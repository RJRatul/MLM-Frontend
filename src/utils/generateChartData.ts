/* eslint-disable prefer-const */
// utils/generateChartData.ts
export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export const generateRandomData = (count = 100, basePrice = 50000): CandleData[] => {
  const data: CandleData[] = [];
  let time = Math.floor(Date.now() / 1000) - count * 3600; // Start from count hours ago
  let price = basePrice;
  let trend = 0; // 0 = neutral, 1 = uptrend, -1 = downtrend

  for (let i = 0; i < count; i++) {
    // Change trend occasionally
    if (Math.random() < 0.1) {
      trend = Math.floor(Math.random() * 3) - 1; // Random trend change
    }

    // Determine volatility based on trend and random factor
    const volatility = 50 + Math.random() * 150; // More realistic volatility range
    
    // Calculate price change based on trend
    let change = 0;
    if (trend === 1) {
      // Uptrend - generally positive changes
      change = (Math.random() * 0.8 + 0.2) * volatility;
    } else if (trend === -1) {
      // Downtrend - generally negative changes
      change = (Math.random() * -0.8 - 0.2) * volatility;
    } else {
      // Neutral - balanced changes
      change = (Math.random() - 0.5) * volatility;
    }

    const open = price;
    const close = open + change;
    
    // Calculate realistic high and low with wicks
    const range = volatility * 0.5;
    const high = Math.max(open, close) + Math.random() * range;
    const low = Math.min(open, close) - Math.random() * range;
    
    data.push({
      time: time + i * 3600,
      open,
      high,
      low,
      close,
    });
    
    price = close;
  }
  
  return data;
};

// Generate initial data for a specific pair
export const getInitialDataForPair = (pairName: string): CandleData[] => {
  const basePrices: { [key: string]: number } = {
    'BTC/USD': 50000,
    'ETH/USD': 3000,
    'XRP/USD': 0.5,
    'ADA/USD': 0.4,
    'DOT/USD': 20,
  };
  
  const basePrice = basePrices[pairName] || 100;
  return generateRandomData(100, basePrice);
};