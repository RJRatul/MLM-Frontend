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
  timeRemaining: number;
}

export interface ChartHandle {
  updateCurrentCandle: (candle: any) => void;
}

const TradingChart = forwardRef<ChartHandle, TradingChartProps>(
  ({ data, pairName, currentPrice, timeRemaining }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
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

    useEffect(() => {
      if (!containerRef.current) return;

      // Create the chart
      const chart = createChart(containerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: "#1f2937" },
          textColor: "#cccccc",
        },
        grid: {
          vertLines: { color: "#141b23" },
          horzLines: { color: "#141b23" },
        },
        width: containerRef.current.clientWidth,
        height: 500,
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
          borderColor: "#1e2a35",
          barSpacing: 15, // zoom level
          rightOffset: 2,
          minBarSpacing: 6,
          fixLeftEdge: false,
          lockVisibleTimeRangeOnResize: true,
          rightBarStaysOnScroll: true,
          borderVisible: false,
        },
        rightPriceScale: {
          borderColor: "#1e2a35",
          scaleMargins: { top: 0.15, bottom: 0.15 },
        },
        crosshair: { mode: 1 },
        localization: {
          priceFormatter: (p: number) => `$${p.toFixed(2)}`,
        },
        handleScroll: true,
        handleScale: true,
      });

      // Add candle series
      const series = chart.addCandlestickSeries({
        upColor: "#00ff99",
        borderUpColor: "#00ff99",
        wickUpColor: "#00ff99",
        downColor: "#ff4d4d",
        borderDownColor: "#ff4d4d",
        wickDownColor: "#ff4d4d",
        priceLineVisible: true,
      });

      chart.timeScale().subscribeVisibleTimeRangeChange(() => {
        userInteracted.current = true;
      });

      chartRef.current = chart;
      seriesRef.current = series;

      // Resize chart when window size changes
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

    useEffect(() => {
      userInteracted.current = false;
    }, [pairName]);

    useEffect(() => {
      if (!seriesRef.current || !chartRef.current) return;

      const formatted = formatData(data);
      seriesRef.current.setData(formatted);

      // ✅ Auto zoom to last 30 candles on load
      if (!userInteracted.current && formatted.length > 0) {
        const visibleCount = 30;
        const lastIndex = formatted.length - 1;
        const from = Math.max(0, lastIndex - visibleCount);
        const to = lastIndex;
        const fromTime = formatted[from].time;
        const toTime = formatted[to].time;

        chartRef.current.timeScale().setVisibleRange({ from: fromTime, to: toTime });
      }

      // Keep chart anchored to right edge and prevent auto-zooming out
      chartRef.current.applyOptions({
        timeScale: {
          barSpacing: 15,
          rightOffset: 2,
          minBarSpacing: 6,
          lockVisibleTimeRangeOnResize: true,
          rightBarStaysOnScroll: true,
        },
      });
    }, [data]);

    return (
      <div className="bg-[#1f2937] rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">{pairName}</h2>
          <div className="flex gap-4 items-center">
            <span className="text-white font-mono text-sm">
              ${currentPrice.toFixed(2)}
            </span>
            <span className="text-white font-mono text-sm">
              {timeRemaining}s
            </span>
          </div>
        </div>

        <div
          ref={containerRef}
          className="h-[500px] rounded-lg overflow-hidden"
        />
      </div>
    );
  }
);

TradingChart.displayName = "TradingChart";
export default TradingChart;
