import makeJWTService from "../services/makeJWTService";
import serverStatuses from "../types/serverStatuses";
import sha256 from "../utils/sha256";
import {PASSWORD} from "../app";
import getID from "../utils/getID";
import {RequestHandler} from "express";

const handler: RequestHandler = (req, res, next) => {
    try {
        if (!(req.body.password)) return res.status(serverStatuses.Error).json('Password field is empty!')
        const hashPassword = sha256(req.body.password)
        if (hashPassword === PASSWORD) {
            const token = makeJWTService({id: getID()})
            res.status(serverStatuses.OK).json({token})
        } else {
            res.status(serverStatuses.Error).json({message: 'Wrong name or password!'})
        }
    } catch (e) {
        console.log(e)
    }
}

export default handler
