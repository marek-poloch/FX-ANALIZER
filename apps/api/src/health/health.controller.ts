import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  health() {
    return {
      status: "ok",
      service: "fxradar-api",
      dataMode: process.env.DATA_MODE ?? "demo",
      timestamp: new Date().toISOString(),
    };
  }
}
