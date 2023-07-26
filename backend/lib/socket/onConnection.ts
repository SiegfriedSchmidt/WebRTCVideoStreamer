import {IOServerType, SocketType} from "./types/socketTypes";
import {Database} from "./Database";

const database = new Database()
export default function (io: IOServerType, socket: SocketType) {
    database.addClient(socket.data.name, socket)
    socket.emit('connected', socket.data.name)
    console.log(`user connected ${socket.data.name}`)

    socket.on("disconnect", (reason) => {
        database.removeClient(socket.data.name)
        console.log(`user disconnected ${socket.data.name}`)
    })

    socket.on("sendCall", (name, callback) => {
        if (database.clientExists(name) && name != socket.data.name) {
            database.getClient(name).emit('receiveCall', name, callback)
        } else {
            return callback({accept: false, message: 'Неправильный id'})
        }
    })

    socket.on('sendSDP', ({name, data}, callback) => {
        if (database.clientExists(name) && name != socket.data.name) {
            console.log(`send sdp from ${socket.data.name} to ${name}`)
            database.getClient(name).emit('receiveSDP', ({name: socket.data.name, data}))
            callback(false)
        } else {
            callback(true)
        }
    })

    socket.on('sendIceCandidate', ({name, data}, callback) => {
        if (database.clientExists(name) && name != socket.data.name) {
            console.log(`send ice candidate from ${socket.data.name} to ${name}`)
            database.getClient(name).emit('receiveIceCandidate', ({name: socket.data.name, data}))
            callback(false)
        } else {
            callback(true)
        }
    })
}