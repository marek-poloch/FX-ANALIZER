import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { StoreModule } from "./store/store.module";
import { HealthController } from "./health/health.controller";
import { MarketModule } from "./market/market.module";
import { AlertsModule } from "./alerts/alerts.module";
import { MacroModule } from "./macro/macro.module";
import { NewsModule } from "./news/news.module";
import { SentimentModule } from "./sentiment/sentiment.module";
import { CotModule } from "./cot/cot.module";
import { ReplayModule } from "./replay/replay.module";
import { WsModule } from "./ws/ws.module";
import { DemoFeedModule } from "./demo/demo-feed.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    StoreModule,
    MarketModule,
    AlertsModule,
    MacroModule,
    NewsModule,
    SentimentModule,
    CotModule,
    ReplayModule,
    WsModule,
    DemoFeedModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
