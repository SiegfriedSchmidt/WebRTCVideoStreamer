export interface ServerToClientEvents {
    connected: (name: string) => void
    receiveCall: (name: string, callback: (data: { accept: boolean, message: string }) => void) => void
    receiveSDP: (data: { name: string, data: { type: RTCSdpType, sdp: string } }) => void
    receiveIceCandidate: (data: { name: string, data: RTCIceCandidate }) => void
}

export interface ClientToServerEvents {
    sendCall: (name: string, callback: (data: { accept: boolean, message: string }) => void) => void
    sendSDP: (data: { name: string, data: { type: RTCSdpType, sdp: string } }, callback: (e: boolean) => void) => void
    sendIceCandidate: (data: { name: string, data: RTCIceCandidate }, callback: (e: boolean) => void) => void
}