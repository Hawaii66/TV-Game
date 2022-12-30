import { Bonus, Faction, TileType } from "../Interfaces/Game";

export const TypeToColor = (type: TileType) => {
  switch (type) {
    case "Land":
      return "#eeeeee";
    case "Wall":
      return "#bbbbbb";
  }
};

export const FactionToColor = (faction: Faction) => {
  switch (faction) {
    case "Blue":
      return "#93C5FD";
    case "Green":
      return "#B6E2A1";
    case "Orange":
      return "#EEC373";
    case "Red":
      return "#FD8A8A";
  }
};

export const BonusToColor = (bonus: Bonus) => {
  switch (bonus) {
    case "8SpinR":
      return "#85586F";
    case "8SpinL":
      return "#85586F";
    case "ActionPoints":
      return "#FBFACD";
    case "Jump":
      return "#90A17D";
    case "MoveBox":
      return "#DBA39A";
    case "StarSpawn":
      return "#FFACC7";
    case "None":
      return "#000000";
  }
};
