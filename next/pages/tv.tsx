import Pusher from "pusher";
import React, { useEffect, useState } from "react";
import MapVisualiser from "../Components/Map";
import { useGame } from "../Hooks/useGame";
import { useSocket } from "../Hooks/useSocket";
import { FactionToColor } from "../Utils/TypeToColor";

function TV() {
  const { socket, connectSocket } = useSocket();
  const { pin, setPin, info, setInfo } = useGame();
  const [players, setPlayers] = useState<string[]>([]);

  useEffect(() => {
    connectSocket();
  }, []);

  useEffect(() => {
    socket?.on("hostPlayerJoin", (data) => {
      setPlayers((old) => [...old, data.username]);
    });

    socket?.on("gameInfo", (data) => {
      setInfo(data);
    });

    socket?.on("playerSockets", (data) => {
      setPlayers(data);
    });
  }, [socket]);

  const createGame = () => {
    socket?.emit("createGame");

    socket?.on("createGameAck", (data) => {
      setPin(data.pin);

      socket.emit("gameInfo", {
        pin: data.pin,
      });
    });
  };

  if (pin !== -1) {
    return (
      <div className="w-screen h-screen bg-slate-100 flex flex-row">
        <MapVisualiser info={info} />
        <div className="w-1/3">
          <div className="m-4">
            <h1 className="text-3xl font-extrabold text-slate-700 font-mono">
              Pin:{" "}
              {Array.from(Array(4 - pin.toString().length).keys()).map((_) => {
                return "0";
              })}
              {pin}
            </h1>
          </div>
          <ul className="flex flex-col mt-4 gap-4">
            {players.length === info.players.length &&
              players.map((i, index) => {
                return (
                  <li
                    key={i}
                    className="drop-shadow-xl rounded-md p-4 mx-4 bg-slate-100 gap-1"
                  >
                    <div className="flex flex-row">
                      <h1
                        className="text-2xl font-bold"
                        style={{
                          color: FactionToColor(info.players[index].faction),
                        }}
                      >
                        {info.turn === index && "--> "}
                        {i}:
                      </h1>
                      <div className="flex flex-row gap-1 items-center ml-4">
                        {Array.from(
                          Array(info.players[index].health).keys()
                        ).map((_) => {
                          return (
                            <div className="rounded-full aspect-square h-5/6 bg-red-500 flex justify-center items-center">
                              <div className="rounded-full aspect-square h-3/4 bg-slate-100 flex justify-center items-center">
                                <div className="rounded-full aspect-square h-2/3 bg-red-500" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex flex-row">
                      <b className="text-2xl font-bold text-slate-600">House</b>
                      {info.homes[index].alive > 0 ? (
                        <div className="flex flex-row gap-1 items-center ml-4">
                          {Array.from(
                            Array(info.homes[index].alive).keys()
                          ).map((_) => {
                            return (
                              <div className="rounded-full aspect-square h-5/6 bg-red-500 flex justify-center items-center">
                                <div className="rounded-full aspect-square h-3/4 bg-slate-100 flex justify-center items-center">
                                  <div className="rounded-full aspect-square h-2/3 bg-red-500" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="h-5/6">
                          <b className="text-2xl text-red-500 ml-4">X</b>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-row">
                      <b className="text-2xl font-bold text-slate-600">
                        Action Points
                      </b>
                      <div className="h-5/6">
                        <b className="text-2xl text-red-500 ml-4">
                          {info.players[index].actionPoints}
                        </b>
                      </div>
                    </div>
                    <div className="flex flex-row">
                      <b className="text-2xl font-bold text-slate-600">
                        Power ups
                      </b>
                      <div className="h-5/6">
                        <b className="text-2xl text-red-500 ml-4">
                          {info.players[index].powerups.length}
                        </b>
                      </div>
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-blue-300">
      <h1>TV</h1>
      <button onClick={createGame}>Create Game</button>
    </div>
  );
}

export default TV;
