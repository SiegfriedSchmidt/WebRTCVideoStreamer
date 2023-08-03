export interface ServerToClientEvents {
    connected: (name: string) => void
    receiveConfirmCall: () => void
    receiveCall: (data: { name: string, audio: boolean, video: boolean }, callback: (data: {
        accept: boolean,
        message: string
    }) => void) => void
    receiveSDP: (data: { name: string, data: { type: RTCSdpType, sdp: string } }) => void
    receiveIceCandidate: (data: { name: string, data: RTCIceCandidate }) => void
}

export interface ClientToServerEvents {
    sendConfirmCall: (name: string) => void
    sendCall: (data: { name: string, audio: boolean, video: boolean }, callback: (data: {
        accept: boolean,
        message: string
    }) => void) => void
    sendSDP: (data: { name: string, data: { type: RTCSdpType, sdp: string } }, callback: (e: boolean) => void) => void
    sendIceCandidate: (data: { name: string, data: RTCIceCandidate }, callback: (e: boolean) => void) => void
}