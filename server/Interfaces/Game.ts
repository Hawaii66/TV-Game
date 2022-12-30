export interface GameInfo {
  map: Board;
  players: Player[];
  homes: Home[];
  turn: number;
  target: {
    visible: boolean;
    coord: Coord;
  };
}

export interface Home extends Coord {
  faction: Faction;
  alive: number;
}
export interface Player extends Coord {
  faction: Faction;
  powerups: Bonus[];
  actionPoints: number;
  health: number;
}

export type Faction = "Blue" | "Orange" | "Red" | "Green";

export interface Board {
  squares: Tile[][];
}

export interface Tile extends Coord {
  type: TileType;
  discoverd: boolean;
  bonus: Bonus;
}

export type TileType = "Land" | "Wall";
export type Bonus =
  | "None"
  | "8SpinL"
  | "8SpinR"
  | "Jump"
  | "MoveBox"
  | "StarSpawn"
  | "ActionPoints";

export type BonusJump = {
  bonus: "Jump";
  offset: Coord;
};

export type BonusMove = {
  bonus: "MoveBox";
  start: Coord;
  end: Coord;
};

export type BonusAction =
  | BonusJump
  | BonusMove
  | { bonus: "None" | "8SpinL" | "8SpinR" | "StarSpawn" | "ActionPoints" };

export const BONUSES: Bonus[] = [
  "None",
  "8SpinL",
  "8SpinR",
  "Jump",
  "MoveBox",
  "StarSpawn",
  "ActionPoints",
];

export interface Coord {
  x: number;
  y: number;
}
