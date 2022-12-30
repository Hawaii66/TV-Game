import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { GameInfo } from "../Interfaces/Game";
import { SToCEvents, CToSEvents } from "../Interfaces/SocketEvents";

interface Props {
  info: GameInfo;
  players: string[];
  socket: Socket<SToCEvents, CToSEvents> | null;
  pin: number;
}

function Transfer({ info, players, socket, pin }: Props) {
  const [amount, setAmount] = useState(1);
  const [names, setNames] = useState<string[]>([]);

  const getNames = async () => {
    socket?.emit("names", {
      pin: pin,
    });
  };

  const transferPoints = (index: number) => {
    if (socket === null) {
      return;
    }

    var sender = -1;
    for (var i = 0; i < players.length; i++) {
      if (players[i] === socket.id) {
        sender = i;
        break;
      }
    }

    socket.emit("sendActionPoints", {
      amount: amount,
      pin: pin,
      reciever: index,
      sender: sender,
    });
    setAmount(0);
  };

  useEffect(() => {
    socket?.on("names", (data) => {
      setNames(data);
    });
  }, [socket]);

  useEffect(() => {
    getNames();
  }, [players]);

  return (
    <div className="w-full flex flex-col justify-center items-center gap-4">
      <h1 className={"text-2xl font-bold text-center text-green-500"}>
        Transfer Action Points
      </h1>
      <div className="flex flex-row justify-center items-center">
        <button
          className="text-5xl text-slate-600 font-extrabold font-mono"
          onClick={() => {
            if (amount > 1) {
              setAmount((old) => old - 1);
            }
          }}
        >
          -
        </button>
        <h1 className="text-5xl text-slate-600 font-bold font-mono mx-4">
          {amount}
        </h1>
        <button
          className="text-5xl text-slate-600 font-extrabold font-mono"
          onClick={() => {
            if (socket === null) {
              return;
            }

            var me = -1;
            for (var i = 0; i < players.length; i++) {
              if (players[i] === socket.id) {
                me = i;
                break;
              }
            }
            if (amount <= info.players[me].actionPoints - 1) {
              setAmount((old) => old + 1);
            }
          }}
        >
          +
        </button>
      </div>
      <ul className="w-full flex flex-col items-center gap-4">
        {info.players.map((_, index) => {
          if (players[index] === socket?.id || "") {
            return <></>;
          }

          return (
            <li className="w-full flex flex-col items-center">
              <button
                onClick={() => transferPoints(index)}
                className="flex justify-between flex-row w-1/3 items-center"
              >
                <h3 className="text-3xl font-mono text-slate-600 font-bold">
                  {names[index]}
                </h3>
                <div className="text-3xl font-mono text-slate-600 font-bold">
                  {"=>"}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Transfer;
