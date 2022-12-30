import { ClientSocket, CToSEvents } from "../Interfaces/SocketEvents";
import { Client, Entity, Schema, Repository } from "redis-om";
import { AddPlayer } from "./Utils/Game";
import { GenerateHouses, GenerateMap } from "./Utils/Map";
import { Faction, GameInfo, Player } from "../Interfaces/Game";

export const client = new Client();

export const connect = async () => {
  if (!client.isOpen()) {
    await client.open(process.env.REDIS_URL);
  }
};
export interface RSocket {
  socket: string;
  username: string;
  pin: number;
}
export class RSocket extends Entity {}
export let socketSchema = new Schema(
  RSocket,
  {
    socket: { type: "string" },
    username: { type: "string" },
    pin: { type: "number", indexed: true },
  },
  {
    dataStructure: "JSON",
  }
);
export interface RGame {
  pin: number;
  players: string[];
  host: string;
  game: string;
}
export class RGame extends Entity {}
export let gameSchema = new Schema(
  RGame,
  {
    pin: { type: "number", indexed: true },
    players: { type: "string[]" },
    host: { type: "string" },
    game: { type: "string" },
  },
  {
    dataStructure: "JSON",
  }
);

export const createPlayer = async (
  socket: ClientSocket,
  username: string,
  pin: number
) => {
  await connect();

  const socketRep = client.fetchRepository(socketSchema);
  const gameRep = client.fetchRepository(gameSchema);
  await gameRep.createIndex();

  const redisSocket = socketRep.createEntity({
    socket: socket.id,
    username: username,
    pin: pin,
  });

  const redisId = await socketRep.save(redisSocket);

  await AddPlayer(pin, socket.id);

  return redisId;
};

export const removeSocket = async (id: string) => {
  await connect();

  const socketRep = client.fetchRepository(socketSchema);

  socketRep.remove(id);
};

export const createGame = async (
  pin: number,
  socket: string,
  factions: Faction[]
) => {
  await connect();
  const gameRep = client.fetchRepository(gameSchema);

  const players: Player[] = factions.map((faction) => {
    return {
      actionPoints: 3,
      faction: faction,
      health: 3,
      powerups: [],
      x: -1,
      y: -1,
    };
  });

  const map = GenerateMap();
  const { board, positions } = GenerateHouses(factions, map);

  const gameInfo: GameInfo = {
    map: board,
    homes: positions.map((pos) => {
      return {
        alive: 3,
        faction: pos.faction,
        ...pos.coord,
      };
    }),
    players: positions.map((pos, index) => {
      return {
        ...players[index],
        ...pos.coord,
      };
    }),
    turn: 0,
    target: {
      coord: {
        x: 0,
        y: 0,
      },
      visible: false,
    },
  };

  const redisGame = gameRep.createEntity({
    pin: pin,
    players: [],
    host: socket,
    game: JSON.stringify(gameInfo),
  });

  const redisId = await gameRep.save(redisGame);
  return redisId;
};

export const gameExists = async (pin: number) => {
  await connect();
  const gameRep = client.fetchRepository(gameSchema);
  await gameRep.createIndex();

  const t = await gameRep.search().where("pin").eq(pin).return.first();

  return t !== null;
};

export const getGame = async (pin: number) => {
  await connect();
  const gameRep = client.fetchRepository(gameSchema);
  await gameRep.createIndex();

  var game = await gameRep.search().where("pin").eq(pin).return.first();

  if (game === null) {
    return null;
  }

  return game;
};
