// components/UserPairsList.tsx - Redesigned to match the image
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
  holdings: string;
  holdingsValue: string;
}

export default function UserPairsList({
  onPairSelect,
  selectedPair,
}: UserPairsListProps) {
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [priceData, setPriceData] = useState<{ [key: string]: PairPriceData }>({});
  const [isLoading, setIsLoading] = useState(true);

  // Crypto data matching the image exactly
  const cryptoData: { [key: string]: { basePrice: number; holdings: string; icon: string } } = {
    "Solana": { 
      basePrice: 96.45, 
      holdings: "84.36SOL",
      icon: "🟣"
    },
    "Ethereum": { 
      basePrice: 2348.67, 
      holdings: "1.83ETH",
      icon: "🔷"
    },
    "Bitcoin": { 
      basePrice: 36842.19, 
      holdings: "0.094BTC",
      icon: "🟡"
    },
    "Polygon": { 
      basePrice: 0.89, 
      holdings: "674.42MATIC",
      icon: "🟣"
    },
    "BNB": { 
      basePrice: 312.56, 
      holdings: "12.45BNB",
      icon: "🟡"
    },
    "Cardano": { 
      basePrice: 0.52, 
      holdings: "1250.50ADA",
      icon: "🔷"
    }
  };

  // Generate realistic price data for each pair
  const generatePriceData = (pairName: string): PairPriceData => {
    const crypto = cryptoData[pairName] || { basePrice: 100, holdings: "0", icon: "⚪" };
    
    // More realistic fluctuation
    const fluctuation = (Math.random() - 0.5) * 0.08; // -4% to +4%
    const newPrice = crypto.basePrice * (1 + fluctuation);
    const priceChange = newPrice - crypto.basePrice;
    const isPositive = priceChange >= 0;

    // Calculate holdings value
    const holdingsAmount = parseFloat(crypto.holdings);
    const holdingsValue = holdingsAmount * newPrice;

    return {
      price: `$${newPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: `${isPositive ? '+' : ''}$${Math.abs(priceChange).toFixed(2)}`,
      isPositive,
      holdings: crypto.holdings,
      holdingsValue: `$${holdingsValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    };
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
        setPairs(activePairs);
      } catch (error) {
        console.error("Failed to load pairs:", error);
        // Fallback to default pairs if API fails
        setPairs([
          {
            _id: "1", pairName: "Solana", isActive: true, profitLoss: 5.2,
            svgImage: "",
            createdAt: "",
            updatedAt: ""
          },
          {
            _id: "2", pairName: "Ethereum", isActive: true, profitLoss: 2.1,
            svgImage: "",
            createdAt: "",
            updatedAt: ""
          },
          {
            _id: "3", pairName: "Bitcoin", isActive: true, profitLoss: 0.8,
            svgImage: "",
            createdAt: "",
            updatedAt: ""
          },
          {
            _id: "4", pairName: "Polygon", isActive: true, profitLoss: 1.5,
            svgImage: "",
            createdAt: "",
            updatedAt: ""
          },
          {
            _id: "5", pairName: "BNB", isActive: true, profitLoss: 3.7,
            svgImage: "",
            createdAt: "",
            updatedAt: ""
          },
          {
            _id: "6", pairName: "Cardano", isActive: true, profitLoss: 1.2,
            svgImage: "",
            createdAt: "",
            updatedAt: ""
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    loadPairs();
  }, []);

  const getTokenIcon = (pairName: string) => {
    const iconMap: { [key: string]: string } = {
      "Solana": "🟣",
      "Ethereum": "🔷", 
      "Bitcoin": "🟡",
      "Polygon": "🟣",
      "BNB": "🟡",
      "Cardano": "🔷"
    };

    return (
      <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center text-2xl">
        {iconMap[pairName] || "⚪"}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-800/50 rounded-2xl p-4 animate-pulse h-20" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
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
                
                {/* Price and change indicator - matches image layout */}
                <div className="text-right">
                  <motion.p
                    key={`price-${pair.pairName}-${currentPriceData.price}`}
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1 }}
                    className="text-white font-bold text-base"
                  >
                    {currentPriceData.holdingsValue}
                  </motion.p>
                  <motion.p
                    key={`change-${pair.pairName}-${currentPriceData.change}`}
                    initial={{ y: -3, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className={`text-sm font-semibold ${
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