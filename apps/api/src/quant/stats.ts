/**
 * Lightweight streaming stats used by alert-engine.
 * Heavy historical computation lives in services/quant-engine (Python).
 */

export class EwmaBaseline {
  private value = 0;
  private initialized = false;
  constructor(private readonly alpha: number) {}

  update(x: number): number {
    if (!this.initialized) {
      this.value = x;
      this.initialized = true;
    } else {
      this.value = this.alpha * x + (1 - this.alpha) * this.value;
    }
    return this.value;
  }
  get(): number {
    return this.value;
  }
}

export class RollingStats {
  private buf: number[] = [];
  constructor(private readonly window: number) {}

  push(x: number): void {
    this.buf.push(x);
    if (this.buf.length > this.window) this.buf.shift();
  }
  mean(): number {
    if (this.buf.length === 0) return 0;
    return this.buf.reduce((a, b) => a + b, 0) / this.buf.length;
  }
  stdev(): number {
    if (this.buf.length < 2) return 0;
    const m = this.mean();
    const v = this.buf.reduce((acc, x) => acc + (x - m) ** 2, 0) / (this.buf.length - 1);
    return Math.sqrt(v);
  }
  zScore(x: number): number {
    const s = this.stdev();
    if (s === 0) return 0;
    return (x - this.mean()) / s;
  }
  percentileRank(x: number): number {
    if (this.buf.length === 0) return 0.5;
    const below = this.buf.filter((v) => v <= x).length;
    return below / this.buf.length;
  }
  size(): number {
    return this.buf.length;
  }
}

/** ATR-like true range on candle returns. */
export function trueRange(high: number, low: number, prevClose: number): number {
  return Math.max(
    high - low,
    Math.abs(high - prevClose),
    Math.abs(low - prevClose),
  );
}

export function clamp(x: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, x));
}
