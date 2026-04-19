import { Controller, Get, Param, Query, NotFoundException } from "@nestjs/common";
import { InMemoryStore } from "../store/in-memory.store";
import type { InstrumentSymbol } from "@fxradar/shared-types";

@Controller()
export class MarketController {
  constructor(private readonly store: InMemoryStore) {}

  @Get("instruments")
  getInstruments() {
    return this.store.instruments;
  }

  @Get("market/overview")
  getOverview() {
    return this.store.instruments.map((inst) => {
      const tick = this.store.getLatestTick(inst.symbol);
      const flow = this.store.getLatestFlowScore(inst.symbol);
      return {
        symbol: inst.symbol,
        description: inst.description,
        proxyFor: inst.proxyFor,
        price: tick?.price ?? null,
        timestamp: tick?.timestamp ?? null,
        dataQuality: tick?.dataQuality ?? "OFFLINE",
        delayStatus: tick?.delayStatus ?? "mock",
        flowScore: flow?.total ?? 0,
        category: flow?.category ?? "noise",
      };
    });
  }

  @Get("market/:symbol/latest")
  getLatest(@Param("symbol") symbol: string) {
    const tick = this.store.getLatestTick(symbol as InstrumentSymbol);
    if (!tick) throw new NotFoundException(`No data for ${symbol}`);
    return tick;
  }

  @Get("market/:symbol/candles")
  getCandles(
    @Param("symbol") symbol: string,
    @Query("interval") interval = "1m",
    @Query("limit") limit = "200",
  ) {
    return this.store.getCandles(symbol as InstrumentSymbol, interval, Number(limit));
  }

  @Get("market/:symbol/ticks")
  getTicks(@Param("symbol") symbol: string, @Query("limit") limit = "500") {
    return this.store.getTicks(symbol as InstrumentSymbol, Number(limit));
  }
}
