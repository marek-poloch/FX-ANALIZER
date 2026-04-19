import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import type { Server } from "socket.io";
import type { MarketTick, FlowScore } from "@fxradar/shared-types";

@WebSocketGateway({ namespace: "/market", cors: { origin: "*" } })
export class MarketGateway {
  @WebSocketServer() server!: Server;

  broadcastTick(tick: MarketTick) {
    this.server?.emit("tick", tick);
  }
  broadcastFlowScore(score: FlowScore) {
    this.server?.emit("flow", score);
  }
}
