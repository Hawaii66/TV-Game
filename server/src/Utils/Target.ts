import { Coord, GameInfo } from "../../Interfaces/Game";
import { GetGame, SaveGame } from "./Game";

export const MoveTarget = async (pin: number, offset: Coord) => {
  const game = await GetGame(pin);
  if (game === null) {
    return null;
  }

  const info: GameInfo = JSON.parse(game.game);
  info.target.visible = true;

  const newX = info.target.coord.x + offset.x;
  const newY = info.target.coord.y + offset.y;

  if (
    newX < 0 ||
    newY < 0 ||
    newX >= info.map.squares.length ||
    newY >= info.map.squares[0].length
  ) {
    return null;
  }

  info.target.coord.x = newX;
  info.target.coord.y = newY;

  game.game = JSON.stringify(info);
  await SaveGame(game);
  return info;
};

export const ShowTarget = async (pin: number) => {
  const game = await GetGame(pin);
  if (game === null) {
    return null;
  }

  const info: GameInfo = JSON.parse(game.game);
  info.target.visible = true;

  game.game = JSON.stringify(info);
  await SaveGame(game);
  return info;
};

export const HideTarget = async (pin: number) => {
  const game = await GetGame(pin);
  if (game === null) {
    return null;
  }

  const info: GameInfo = JSON.parse(game.game);
  info.target.visible = false;

  game.game = JSON.stringify(info);
  await SaveGame(game);
  return info;
};
