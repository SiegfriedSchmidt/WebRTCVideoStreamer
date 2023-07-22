import verifyTokenService from "../services/verifyTokenService";
import {RequestHandler} from "express";

const handler: RequestHandler = (req, res, next) => {
    try {
        if (req.headers.authorization) {
            req.id = verifyTokenService(req.headers.authorization)
        }
    } catch (e) {
    } finally {
        next()
    }
}

export default handler