"use client";
import { useState, useEffect } from "react";
import { pairApiService, Pair } from "@/services/pairApi";

interface UserPairsListProps {
  onPairSelect?: (pairName: string) => void;
  selectedPair?: string;
}

export default function UserPairsList({
  onPairSelect,
  selectedPair,
}: UserPairsListProps) {
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-700 rounded-lg p-4 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2">
      {pairs.map((pair) => {
        const isActive = selectedPair === pair.pairName;
        return (
          <div
            key={pair._id}
            className={`rounded-lg p-4 cursor-pointer transition-colors ${
              isActive
                ? "bg-gray-700 ring-2 ring-green-500"
                : "bg-gray-800 hover:bg-gray-700/50"
            }`}
            onClick={() => onPairSelect?.(pair.pairName)}
          >
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: pair.svgImage }}
              />
              <div>
                <h3 className="text-white font-medium">{pair.pairName}</h3>
                <p
                  className={`text-sm font-mono ${
                    pair.profitLoss >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {pair.profitLoss >= 0 ? "+" : ""}
                  {pair.profitLoss}%
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
