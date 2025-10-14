"use client";
import React, { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  Time,
} from "lightweight-charts";
import { CandleData } from "@/utils/generateChartData";

interface TradingChartProps {
  pairName: string;
  data: CandleData[];
  currentPrice: number;
  timeRemaining: number;
}

export interface ChartHandle {
  updateCurrentCandle: (candle: CandleData) => void;
}

const TradingChart = forwardRef<ChartHandle, TradingChartProps>(
  ({ pairName, data, currentPrice, timeRemaining }, ref) => {
    const chartContainerRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

    useImperativeHandle(ref, () => ({
      updateCurrentCandle: (candle: CandleData) => {
        if (!seriesRef.current) return;
        seriesRef.current.update({
          time: candle.time as Time,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        });
      },
    }));

    const formatData = (raw: CandleData[]): CandlestickData[] =>
      raw.map((d) => ({
        time: d.time as Time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));

    useEffect(() => {
      if (!chartContainerRef.current) return;

      const chart = createChart(chartContainerRef.current, {
        layout: { background: { type: ColorType.Solid, color: "#1f2937" }, textColor: "#cccccc" },
        grid: { vertLines: { color: "#141b23" }, horzLines: { color: "#141b23" } },
        width: chartContainerRef.current.clientWidth,
        height: 500,
        rightPriceScale: { borderColor: "#1e2a35", scaleMargins: { top: 0.15, bottom: 0.15 } },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
          borderColor: "#1e2a35",
          barSpacing: 15,
          rightOffset: 2,
          minBarSpacing: 6,
          lockVisibleTimeRangeOnResize: true,
          rightBarStaysOnScroll: true,
          borderVisible: false,
        },
        crosshair: { mode: 1 },
        localization: { priceFormatter: (p: number) => `$${p.toFixed(2)}` },
        handleScale: { axisPressedMouseMove: { price: false, time: true }, mouseWheel: false },
        handleScroll: { pressedMouseMove: true },
      });

      const candleSeries = chart.addCandlestickSeries({
        upColor: "#00ff99",
        borderUpColor: "#00ff99",
        wickUpColor: "#00ff99",
        downColor: "#ff4d4d",
        borderDownColor: "#ff4d4d",
        wickDownColor: "#ff4d4d",
        priceLineVisible: true,
      });

      candleSeries.setData(formatData(data));

      chartRef.current = chart;
      seriesRef.current = candleSeries;

      const handleResize = () => {
        if (chartRef.current && chartContainerRef.current) {
          chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
        }
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
          seriesRef.current = null;
        }
      };
    }, [pairName, data]);

    return (
      <div className="bg-[#1f2937] rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">{pairName}</h2>
          <div className="flex gap-4 items-center">
            <span className="text-white font-mono text-sm">${currentPrice.toFixed(2)}</span>
            <span className="text-white font-mono text-sm">{timeRemaining}s</span>
          </div>
        </div>

        <div ref={chartContainerRef} className="h-[500px] rounded-lg overflow-hidden" />
      </div>
    );
  }
);

TradingChart.displayName = "TradingChart";
export default TradingChart;
