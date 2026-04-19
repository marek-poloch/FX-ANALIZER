import { EwmaBaseline, RollingStats, trueRange, clamp } from "./stats";

describe("RollingStats", () => {
  it("computes mean/stdev/zscore", () => {
    const rs = new RollingStats(5);
    [1, 2, 3, 4, 5].forEach((x) => rs.push(x));
    expect(rs.mean()).toBeCloseTo(3);
    expect(rs.stdev()).toBeGreaterThan(0);
    expect(rs.zScore(5)).toBeGreaterThan(0);
  });

  it("caps size at window", () => {
    const rs = new RollingStats(3);
    [1, 2, 3, 4, 5].forEach((x) => rs.push(x));
    expect(rs.size()).toBe(3);
    expect(rs.mean()).toBeCloseTo(4);
  });

  it("returns 0 z for empty stdev", () => {
    const rs = new RollingStats(5);
    rs.push(1);
    expect(rs.zScore(1)).toBe(0);
  });
});

describe("EwmaBaseline", () => {
  it("tracks values with smoothing", () => {
    const e = new EwmaBaseline(0.5);
    e.update(10);
    expect(e.get()).toBe(10);
    e.update(20);
    expect(e.get()).toBe(15);
  });
});

describe("trueRange", () => {
  it("picks the widest range", () => {
    expect(trueRange(11, 10, 9)).toBe(2);
    expect(trueRange(11, 10, 12)).toBe(2);
  });
});

describe("clamp", () => {
  it("bounds values", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });
});
