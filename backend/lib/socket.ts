import {Server as HttpServer} from "http";
import {Server as HttpsServer} from "https";
import {Server as IOServer, Socket} from "socket.io";
import {customAlphabet} from "nanoid";
import {ClientToServerEvents, ServerToClientEvents} from "./socketEvents";

const getID = customAlphabet('0123456789', 4)

interface InterServerEvents {

}

interface SocketData {
    id: string
}

type SocketType = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>

export default (server: HttpsServer | HttpServer) => {
    const io = new IOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
        path: '/socket.io/',
        cors: {
            origin: '*'
        }
    });
    io.on('connection', (socket) => socketOnConnection(io, socket))
}

const clients: { [key: string]: SocketType } = {}

function socketOnConnection(io: IOServer, socket: SocketType) {
    socket.data.id = getID()
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
}
