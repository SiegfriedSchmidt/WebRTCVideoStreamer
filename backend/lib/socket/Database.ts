export class Database {
    private clients: { [key: string]: string } = {}

    constructor() {
    }

    addClient(name: string, id: string) {
        this.clients[name] = id
    }

    getClient(name: string) {
        return this.clients[name]
    }

    removeClient(name: string) {
        delete this.clients[name]
    }

    clientExists(id: string) {
        return (id in this.clients)
    }
}