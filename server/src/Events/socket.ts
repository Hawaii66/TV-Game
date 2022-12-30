import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { removeSocket } from "../redis";
import { SToCEvents, CToSEvents } from "../../Interfaces/SocketEvents";
import { clientSockets } from "./Client";
import { hostSockets } from "./Host";
import { publicSockets } from "./Public";

export const SocketRoutes = (
  io: Server<CToSEvents, SToCEvents, DefaultEventsMap, any>
) => {
  io.on("connection", (socket) => {
    clientSockets(io, socket);

    hostSockets(io, socket);

    publicSockets(io, socket);
  });
};
