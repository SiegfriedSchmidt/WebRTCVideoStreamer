import {RequestHandler} from "express";
import {loginPagePath} from "../app";

const handler: RequestHandler = (req, res, next) => {
    return res.sendFile(loginPagePath)
}

export default handler