/* eslint-disable prefer-const */

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

// Types for pattern-based candle generation
export interface CandlePattern {
  trend: "bullish" | "bearish" | "consolidation";
  strength: number; // 0-1
  duration: number; // in candles
  volatility: number; // 0-1
}

export interface IntraCandleMovement {
  direction: "up" | "down";
  startPrice: number;
  targetExtreme: number;
}

// --- Generate realistic historical candles ---
export const generateRandomData = (
  count = 100,
  basePrice = 500
): CandleData[] => {
  const data: CandleData[] = [];
  const nowSec = Math.floor(Date.now() / 1000);
  let time = nowSec - count * 60;
  let price = basePrice;

  let direction = Math.random() > 0.5 ? 1 : -1;
  let runLength = Math.floor(Math.random() * 3) + 1;
  let runStep = 0;

  for (let i = 0; i < count; i++) {
    const vol = basePrice * 0.001;
    const trendBias = direction * (Math.random() * 0.6 + 0.2);
    const noise = (Math.random() - 0.5) * 0.3;
    const change = (trendBias + noise) * vol;

    const open = price;
    const close = Math.max(0.0001, open + change);
    const high = Math.max(open, close) + Math.random() * vol * 0.4;
    const low = Math.min(open, close) - Math.random() * vol * 0.4;

    data.push({
      time: time + i * 60,
      open: Math.max(0.0001, open),
      high: Math.max(0.0001, high),
      low: Math.max(0.0001, low),
      close: Math.max(0.0001, close),
    });

    price = close;
    runStep++;

    if (runStep >= runLength) {
      const continueProb = 0.35 + Math.random() * 0.15;
      if (Math.random() > continueProb) direction *= -1;
      runLength = Math.floor(Math.random() * 3) + 1;
      runStep = 0;
    }
  }

  return data;
};

// --- Pair-based initial data ---
export const getInitialDataForPair = (pairName: string): CandleData[] => {
  const basePrice = 500;
  return generateRandomData(1000, basePrice);
};

// --- Generate new candle pattern ---
export const generateNewPattern = (): CandlePattern => {
  const rand = Math.random();
  if (rand < 0.45) {
    return {
      trend: "bullish",
      strength: 0.25 + Math.random() * 0.5,
      duration: 1 + Math.floor(Math.random() * 3),
      volatility: 0.15 + Math.random() * 0.35,
    };
  } else if (rand < 0.85) {
    return {
      trend: "bearish",
      strength: 0.25 + Math.random() * 0.5,
      duration: 1 + Math.floor(Math.random() * 3),
      volatility: 0.15 + Math.random() * 0.35,
    };
  } else {
    return {
      trend: "consolidation",
      strength: 0.05 + Math.random() * 0.2,
      duration: 1 + Math.floor(Math.random() * 3),
      volatility: 0.05 + Math.random() * 0.15,
    };
  }
};

// --- Generate intra-candle movement ---
export const generateIntraCandleMovement = (
  openPrice: number,
  pattern: CandlePattern
): IntraCandleMovement => {
  const baseVolatility = openPrice * 0.001 * (0.5 + pattern.volatility);
  const willReverse = Math.random() < 0.7;

  if (pattern.trend === "bullish") {
    if (willReverse) {
      const dip = openPrice - baseVolatility * (0.2 + Math.random() * 0.4);
      return {
        direction: "down",
        startPrice: openPrice,
        targetExtreme: Math.max(openPrice * 0.995, dip),
      };
    } else {
      return {
        direction: "up",
        startPrice: openPrice,
        targetExtreme: openPrice + baseVolatility * (0.4 + Math.random() * 0.6),
      };
    }
  } else if (pattern.trend === "bearish") {
    if (willReverse) {
      const spike = openPrice + baseVolatility * (0.2 + Math.random() * 0.4);
      return {
        direction: "up",
        startPrice: openPrice,
        targetExtreme: Math.min(openPrice * 1.005, spike),
      };
    } else {
      return {
        direction: "down",
        startPrice: openPrice,
        targetExtreme: openPrice - baseVolatility * (0.4 + Math.random() * 0.6),
      };
    }
  } else {
    const smallMove = openPrice * (Math.random() < 0.5 ? 0.999 : 1.001);
    const direction: "up" | "down" = Math.random() < 0.5 ? "up" : "down";
    return { direction, startPrice: openPrice, targetExtreme: smallMove };
  }
};
