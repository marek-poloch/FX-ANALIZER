import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import type { Server } from "socket.io";
import type { NewsItem } from "@fxradar/shared-types";

@WebSocketGateway({ namespace: "/news", cors: { origin: "*" } })
export class NewsGateway {
  @WebSocketServer() server!: Server;

  broadcastNews(item: NewsItem) {
    this.server?.emit("news", item);
  }
}
