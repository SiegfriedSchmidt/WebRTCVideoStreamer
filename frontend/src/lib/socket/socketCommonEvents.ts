export interface ServerToClientEvents {
    connected: (id: string) => void
    receiveSDP: (data: { id: string, data: { type: RTCSdpType, sdp: string } }) => void
    receiveIceCandidate: (data: { id: string, data: RTCIceCandidate }) => void
}

export interface ClientToServerEvents {
    sendSDP: (data: { id: string, data: { type: RTCSdpType, sdp: string } }, callback: (data: {
        error: boolean
    }) => void) => void

    sendIceCandidate: (data: { id: string, data: RTCIceCandidate }, callback: (data: {
        error: boolean
    }) => void) => void
}