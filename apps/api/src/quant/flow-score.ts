import type {
  FlowScore,
  FlowScoreComponents,
  InstrumentSymbol,
} from "@fxradar/shared-types";
import { clamp } from "./stats";

export interface FlowScoreInputs {
  volumeZ: number;
  priceImpulseAtr: number; // return / ATR ratio
  spreadZ: number;
  orderBookImbalance: number; // |(bid-ask)/(bid+ask)|  in [0,1]
  liquiditySweep: boolean;
  crossPairConfirmation: boolean;
  macroConfirmation: boolean;
  sentimentContradiction: boolean;
  cotExtreme: boolean;
}

export function computeFlowScore(
  symbol: InstrumentSymbol,
  inputs: FlowScoreInputs,
  now = new Date(),
): FlowScore {
  const components: FlowScoreComponents = {
    // z=2 -> 10pts, z=3 -> 15pts, z=4+ -> 20pts
    volumeShock: clamp((Math.abs(inputs.volumeZ) - 1) * 6.5, 0, 20),
    priceImpulse: clamp(Math.abs(inputs.priceImpulseAtr) * 5, 0, 15),
    spreadShock: clamp((Math.abs(inputs.spreadZ) - 1) * 5, 0, 10),
    orderBookImbalance: clamp(inputs.orderBookImbalance * 30, 0, 15),
    liquiditySweep: inputs.liquiditySweep ? 10 : 0,
    crossPair: inputs.crossPairConfirmation ? 10 : 0,
    macroNews: inputs.macroConfirmation ? 10 : 0,
    sentiment: inputs.sentimentContradiction ? 5 : 0,
    cot: inputs.cotExtreme ? 5 : 0,
  };

  const total = Object.values(components).reduce((a, b) => a + b, 0);
  const category = categorize(total);

  return {
    symbol,
    timestamp: now.toISOString(),
    total,
    components,
    category,
  };
}

function categorize(total: number): FlowScore["category"] {
  if (total >= 86) return "major_event";
  if (total >= 71) return "probable_institutional";
  if (total >= 51) return "significant";
  if (total >= 31) return "watch";
  return "noise";
}

export function severityFromScore(total: number): "LOW" | "MEDIUM" | "HIGH" {
  if (total >= 71) return "HIGH";
  if (total >= 51) return "MEDIUM";
  return "LOW";
}
