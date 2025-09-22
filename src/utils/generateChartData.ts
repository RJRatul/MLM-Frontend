/* eslint-disable prefer-const */
export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export const generateRandomData = (count = 100, basePrice = 500): CandleData[] => {
  const data: CandleData[] = [];
  let time = Math.floor(Date.now() / 1000) - count * 60;
  let price = basePrice;
  let trend = 0;

  for (let i = 0; i < count; i++) {
    if (Math.random() < 0.1) trend = Math.floor(Math.random() * 3) - 1;

    const vol = basePrice * 0.002;
    let change =
      trend === 1
        ? (Math.random() * 0.8 + 0.2) * vol
        : trend === -1
        ? (Math.random() * -0.8 - 0.2) * vol
        : (Math.random() - 0.5) * vol;

    const open = price;
    const close = open + change;
    const range = vol * 0.5;
    const high = Math.max(open, close) + Math.random() * range;
    const low = Math.min(open, close) - Math.random() * range;

    data.push({
      time: time + i * 60,
      open: Math.max(0.01, Math.min(999, open)),
      high: Math.max(0.01, Math.min(999, high)),
      low: Math.max(0.01, Math.min(999, low)),
      close: Math.max(0.01, Math.min(999, close)),
    });

    price = close;
  }
  return data;
};

export const getInitialDataForPair = (pairName: string): CandleData[] => {
  const basePrices: { [key: string]: number } = {
    "BTC/USD": 500,
    "ETH/USD": 300,
    "XRP/USD": 0.5,
    "ADA/USD": 0.4,
    "DOT/USD": 20,
  };
  const basePrice = basePrices[pairName] || 100;
  return generateRandomData(1000, basePrice);
};
