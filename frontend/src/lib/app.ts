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
let socket: Socket<ServerToClientEvents, ClientToServerEvents>
const peerConnection = new RTCPeerConnection(servers)
let localID: string;
let remoteID: string;
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
const statusText = document.getElementById('status') as HTMLLabelElement;

function setStatus(status: string) {
    statusText.innerText = `Status: ${status}`
}

// Setup media sources
webcamButton.onclick = async () => {
    setStatus('Starting web camera...')
    // localStream = await navigator.mediaDevices.getUserMedia({video: {facingMode: 'environment'}, audio: false});
    localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
    setStatus('Web camera started.')
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

    setStatus("Socket connecting...")
    socketConnect()

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('sendIceCandidate', {id: remoteID, data: event.candidate}, () => {
            })
        }
    };
};

function socketConnect() {
    socket = io({path: '/socket.io/'})
    socket.on("connected", (id) => {
        console.log(`connected ${id}`)
        localIDLabel.innerText = id
        localID = id
        setStatus("Socket connected.")
    })

    socket.on('receiveSDP', async ({id, data}) => {
        remoteID = id
        await peerConnection.setRemoteDescription(data);
        if (!peerConnection.localDescription) {
            setStatus(`receive offer from "${id}"`)
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socket.emit('sendSDP', {id, data: peerConnection.localDescription}, () => {
            })
        } else {
            setStatus(`receive answer from "${id}"`)
        }
    })

    socket.on('receiveIceCandidate', async ({id, data}) => {
        await peerConnection.addIceCandidate(data)
    })
}

callButton.onclick = async () => {
    setStatus(`Sending offer to remote ID "${callInput.value}"...`)
    const offerDescription = await peerConnection.createOffer();
    remoteID = callInput.value.toUpperCase()
    socket.emit('sendSDP', {
        id: remoteID,
        data: {type: offerDescription.type, sdp: offerDescription.sdp}
    }, async ({error}) => {
        if (error) {
            setStatus(`Error! Incorrect ID "${callInput.value}"!`)
        } else {
            await peerConnection.setLocalDescription(offerDescription);
            setStatus(`Send offer to remote ID "${callInput.value}".`)
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