export interface ServerToClientEvents {
    connected: (id: string) => void
    receiveSDP: (data: { id: string, data: RTCSessionDescription }) => void
    receiveIceCandidate: (data: { id: string, data: RTCIceCandidate }) => void
}

export interface ClientToServerEvents {
    sendSDP: (data: { id: string, data: RTCSessionDescription }, callback: (data: { error: boolean }) => void) => void
    sendIceCandidate: (data: { id: string, data: RTCIceCandidate }) => void
}