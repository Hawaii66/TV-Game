import React, { useState } from "react";
import { Coord, Faction } from "../Interfaces/Game";
import { FactionToColor } from "../Utils/TypeToColor";
import JoystickButton from "./JoystickButton";

interface Props {
  onMove: (offset: Coord) => void;
  onShoot: (offset: Coord) => void;
  faction: Faction;
}

function Joystick({ onMove, onShoot, faction }: Props) {
  const [joystickMode, changeMode] = useState<"Move" | "Attack">("Move");

  const onClick = (offset: Coord) => {
    if (joystickMode === "Move") {
      onMove(offset);
    } else {
      onShoot(offset);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <h1
        className={`text-2xl font-bold text-center ${
          joystickMode === "Attack" && "text-red-500"
        }`}
        style={{
          color: FactionToColor(faction),
          textAlign: "right",
        }}
      >
        {joystickMode}
      </h1>
      <div className="w-1/2 aspect-square grid grid-cols-3 grid-rows-3">
        <div />
        <JoystickButton dir="t" onClick={() => onClick({ x: 0, y: -1 })} />
        <div />
        <JoystickButton dir="l" onClick={() => onClick({ x: -1, y: 0 })} />
        <button
          onClick={() =>
            changeMode((old) => (old === "Move" ? "Attack" : "Move"))
          }
          className={`drop-shadow-xl active:drop-shadow-none m-2 rounded-full aspect-square bg-slate-400 ${
            joystickMode === "Attack" && "bg-red-500"
          }`}
          style={{
            backgroundColor:
              joystickMode === "Move" ? FactionToColor(faction) : "",
          }}
        ></button>
        <JoystickButton dir="r" onClick={() => onClick({ x: 1, y: 0 })} />
        <div />
        <JoystickButton dir="b" onClick={() => onClick({ x: 0, y: 1 })} />
        <div />
      </div>
    </div>
  );
}

export default Joystick;
