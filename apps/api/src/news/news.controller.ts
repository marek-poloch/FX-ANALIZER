import { Controller, Get, Query } from "@nestjs/common";
import { InMemoryStore } from "../store/in-memory.store";

@Controller("news")
export class NewsController {
  constructor(private readonly store: InMemoryStore) {}

  @Get()
  list(@Query("currency") currency?: string, @Query("limit") limit = "50") {
    const all = this.store.getNews(Number(limit));
    if (!currency) return all;
    const cur = currency.toUpperCase();
    return all.filter((n) => n.currencies.includes(cur));
  }
}
