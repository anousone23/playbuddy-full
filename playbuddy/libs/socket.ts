import { io } from "socket.io-client";

import { BACK_END_URL } from "@/constants";

export const socket = io(BACK_END_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
