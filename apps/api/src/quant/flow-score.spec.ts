import { computeFlowScore, severityFromScore } from "./flow-score";

describe("computeFlowScore", () => {
  it("produces noise for calm inputs", () => {
    const s = computeFlowScore("6E", {
      volumeZ: 0.1,
      priceImpulseAtr: 0.1,
      spreadZ: 0.1,
      orderBookImbalance: 0.05,
      liquiditySweep: false,
      crossPairConfirmation: false,
      macroConfirmation: false,
      sentimentContradiction: false,
      cotExtreme: false,
    });
    expect(s.total).toBeLessThan(31);
    expect(s.category).toBe("noise");
  });

  it("escalates on severe inputs", () => {
    const s = computeFlowScore("6E", {
      volumeZ: 5,
      priceImpulseAtr: 4,
      spreadZ: 4,
      orderBookImbalance: 0.6,
      liquiditySweep: true,
      crossPairConfirmation: true,
      macroConfirmation: true,
      sentimentContradiction: true,
      cotExtreme: true,
    });
    expect(s.total).toBeGreaterThanOrEqual(86);
    expect(s.category).toBe("major_event");
  });
});

describe("severityFromScore", () => {
  it("maps score to severity", () => {
    expect(severityFromScore(10)).toBe("LOW");
    expect(severityFromScore(55)).toBe("MEDIUM");
    expect(severityFromScore(80)).toBe("HIGH");
  });
});
