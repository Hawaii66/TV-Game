import {
  client,
  connect,
  gameExists,
  gameSchema,
  getGame,
  RGame,
  socketSchema,
} from "../../src/redis";
import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { SToCEvents, CToSEvents } from "../../Interfaces/SocketEvents";
import { DeleteClient } from "./Client";
import {
  Bonus,
  BonusAction,
  BONUSES,
  Coord,
  GameInfo,
  Tile,
} from "../../Interfaces/Game";
import { HideTarget } from "./Target";

export const GetGame = async (pin: number) => {
  const game = await getGame(pin);

  return game;
};

export const SaveGame = async (game: RGame) => {
  await connect();
  const gameRep = client.fetchRepository(gameSchema);
  gameRep.save(game);
};

export const GameExits = async (pin: number) => {
  const alive = await gameExists(pin);

  return alive;
};

export const AddPlayer = async (pin: number, player: string) => {
  const game = await GetGame(pin);
  if (game === null) {
    return false;
  }

  game.players.push(player);

  await connect();
  const gameRep = client.fetchRepository(gameSchema);
  gameRep.save(game);

  return true;
};

export const GetGameHost = async (
  io: Server<CToSEvents, SToCEvents, DefaultEventsMap, any>,
  pin: number
) => {
  const game = await GetGame(pin);
  if (game === null) {
    return null;
  }

  const host = io.sockets.sockets.get(game.host);

  return host;
};

export const DeleteGame = async (
  io: Server<CToSEvents, SToCEvents, DefaultEventsMap, any>,
  pin: number
) => {
  await connect();
  const game = await GetGame(pin);
  if (game == null) {
    return false;
  }

  for (var i = 0; i < game.players.length; i++) {
    const player = game.players[i];
    io.sockets.sockets.get(player)?.emit("gameQuit");

    const socketRep = client.fetchRepository(socketSchema);
    await socketRep.createIndex();

    const obj = await socketRep
      .search()
      .where("socket")
      .eq(player)
      .return.first();
    if (obj === null) {
      continue;
    }

    await DeleteClient(obj?.entityId);
  }

  await connect();
  const gameRep = client.fetchRepository(gameSchema);
  gameRep.remove(game.entityId);
};

export const MoveCurrentPlayer = async (
  pin: number,
  offset: Coord
): Promise<
  | {
      status:
        | "No game found"
        | "A wall is in the way"
        | "A shelter is in the way"
        | "A player is in the way"
        | "Out of bounds"
        | "You have no actions left";
      info: null;
    }
  | {
      info: GameInfo;
      status: "Success";
    }
> => {
  const game = await GetGame(pin);
  if (game === null) {
    return {
      info: null,
      status: "No game found",
    };
  }

  const info: GameInfo = JSON.parse(game.game);

  if (info.players[info.turn].actionPoints <= 0) {
    return {
      info: null,
      status: "You have no actions left",
    };
  }
  var x = info.players[info.turn].x + offset.x;
  var y = info.players[info.turn].y + offset.y;

  var newX = Math.max(0, Math.min(x, info.map.squares.length - 1));
  var newY = Math.max(0, Math.min(y, info.map.squares[0].length - 1));

  if (x !== newX || y !== newY) {
    return {
      info: null,
      status: "Out of bounds",
    };
  }

  if (info.map.squares[x][y].type === "Wall") {
    return {
      info: null,
      status: "A wall is in the way",
    };
  }
  if (info.homes.filter((i) => i.x === x && i.y === y).length > 0) {
    return {
      info: null,
      status: "A shelter is in the way",
    };
  }
  if (
    info.players.filter((player) => player.x === x && player.y === y).length > 0
  ) {
    return {
      info: null,
      status: "A player is in the way",
    };
  }
  info.players[info.turn].x = x;
  info.players[info.turn].y = y;
  info.players[info.turn].actionPoints -= 1;

  if (info.map.squares[x][y].bonus !== "None") {
    info.players[info.turn].powerups.push(info.map.squares[x][y].bonus);
  }

  game.game = JSON.stringify(info);
  await SaveGame(game);

  return {
    info: info,
    status: "Success",
  };
};

export const GetPlayersFromGame = async (
  io: Server<CToSEvents, SToCEvents, DefaultEventsMap, any>,
  pin: number
) => {
  const game = await GetGame(pin);
  if (game === null) {
    return [];
  }

  return game.players.map((player) => io.sockets.sockets.get(player));
};

export const NextPlayer = async (pin: number) => {
  const game = await GetGame(pin);
  if (game === null) {
    return null;
  }

  const info: GameInfo = JSON.parse(game.game);

  info.players[info.turn].actionPoints += 3;
  info.turn += 1;
  if (info.turn >= game.players.length) {
    info.turn = 0;
  }

  game.game = JSON.stringify(info);
  await SaveGame(game);
  return info;
};

export const ShootGame = async (
  pin: number,
  offset: Coord
): Promise<
  | {
      status: "Success";
      data: { info: GameInfo; players: string[]; deadSocket: string };
    }
  | { status: "Error"; data: null }
> => {
  var game = await GetGame(pin);
  if (game === null) {
    return {
      status: "Error",
      data: null,
    };
  }

  var info: GameInfo = JSON.parse(game.game);

  if (info.players[info.turn].actionPoints <= 0) {
    return {
      status: "Error",
      data: null,
    };
  }
  var x = info.players[info.turn].x + offset.x;
  var y = info.players[info.turn].y + offset.y;

  var newX = Math.max(0, Math.min(x, info.map.squares.length - 1));
  var newY = Math.max(0, Math.min(y, info.map.squares[0].length - 1));

  if (x !== newX || y !== newY) {
    return {
      status: "Error",
      data: null,
    };
  }
  if (info.homes.filter((home) => home.x === x && home.y === y).length !== 0) {
    info = ShootHouse(info, x, y);
    game.game = JSON.stringify(info);
    await SaveGame(game);
    return {
      data: {
        deadSocket: "",
        info: info,
        players: game.players,
      },
      status: "Success",
    };
  } else if (
    info.players.filter((player) => player.x === x && player.y === y).length !==
    0
  ) {
    const playerShootResult = ShootPlayer(info, game, x, y);
    game = playerShootResult.game;
    info = playerShootResult.info;
    const deadSocket = playerShootResult.deadSocket;

    game.game = JSON.stringify(info);
    await SaveGame(game);
    return {
      data: {
        deadSocket: deadSocket,
        players: game.players,
        info: info,
      },
      status: "Success",
    };
  }

  return {
    status: "Error",
    data: null,
  };
};

const ShootPlayer = (info: GameInfo, game: RGame, x: number, y: number) => {
  info.players[info.turn].actionPoints -= 1;

  const player = info.players.filter(
    (player) => player.x === x && player.y === y
  )[0];

  var deadSocket = "";
  player.health -= 1;
  if (player.health <= 0) {
    var index = -1;
    for (var i = 0; i < info.players.length; i++) {
      if (info.players[i].health <= 0) {
        index = i;
        break;
      }
    }

    if (info.homes[index].alive === 0) {
      info.players.splice(index, 1);
      game.players.splice(index, 1);
      deadSocket = game.players[index];
    } else {
      info.players[index].x = info.homes[index].x;
      info.players[index].y = info.homes[index].y;
      info.players[index].health += 3;
    }
  }

  return {
    deadSocket,
    info,
    game,
  };
};

const ShootHouse = (info: GameInfo, x: number, y: number) => {
  var index = -1;
  for (var i = 0; i < info.homes.length; i++) {
    if (info.homes[i].x === x && info.homes[i].y === y) {
      index = i;
      break;
    }
  }

  info.homes[index].alive -= 1;
  info.players[info.turn].actionPoints -= 1;

  if (info.homes[index].alive <= 0) {
    info.homes[index].alive = 0;
  }

  return info;
};

export const UseBonus = async (pin: number, bonus: BonusAction) => {
  const game = await GetGame(pin);
  if (game === null) {
    return null;
  }

  const info: GameInfo = JSON.parse(game.game);

  if (info.players[info.turn].actionPoints <= 0) {
    return null;
  }

  if (bonus.bonus === "ActionPoints") {
    info.players[info.turn].actionPoints += 3;
  }
  if (bonus.bonus === "StarSpawn") {
    const squares = info.map.squares;
    for (var x = 0; x < squares.length; x++) {
      for (var y = 0; y < squares[0].length; y++) {
        if (
          Math.random() < 0.1 &&
          squares[x][y].type === "Land" &&
          info.players.filter((i) => i.x === x && i.y === y).length === 0 &&
          info.homes.filter((i) => i.x === x && i.y === y).length === 0
        ) {
          squares[x][y].bonus =
            BONUSES[Math.floor(Math.random() * BONUSES.length)];
        }
      }
    }
  }
  if (bonus.bonus === "8SpinL" || bonus.bonus === "8SpinR") {
    const coord: Coord = {
      x: info.players[info.turn].x,
      y: info.players[info.turn].y,
    };

    if (
      coord.x === 0 ||
      coord.y === 0 ||
      coord.x === info.map.squares.length - 1 ||
      coord.y === info.map.squares[0].length - 1
    ) {
      return null;
    }

    const offsets: Coord[] = [
      {
        x: -1,
        y: 0,
      },
      {
        x: -1,
        y: -1,
      },
      {
        x: 0,
        y: -1,
      },
      {
        x: 1,
        y: -1,
      },
      {
        x: 1,
        y: 0,
      },
      {
        x: 1,
        y: 1,
      },
      {
        x: 0,
        y: 1,
      },
      {
        x: -1,
        y: 1,
      },
    ];

    if (bonus.bonus === "8SpinR") {
      offsets.reverse();
    }

    var allTiles: Tile[] = [];
    offsets.map((offset) => {
      allTiles.push(info.map.squares[offset.x + coord.x][offset.y + coord.y]);
    });
    allTiles.push(allTiles[0]);
    allTiles.splice(0, 1);
    for (var i = 0; i < offsets.length; i++) {
      const currPos: Coord = {
        x: coord.x + offsets[i].x,
        y: coord.y + offsets[i].y,
      };
      info.map.squares[currPos.x][currPos.y] = allTiles[i];
    }
  }
  if (bonus.bonus === "Jump") {
    const dir = bonus.offset;
    const player = info.players[info.turn];
    if (info.map.squares[player.x + dir.x][player.y + dir.y].type !== "Wall") {
      return null;
    }

    dir.x *= 2;
    dir.y *= 2;

    const newPosX = player.x + dir.x;
    const newPosY = player.y + dir.y;
    if (
      newPosX < 0 ||
      newPosY < 0 ||
      newPosX >= info.map.squares.length ||
      newPosY >= info.map.squares[0].length
    ) {
      return null;
    }

    if (info.map.squares[newPosX][newPosY].type !== "Land") {
      return null;
    }

    if (
      info.homes.filter((home) => home.x === newPosX && home.y === newPosY)
        .length > 0
    ) {
      return null;
    }

    if (
      info.players.filter(
        (player) => player.x === newPosX && player.y === newPosY
      ).length > 0
    ) {
      return null;
    }

    info.players[info.turn].x += dir.x;
    info.players[info.turn].y += dir.y;

    if (info.map.squares[newPosX][newPosY].bonus !== "None") {
      info.players[info.turn].powerups.push(
        info.map.squares[newPosX][newPosY].bonus
      );
    }
  }
  if (bonus.bonus === "MoveBox") {
    info.map.squares[bonus.end.x][bonus.end.y].type = "Wall";
    info.map.squares[bonus.start.x][bonus.start.y].type = "Land";
  }

  info.players[info.turn].actionPoints -= 1;

  const targetInfo = await HideTarget(game.pin);
  if (targetInfo !== null) {
    info.target = targetInfo.target;
  }
  game.game = JSON.stringify(info);
  await SaveGame(game);

  return {
    info,
  };
};

export const TransferActionPoints = async (
  pin: number,
  sender: number,
  reciever: number,
  amount: number
) => {
  const game = await GetGame(pin);
  if (game === null) {
    return null;
  }

  const info: GameInfo = JSON.parse(game.game);

  if (info.players[sender].actionPoints < amount) {
    return null;
  }

  info.players[reciever].actionPoints += amount;
  info.players[sender].actionPoints -= amount;

  game.game = JSON.stringify(info);
  await SaveGame(game);
  return {
    info,
  };
};
