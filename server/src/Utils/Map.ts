import {
  Board,
  Bonus,
  BONUSES,
  Coord,
  Faction,
  Tile,
  TileType,
} from "../../Interfaces/Game";
import { GetPoints } from "./MidpointCircle";
var perlin = require("perlin-noise");

export const GenerateMap = (): Board => {
  const map: Tile[][] = [];
  const width = 10;
  const height = 10;

  const noise = perlin.generateWhiteNoise(width, height);

  for (var x = 0; x < width; x++) {
    var row: Tile[] = [];
    for (var y = 0; y < height; y++) {
      var type: TileType = noise[y * width + x] < 0.1 ? "Wall" : "Land";

      var bonus: Bonus =
        type !== "Land"
          ? "None"
          : Math.random() < 0.1
          ? BONUSES[Math.floor(Math.random() * BONUSES.length)]
          : "None";

      row.push({
        type: type,
        x: x,
        y: y,
        bonus: bonus,
        discoverd: true,
      });
    }

    map.push(row);
  }

  return {
    squares: map,
  };
};

export const GenerateHouses = (factions: Faction[], board: Board) => {
  var positions: { faction: Faction; coord: Coord }[] = [];

  for (var i = 0; i < factions.length; i++) {
    const x = Math.floor(Math.random() * board.squares.length);
    const y = Math.floor(Math.random() * board.squares[0].length);
    positions.push({ coord: { x, y }, faction: factions[i] });
  }

  positions.forEach((pos) => {
    board.squares[pos.coord.x][pos.coord.y].type = "Land";
    board.squares[pos.coord.x][pos.coord.y].discoverd = true;
    board.squares[pos.coord.x][pos.coord.y].bonus = "None";
  });

  return {
    positions,
    board,
  };
};
