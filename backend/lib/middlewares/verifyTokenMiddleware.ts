import verifyTokenService from "../services/verifyTokenService";
import {RequestHandler} from "express";
import readCookieToken from "../utils/readCookieToken";

const handler: RequestHandler = (req, res, next) => {
    try {
        const token = readCookieToken(req.headers.cookie)
        req.id = verifyTokenService(token)
    } catch (e) {
    } finally {
        next()
    }
}

export default handler