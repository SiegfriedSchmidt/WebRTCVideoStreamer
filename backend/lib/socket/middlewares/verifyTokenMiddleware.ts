import middlewareHandlerType from "../types/middlewareHandlerType";
import readCookieToken from "../../utils/readCookieToken";
import verifyTokenService from "../../services/verifyTokenService";

const handler: middlewareHandlerType = (socket, next) => {
    const token = readCookieToken(socket.handshake.headers.cookie)
    const userID = verifyTokenService(token)
    if (userID) {
        socket.data.name = userID
        next()
    } else {
        next(new Error('Authentication error'))
    }
}
export default handler