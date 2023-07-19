import {Server as HttpsServer} from "https";
import {Server, Socket} from "socket.io";
import {customAlphabet} from "nanoid";
import {ClientToServerEvents, ServerToClientEvents} from "./socketEvents";

const getID = customAlphabet('ABC', 6)

interface InterServerEvents {

}

interface SocketData {
    id: string
}

type SocketType = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>

export default (server: HttpsServer) => {
    const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
        cors: {
            origin: '*'
        }
    });
    io.on('connection', (socket) => socketOnConnection(io, socket))
}

const clients: { [key: string]: SocketType } = {}

function socketOnConnection(io: Server, socket: SocketType) {
    socket.data.id = getID()
    clients[socket.data.id] = socket
    socket.emit('connected', socket.data.id)
    console.log(`user connected ${socket.data.id}`)

    socket.on("disconnect", (reason) => {
        delete clients[socket.data.id]
        console.log(`user disconnected ${socket.data.id}`)
    })

    socket.on('sendSDP', ({id, data}, callback) => {
        console.log(`send sdp from ${socket.data.id} to ${id}`)
        if (id in clients && id != socket.data.id) {
            callback({error: false})
            clients[id].emit('receiveSDP', ({id: socket.data.id, data}))
        } else {
            callback({error: true})
        }
    })
}
