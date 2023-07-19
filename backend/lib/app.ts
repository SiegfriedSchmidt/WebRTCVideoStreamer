import * as https from "https";
import {readFileSync} from "fs";
import createSocket from "./socket";

const PORT = process.env.PORT || 9449
const server = https.createServer({
    key: readFileSync("certs/tls.key"),
    cert: readFileSync("certs/tls.crt"),
    ca: readFileSync("certs/tls.csr"),
})

createSocket(server)
server.listen(PORT, () => console.info(`Server running on port ${PORT}`));
