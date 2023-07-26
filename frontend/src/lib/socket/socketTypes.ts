import {Socket} from "socket.io-client";
import {ClientToServerEvents, ServerToClientEvents} from "./socketCommonEvents";


type SocketTypes = Socket<ServerToClientEvents, ClientToServerEvents>
export default SocketTypes