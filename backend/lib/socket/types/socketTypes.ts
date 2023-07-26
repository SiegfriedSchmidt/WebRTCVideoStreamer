import {Server as IOServer, Socket} from "socket.io";
import {ClientToServerEvents, ServerToClientEvents} from "./socketCommonEvents";

interface InterServerEvents {

}

interface SocketData {
    name: string
}

export type SocketType = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
export type IOServerType = IOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>