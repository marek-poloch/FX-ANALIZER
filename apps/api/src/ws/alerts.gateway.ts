import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import type { Server } from "socket.io";
import type { Alert } from "@fxradar/shared-types";

@WebSocketGateway({ namespace: "/alerts", cors: { origin: "*" } })
export class AlertsGateway {
  @WebSocketServer() server!: Server;

  broadcastAlert(alert: Alert) {
    this.server?.emit("alert", alert);
  }
}
