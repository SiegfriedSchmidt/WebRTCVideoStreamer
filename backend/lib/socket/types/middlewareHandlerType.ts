import {SocketType} from "./socketTypes";
import {ExtendedError} from "socket.io/dist/namespace";

type middlewareHandlerType = (socket: SocketType, next: (err?: ExtendedError) => void) => void
export default middlewareHandlerType
