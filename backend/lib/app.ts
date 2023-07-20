import * as http from "http";
import createSocket from "./socket";

const PORT = Number(process.env.PORT) || 9449
const ENV = process.env.NODE_ENV || 'development';

const server = http.createServer()
createSocket(server)
server.listen(PORT, 'localhost', () => console.info(`Server running on port ${PORT} in ${ENV} mode`));