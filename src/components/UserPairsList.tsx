// components/UserPairsList.tsx - Fixed with SVG and proper serial order
"use client";

import { useState, useEffect, JSX } from "react";
import { pairApiService, Pair } from "@/services/pairApi";
import { motion, AnimatePresence } from "framer-motion";

interface UserPairsListProps {
  onPairSelect?: (pairName: string) => void;
  selectedPair?: string;
}

interface PairPriceData {
  price: string;
  change: string;
  changePercentage: string;
  isPositive: boolean;
  holdings: string;
  holdingsValue: string;
  absoluteChange: string;
}

// SVG Icons for all cryptocurrencies - Larger and better aligned
const CryptoSVGIcons: { [key: string]: JSX.Element } = {
  "Ethereum": (
    <svg viewBox="0 0 64 64" className="w-10 h-10">
      <circle cx="32" cy="32" r="30" fill="#627EEA"/>
      <path fill="#FFF" fillOpacity="0.6" d="M32.5 7v17.9l12.4 5.6z"/>
      <path fill="#FFF" d="M32.5 7L20 30.5l12.5-5.6z"/>
      <path fill="#FFF" fillOpacity="0.6" d="M32.5 41.9V57l12.5-18.2z"/>
      <path fill="#FFF" d="M32.5 57V41.9L20 38.8z"/>
      <path fill="#FFF" fillOpacity="0.2" d="M32.5 40.3l12.4-9.8-12.4-5.6z"/>
      <path fill="#FFF" fillOpacity="0.6" d="M20 30.5l12.5 9.8V24.9z"/>
    </svg>
  ),
  "Bitcoin": (
    <svg viewBox="0 0 64 64" className="w-10 h-10">
      <circle cx="32" cy="32" r="30" fill="#F7931A"/>
      <path fill="#FFF" d="M46.1 27.5c-.6-4-3.5-6-7.4-6.8l1.5-6-3.6-.9-1.5 5.9c-.9-.2-1.9-.4-2.9-.6l1.5-6-3.6-.9-1.5 6c-.8-.2-1.6-.4-2.4-.6l-5-1.2-1 4.1s2.7.6 2.6.7c1.5.4 1.8 1.3 1.7 2l-1.7 6.8c.1.1.3 0 .5.1l-.5.1-1.7 6.9c-.1.4-.5 1-1.3.8.1.1-2.6-.7-2.6-.7l-1.8 4.2 4.7 1.2c.9.2 1.7.4 2.6.6l-1.6 6.4 3.6.9 1.6-6.3c1 .3 1.9.5 2.8.7l-1.5 6.2 3.6.9 1.6-6.3c6.2 1.2 10.9.7 12.8-4.9 1.5-4.4-.1-6.9-3.1-8.5 2.2-.5 3.9-1.9 4.3-4.8zm-8 11.2c-1.1 4.4-8.6 2-11 1.4l2-7.8c2.4.6 10.1 1.8 9 6.4zm1.1-11.4c-1 4-7.2 2-9.2 1.5l1.8-7.2c2 .5 8.5 1.5 7.4 5.7z"/>
    </svg>
  ),
  "Polygon": (
    <svg viewBox="0 0 64 64" className="w-10 h-10">
      <circle cx="32" cy="32" r="30" fill="#8247E5"/>
      <path fill="#FFF" d="M42.2 28.2l-8.1-4.7c-.6-.3-1.3-.3-1.9 0l-8.1 4.7c-.6.3-1 1-1 1.7v9.4c0 .7.4 1.4 1 1.7l8.1 4.7c.6.3 1.3.3 1.9 0l8.1-4.7c.6-.3 1-1 1-1.7v-9.4c0-.7-.4-1.4-1-1.7zm-9 23.1l-8.1-4.7c-.6-.3-1-1-1-1.7V26.5c0-.7.4-1.4 1-1.7l8.1-4.7c.6-.3 1.3-.3 1.9 0l8.1 4.7c.6.3 1 1 1 1.7v16.4c0 .7-.4 1.4-1 1.7l-8.1 4.7c-.6.4-1.3.4-1.9 0z"/>
    </svg>
  ),
  "Solana": (
    <svg viewBox="0 0 64 64" className="w-10 h-10">
      <circle cx="32" cy="32" r="30" fill="url(#solGradient)"/>
      <defs>
        <linearGradient id="solGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9945FF"/>
          <stop offset="100%" stopColor="#14F195"/>
        </linearGradient>
      </defs>
      <path fill="#FFF" d="M19.5 24.4h25.1c.3 0 .5.2.5.5v2.1c0 .3-.2.5-.5.5H19.5c-.3 0-.5-.2-.5-.5v-2.1c0-.3.2-.5.5-.5zm0 6.3h25.1c.3 0 .5.2.5.5v2.1c0 .3-.2.5-.5.5H19.5c-.3 0-.5-.2-.5-.5v-2.1c0-.3.2-.5.5-.5zm0 6.3h25.1c.3 0 .5.2.5.5v2.1c0 .3-.2.5-.5.5H19.5c-.3 0-.5-.2-.5-.5v-2.1c0-.3.2-.5.5-.5z"/>
    </svg>
  ),
  "Trump Coin": (
    <svg viewBox="0 0 64 64" className="w-10 h-10">
      <circle cx="32" cy="32" r="30" fill="#FF6B6B"/>
      <path fill="#FFF" d="M32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16-16-7.2-16-16 7.2-16 16-16zm-4 8h-4v16h12v-4h-8v-12z"/>
      <path fill="#FF6B6B" d="M28 24h4v4h-4z"/>
    </svg>
  ),
  "Ton Coin": (
    <svg viewBox="0 0 64 64" className="w-10 h-10">
      <circle cx="32" cy="32" r="30" fill="#0088CC"/>
      <path fill="#FFF" d="M32 16l12 8-12 8-12-8 12-8zm0 16l12 8-12 8-12-8 12-8z"/>
    </svg>
  ),
  "Polkadot": (
    <svg viewBox="0 0 64 64" className="w-10 h-10">
      <circle cx="32" cy="32" r="30" fill="#E6007A"/>
      <circle cx="32" cy="32" r="12" fill="#FFF"/>
      <circle cx="32" cy="32" r="6" fill="#E6007A"/>
    </svg>
  ),
  "BNB": (
    <svg viewBox="0 0 64 64" className="w-10 h-10">
      <circle cx="32" cy="32" r="30" fill="#F3BA2F"/>
      <path fill="#FFF" d="M32 16l3.9 3.9-7.3 7.3-3.9-3.9L32 16zm9.8 9.8l3.9 3.9L32 39.4l-3.9-3.9-2.3 2.3-1.6 1.6-3.9-3.9L32 24.2l3.9 3.9 2.3-2.3 1.6-1.6zm4.9 11.7l-3.9 3.9-2.3-2.3-1.6-1.6-3.9 3.9-9.8-9.8 3.9-3.9 2.3 2.3 1.6 1.6 3.9-3.9 2.3 2.3 1.6 1.6 3.9-3.9 3.9 3.9z"/>
    </svg>
  ),
  "Cardano": (
    <svg viewBox="0 0 64 64" className="w-10 h-10">
      <circle cx="32" cy="32" r="30" fill="#0033AD"/>
      <path fill="#FFF" d="M32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16-16-7.2-16-16 7.2-16 16-16zm0 4c-6.6 0-12 5.4-12 12s5.4 12 12 12 12-5.4 12-12-5.4-12-12-12zm0 4c4.4 0 8 3.6 8 8s-3.6 8-8 8-8-3.6-8-8 3.6-8 8-8z"/>
    </svg>
  ),
  "XRP": (
    <svg viewBox="0 0 64 64" className="w-10 h-10">
      <circle cx="32" cy="32" r="30" fill="#23292F"/>
      <path fill="#FFF" d="M47.5 22.5l-3.5 3.5 3.5 3.5-3.5 3.5 3.5 3.5-3.5 3.5-3.5-3.5-3.5 3.5-3.5-3.5 3.5-3.5-3.5-3.5 3.5-3.5-3.5-3.5 3.5-3.5 3.5 3.5 3.5-3.5 3.5 3.5-3.5 3.5 3.5 3.5z"/>
    </svg>
  ),
  "Dogecoin": (
    <svg viewBox="0 0 64 64" className="w-10 h-10">
      <circle cx="32" cy="32" r="30" fill="#C2A633"/>
      <path fill="#FFF" d="M32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16-16-7.2-16-16 7.2-16 16-16zm-4 8h-4v16h8c2.2 0 4-1.8 4-4v-8c0-2.2-1.8-4-4-4h-4zm4 12h-4v-8h4v8z"/>
    </svg>
  ),
  "Pepe": (
    <svg viewBox="0 0 64 64" className="w-10 h-10">
      <circle cx="32" cy="32" r="30" fill="#00A651"/>
      <path fill="#FFF" d="M32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16-16-7.2-16-16 7.2-16 16-16zm-8 12c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm16 0c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm-8 12c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4z"/>
    </svg>
  ),
  "Chainlink": (
    <svg viewBox="0 0 64 64" className="w-10 h-10">
      <circle cx="32" cy="32" r="30" fill="#2A5ADA"/>
      <path fill="#FFF" d="M32 16l4.9 4.9-4.9 4.9-4.9-4.9L32 16zm9.8 9.8l4.9 4.9-4.9 4.9-4.9-4.9 4.9-4.9zm-19.6 0l4.9 4.9-4.9 4.9-4.9-4.9 4.9-4.9zm9.8 9.8l4.9 4.9-4.9 4.9-4.9-4.9 4.9-4.9z"/>
    </svg>
  ),
  "Mmt": (
    <svg viewBox="0 0 64 64" className="w-10 h-10">
      <circle cx="32" cy="32" r="30" fill="#4A90E2"/>
      <path fill="#FFF" d="M32 16l12 8-12 8-12-8 12-8zm0 16l12 8-12 8-12-8 12-8z"/>
    </svg>
  ),
  "Allo": (
    <svg viewBox="0 0 64 64" className="w-10 h-10">
      <circle cx="32" cy="32" r="30" fill="#FFA726"/>
      <path fill="#FFF" d="M32 16l8 8-8 8-8-8 8-8zm0 16l8 8-8 8-8-8 8-8z"/>
    </svg>
  ),
  "Litecoin": (
    <svg viewBox="0 0 64 64" className="w-10 h-10">
      <circle cx="32" cy="32" r="30" fill="#BFBBBB"/>
      <path fill="#FFF" d="M32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16-16-7.2-16-16 7.2-16 16-16zm-4 8h-4v16h12v-4h-8v-12z"/>
    </svg>
  )
};

// Your exact serial order
const SERIAL_ORDER = [
  "Ethereum",    // 1
  "Bitcoin",     // 2
  "Polygon",     // 3
  "Solana",      // 4
  "Trump Coin",  // 5
  "Ton Coin",    // 6
  "Polkadot",    // 7 (Note: API has "Polkadot" but you said "Dot Coin")
  "BNB",         // 8
  "Cardano",     // 9
  "XRP",         // 10
  "Dogecoin",    // 11
  "Pepe",        // 12
  "Chainlink",   // 13
  "Mmt",         // 14
  "Allo",        // 15
  "Litecoin"     // 16
];

export default function UserPairsList({
  onPairSelect,
  selectedPair,
}: UserPairsListProps) {
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [priceData, setPriceData] = useState<{ [key: string]: PairPriceData }>({});
  const [isLoading, setIsLoading] = useState(true);

  // Complete crypto data with realistic base prices
  const cryptoData: { 
    [key: string]: { 
      basePrice: number; 
      holdings: string; 
      typicalChangeRange: [number, number];
    } 
  } = {
    "Ethereum": { basePrice: 2400, holdings: "1.83ETH", typicalChangeRange: [-100, 150] },
    "Bitcoin": { basePrice: 37300, holdings: "0.094BTC", typicalChangeRange: [-500, 800] },
    "Polygon": { basePrice: 0.89, holdings: "674.42MATIC", typicalChangeRange: [-0.1, 0.1] },
    "Solana": { basePrice: 99.36, holdings: "84.36SOL", typicalChangeRange: [-5, 8] },
    "Trump Coin": { basePrice: 8.76, holdings: "245.67TRUMP", typicalChangeRange: [-15, 25] },
    "Ton Coin": { basePrice: 4.32, holdings: "156.89TON", typicalChangeRange: [-4, 7] },
    "Polkadot": { basePrice: 6.78, holdings: "89.45DOT", typicalChangeRange: [-4, 6] },
    "BNB": { basePrice: 312.56, holdings: "12.45BNB", typicalChangeRange: [-3, 5] },
    "Cardano": { basePrice: 0.52, holdings: "1250.50ADA", typicalChangeRange: [-4, 6] },
    "XRP": { basePrice: 0.62, holdings: "845.67XRP", typicalChangeRange: [-0.5, 0.5] },
    "Dogecoin": { basePrice: 0.12, holdings: "2567.89DOGE", typicalChangeRange: [-6, 12] },
    "Pepe": { basePrice: 0.0000012, holdings: "4567890PEPE", typicalChangeRange: [-8, 15] },
    "Chainlink": { basePrice: 14.56, holdings: "45.67LINK", typicalChangeRange: [-4, 7] },
    "Mmt": { basePrice: 0.034, holdings: "12345MMT", typicalChangeRange: [-5, 8] },
    "Allo": { basePrice: 0.45, holdings: "678.90ALLO", typicalChangeRange: [-7, 10] },
    "Litecoin": { basePrice: 74.32, holdings: "23.45LTC", typicalChangeRange: [-3, 5] }
  };

  // Generate realistic price data for each pair
  const generatePriceData = (pairName: string): PairPriceData => {
    const crypto = cryptoData[pairName] || { 
      basePrice: 100, 
      holdings: "0", 
      typicalChangeRange: [-2, 4]
    };
    
    const [minChange, maxChange] = crypto.typicalChangeRange;
    const changeAmount = minChange + (Math.random() * (maxChange - minChange));
    const newPrice = crypto.basePrice + changeAmount;
    const priceChange = newPrice - crypto.basePrice;
    const isPositive = priceChange >= 0;

    const holdingsAmount = parseFloat(crypto.holdings);
    const holdingsValue = holdingsAmount * newPrice;

    const absoluteChange = Math.abs(priceChange) < 0.01 ? '+$0.00' : 
      `${isPositive ? '+' : '-'}$${Math.abs(priceChange).toFixed(2)}`;

    return {
      price: `$${newPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`,
      change: `${isPositive ? '+' : ''}$${Math.abs(priceChange).toFixed(4)}`,
      changePercentage: `${isPositive ? '+' : ''}${((priceChange / crypto.basePrice) * 100).toFixed(2)}%`,
      isPositive,
      holdings: crypto.holdings,
      holdingsValue: `$${holdingsValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      absoluteChange
    };
  };

  // Sort pairs according to your serial order
  const sortPairsBySerialOrder = (pairs: Pair[]): Pair[] => {
    return [...pairs].sort((a, b) => {
      const indexA = SERIAL_ORDER.indexOf(a.pairName);
      const indexB = SERIAL_ORDER.indexOf(b.pairName);
      return indexA - indexB;
    });
  };

  // Initialize and update price data
  useEffect(() => {
    const updateAllPrices = () => {
      const newPriceData: { [key: string]: PairPriceData } = {};
      pairs.forEach(pair => {
        newPriceData[pair.pairName] = generatePriceData(pair.pairName);
      });
      setPriceData(newPriceData);
    };

    if (pairs.length > 0) {
      updateAllPrices();
    }
  }, [pairs]);

  // Auto-update prices every 5 seconds
  useEffect(() => {
    if (pairs.length === 0) return;

    const interval = setInterval(() => {
      setPriceData(prev => {
        const newData = { ...prev };
        pairs.forEach(pair => {
          newData[pair.pairName] = generatePriceData(pair.pairName);
        });
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [pairs]);

  useEffect(() => {
    const loadPairs = async () => {
      try {
        setIsLoading(true);
        const activePairs = await pairApiService.getActivePairs();
        // Sort the pairs according to your serial order
        const sortedPairs = sortPairsBySerialOrder(activePairs);
        setPairs(sortedPairs);
      } catch (error) {
        console.error("Failed to load pairs:", error);
        // Create fallback pairs in your serial order
        const fallbackPairs = SERIAL_ORDER.map((pairName, index) => ({
          _id: `${index + 1}`,
          pairName,
          isActive: true,
          profitLoss: Math.random() * 20,
          svgImage: pairName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        setPairs(fallbackPairs);
      } finally {
        setIsLoading(false);
      }
    };
    loadPairs();
  }, []);

  const getTokenIcon = (pairName: string) => {
    return (
      <div className="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center">
        {CryptoSVGIcons[pairName] || (
          <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center text-white text-lg">
            ?
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-800/50 rounded-2xl p-4 animate-pulse h-20" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto">
      <AnimatePresence>
        {pairs.map((pair) => {
          const isActive = selectedPair === pair.pairName;
          const currentPriceData = priceData[pair.pairName] || generatePriceData(pair.pairName);

          return (
            <motion.div
              key={pair._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl p-4 cursor-pointer transition-all duration-200 ${
                isActive
                  ? "bg-gray-700 ring-2 ring-green-500"
                  : "bg-gray-800/50 hover:bg-gray-700/70"
              }`}
              onClick={() => onPairSelect?.(pair.pairName)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getTokenIcon(pair.pairName)}
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-base">{pair.pairName}</h3>
                    <p className="text-gray-400 text-sm">
                      {currentPriceData.holdings}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <motion.p
                    key={`value-${pair.pairName}-${currentPriceData.holdingsValue}`}
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1 }}
                    className="text-white font-bold text-base"
                  >
                    {currentPriceData.holdingsValue}
                  </motion.p>
                  <motion.div
                    key={`change-${pair.pairName}-${currentPriceData.absoluteChange}`}
                    initial={{ y: -3, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className={`text-sm font-semibold ${
                      currentPriceData.isPositive ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {currentPriceData.absoluteChange}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}