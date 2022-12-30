import { Board, Bonus, BonusAction, Coord, GameInfo } from "./Game";

export interface Player {
  username: string;
  pin: number;
}
export interface CToSEvents {
  join: ({ username, pin }: Player) => void;
  createGame: () => void;
  gameInfo: ({ pin }: { pin: number }) => void;
  move: ({ pin, offset }: { pin: number; offset: Coord }) => void;
  turnDone: ({ pin }: { pin: number }) => void;
  shoot: ({ pin, offset }: { pin: number; offset: Coord }) => void;
  useBonus: ({ pin, bonus }: { pin: number; bonus: BonusAction }) => void;
  targetMove: ({ pin, offset }: { pin: number; offset: Coord }) => void;
  targetVisible: ({ pin, state }: { pin: number; state: boolean }) => void;
  sendActionPoints: ({
    pin,
    sender,
    reciever,
    amount,
  }: {
    pin: number;
    sender: number;
    reciever: number;
    amount: number;
  }) => void;
  names: ({ pin }: { pin: number }) => void;
}

export interface SToCEvents {
  joinack: ({ status, id }: { status: boolean; id: string }) => void;
  createGameAck: ({ pin, id }: { pin: number; id: string }) => void;
  hostPlayerJoin: (player: Player) => void;
  gameQuit: () => void;
  gameInfo: (info: GameInfo) => void;
  moveError: (status: string) => void;
  playerSockets: (sockets: string[]) => void;
  shootError: (status: string) => void;
  dead: () => void;
  names: (names: string[]) => void;
}
