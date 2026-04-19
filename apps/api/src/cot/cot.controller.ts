import { Controller, Get, Param } from "@nestjs/common";
import { InMemoryStore } from "../store/in-memory.store";
import type { InstrumentSymbol } from "@fxradar/shared-types";

@Controller("cot")
export class CotController {
  constructor(private readonly store: InMemoryStore) {}

  @Get(":symbol")
  get(@Param("symbol") symbol: string) {
    return this.store.getCot(symbol as InstrumentSymbol);
  }
}
