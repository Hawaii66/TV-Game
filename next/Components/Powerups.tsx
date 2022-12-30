import React from "react";
import { Bonus } from "../Interfaces/Game";
import Powerup from "./Powerup";

interface Props {
  powerups: Bonus[];
  onUse: (index: number) => void;
}

function Powerups({ powerups, onUse }: Props) {
  return (
    <div className="w-full flex flex-col justify-center items-center gap-4">
      <h1 className={"text-2xl font-bold text-center text-green-500"}>
        Powerups
      </h1>
      <div className="grid grid-cols-4 gap-4 w-2/3">
        {powerups.map((bonus, index) => {
          return <Powerup bonus={bonus} onClick={() => onUse(index)} />;
        })}
      </div>
    </div>
  );
}

export default Powerups;
