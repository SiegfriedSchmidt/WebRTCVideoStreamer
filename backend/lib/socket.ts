import {Server as HttpServer} from "http";
import {Server as HttpsServer} from "https";
import {Server as IOServer, Socket} from "socket.io";
import {ClientToServerEvents, ServerToClientEvents} from "./socketEvents";
import verifyTokenService from "./services/verifyTokenService";

interface InterServerEvents {

}

interface SocketData {
    id: string
}

type SocketType = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>

function readTokenCookie(socket: SocketType) {
    return socket.handshake.headers.cookie!
        .split("; ")
        .find((row) => row.startsWith("token="))?.slice(6);
}

const clients: { [key: string]: SocketType } = {}

export default (server: HttpsServer | HttpServer) => {
    const io = new IOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
        path: '/socket.io/',
        cors: {
            origin: '*'
        }
    });

    io.use((socket, next) => {
        const token = readTokenCookie(socket)
        const userID = verifyTokenService(token as string)
        if (userID) {
            socket.data.id = userID
            next()
        } else {
            next(new Error('Authentication error'))
        }
    })

    io.on('connection', (socket) => {
        clients[socket.data.id] = socket
        socket.emit('connected', socket.data.id)
        console.log(`user connected ${socket.data.id}`)

        socket.on("disconnect", (reason) => {
            delete clients[socket.data.id]
            console.log(`user disconnected ${socket.data.id}`)
        })

        socket.on('sendSDP', ({id, data}, callback) => {
            if (id in clients && id != socket.data.id) {
                console.log(`send sdp from ${socket.data.id} to ${id}`)
                clients[id].emit('receiveSDP', ({id: socket.data.id, data}))
                callback({error: false})
            } else {
                callback({error: true})
            }
        })

        socket.on('sendIceCandidate', ({id, data}, callback) => {
            if (id in clients && id != socket.data.id) {
                console.log(`send ice candidate from ${socket.data.id} to ${id}`)
                clients[id].emit('receiveIceCandidate', ({id: socket.data.id, data}))
                callback({error: false})
            } else {
                callback({error: true})
            }
        })
    })
}