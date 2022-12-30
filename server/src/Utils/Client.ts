import { removeSocket } from "../redis";

export const DeleteClient = async (socketId: string) => {
  await removeSocket(socketId);
};
