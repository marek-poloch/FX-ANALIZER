import { Body, Controller, Get, NotFoundException, Post } from "@nestjs/common";
import { ReplayService } from "./replay.service";

@Controller("replay")
export class ReplayController {
  constructor(private readonly service: ReplayService) {}

  @Get("sessions")
  sessions() {
    return this.service.list();
  }

  @Post("start")
  start(@Body() body: { label: string; startTs: string; endTs: string; speed?: number }) {
    return this.service.start(body);
  }

  @Post("stop")
  stop(@Body() body: { id: string }) {
    const s = this.service.stop(body.id);
    if (!s) throw new NotFoundException(`Replay ${body.id} not found`);
    return s;
  }
}
