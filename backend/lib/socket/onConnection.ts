import {SocketType} from "./types/socketTypes";
import {Database} from "./Database";

const database = new Database()
export default function (socket: SocketType) {
    database.addClient(socket.data.name, socket.id)
    socket.emit('connected', socket.data.name)
    console.log(`user connected ${socket.data.name}`)

    socket.on("disconnect", (reason) => {
        database.removeClient(socket.data.name)
        console.log(`user disconnected ${socket.data.name}`)
    })

    socket.on('sendSDP', ({id, data}, callback) => {
        if (database.clientExists(id) && id != socket.data.name) {
            console.log(`send sdp from ${socket.data.name} to ${id}`)
            socket.to(database.getClient(id)).emit('receiveSDP', ({id: socket.data.name, data}))
            callback({error: false})
        } else {
            callback({error: true})
        }
    })

    socket.on('sendIceCandidate', ({id, data}, callback) => {
        if (database.clientExists(id) && id != socket.data.name) {
            console.log(`send ice candidate from ${socket.data.name} to ${id}`)
            socket.to(database.getClient(id)).emit('receiveIceCandidate', ({id: socket.data.name, data}))
            callback({error: false})
        } else {
            callback({error: true})
        }
    })
}