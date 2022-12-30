import React from "react";
import { Coord } from "../Interfaces/Game";
import JoystickButton from "./JoystickButton";

interface Props {
  onClick: (offset: Coord) => void;
  onClose: () => void;
  children?: React.ReactNode;
}

function Modal({ onClick, onClose, children }: Props) {
  return (
    <div className="absolute inset-0 m-auto w-2/3 h-2/5 flex items-center justify-center flex-col bg-blue-300 rounded-3xl drop-shadow-2xl">
      <h1 className="font-mono text-slate-600 text-center text-2xl font-bold">
        Which Direction?
      </h1>
      <div className="w-3/4 aspect-square grid grid-cols-3 grid-rows-3">
        <div />
        <JoystickButton
          dir="t"
          onClick={() =>
            onClick({
              x: 0,
              y: -1,
            })
          }
        />
        <div />
        <JoystickButton
          dir="l"
          onClick={() =>
            onClick({
              x: -1,
              y: 0,
            })
          }
        />
        <button
          onClick={() => onClose()}
          className={`drop-shadow-xl active:drop-shadow-none m-2 aspect-square bg-slate-400 text-3xl font-extrabold text-mono text-slate-600`}
        >
          X
        </button>
        <JoystickButton
          dir="r"
          onClick={() =>
            onClick({
              x: 1,
              y: 0,
            })
          }
        />
        <div />
        <JoystickButton
          dir="b"
          onClick={() =>
            onClick({
              x: 0,
              y: 1,
            })
          }
        />
        <div />
      </div>
      {children}
    </div>
  );
}

export default Modal;
