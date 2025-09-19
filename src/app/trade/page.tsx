/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import PrivateLayout from '@/layouts/PrivateLayout';
import UserPairsList from '@/components/UserPairsList';
import TradingChart from '@/components/TradingChart';
import Modal from '@/components/Modal';
import { FaPlus, FaPause, FaPlay, FaSync } from 'react-icons/fa';
import { getInitialDataForPair, CandleData } from '@/utils/generateChartData';

export default function Trade() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isPairsModalOpen, setIsPairsModalOpen] = useState(false);
  const [selectedPair, setSelectedPair] = useState('BTC/USD');
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [isAnimating, setIsAnimating] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [currentTrend, setCurrentTrend] = useState<'up' | 'down' | 'neutral'>('neutral');
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const currentCandleRef = useRef<CandleData | null>(null);
  const candleStartTimeRef = useRef<number>(0);

  // Base prices for different pairs
  const basePrices: { [key: string]: number } = {
    'BTC/USD': 50000,
    'ETH/USD': 3000,
    'XRP/USD': 0.5,
    'ADA/USD': 0.4,
    'DOT/USD': 20,
  };

  useEffect(() => {
    // Generate initial chart data for the selected pair
    const initialData = getInitialDataForPair(selectedPair);
    setChartData(initialData);
    
    // Set initial current price
    const basePrice = basePrices[selectedPair] || 100;
    setCurrentPrice(basePrice);
    
    // Initialize first current candle
    const lastCandle = initialData[initialData.length - 1];
    currentCandleRef.current = {
      time: Math.floor(Date.now() / 1000),
      open: lastCandle.close,
      high: lastCandle.close,
      low: lastCandle.close,
      close: lastCandle.close,
    };
    candleStartTimeRef.current = Date.now();
  }, [selectedPair]);

  useEffect(() => {
    if (!isAnimating) return;

    const animateCurrentCandle = () => {
      const now = Date.now();
      const elapsed = now - candleStartTimeRef.current;
      const timeRemaining = 60000 - elapsed; // 1 minute candle

      if (timeRemaining <= 0) {
        // Finalize current candle and start new one
        if (currentCandleRef.current) {
          const finalizedCandle = { ...currentCandleRef.current };
          
          setChartData(prevData => {
            // Add finalized candle and remove oldest
            const newData = [...prevData.slice(1), finalizedCandle];
            return newData;
          });

          // Start new candle
          const newCandle: CandleData = {
            time: Math.floor(now / 1000),
            open: finalizedCandle.close,
            high: finalizedCandle.close,
            low: finalizedCandle.close,
            close: finalizedCandle.close,
          };
          
          currentCandleRef.current = newCandle;
          candleStartTimeRef.current = now;
        }
      } else {
        // Animate current candle
        if (currentCandleRef.current) {
          const volatility = basePrices[selectedPair] * 0.002; // 0.2% volatility
          
          // Determine price movement direction
          const random = Math.random();
          let priceChange = 0;
          let newTrend: typeof currentTrend = 'neutral';

          if (random < 0.4) {
            // Up movement (40% chance)
            priceChange = (Math.random() * volatility * 0.8);
            newTrend = 'up';
          } else if (random < 0.7) {
            // Down movement (30% chance)
            priceChange = -(Math.random() * volatility * 0.8);
            newTrend = 'down';
          } else {
            // Neutral (30% chance)
            priceChange = (Math.random() - 0.5) * volatility * 0.5;
            newTrend = 'neutral';
          }

          setCurrentTrend(newTrend);

          const newPrice = currentCandleRef.current.close + priceChange;
          setCurrentPrice(newPrice);

          // Update current candle
          const updatedCandle: CandleData = {
            ...currentCandleRef.current,
            close: newPrice,
            high: Math.max(currentCandleRef.current.high, newPrice),
            low: Math.min(currentCandleRef.current.low, newPrice),
          };

          currentCandleRef.current = updatedCandle;

          // Update chart with animated candle (for visualization)
          setChartData(prevData => {
            const currentData = [...prevData];
            if (currentData.length > 0) {
              currentData[currentData.length - 1] = updatedCandle;
            }
            return currentData;
          });
        }
      }
    };

    // Update every 100ms for smooth animation (10 times per second)
    animationRef.current = setInterval(animateCurrentCandle, 100);

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isAnimating, selectedPair]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handlePairSelect = (pair: string) => {
    setSelectedPair(pair);
    setIsPairsModalOpen(false);
    // Reset animation with new pair data
    const newData = getInitialDataForPair(pair);
    setChartData(newData);
    
    const basePrice = basePrices[pair] || 100;
    setCurrentPrice(basePrice);
    
    // Reset current candle
    const lastCandle = newData[newData.length - 1];
    currentCandleRef.current = {
      time: Math.floor(Date.now() / 1000),
      open: lastCandle.close,
      high: lastCandle.close,
      low: lastCandle.close,
      close: lastCandle.close,
    };
    candleStartTimeRef.current = Date.now();
  };

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  const resetAnimation = () => {
    const newData = getInitialDataForPair(selectedPair);
    setChartData(newData);
    
    const basePrice = basePrices[selectedPair] || 100;
    setCurrentPrice(basePrice);
    
    // Reset current candle
    const lastCandle = newData[newData.length - 1];
    currentCandleRef.current = {
      time: Math.floor(Date.now() / 1000),
      open: lastCandle.close,
      high: lastCandle.close,
      low: lastCandle.close,
      close: lastCandle.close,
    };
    candleStartTimeRef.current = Date.now();
    
    if (!isAnimating) {
      setIsAnimating(true);
    }
  };

  // Calculate time remaining for current candle
  const getTimeRemaining = () => {
    const elapsed = Date.now() - candleStartTimeRef.current;
    const remaining = Math.max(0, 60000 - elapsed);
    return Math.ceil(remaining / 1000);
  };

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="container mx-auto">
          {/* Header with controls */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Trading</h1>
            <div className="flex items-center space-x-4">
              {/* Current price and trend indicator */}
              <div className={`px-3 py-2 rounded-lg ${
                currentTrend === 'up' ? 'bg-green-600' : 
                currentTrend === 'down' ? 'bg-red-600' : 'bg-gray-600'
              }`}>
                <span className="text-white font-mono">
                  ${currentPrice.toFixed(2)}
                </span>
              </div>
              
              {/* Time remaining */}
              <div className="bg-gray-700 px-3 py-2 rounded-lg">
                <span className="text-white font-mono">
                  {getTimeRemaining()}s
                </span>
              </div>

              <button
                onClick={toggleAnimation}
                className="flex items-center bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                {isAnimating ? <FaPause className="mr-2" /> : <FaPlay className="mr-2" />}
                {isAnimating ? 'Pause' : 'Play'}
              </button>
              
              <button
                onClick={resetAnimation}
                className="flex items-center bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                <FaSync className="mr-2" />
                Reset
              </button>
              
              <button
                onClick={() => setIsPairsModalOpen(true)}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                <FaPlus className="mr-2" />
                {selectedPair}
              </button>
            </div>
          </div>

          {/* Trading Chart */}
          <TradingChart data={chartData} pairName={selectedPair} />

          {/* Trading controls */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-4">Buy</h3>
              <div className="space-y-3">
                <input
                  type="number"
                  placeholder="Amount"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded">
                  Buy
                </button>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-4">Sell</h3>
              <div className="space-y-3">
                <input
                  type="number"
                  placeholder="Amount"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
                <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded">
                  Sell
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pairs Selection Modal */}
        <Modal
          isOpen={isPairsModalOpen}
          onClose={() => setIsPairsModalOpen(false)}
          title="Select Trading Pair"
        >
          <UserPairsList onPairSelect={handlePairSelect} />
        </Modal>
      </div>
    </PrivateLayout>
  );
}