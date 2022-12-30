import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { CToSEvents, SToCEvents } from "../Interfaces/SocketEvents";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket<SToCEvents, CToSEvents> | null>(
    null
  );

  const [isConnected, setIsConnected] = useState(false);

  const connectSocket = () => {
    if (isConnected) {
      return;
    }

    var temp = io("http://localhost:5000");
    setSocket(temp);
  };

  useEffect(() => {
    if (socket === null) {
      console.log("No socket");
      return;
    }

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected to server");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected from server");
    });
  }, [socket]);

  return {
    isConnected,
    socket,
    connectSocket,
  };
};
