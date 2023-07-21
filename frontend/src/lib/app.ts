import io, {Socket} from "socket.io-client";
import {ClientToServerEvents, ServerToClientEvents} from "./interfaces";

const servers: RTCConfiguration = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
        },
    ],
    iceCandidatePoolSize: 10,
};

// Global State
const startTime = (new Date()).getTime()
let socket: Socket<ServerToClientEvents, ClientToServerEvents>
const peerConnection = new RTCPeerConnection(servers)
let localID: string;
let remoteID: string;
let offerAnswerComplete = false;
let localStream: MediaStream = null;
let remoteStream: MediaStream = null;

// HTML elements
const webcamVideo = document.getElementById('webcamVideo') as HTMLVideoElement;
const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
const webcamButton = document.getElementById('webcamButton') as HTMLButtonElement;
const callButton = document.getElementById('callButton') as HTMLButtonElement;
const callInput = document.getElementById('callInput') as HTMLInputElement;
const answerButton = document.getElementById('answerButton') as HTMLButtonElement;
const hangupButton = document.getElementById('hangupButton') as HTMLButtonElement;
const localIDLabel = document.getElementById('localID') as HTMLLabelElement;
const remoteIDLabel = document.getElementById('remoteID') as HTMLLabelElement;
const logsList = document.getElementById('logs') as HTMLLabelElement;

function createLogElement(time: string, text: string, color?: string): string {
    if (color) {
        return `<div class="log"><p style="color: ${color}" class="log-text">${time} ${text}</p></div>`
    }
    return `<div class="log"><p class="log-text">${time} ${text}</p></div>`
}

function addLog(log: string, color?: string) {
    const time = (Math.round(((new Date()).getTime() - startTime) / 1000)).toString()
    const logElement = createLogElement(time, log, color)
    logsList.insertAdjacentHTML('beforeend', logElement)
}

setInterval(async () => {
    // addLog(`ice gathering state: ${peerConnection.iceGatheringState}`, 'yellow')
    addLog(`ice connection state: ${peerConnection.iceConnectionState}`, 'yellow')
    const statsReport = await peerConnection.getStats();
    statsReport.forEach(report => {
        if (report.type === 'candidate-pair') {
            console.log('Candidate Pair:', report.state, 'RTT:', report.currentRoundTripTime);
        }
    });
    // addLog(`connection stats`, 'yellow')
    // addLog(`signaling state: ${peerConnection.signalingState}`, 'yellow')
}, 2000)

// Setup media sources
webcamButton.onclick = async () => {
    // localStream = await navigator.mediaDevices.getUserMedia({video: {facingMode: 'environment'}, audio: false});
    localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
    // localStream = await navigator.mediaDevices.getDisplayMedia({video: true, audio: true});

    addLog('web camera started.')
    // localStream = new MediaStream()
    remoteStream = new MediaStream();

    // Push tracks from local stream to peer connection
    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    });

    // Pull tracks from remote stream, add to video stream
    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
        });
    };

    webcamVideo.muted = true
    webcamVideo.srcObject = localStream;
    remoteVideo.srcObject = remoteStream;

    callButton.disabled = false;
    callInput.disabled = false;
    answerButton.disabled = false;
    webcamButton.disabled = true;

    addLog('socket connecting')
    socketConnect()

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            addLog(`send ice candidate, ${event.candidate.candidate}`)
            addLog(`ice candidate gathering stage: ${peerConnection.iceGatheringState}`, 'yellow')
            addLog(`ice candidate connection stage: ${peerConnection.iceConnectionState}`, 'yellow')
            socket.emit('sendIceCandidate', {id: remoteID, data: event.candidate}, () => {
            })
        }
    };
};
webcamButton.click()

function socketConnect() {
    socket = io({path: '/socket.io/'})
    socket.on("connected", (id) => {
        console.log(`connected ${id}`)
        localIDLabel.innerText = id
        localID = id
        addLog(`socket connected with id "${id}"`)
    })

    socket.on('receiveSDP', async ({id, data}) => {
        remoteID = id
        await peerConnection.setRemoteDescription(data);
        if (!peerConnection.localDescription) {
            addLog(`receive offer from "${id}"`)
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            addLog(`send answer to "${id}"`)
            socket.emit('sendSDP', {id, data: {type: answer.type, sdp: answer.sdp}}, () => {
            })
        } else {
            addLog(`receive answer from "${id}"`)
        }
        offerAnswerComplete = true
    })

    socket.on('receiveIceCandidate', async ({id, data}) => {
        addLog(`receive ice candidate, ${data.candidate}`)
        addLog(`ice candidate gathering stage: ${peerConnection.iceGatheringState}`, 'yellow')
        addLog(`ice candidate connection stage: ${peerConnection.iceConnectionState}`, 'yellow')
        setTimeout(async () => {
            await peerConnection.addIceCandidate(data)
        }, 3000)
    })
}

callButton.onclick = async () => {
    addLog(`sending offer to remote ID "${callInput.value}"`)
    const offerDescription = await peerConnection.createOffer();
    remoteID = callInput.value.toUpperCase()
    socket.emit('sendSDP', {
        id: remoteID,
        data: {type: offerDescription.type, sdp: offerDescription.sdp}
    }, async ({error}) => {
        if (error) {
            addLog(`incorrect ID "${callInput.value}"`)
        } else {
            await peerConnection.setLocalDescription(offerDescription);
            addLog(`offer sent to remote ID "${callInput.value}"`)
        }
    })
}

//
// callButton.onclick = async () => {
//     // Peer A creates an offer and sends it to the signaling server
//     const offerDescription = await peerConnection.createOffer();
//     await peerConnection.setLocalDescription(offerDescription);
//     socket.send(JSON.stringify({type: 'offer', sdp: peerConnection.localDescription}));
//
//     // Peer B receives the offer from the signaling server
//     socket.onmessage = async (event) => {
//         console.log(1)
//         const message = JSON.parse(event.data);
//
//         if (message.type === 'offer') {
//             await peerConnection.setRemoteDescription(new RTCSessionDescription(message));
//             const answer = await peerConnection.createAnswer();
//             await peerConnection.setLocalDescription(answer);
//             socket.send(JSON.stringify({type: 'answer', sdp: peerConnection.localDescription}));
//         }
//     };
//
//     // Sending ICE candidates
//     peerConnection.onicecandidate = (event) => {
//         if (event.candidate) {
//             socket.send(JSON.stringify({type: 'candidate', candidate: event.candidate}));
//         }
//     };
//
//     // Receiving ICE candidates
//     socket.onmessage = (event) => {
//         console.log(2)
//         const message = JSON.parse(event.data);
//
//         if (message.type === 'candidate') {
//             peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
//         }
//     };
//     hangupButton.disabled = false;
// }
//
// answerButton.onclick = async () => {
//
// };

// export const socketOnConnection = async (io: Server, socket: SocketType) => {
//     socket.on('disconnect', (reason) => {
//         leaveRoom(io, socket)
//         console.log(`user disconnected '${reason}'`)
//         delete users[socket.data.username as string]
//         io.sockets.emit('users', {users: Object.keys(users)})
//     })
//     const user = verifyTokenService(socket.handshake.query.authorization as string)
//     if (user) {
//         socket.data.username = (await getUserFromDB(Number(user)))?.login as string
//         users[socket.data.username] = {socket}
//     } else {
//         console.log(`Wrong token`)
//         return socket.disconnect()
//     }
//
//     console.log(`user connected ${socket.data.username}`)
//     io.sockets.emit('users', {users: Object.keys(users)})
//
//     socket.on('conversation', ({user}) => {
//         if (users[user] === undefined) return
//         const roomId = generateUniqueId()
//         rooms[roomId] = [user, socket.data.username as string]
//         socket.data.roomId = roomId
//         users[user].socket.data.roomId = roomId
//         socket.join(roomId)
//         users[user].socket.join(roomId)
//         socket.emit('enterRoom', {users: rooms[roomId]})
//         users[user].socket.emit('enterRoom', {users: rooms[roomId]})
//     })
//
//     socket.on('sendMessage', ({message}) => {
//         console.log(message)
//         if (socket.data.roomId && socket.data.username) {
//             socket.in(socket.data.roomId).emit('getMessage', ({message, sender: socket.data.username}))
//         }
//     })
//
//     socket.on('sendRsaPublic', ({key}) => {
//         console.log(key)
//         if (socket.data.roomId && socket.data.username) {
//             socket.in(socket.data.roomId).emit('getRsaPublic', ({key}))
//         }
//     })
//
//     socket.on('sendWrappedKey', ({key}) => {
//         console.log(key)
//         if (socket.data.roomId && socket.data.username) {
//             socket.in(socket.data.roomId).emit('getWrappedKey', ({key}))
//         }
//     })
//
//     socket.on('exitRoom', () => {
//         leaveRoom(io, socket)
//     })