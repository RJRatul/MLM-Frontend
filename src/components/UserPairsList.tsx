// components/UserPairsList.tsx
"use client";

import { useState, useEffect } from "react";
import { pairApiService, Pair } from "@/services/pairApi";

export default function UserPairsList() {
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPairs();
  }, []);

  const loadPairs = async () => {
    try {
      setIsLoading(true);
      // Use getActivePairs which filters only active pairs
      const activePairs = await pairApiService.getActivePairs();
      setPairs(activePairs);
    } catch (error) {
      console.error("Failed to load pairs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-gray-400">Loading pairs...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {pairs.map((pair) => (
        <div key={pair._id} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700/50 transition-colors">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: pair.svgImage }}
            />
            <div>
              <h3 className="text-white font-medium">{pair.pairName}</h3>
              <p className={`text-sm font-mono ${pair.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {pair.profitLoss >= 0 ? '+' : ''}{pair.profitLoss}%
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}