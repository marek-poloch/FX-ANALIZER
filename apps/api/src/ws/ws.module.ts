import { Module } from "@nestjs/common";
import { MarketGateway } from "./market.gateway";
import { AlertsGateway } from "./alerts.gateway";
import { NewsGateway } from "./news.gateway";

@Module({
  providers: [MarketGateway, AlertsGateway, NewsGateway],
  exports: [MarketGateway, AlertsGateway, NewsGateway],
})
export class WsModule {}
