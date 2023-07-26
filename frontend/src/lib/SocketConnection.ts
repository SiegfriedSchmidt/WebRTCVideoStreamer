import SocketTypes from "./socket/socketTypes";
import io from "socket.io-client";

// class EventEmitter {
//     private callbacks: { [key: string]: Function[] } = {}
//
//     constructor() {
//     }
//
//     on(event: string, cb: Function) {
//         if (!this.callbacks[event]) this.callbacks[event] = [];
//         this.callbacks[event].push(cb)
//     }
//
//     emit(event: string, data: any) {
//         let cbs = this.callbacks[event]
//         if (cbs) {
//             cbs.forEach(cb => cb(data))
//         }
//     }
// }

export default class SocketConnection {
    public socket: SocketTypes;
    public name: string;

    constructor() {
    }

    async init() {
        await this.socketConnect()
    }

    socketConnect(): Promise<string> {
        this.socket = io({path: '/socket.io/'})
        this.socket.on('disconnect', (reason) => {
            console.log(reason)
        })
        return new Promise((resolve, reject) => {
            this.socket.on("connected", (name) => {
                this.name = name;
                resolve('')
            })
        })
    }
}