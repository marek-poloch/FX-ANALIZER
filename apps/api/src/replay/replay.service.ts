import { Injectable } from "@nestjs/common";
import { v4 as uuid } from "uuid";

export interface ReplaySession {
  id: string;
  label: string;
  startTs: string;
  endTs: string;
  speed: number;
  state: "ready" | "running" | "paused" | "completed";
}

@Injectable()
export class ReplayService {
  private sessions: ReplaySession[] = [];

  list(): ReplaySession[] {
    return this.sessions;
  }

  start(params: { label: string; startTs: string; endTs: string; speed?: number }): ReplaySession {
    const session: ReplaySession = {
      id: uuid(),
      label: params.label,
      startTs: params.startTs,
      endTs: params.endTs,
      speed: params.speed ?? 1.0,
      state: "running",
    };
    this.sessions.unshift(session);
    return session;
  }

  stop(id: string): ReplaySession | null {
    const s = this.sessions.find((x) => x.id === id);
    if (!s) return null;
    s.state = "completed";
    return s;
  }
}
