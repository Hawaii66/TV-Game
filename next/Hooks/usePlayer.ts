import { useState } from "react";

export type Status = "joining" | "waiting" | "playing";

export const usePlayer = () => {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState(-1);
  const [status, setStatus] = useState<Status>("joining");
  const [id, setId] = useState("");

  const createPlayer = (id: string, username: string, pin: number) => {
    setUsername(username);
    setPin(pin);
    setId(id);
  };

  const removePlayer = () => {
    setUsername("");
    setPin(-1);
    setId("");
  };

  return {
    createPlayer,
    username,
    pin,
    status,
    removePlayer,
    changeStatus: (status: Status) => setStatus(status),
  };
};
