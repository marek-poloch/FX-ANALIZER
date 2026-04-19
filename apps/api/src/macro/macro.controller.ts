import { Controller, Get } from "@nestjs/common";
import { InMemoryStore } from "../store/in-memory.store";

@Controller("macro")
export class MacroController {
  constructor(private readonly store: InMemoryStore) {}

  @Get("calendar")
  calendar() {
    return this.store.getMacro();
  }
}
