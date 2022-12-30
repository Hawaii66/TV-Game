import { useState } from "react";
import { Board, GameInfo, Tile } from "../Interfaces/Game";

export const useGame = () => {
  const [pin, setPin] = useState(-1);
  const [info, setInfo] = useState<GameInfo>({
    homes: [],
    map: {
      squares: [],
    },
    players: [],
  });

  return {
    pin,
    setPin: (pin: number) => setPin(pin),
    setInfo: (info: GameInfo) => setInfo(info),
    info,
  };
};
