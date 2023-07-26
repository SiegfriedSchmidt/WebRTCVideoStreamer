import {SocketType} from "./types/socketTypes";

export class Database {
    private clients: { [key: string]: SocketType } = {}

    constructor() {
    }

    addClient(name: string, socket: SocketType) {
        this.clients[name] = socket
    }

    getClient(name: string) {
        return this.clients[name]
    }

    removeClient(name: string) {
        delete this.clients[name]
    }

    clientExists(name: string) {
        return (name in this.clients)
    }

    allClients() {
        return Object.keys(this.clients)
    }
}