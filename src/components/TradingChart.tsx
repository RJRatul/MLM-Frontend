'use client';

import { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';

interface TradingChartProps {
  data: {
    time: number; // This will be converted to the required Time type
    open: number;
    high: number;
    low: number;
    close: number;
  }[];
  pairName: string;
}

export default function TradingChart({ data, pairName }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  // Convert data to the format expected by Lightweight Charts
  const formatData = (rawData: TradingChartProps['data']): CandlestickData[] => {
    return rawData.map(item => ({
      time: item.time as Time, // Cast number to Time type
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }));
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Initialize chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#1f2937' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#374151' },
        horzLines: { color: '#374151' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Add candlestick series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#10b981',
      wickDownColor: '#ef4444',
      wickUpColor: '#10b981',
    });

    // Set formatted data
    const formattedData = formatData(data);
    candleSeries.setData(formattedData);

    // Store references
    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Update data when props change
  useEffect(() => {
    if (candleSeriesRef.current) {
      const formattedData = formatData(data);
      candleSeriesRef.current.setData(formattedData);
    }
  }, [data]);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">{pairName}</h2>
        <div className="flex space-x-2">
          <button className="px-3 py-1 bg-gray-700 rounded text-sm text-gray-300 hover:bg-gray-600">
            1h
          </button>
          <button className="px-3 py-1 bg-blue-600 rounded text-sm text-white">
            4h
          </button>
          <button className="px-3 py-1 bg-gray-700 rounded text-sm text-gray-300 hover:bg-gray-600">
            1d
          </button>
          <button className="px-3 py-1 bg-gray-700 rounded text-sm text-gray-300 hover:bg-gray-600">
            1w
          </button>
        </div>
      </div>
      
      {/* Chart container */}
      <div 
        ref={chartContainerRef} 
        className="rounded-lg overflow-hidden"
      />
      
      {/* Price indicators */}
      <div className="flex justify-between mt-4 text-sm">
        <div className="text-green-400">
          High: ${Math.max(...data.map(d => d.high)).toFixed(2)}
        </div>
        <div className="text-red-400">
          Low: ${Math.min(...data.map(d => d.low)).toFixed(2)}
        </div>
        <div className="text-gray-300">
          Current: ${data[data.length - 1]?.close.toFixed(2)}
        </div>
      </div>
    </div>
  );
}