// components/ProfitDisplay.tsx - Enhanced version
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfitDisplay() {
  const { user, refreshProfitData } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      await refreshProfitData();
    } catch (error) {
      console.error("Failed to refresh profit data:", error);
      setError("Failed to update profit data");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh profit data when component mounts
  useEffect(() => {
    refreshProfitData().catch((error) => {
      console.warn("Could not load profit data on mount:", error);
    });
  }, []);

  // If there's an error and no data, show error state
  if (error && !user?.algoProfitAmount && user?.algoProfitAmount !== 0) {
    return (
      <div className="text-yellow-400 text-sm">
        Data unavailable
      </div>
    );
  }

  // If no data and no error, show loading/empty state
  if (!user?.algoProfitAmount && user?.algoProfitAmount !== 0) {
    return (
      <div className="text-gray-400 text-sm">
        No profit data
      </div>
    );
  }

  const isProfit = user.algoProfitAmount > 0;
  const isLoss = user.algoProfitAmount < 0;

  const profitColor = isProfit
    ? "text-green-400"
    : isLoss
    ? "text-red-400"
    : "text-gray-400";
    
  const profitSign = isProfit ? "+" : isLoss ? "-" : "";

  return (
    <div className={`${profitColor} text-lg font-semibold`}>
      {profitSign}${Math.abs(user.algoProfitAmount).toFixed(2)}
      <span className={`${isProfit ? 'ml-2 bg-green-500/20 text-green-400' : isLoss ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'} px-2 py-1 rounded-md`}>
        {profitSign}{Math.abs(user.algoProfitPercentage || 0).toFixed(2)}%
      </span>
    </div>
  );
}