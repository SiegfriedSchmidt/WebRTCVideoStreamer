import express from "express";
import * as http from "http";
import * as https from "https";
import cookieParser from 'cookie-parser'
import {readFileSync} from "fs";
import {nanoid} from "nanoid";
import createSocket from "./socket";
import loggerMiddleware from "./middlewares/loggerMiddleware";
import verifyTokenMiddleware from "./middlewares/verifyTokenMiddleware";
import usersRouter from "./routers/usersRouter";
import sha256 from "./utils/sha256";
import path from "path";
import restrictAccessMiddleware from "./middlewares/restrictAccessMiddleware";

const PORT = Number(process.env.PORT) || 9449
const ENV = process.env.NODE_ENV || 'development';
const PROTOCOL = ENV === 'development' ? "https" : "http"
const HOSTNAME = ENV === 'development' ? "localhost" : "localhost"
const STATIC = ENV === 'development' ? path.join(__dirname, '../../../frontend/dist') : path.join(__dirname, '../../dist/')

export const loginUrl = '/user/login'
export const allowedUrls = [loginUrl, '/user/auth']
export const loginPagePath = path.join(__dirname, '../html/loginPage.html')
export const TOKEN = nanoid(32)
export const PASSWORD = 'lE8TIJicCXMGxqb+vAo8DLg5yfqFxtbZR1prErM1DVU='

const app = express()
const server = PROTOCOL === 'https'
    ?
    https.createServer({
        key: readFileSync("certs/tls.key"),
        cert: readFileSync("certs/tls.crt"),
        ca: readFileSync("certs/tls.csr"),
    }, app)
    :
    http.createServer(app)

createSocket(server)

// middleware
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())

// my middleware
app.use(loggerMiddleware)
app.use(verifyTokenMiddleware)
app.use(restrictAccessMiddleware)
app.use(express.static(STATIC))

// routers
app.use('/user', usersRouter)

// start
server.listen(PORT, HOSTNAME, () => console.info(`Server running on ${PROTOCOL}://${HOSTNAME}:${PORT} in ${ENV} mode`));