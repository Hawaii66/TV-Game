import { ClientSocket } from "../../Interfaces/SocketEvents";
import { gameExists, createPlayer, getGame, removeSocket } from "../redis";
import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { SToCEvents, CToSEvents } from "../../Interfaces/SocketEvents";
import {
  GetGame,
  GetGameHost,
  GetPlayersFromGame,
  MoveCurrentPlayer,
  NextPlayer,
  ShootGame,
  TransferActionPoints,
  UseBonus,
} from "../Utils/Game";
import { GetSocketUsersFromGame } from "../Utils/Sockets";
import { HideTarget, MoveTarget, ShowTarget } from "../Utils/Target";

export const clientSockets = (
  io: Server<CToSEvents, SToCEvents, DefaultEventsMap, any>,
  socket: ClientSocket
) => {
  var redisId = "";

  socket.on("join", async (data) => {
    const gameStatus = await gameExists(data.pin);
    if (!gameStatus) {
      socket.emit("joinack", {
        id: "",
        status: false,
      });
      return;
    }

    redisId = await createPlayer(socket, data.username, data.pin);

    socket.emit("joinack", {
      id: redisId,
      status: true,
    });

    const hostSocket = await GetGameHost(io, data.pin);
    hostSocket?.emit("hostPlayerJoin", {
      pin: data.pin,
      username: data.username,
    });

    const game = await GetGame(data.pin);
    if (game === null) {
      return;
    }
    socket.emit("gameInfo", JSON.parse(game.game));
    const players = await GetPlayersFromGame(io, data.pin);
    players.map((player) => player?.emit("playerSockets", game.players));
  });

  socket.on("disconnect", async () => {
    await removeSocket(redisId);
  });

  socket.on("move", async (data) => {
    const result = await MoveCurrentPlayer(data.pin, data.offset);

    if (result.status === "Success") {
      const host = await GetGameHost(io, data.pin);
      host?.emit("gameInfo", result.info);
      const players = await GetPlayersFromGame(io, data.pin);
      players.map((player) => player?.emit("gameInfo", result.info));
    } else {
      socket.emit("moveError", result.status);
    }
  });

  socket.on("turnDone", async (data) => {
    const result = await NextPlayer(data.pin);
    if (result === null) {
      return;
    }

    const host = await GetGameHost(io, data.pin);
    host?.emit("gameInfo", result);
    const players = await GetPlayersFromGame(io, data.pin);
    players.map((player) => player?.emit("gameInfo", result));
  });

  socket.on("shoot", async (data) => {
    const result = await ShootGame(data.pin, data.offset);

    if (result.status !== "Success") {
      socket.emit("shootError", result.status);
      return;
    }

    const host = await GetGameHost(io, data.pin);
    host?.emit("gameInfo", result.data.info);
    const socketPlayer = await GetSocketUsersFromGame(data.pin);
    host?.emit(
      "playerSockets",
      socketPlayer.map((i) => i?.username || "")
    );

    if (result.data.deadSocket !== "") {
      io.sockets.sockets.get(result.data.deadSocket)?.emit("dead");
    }
    const players = await GetPlayersFromGame(io, data.pin);
    players.map((player) => {
      player?.emit("gameInfo", result.data.info);
      player?.emit("playerSockets", result.data.players);
    });
  });

  socket.on("useBonus", async (data) => {
    const result = await UseBonus(data.pin, data.bonus);
    if (result === null) {
      return;
    }

    const host = await GetGameHost(io, data.pin);
    host?.emit("gameInfo", result?.info);
    const players = await GetPlayersFromGame(io, data.pin);
    players.map((player) => {
      player?.emit("gameInfo", result.info);
    });
  });

  socket.on("targetMove", async (data) => {
    const result = await MoveTarget(data.pin, data.offset);
    if (result === null) {
      return;
    }

    const host = await GetGameHost(io, data.pin);
    host?.emit("gameInfo", result);
    const players = await GetPlayersFromGame(io, data.pin);
    players.map((player) => {
      player?.emit("gameInfo", result);
    });
  });

  socket.on("targetVisible", async (data) => {
    const methods = [ShowTarget, HideTarget];
    const result = await methods[data.state ? 0 : 1](data.pin);
    if (result === null) {
      return;
    }

    const host = await GetGameHost(io, data.pin);
    host?.emit("gameInfo", result);
    const players = await GetPlayersFromGame(io, data.pin);
    players.map((player) => {
      player?.emit("gameInfo", result);
    });
  });

  socket.on("sendActionPoints", async (data) => {
    const result = await TransferActionPoints(
      data.pin,
      data.sender,
      data.reciever,
      data.amount
    );
    if (result === null) {
      return;
    }

    const host = await GetGameHost(io, data.pin);
    host?.emit("gameInfo", result.info);
    const players = await GetPlayersFromGame(io, data.pin);
    players.map((player) => {
      player?.emit("gameInfo", result.info);
    });
  });
};
