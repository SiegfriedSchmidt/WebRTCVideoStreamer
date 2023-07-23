import verifyTokenService from "../services/verifyTokenService";
import {RequestHandler} from "express";

const handler: RequestHandler = (req, res, next) => {
    try {
        if (req.cookies['token']) {
            req.id = verifyTokenService(req.cookies['token'])
        }
    } catch (e) {
    } finally {
        next()
    }
}

export default handler