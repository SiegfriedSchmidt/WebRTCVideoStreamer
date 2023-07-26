import SocketTypes from "./socket/socketTypes";

const servers: RTCConfiguration = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
        },
    ],
    iceCandidatePoolSize: 10,
};

export default class RTCConnection {
    public startTime = (new Date()).getTime()
    public pc = new RTCPeerConnection(servers)

    constructor(
        public peerID: string,
        public socket: SocketTypes,
    ) {
    }

    initEvents() {
        this.pc.onicecandidateerror = (event) => {
            console.log(event.type)
        }

        this.pc.onicecandidate = (event) => {
            if (event.candidate) {
                this.socket.emit('sendIceCandidate', {id: this.peerID, data: event.candidate}, () => {
                })
            }
        }

        this.socket.on('receiveSDP', async ({id, data}) => {
            await this.pc.setRemoteDescription(data);
            if (data.type === 'offer') {
                const answer = await this.pc.createAnswer();
                await this.pc.setLocalDescription(answer);
                this.socket.emit('sendSDP', {id, data: {type: answer.type, sdp: answer.sdp}}, () => {
                })
            }
        })

        this.socket.on('receiveIceCandidate', async ({id, data}) => {
            await this.pc.addIceCandidate(data)
        })
    }

    initMedia(localStream: MediaStream, remoteStream: MediaStream) {
        localStream.getTracks().forEach((track) => {
            this.pc.addTrack(track, localStream);
        });

        this.pc.ontrack = (event) => {
            event.streams[0].getTracks().forEach((track) => {
                remoteStream.addTrack(track);
            });
        };
    }

    async sendOffer(): Promise<string> {
        const offerDescription = await this.pc.createOffer();
        return new Promise((resolve, reject) => {
            this.socket.emit('sendSDP', {
                id: this.peerID,
                data: {type: offerDescription.type, sdp: offerDescription.sdp}
            }, async ({error}) => {
                if (error) {
                    resolve('Incorrect ID')
                } else {
                    await this.pc.setLocalDescription(offerDescription);
                }
                resolve('')
            })
        })
    }

    async logReport() {
        const iceConnectionState = this.pc.iceConnectionState
        const statsReport = await this.pc.getStats();
        const report: string[] = []
        statsReport.forEach(report => {
            if (report.type === 'candidate-pair') {
                report.push(`Candidate Pair: ${report.state}\nRTT: ${report.currentRoundTripTime}`)
            }
        });
        console.log({iceConnectionState, report})
    }
}