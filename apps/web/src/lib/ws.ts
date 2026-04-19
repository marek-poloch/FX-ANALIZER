import { io, Socket } from "socket.io-client";
import { WS_URL } from "./api";

let marketSocket: Socket | null = null;
let alertsSocket: Socket | null = null;
let newsSocket: Socket | null = null;

export function getMarketSocket(): Socket {
  if (!marketSocket) marketSocket = io(`${WS_URL}/market`, { transports: ["websocket"] });
  return marketSocket;
}
export function getAlertsSocket(): Socket {
  if (!alertsSocket) alertsSocket = io(`${WS_URL}/alerts`, { transports: ["websocket"] });
  return alertsSocket;
}
export function getNewsSocket(): Socket {
  if (!newsSocket) newsSocket = io(`${WS_URL}/news`, { transports: ["websocket"] });
  return newsSocket;
}
