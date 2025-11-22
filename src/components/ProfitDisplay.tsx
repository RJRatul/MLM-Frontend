// components/ProfitDisplay.tsx - Updated with better error handling
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
      <div className="text-yellow-400 text-sm flex items-center space-x-2">
        <span>Data unavailable</span>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="text-xs text-blue-400 hover:text-blue-300 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  // If no data and no error, show loading/empty state
  if (!user?.algoProfitAmount && user?.algoProfitAmount !== 0) {
    return (
      <div className="text-gray-400 text-sm flex items-center space-x-2">
        <span>No profit data</span>
        {/* <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`text-xs text-blue-400 hover:text-blue-300 ${
            isRefreshing ? "opacity-50" : ""
          }`}
        >
          {isRefreshing ? "..." : "Refresh"}
        </button> */}
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
    <div className="flex items-center space-x-2">
      <div className={`${profitColor} text-sm font-medium`}>
        {profitSign}${Math.abs(user.algoProfitAmount).toFixed(2)} {profitSign}
        {Math.abs(user.algoProfitPercentage || 0).toFixed(2)}%
      </div>
    </div>
  );
}
