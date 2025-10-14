/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import PrivateLayout from "@/layouts/PrivateLayout";
import TradingChart, { ChartHandle } from "@/components/TradingChart";
import {
  getInitialDataForPair,
  CandleData,
  generateNewPattern,
  generateIntraCandleMovement,
} from "@/utils/generateChartData";
import Button from "@/components/Button";
import { FaPlus, FaRobot } from "react-icons/fa";
import UserPairsList from "@/components/UserPairsList";
import SmallAiToggle from "@/components/SmallAiToggle";

export default function Trade() {
  const { user } = useAuth();
  const router = useRouter();

  const [selectedPair, setSelectedPair] = useState("BTC/USD");
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentTrend, setCurrentTrend] = useState<"up" | "down" | "neutral">("neutral");
  const [timeRemaining, setTimeRemaining] = useState(60);

  const currentCandleRef = useRef<CandleData | null>(null);
  const candleStartTimeRef = useRef<number>(0);
  const animationRef = useRef<number | null>(null);
  const chartRef = useRef<ChartHandle | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  const currentPatternRef = useRef(generateNewPattern());
  const patternProgressRef = useRef<number>(0);
  const intraCandleMovementRef = useRef<any>(null);

  const globalHistoryRef = useRef<CandleData[] | null>(null);

  const CANDLE_DURATION = 60_000; // 60 seconds
  const MAX_CANDLES = 500;

  // Initialize global history once
  useEffect(() => {
    if (!globalHistoryRef.current) {
      const initial = getInitialDataForPair("shared");
      // Deduplicate & sort times
      globalHistoryRef.current = Array.from(
        new Map(initial.map(d => [d.time, d])).values()
      ).sort((a, b) => a.time - b.time);
    }

    const initial = globalHistoryRef.current!;
    setChartData(initial);

    const last = initial[initial.length - 1];
    setCurrentPrice(last.close);

    currentCandleRef.current = { ...last };
    candleStartTimeRef.current = Date.now();
    lastUpdateTimeRef.current = Date.now();
    setTimeRemaining(60);

    currentPatternRef.current = generateNewPattern();
    patternProgressRef.current = 0;
    intraCandleMovementRef.current = generateIntraCandleMovement(
      last.close,
      currentPatternRef.current
    );
  }, []);

  // Handle pair change
  useEffect(() => {
    if (!selectedPair) return;

    const initialData =
      getInitialDataForPair(selectedPair) || globalHistoryRef.current || [];
    const cleanData = Array.from(
      new Map(initialData.map(d => [d.time, d])).values()
    ).sort((a, b) => a.time - b.time);

    setChartData(cleanData);

    const lastCandle = cleanData[cleanData.length - 1] || {
      time: Math.floor(Date.now() / 1000),
      open: 100,
      high: 100,
      low: 100,
      close: 100,
    };

    currentCandleRef.current = { ...lastCandle };
    candleStartTimeRef.current = Date.now();
    lastUpdateTimeRef.current = Date.now();
    setCurrentPrice(lastCandle.close);
    setTimeRemaining(60);

    currentPatternRef.current = generateNewPattern();
    patternProgressRef.current = 0;
    intraCandleMovementRef.current = generateIntraCandleMovement(
      lastCandle.close,
      currentPatternRef.current
    );
  }, [selectedPair]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      const now = Date.now();
      if (now - lastUpdateTimeRef.current < 200) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastUpdateTimeRef.current = now;

      if (!currentCandleRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const elapsed = now - candleStartTimeRef.current;
      const remaining = Math.max(0, Math.ceil((CANDLE_DURATION - elapsed) / 1000));
      setTimeRemaining(remaining);

      const elapsedRatio = elapsed / CANDLE_DURATION;

      if (elapsed >= CANDLE_DURATION) {
        // Finish candle
        const finishedCandle = { ...currentCandleRef.current };

        setChartData(prev => {
          const updated = [...prev, finishedCandle];
          if (updated.length > MAX_CANDLES) updated.shift();

          const uniqueSorted = Array.from(
            new Map(updated.map(d => [d.time, d])).values()
          ).sort((a, b) => a.time - b.time);

          globalHistoryRef.current = uniqueSorted;
          return uniqueSorted;
        });

        chartRef.current?.updateCurrentCandle(finishedCandle);

        // Start new candle
        const lastClose = finishedCandle.close;
        const lastCandleTime =
          chartData[chartData.length - 1]?.time || Math.floor(Date.now() / 1000);

        currentCandleRef.current = {
          time: lastCandleTime + 60,
          open: lastClose,
          high: lastClose,
          low: lastClose,
          close: lastClose,
        };

        candleStartTimeRef.current = now;
        setTimeRemaining(60);

        patternProgressRef.current++;
        if (patternProgressRef.current >= currentPatternRef.current.duration) {
          currentPatternRef.current = generateNewPattern();
          patternProgressRef.current = 0;
        }

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

        const newPrice = calculateNewPrice(currentCandleRef.current.open, elapsedRatio);
        setCurrentPrice(newPrice);

        if (newPrice > currentCandleRef.current.open) setCurrentTrend("up");
        else if (newPrice < currentCandleRef.current.open) setCurrentTrend("down");
        else setCurrentTrend("neutral");

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
  }, [chartData]);

  const calculateNewPrice = (openPrice: number, elapsedRatio: number) => {
    const pattern = currentPatternRef.current;
    const baseVolatility = openPrice * 0.001 * (0.5 + pattern.volatility);

    const movement = intraCandleMovementRef.current;
    if (movement) {
      const progress = Math.min(1, elapsedRatio * 2);
      if (progress < 1)
        return movement.startPrice + (movement.targetExtreme - movement.startPrice) * progress;

      const finalProgress = (elapsedRatio - 0.5) * 2;
      if (pattern.trend === "bullish")
        return movement.targetExtreme + baseVolatility * pattern.strength * finalProgress;
      else if (pattern.trend === "bearish")
        return movement.targetExtreme - baseVolatility * pattern.strength * finalProgress;
      else return movement.targetExtreme + (Math.random() - 0.5) * baseVolatility * 0.2;
    }

    if (pattern.trend === "bullish")
      return openPrice + baseVolatility * pattern.strength * elapsedRatio;
    else if (pattern.trend === "bearish")
      return openPrice - baseVolatility * pattern.strength * elapsedRatio;
    else return openPrice + (Math.random() - 0.5) * baseVolatility * 0.2;
  };

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
              key={selectedPair}
              ref={chartRef}
              data={chartData}
              pairName={selectedPair}
              currentPrice={currentPrice}
              timeRemaining={timeRemaining}
            />
          </div>

          <div className="block lg:hidden">
            <div className="flex items-center justify-evenly p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700">
              <p className="text-white text-sm">Turn on your AI Trade</p>
              <FaRobot className="w-4 h-4" />
              <SmallAiToggle />
            </div>
          </div>
        </div>

        {/* Drawer */}
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
            <UserPairsList onPairSelect={handlePairSelect} selectedPair={selectedPair} />
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
