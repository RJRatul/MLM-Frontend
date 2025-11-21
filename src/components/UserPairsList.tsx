// components/UserPairsList.tsx
"use client";

import { useState, useEffect } from "react";
import { pairApiService, Pair } from "@/services/pairApi";
import { motion, AnimatePresence } from "framer-motion";

interface UserPairsListProps {
  onPairSelect?: (pairName: string) => void;
  selectedPair?: string;
}

interface PairPriceData {
  price: string;
  change: string;
  isPositive: boolean;
}

export default function UserPairsList({
  onPairSelect,
  selectedPair,
}: UserPairsListProps) {
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [priceData, setPriceData] = useState<{ [key: string]: PairPriceData }>({});
  const [isLoading, setIsLoading] = useState(true);

  // Generate random price data for each pair
  const generateRandomPriceData = (pairName: string): PairPriceData => {
    const basePrices: { [key: string]: number } = {
      "Solona": 96.45,
      "Ethereum": 2348.67,
      "Bitcoin": 36842.19,
      "Polygon": 0.89,
      "BNB": 312.56,
      "Cardano": 0.52
    };

    const basePrice = basePrices[pairName] || 100;
    
    // Random fluctuation between -2% to +2%
    const fluctuation = (Math.random() - 0.5) * 0.04;
    const newPrice = basePrice * (1 + fluctuation);
    const priceChange = newPrice - basePrice;
    const isPositive = priceChange >= 0;

    return {
      price: `$${newPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: `${isPositive ? '+' : ''}$${Math.abs(priceChange).toFixed(2)}`,
      isPositive
    };
  };

  // Initialize and update price data
  useEffect(() => {
    const updateAllPrices = () => {
      const newPriceData: { [key: string]: PairPriceData } = {};
      pairs.forEach(pair => {
        newPriceData[pair.pairName] = generateRandomPriceData(pair.pairName);
      });
      setPriceData(newPriceData);
    };

    if (pairs.length > 0) {
      updateAllPrices();
    }
  }, [pairs]);

  // Auto-update prices every 3 seconds
  useEffect(() => {
    if (pairs.length === 0) return;

    const interval = setInterval(() => {
      setPriceData(prev => {
        const newData = { ...prev };
        pairs.forEach(pair => {
          newData[pair.pairName] = generateRandomPriceData(pair.pairName);
        });
        return newData;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [pairs]);

  useEffect(() => {
    const loadPairs = async () => {
      try {
        setIsLoading(true);
        const activePairs = await pairApiService.getActivePairs();
        setPairs(activePairs);
      } catch (error) {
        console.error("Failed to load pairs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPairs();
  }, []);

  const getTokenIcon = (pairName: string) => {
    const iconMap: { [key: string]: { bg: string, text: string } } = {
      "Solona": { bg: "from-purple-500 to-pink-500", text: "SOL" },
      "Ethereum": { bg: "from-blue-400 to-blue-600", text: "ETH" },
      "Bitcoin": { bg: "from-orange-400 to-orange-600", text: "BTC" },
      "Polygon": { bg: "from-purple-600 to-red-500", text: "MATIC" },
      "BNB": { bg: "from-yellow-400 to-yellow-600", text: "BNB" },
      "Cardano": { bg: "from-blue-600 to-blue-800", text: "ADA" }
    };

    const style = iconMap[pairName] || { bg: "from-gray-500 to-gray-700", text: pairName.substring(0, 3).toUpperCase() };
    
    return (
      <div className={`w-10 h-10 bg-gradient-to-br ${style.bg} rounded-full flex items-center justify-center`}>
        <span className="text-white font-bold text-xs">{style.text}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-700 rounded-xl p-4 animate-pulse h-16" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {pairs.map((pair) => {
          const isActive = selectedPair === pair.pairName;
          const currentPriceData = priceData[pair.pairName] || generateRandomPriceData(pair.pairName);

          return (
            <motion.div
              key={pair._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                isActive
                  ? "bg-gray-700 ring-2 ring-green-500"
                  : "bg-gray-700/50 hover:bg-gray-700"
              }`}
              onClick={() => onPairSelect?.(pair.pairName)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getTokenIcon(pair.pairName)}
                  <div>
                    <h3 className="text-white font-medium text-sm">{pair.pairName}</h3>
                    <motion.p
                      key={`profit-${pair.pairName}-${pair.profitLoss}`}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-gray-400 text-xs font-mono"
                    >
                      {pair.profitLoss >= 0 ? "+" : ""}
                      {pair.profitLoss}
                    </motion.p>
                  </div>
                </div>
                
                {/* Dynamic price and change indicator */}
                <div className="text-right">
                  <motion.p
                    key={`price-${pair.pairName}-${currentPriceData.price}`}
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1 }}
                    className="text-white font-semibold text-sm"
                  >
                    {currentPriceData.price}
                  </motion.p>
                  <motion.p
                    key={`change-${pair.pairName}-${currentPriceData.change}`}
                    initial={{ y: -3, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className={`text-xs ${
                      currentPriceData.isPositive ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {currentPriceData.change}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}