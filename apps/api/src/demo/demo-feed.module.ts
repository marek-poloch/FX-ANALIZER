import { Module } from "@nestjs/common";
import { DemoFeedService } from "./demo-feed.service";
import { WsModule } from "../ws/ws.module";

@Module({
  imports: [WsModule],
  providers: [DemoFeedService],
})
export class DemoFeedModule {}
