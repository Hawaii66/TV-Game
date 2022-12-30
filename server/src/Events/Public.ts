import { ClientSocket } from "../../Interfaces/SocketEvents";
import { createGame } from "../redis";
import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { SToCEvents, CToSEvents } from "../../Interfaces/SocketEvents";
import { DeleteGame, GetGame } from "../Utils/Game";
import { GameInfo } from "../../Interfaces/Game";
import { GetSocketUsersFromGame } from "../Utils/Sockets";

export const publicSockets = (
  io: Server<CToSEvents, SToCEvents, DefaultEventsMap, any>,
  socket: ClientSocket
) => {
  var pin = -1;
  var redisId = "";

  socket.on("join", (data) => {
    pin = data.pin;
  });

  socket.on("gameInfo", async (data) => {
    const game = await GetGame(data.pin);
    if (game == null) {
      return;
    }

    const info: GameInfo = JSON.parse(game.game);
    socket.emit("gameInfo", info);
  });

  socket.on("names", async (data) => {
    const sockets = await GetSocketUsersFromGame(data.pin);

    socket.emit(
      "names",
      sockets.map((i) => {
        return i?.username || "";
      })
    );
  });
};
