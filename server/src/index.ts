import cors = require("cors");
import express = require("express");
import { Server } from "socket.io";
import http = require("http");
import { CToSEvents, SToCEvents } from "../Interfaces/SocketEvents";
import { SocketRoutes } from "./Events/socket";

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server<CToSEvents, SToCEvents>(server, {
  cors: {
    origin: "*",
  },
});

SocketRoutes(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server alive on: http://localhost:" + PORT.toString());
});
