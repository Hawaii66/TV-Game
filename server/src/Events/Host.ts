import { ClientSocket } from "../../Interfaces/SocketEvents";
import { createGame } from "../redis";
import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { SToCEvents, CToSEvents } from "../../Interfaces/SocketEvents";
import { DeleteGame } from "../Utils/Game";

export const hostSockets = (
  io: Server<CToSEvents, SToCEvents, DefaultEventsMap, any>,
  socket: ClientSocket
) => {
  var pin = -1;
  var redisId = "";

  socket.on("createGame", async () => {
    pin = parseInt((Math.random() * 1000).toString());
    redisId = await createGame(pin, socket.id, ["Blue", "Green"]);

    socket.emit("createGameAck", {
      pin: pin,
      id: redisId,
    });
  });

  socket.on("disconnect", async () => {
    await DeleteGame(io, pin);
  });
};
