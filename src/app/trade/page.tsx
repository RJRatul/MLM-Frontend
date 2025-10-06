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

  const basePrices: Record<string, number> = {
    "BTC/USD": 500,
    "ETH/USD": 300,
    "XRP/USD": 0.5,
    "ADA/USD": 0.4,
    "DOT/USD": 20,
  };

  const CANDLE_DURATION = 60_000; // 60 seconds
  const MAX_CANDLES = 500;

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

      const base = basePrices[selectedPair] || 100;
      const volatility = base * 0.0005; // small candle movement

      if (elapsed >= CANDLE_DURATION) {
        const finishedCandle = { ...currentCandleRef.current };

        setChartData((prev) => {
          const updated = [...prev, finishedCandle];
          if (updated.length > MAX_CANDLES) updated.shift();
          return updated;
        });

        chartRef.current?.updateCurrentCandle?.(finishedCandle);

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
      } else {
        const r = Math.random();
        let priceChange = 0;
        let newTrend: typeof currentTrend = "neutral";

        if (r < 0.4) {
          priceChange = Math.random() * volatility;
          newTrend = "up";
        } else if (r < 0.7) {
          priceChange = -(Math.random() * volatility);
          newTrend = "down";
        } else {
          priceChange = (Math.random() - 0.5) * volatility * 0.5;
        }

        setCurrentTrend(newTrend);

        const newPrice = Math.max(
          0.01,
          Math.min(999, currentCandleRef.current.close + priceChange)
        );
        setCurrentPrice(newPrice);

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
      <div className="min-h-[80vh] bg-gray-900 relative p-3">
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

            <div className="flex items-center gap-4">
              <Link href="/aiTrade" passHref>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<FaRobot className="w-4 h-4" />}
                  className="rounded-full"
                >
                  Trade with AI
                </Button>
              </Link>
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
