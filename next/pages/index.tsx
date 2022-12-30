import { use, useEffect, useState } from "react";
import Pusher from "pusher-js";
import { useSocket } from "../Hooks/useSocket";
import { usePlayer } from "../Hooks/usePlayer";
import { Coord, GameInfo } from "../Interfaces/Game";
import JoystickButton from "../Components/JoystickButton";
import Joystick from "../Components/Joystick";
import Powerups from "../Components/Powerups";
import Modal from "../Components/Modal";
import Transfer from "../Components/Transfer";

export default function Home() {
  const { isConnected, socket, connectSocket } = useSocket();
  const { createPlayer, username, removePlayer } = usePlayer();

  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [showForm, setShowForm] = useState(true);
  const [info, setInfo] = useState<GameInfo | null>(null);
  const [allSockets, setSockets] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [alive, setAlive] = useState(true);
  const [showJumpModal, setShowJumpModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveInfo, setMoveInfo] = useState<Coord>({
    x: -1,
    y: -1,
  });

  useEffect(() => {
    connectSocket();
  }, []);

  useEffect(() => {
    socket?.on("gameQuit", () => {
      setPin("");
      setName("");
      setShowForm(true);
      removePlayer();
    });

    socket?.on("gameInfo", (data) => {
      setInfo(data);
    });

    socket?.on("playerSockets", (data) => {
      setSockets(data);
    });

    socket?.on("moveError", (data) => {
      if (data.startsWith("You have")) {
        setError("");
        return;
      }

      setError(data);
    });

    socket?.on("dead", () => {
      setAlive(false);
    });
  }, [socket]);

  const joinGame = () => {
    setShowForm(false);
    socket?.emit("join", {
      pin: parseInt(pin),
      username: name,
    });

    socket?.on("joinack", (data) => {
      if (!data.status) {
        setPin("");
        setName("");
        setShowForm(true);
        return;
      }
      createPlayer(data.id, name, parseInt(pin));
    });
  };

  const move = (offset: Coord) => {
    socket?.emit("move", {
      offset,
      pin: parseInt(pin),
    });
  };

  const shoot = (offset: Coord) => {
    socket?.emit("shoot", {
      offset: offset,
      pin: parseInt(pin),
    });
  };

  const jump = (offset: Coord) => {
    socket?.emit("useBonus", {
      bonus: {
        bonus: "Jump",
        offset: offset,
      },
      pin: parseInt(pin),
    });
  };

  const nextPlayer = () => {
    socket?.emit("turnDone", {
      pin: parseInt(pin),
    });
  };

  const moveBox = (offset: Coord) => {
    socket?.emit("targetMove", {
      offset: offset,
      pin: parseInt(pin),
    });
  };

  const startMove = () => {
    setMoveInfo({
      x: -1,
      y: -1,
    });
    socket?.emit("targetVisible", {
      pin: parseInt(pin),
      state: true,
    });
  };

  const cancelMove = () => {
    setShowMoveModal(false);
    setMoveInfo({
      x: -1,
      y: -1,
    });
    socket?.emit("targetVisible", {
      pin: parseInt(pin),
      state: false,
    });
  };

  const pickUpWall = () => {
    if (info === null) {
      return;
    }

    if (
      info.map.squares[info.target.coord.x][info.target.coord.y].type !== "Wall"
    ) {
      setError("No box here");
      cancelMove();
      return;
    }

    setMoveInfo({
      x: info.target.coord.x,
      y: info.target.coord.y,
    });
  };

  const dropWall = () => {
    if (info === null) {
      return;
    }

    if (
      info.map.squares[info.target.coord.x][info.target.coord.y].type !== "Land"
    ) {
      setError("Can only place a wall on land");
      return;
    }
    if (
      info.players.filter(
        (i) => i.x === info.target.coord.x && i.y === info.target.coord.y
      ).length > 0
    ) {
      setError("Cant place box on a player");
      return;
    }
    if (
      info.homes.filter(
        (i) => i.x === info.target.coord.x && i.y === info.target.coord.y
      ).length > 0
    ) {
      setError("Cant place box on a house");
      return;
    }
    if (
      info.target.coord.x === moveInfo.x &&
      info.target.coord.y === moveInfo.y
    ) {
      setError("Cant place wall on same spot");
      return;
    }
    socket?.emit("useBonus", {
      bonus: {
        bonus: "MoveBox",
        end: {
          x: info.target.coord.x,
          y: info.target.coord.y,
        },
        start: moveInfo,
      },
      pin: parseInt(pin),
    });
    setShowMoveModal(false);
  };

  const handleWall = () => {
    if (moveInfo.x === -1 && moveInfo.y === -1) {
      pickUpWall();
    } else {
      dropWall();
      setMoveInfo({
        x: -1,
        y: -1,
      });
    }
  };

  return (
    <div className="bg-blue-200 w-screen h-screen">
      {username !== "" && (
        <div className="w-full h-full flex flex-col gap-4 items-center">
          <h1 className="mt-4 text-3xl font-extrabold font-mono text-slate-500 text-center">
            {username}:
          </h1>
          {info !== null && allSockets[info.turn] === socket?.id && (
            <>
              <div className="w-full flex flex-col items-center">
                {error !== "" && (
                  <div className="w-2/3 bg-red-500 px-4 py-2 flex flex-row justify-between">
                    <h3 className="text-slate-700 font-mono font-semibold">
                      {error}
                    </h3>
                    <button
                      className="h-5/6 font-extrabold aspect-square text-slate-700"
                      onClick={() => setError("")}
                    >
                      X
                    </button>
                  </div>
                )}
                <Joystick
                  onMove={move}
                  onShoot={shoot}
                  faction={info.players[info.turn].faction}
                />
                <button
                  onClick={nextPlayer}
                  className="bg-blue-300 drop-shadow-lg p-4 rounded-2xl mt-4 text-2xl font-bold text-slate-500 text-center "
                >
                  Next Player
                </button>
              </div>

              <Powerups
                onUse={(index) => {
                  const currentPowerup =
                    info.players[info.turn].powerups[index];
                  if (currentPowerup === "Jump") {
                    setShowJumpModal(true);
                    return;
                  }
                  if (currentPowerup === "MoveBox") {
                    setShowMoveModal(true);
                    startMove();
                    return;
                  }
                  var text:
                    | "None"
                    | "8SpinL"
                    | "8SpinR"
                    | "StarSpawn"
                    | "ActionPoints" = "None";
                  if (currentPowerup === "8SpinL") {
                    text = "8SpinL";
                  }
                  if (currentPowerup === "8SpinR") {
                    text = "8SpinR";
                  }
                  if (currentPowerup === "StarSpawn") {
                    text = "StarSpawn";
                  }
                  if (currentPowerup === "ActionPoints") {
                    text = "ActionPoints";
                  }
                  socket.emit("useBonus", {
                    bonus: {
                      bonus: text,
                    },
                    pin: parseInt(pin),
                  });
                }}
                powerups={info.players[info.turn].powerups}
              />
            </>
          )}
          {!alive && (
            <h1 className="text-3xl font-bold font-mono text-red-600">
              You are dead
            </h1>
          )}
          {info !== null && (
            <Transfer
              info={info}
              players={allSockets}
              socket={socket}
              pin={parseInt(pin)}
            />
          )}
        </div>
      )}
      {showForm && (
        <>
          <h1>Connect Client</h1>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="NAME"
            className="bg-blue-200"
            maxLength={15}
          />
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN"
            className="bg-blue-200"
            maxLength={4}
          />
          <button onClick={() => joinGame()}>Connect</button>
        </>
      )}
      {showJumpModal && (
        <Modal
          onClick={(offset) => {
            jump(offset);
            setShowJumpModal(false);
          }}
          onClose={() => setShowJumpModal(false)}
        />
      )}
      {showMoveModal && (
        <Modal onClick={moveBox} onClose={cancelMove}>
          <button
            onClick={handleWall}
            className="w-2/3 text-2xl font-bold text-slate-600 mt-2 px-4 py-2 rounded-lg bg-blue-200"
          >
            {moveInfo.x === -1 && moveInfo.y === -1
              ? "Pick up box"
              : "Drop Box"}
          </button>
        </Modal>
      )}
    </div>
  );
}
