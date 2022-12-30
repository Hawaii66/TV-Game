import React from "react";
import { Bonus } from "../Interfaces/Game";
import { BonusToColor } from "../Utils/TypeToColor";

interface Props {
  bonus: Bonus;
  onClick: () => void;
}

function Powerup({ bonus, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full aspect-square`}
      style={{
        backgroundColor: BonusToColor(bonus),
      }}
    >
      {bonus.substring(0, 3)}
    </button>
  );
}

export default Powerup;
