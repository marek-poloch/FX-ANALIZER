import { Controller, Get, Post, Param, Body, NotFoundException } from "@nestjs/common";
import { InMemoryStore } from "../store/in-memory.store";

interface AlertConfigDto {
  userId: string;
  instruments?: string[];
  minScore?: number;
  minSeverity?: "LOW" | "MEDIUM" | "HIGH";
  channels?: string[];
}

@Controller("alerts")
export class AlertsController {
  constructor(private readonly store: InMemoryStore) {}

  @Get()
  list() {
    return this.store.getAlerts();
  }

  @Get(":id")
  get(@Param("id") id: string) {
    const alert = this.store.getAlert(id);
    if (!alert) throw new NotFoundException(`Alert ${id} not found`);
    return alert;
  }

  @Post("config")
  saveConfig(@Body() dto: AlertConfigDto) {
    // In demo mode we simply echo the config; persistence goes to Postgres in live mode.
    return {
      ok: true,
      savedAt: new Date().toISOString(),
      config: {
        userId: dto.userId,
        instruments: dto.instruments ?? [],
        minScore: dto.minScore ?? 50,
        minSeverity: dto.minSeverity ?? "MEDIUM",
        channels: dto.channels ?? [],
      },
    };
  }
}
