import { CToSEvents, SToCEvents } from "../../Interfaces/SocketEvents";
import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { GetGame } from "./Game";
import { connect, client, socketSchema, RSocket } from "../redis";

export const GetSocketUsersFromGame = async (pin: number) => {
  const game = await GetGame(pin);
  if (game === null) {
    return [];
  }

  await connect();
  const socketRep = client.fetchRepository(socketSchema);
  await socketRep.createIndex();

  var players: (RSocket | null)[] = [];
  for (var i = 0; i < game.players.length; i++) {
    const player = await socketRep
      .search()
      .where("socket")
      .eq(game.players[i])
      .return.first();
    players.push(player);
  }
  return players;
};
