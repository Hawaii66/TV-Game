import React from "react";

interface Props {
  dir: "t" | "b" | "l" | "r" | "";
  onClick: () => void;
}

function JoystickButton({ dir, onClick }: Props) {
  return (
    <button
      onClick={() => onClick()}
      className={`drop-shadow-xl active:drop-shadow-none m-2 rounded-${dir}-full aspect-square bg-slate-400`}
    />
  );
}

export default JoystickButton;
