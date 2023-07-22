import {RequestHandler} from "express";
import {allowedUrls, loginUrl} from "../app";

const handler: RequestHandler = (req, res, next) => {
    try {
        if (req.id || allowedUrls.includes(req.url)) {
            return next()
        }
    } catch (e) {
    }
    return res.redirect(loginUrl)
}

export default handler