/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  Time,
} from "lightweight-charts";

interface TradingChartProps {
  data: {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
  }[];
  pairName: string;
  currentPrice: number;
}

export interface ChartHandle {
  updateCurrentCandle: (candle: any) => void;
}

const TradingChart = forwardRef<ChartHandle, TradingChartProps>(
  ({ data, pairName, currentPrice }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const initialRangeSet = useRef(false);
    const userInteracted = useRef(false);

    useImperativeHandle(ref, () => ({
      updateCurrentCandle: (candle: any) => {
        seriesRef.current?.update({
          time: candle.time as Time,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        });
      },
    }));

    const formatData = (raw: TradingChartProps["data"]): CandlestickData[] =>
      raw.map((d) => ({
        time: d.time as Time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));

    // Initialize chart
    useEffect(() => {
      if (!containerRef.current) return;

      const chart = createChart(containerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: "#1f2937" },
          textColor: "#d1d5db",
        },
        grid: {
          vertLines: { color: "#374151" },
          horzLines: { color: "#374151" },
        },
        width: containerRef.current.clientWidth,
        height: 500,
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
          borderColor: "#374151",
          barSpacing: 20, // Increased for bigger candles
          rightOffset: 8, // Space for future candles
          minBarSpacing: 10, // Minimum zoom level for bigger candles
        },
        crosshair: { mode: 1 },
        rightPriceScale: {
          borderColor: "#374151",
          scaleMargins: { top: 0.1, bottom: 0.1 },
        },
        localization: {
          priceFormatter: (p: number) => `$${p.toFixed(2)}`,
        },
      });

      const series = chart.addCandlestickSeries({
        upColor: "#10b981",
        downColor: "#ef4444",
        borderUpColor: "#10b981",
        borderDownColor: "#ef4444",
        wickUpColor: "#10b981",
        wickDownColor: "#ef4444",
      });

      chart.timeScale().subscribeVisibleTimeRangeChange(() => {
        userInteracted.current = true;
      });

      chartRef.current = chart;
      seriesRef.current = series;

      const resize = () => {
        if (containerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: containerRef.current.clientWidth,
          });
        }
      };
      window.addEventListener("resize", resize);

      return () => {
        window.removeEventListener("resize", resize);
        chart.remove();
      };
    }, []);

    // Reset user interaction on pair change
    useEffect(() => {
      userInteracted.current = false;
      initialRangeSet.current = false;
    }, [pairName]);

    // Update chart data
    useEffect(() => {
      if (!seriesRef.current || !chartRef.current) return;

      const formatted = formatData(data);
      seriesRef.current.setData(formatted);

      if (!userInteracted.current && formatted.length > 0) {
        const targetVisibleCandles = 30; // Show exactly 30 candles
        
        // Always show the last 30 candles, regardless of total data length
        const lastIndex = formatted.length - 1;
        const from = Math.max(0, lastIndex - targetVisibleCandles + 1);
        const to = lastIndex;
        
        chartRef.current.timeScale().setVisibleLogicalRange({ 
          from, 
          to 
        });
        
        // Apply settings for bigger candles
        chartRef.current.applyOptions({
          timeScale: {
            rightOffset: 6,
            barSpacing: 20, // Bigger bar spacing for larger candles
          },
        });
        
        initialRangeSet.current = true;
      }
    }, [data]);

    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">{pairName}</h2>
          <span className="text-white font-mono text-sm">
            ${currentPrice.toFixed(2)}
          </span>
        </div>
        <div ref={containerRef} className="rounded-lg overflow-hidden" />
      </div>
    );
  }
);

TradingChart.displayName = "TradingChart";
export default TradingChart;