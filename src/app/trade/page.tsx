/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import PrivateLayout from "@/layouts/PrivateLayout";
import TradingChart, { ChartHandle } from "@/components/TradingChart";
import { getInitialDataForPair, CandleData } from "@/utils/generateChartData";
import Link from "next/link";
import Button from "@/components/Button";
import { FaPlus, FaRobot } from "react-icons/fa";
import UserPairsList from "@/components/UserPairsList";
import SmallAiToggle from "@/components/SmallAiToggle";

// Interfaces for candle pattern state
interface CandlePattern {
  trend: "bullish" | "bearish" | "consolidation";
  strength: number; // 0-1
  duration: number; // in updates
  volatility: number; // 0-1
}

type IntraCandleMovement = {
  direction: "up" | "down";
  startPrice: number;
  targetExtreme: number;
};

export default function Trade() {
  const { user } = useAuth();
  const router = useRouter();

  const [selectedPair, setSelectedPair] = useState("BTC/USD");
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentTrend, setCurrentTrend] = useState<"up" | "down" | "neutral">(
    "neutral"
  );
  const [timeRemaining, setTimeRemaining] = useState(60);

  const currentCandleRef = useRef<CandleData | null>(null);
  const candleStartTimeRef = useRef<number>(0);
  const animationRef = useRef<number | null>(null);
  const chartRef = useRef<ChartHandle | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  // New refs for pattern-based generation
  const currentPatternRef = useRef<CandlePattern>({
    trend: "consolidation",
    strength: 0.5,
    duration: 0,
    volatility: 0.3,
  });
  const patternProgressRef = useRef<number>(0);
  const intraCandleMovementRef = useRef<IntraCandleMovement | null>(null);

  const basePrices: Record<string, number> = {
    "BTC/USD": 500,
    "ETH/USD": 300,
    "XRP/USD": 0.5,
    "ADA/USD": 0.4,
    "DOT/USD": 20,
  };

  const CANDLE_DURATION = 60_000; // 60 seconds
  const MAX_CANDLES = 500;

  // Generate realistic candle patterns
  const generateNewPattern = (): CandlePattern => {
    const rand = Math.random();

    if (rand < 0.4) {
      // Bullish pattern
      return {
        trend: "bullish",
        strength: 0.3 + Math.random() * 0.5, // 0.3-0.8
        duration: 3 + Math.floor(Math.random() * 5), // 3-7 candles
        volatility: 0.2 + Math.random() * 0.3, // 0.2-0.5
      };
    } else if (rand < 0.7) {
      // Bearish pattern
      return {
        trend: "bearish",
        strength: 0.3 + Math.random() * 0.5, // 0.3-0.8
        duration: 3 + Math.floor(Math.random() * 5), // 3-7 candles
        volatility: 0.2 + Math.random() * 0.3, // 0.2-0.5
      };
    } else if (rand < 0.85) {
      // Strong trend
      const isBullish = Math.random() > 0.5;
      return {
        trend: isBullish ? "bullish" : "bearish",
        strength: 0.6 + Math.random() * 0.4, // 0.6-1.0
        duration: 5 + Math.floor(Math.random() * 8), // 5-12 candles
        volatility: 0.4 + Math.random() * 0.4, // 0.4-0.8
      };
    } else {
      // Consolidation/doji pattern
      return {
        trend: "consolidation",
        strength: 0.1 + Math.random() * 0.2, // 0.1-0.3
        duration: 2 + Math.floor(Math.random() * 4), // 2-5 candles
        volatility: 0.1 + Math.random() * 0.2, // 0.1-0.3
      };
    }
  };

  // Generate intra-candle movement (price goes both ways during candle formation)
  const generateIntraCandleMovement = (
    openPrice: number,
    pattern: CandlePattern
  ): IntraCandleMovement => {
    const baseVolatility =
      basePrices[selectedPair] * 0.002 * pattern.volatility;
    const willReverse = Math.random() < 0.7; // 70% chance of intra-candle reversal

    if (pattern.trend === "bullish") {
      if (willReverse) {
        // Price goes down first, then up
        const dip = openPrice - baseVolatility * (0.2 + Math.random() * 0.3);
        return {
          direction: "down",
          startPrice: openPrice,
          targetExtreme: Math.max(openPrice * 0.99, dip), // Max 1% dip
        };
      } else {
        // Price goes up strongly
        return {
          direction: "up",
          startPrice: openPrice,
          targetExtreme:
            openPrice + baseVolatility * (0.5 + Math.random() * 0.5),
        };
      }
    } else if (pattern.trend === "bearish") {
      if (willReverse) {
        // Price goes up first, then down
        const spike = openPrice + baseVolatility * (0.2 + Math.random() * 0.3);
        return {
          direction: "up",
          startPrice: openPrice,
          targetExtreme: Math.min(openPrice * 1.01, spike), // Max 1% spike
        };
      } else {
        // Price goes down strongly
        return {
          direction: "down",
          startPrice: openPrice,
          targetExtreme:
            openPrice - baseVolatility * (0.5 + Math.random() * 0.5),
        };
      }
    } else {
      // Consolidation - small movements in both directions
      const smallMove = openPrice * (Math.random() < 0.5 ? 0.998 : 1.002);
      const direction: "up" | "down" = Math.random() < 0.5 ? "up" : "down";
      return {
        direction,
        startPrice: openPrice,
        targetExtreme: smallMove,
      };
    }
  };

  // Calculate price based on current pattern and intra-candle movement
  const calculateNewPrice = (
    currentPrice: number,
    elapsedRatio: number
  ): number => {
    const base = basePrices[selectedPair] || 100;
    const pattern = currentPatternRef.current;
    const baseVolatility = base * 0.002 * pattern.volatility;

    // If we have an active intra-candle movement
    if (intraCandleMovementRef.current) {
      const movement = intraCandleMovementRef.current;
      const progress = Math.min(1, elapsedRatio * 2); // Intra-candle movement happens in first half

      if (progress < 1) {
        // Moving toward the extreme
        const distance = movement.targetExtreme - movement.startPrice;
        return movement.startPrice + distance * progress;
      } else {
        // After reaching extreme, move toward final candle direction
        const finalProgress = (elapsedRatio - 0.5) * 2; // 0-1 in second half

        let finalDirection: number;
        if (pattern.trend === "bullish") {
          finalDirection =
            movement.targetExtreme +
            baseVolatility * pattern.strength * finalProgress;
        } else if (pattern.trend === "bearish") {
          finalDirection =
            movement.targetExtreme -
            baseVolatility * pattern.strength * finalProgress;
        } else {
          // Small random movement around the extreme for consolidation
          finalDirection =
            movement.targetExtreme +
            (Math.random() - 0.5) * baseVolatility * 0.3;
        }

        return finalDirection;
      }
    }

    // Fallback to simple pattern-based movement
    let movement = 0;
    if (pattern.trend === "bullish") {
      movement = baseVolatility * pattern.strength * elapsedRatio;
    } else if (pattern.trend === "bearish") {
      movement = -baseVolatility * pattern.strength * elapsedRatio;
    } else {
      movement = (Math.random() - 0.5) * baseVolatility * 0.5;
    }

    return currentPrice + movement;
  };

  useEffect(() => {
    const initial = getInitialDataForPair(selectedPair);
    setChartData(initial);

    const base = basePrices[selectedPair] || 100;
    setCurrentPrice(base);

    const last = initial[initial.length - 1];
    currentCandleRef.current = {
      time: Math.floor(Date.now() / 1000),
      open: last.close,
      high: last.close,
      low: last.close,
      close: last.close,
    };
    candleStartTimeRef.current = Date.now();
    lastUpdateTimeRef.current = Date.now();
    setTimeRemaining(60);

    // Initialize first pattern
    currentPatternRef.current = generateNewPattern();
    patternProgressRef.current = 0;
  }, [selectedPair]);

  useEffect(() => {
    const animate = () => {
      const now = Date.now();
      if (now - lastUpdateTimeRef.current < 500) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastUpdateTimeRef.current = now;

      if (!currentCandleRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const elapsed = now - candleStartTimeRef.current;
      const remaining = Math.max(
        0,
        Math.ceil((CANDLE_DURATION - elapsed) / 1000)
      );
      setTimeRemaining(remaining);

      const elapsedRatio = elapsed / CANDLE_DURATION;

      if (elapsed >= CANDLE_DURATION) {
        // Finish current candle
        const finishedCandle = { ...currentCandleRef.current };

        setChartData((prev) => {
          const updated = [...prev, finishedCandle];
          if (updated.length > MAX_CANDLES) updated.shift();
          return updated;
        });

        chartRef.current?.updateCurrentCandle?.(finishedCandle);

        // Start new candle
        const lastClose = finishedCandle.close;
        currentCandleRef.current = {
          time: Math.floor(now / 1000),
          open: lastClose,
          high: lastClose,
          low: lastClose,
          close: lastClose,
        };
        candleStartTimeRef.current = now;
        setTimeRemaining(60);

        // Update pattern progress or generate new pattern
        patternProgressRef.current++;
        if (patternProgressRef.current >= currentPatternRef.current.duration) {
          currentPatternRef.current = generateNewPattern();
          patternProgressRef.current = 0;
        }

        // Generate intra-candle movement for the new candle
        intraCandleMovementRef.current = generateIntraCandleMovement(
          lastClose,
          currentPatternRef.current
        );
      } else {
        // Update current candle
        if (!intraCandleMovementRef.current) {
          intraCandleMovementRef.current = generateIntraCandleMovement(
            currentCandleRef.current.open,
            currentPatternRef.current
          );
        }

        const newPrice = calculateNewPrice(
          currentCandleRef.current.open,
          elapsedRatio
        );
        setCurrentPrice(newPrice);

        // Determine current trend for UI
        if (newPrice > currentCandleRef.current.open) {
          setCurrentTrend("up");
        } else if (newPrice < currentCandleRef.current.open) {
          setCurrentTrend("down");
        } else {
          setCurrentTrend("neutral");
        }

        const updated = {
          ...currentCandleRef.current,
          close: newPrice,
          high: Math.max(currentCandleRef.current.high, newPrice),
          low: Math.min(currentCandleRef.current.low, newPrice),
        };
        currentCandleRef.current = updated;

        chartRef.current?.updateCurrentCandle(updated);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [selectedPair]);

  const handlePairSelect = (pairName: string) => {
    setSelectedPair(pairName);
    setIsDrawerOpen(false);
  };

  return (
    <PrivateLayout>
      <div className="min-h-[100vh] bg-gray-900 relative p-3">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Button
              variant="primary"
              size="sm"
              icon={<FaPlus className="w-4 h-4" />}
              className="rounded-full"
              onClick={() => setIsDrawerOpen(true)}
            >
              Select Pair
            </Button>

            <div className="hidden lg:flex items-center gap-4">
              <Button variant="primary" size="sm" className="rounded-full">
                <FaRobot className="w-4 h-4" />
              </Button>
              <SmallAiToggle />
            </div>
          </div>

          <div className="flex-1">
            <TradingChart
              ref={chartRef}
              data={chartData}
              pairName={selectedPair}
              currentPrice={currentPrice}
              timeRemaining={timeRemaining}
            />
          </div>
          <div className="block lg:hidden">
            <div className="flex items-center justify-evenly p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-blue-500">
              <p className="text-white text-sm">Turn on your AI Trade</p>
              <FaRobot className="w-4 h-4" />
              <SmallAiToggle />
            </div>
          </div>
        </div>

        {/* Left Drawer */}
        <div
          className={`fixed top-0 left-0 h-full w-80 bg-gray-800 shadow-xl transform transition-transform duration-300 z-50
            ${isDrawerOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="p-4 flex items-center justify-between border-b border-gray-700">
            <h2 className="text-white font-semibold">Select trade pair</h2>
            <button
              className="text-gray-400 hover:text-white"
              onClick={() => setIsDrawerOpen(false)}
            >
              ✕
            </button>
          </div>
          <div className="p-4 overflow-y-auto h-full">
            <UserPairsList
              onPairSelect={handlePairSelect}
              selectedPair={selectedPair}
            />
          </div>
        </div>

        {isDrawerOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setIsDrawerOpen(false)}
          />
        )}
      </div>
    </PrivateLayout>
  );
}
