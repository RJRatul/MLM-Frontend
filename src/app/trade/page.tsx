// app/trade/page.tsx - With Market Off Days Info
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import PrivateLayout from "@/layouts/PrivateLayout";
import UserPairsList from "@/components/UserPairsList";
import UserBalance from "@/components/UserBalance";
import SmallAiToggle from "@/components/SmallAiToggle";
import ProfitDisplay from "@/components/ProfitDisplay";

import { FaArrowDown, FaQrcode, FaRobot, FaCalendarTimes, FaInfoCircle } from "react-icons/fa";

export default function Trade() {
  const { user } = useAuth();
  const [selectedPair, setSelectedPair] = useState("");
  const [marketOffDays, setMarketOffDays] = useState<string[]>([]);
  const [isLoadingMarketDays, setIsLoadingMarketDays] = useState(false);

  // Toast state moved to page level
  const [toast, setToast] = useState<{
    message: string;
    color: "green" | "red";
    show: boolean;
  }>({ message: "", color: "green", show: false });
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch market off days
  useEffect(() => {
    fetchMarketOffDays();
  }, []);

  const fetchMarketOffDays = async () => {
    try {
      setIsLoadingMarketDays(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://beecoin.cloud/api'}/cron-settings/market-off-days`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMarketOffDays(data.marketOffDayNames || []);
      }
    } catch (error) {
      console.error('Failed to fetch market off days:', error);
    } finally {
      setIsLoadingMarketDays(false);
    }
  };

  const getUserName = () => {
    if (user?.firstName && user?.lastName)
      return `${user.firstName} ${user.lastName}`;
    if (user?.firstName) return user.firstName;
    if (user?.lastName) return user.lastName;
    return "User";
  };

  const showToast = (message: string, color: "green" | "red") => {
    setToast({ message, color, show: true });

    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 2000); // Shorter duration
  };

  // Check if today is market off day
  const isTodayMarketOff = () => {
    if (marketOffDays.length === 0) return false;
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return marketOffDays.includes(today);
  };

  const actionButtons = [
    {
      label: "Withdrawal",
      icon: <FaArrowDown className="w-5 h-5" />,
      href: "/withdrawal",
    },
    {
      label: "Deposit",
      icon: <FaQrcode className="w-5 h-5" />,
      href: "/deposit",
    },
  ];

  return (
    <PrivateLayout>
      {/* Smaller, centered toast */}
      {toast.show && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg text-white z-50 animate-in slide-in-from-top duration-300 ${
            toast.color === "green" ? "bg-gradient-to-br from-green-600 to-green-800" : "bg-gradient-to-br from-red-600 to-red-800"
          }`}
        >
          <FaRobot className="w-3 h-3" />
          <span className="font-medium text-xs">{toast.message}</span>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4">
        <div className="max-w-md mx-auto">
          {/* Account Header */}
          <div className="mb-6">
            <div className="text-center mb-8">
              <h1 className="text-white text-2xl font-bold mb-2">
                {getUserName()}
              </h1>
              <div className="text-white text-4xl font-bold mb-2">
                <UserBalance />
              </div>
              <div className="text-green-400 text-lg font-semibold">
                <ProfitDisplay />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center gap-4 mb-8">
              {actionButtons.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center gap-3 flex-1"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center shadow-lg border border-gray-700 transition-all duration-200 hover:bg-gray-700 hover:scale-105">
                    <div className="text-gray-300">{action.icon}</div>
                  </div>
                  <span className="text-white text-sm font-medium text-center">
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>

            {/* ALGO Toggle Section with Market Off Days */}
            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-2xl p-4 border border-purple-700/30 mb-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center">
                    <FaRobot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-white font-semibold">ALGO Trade</span>
                    <div className="text-purple-300 text-xs">
                      Automated trading bot
                    </div>
                  </div>
                </div>
                <SmallAiToggle onToggle={showToast} />
              </div>

              {/* Market Off Days Info */}
              {marketOffDays.length > 0 && (
                <div className="mt-3 pt-3 border-t border-purple-700/30">
                  <div className="flex items-start gap-2">
                    <div className="text-xs text-yellow-300">
                      <div className="font-medium mb-1">
                        {isTodayMarketOff() ? (
                          <span className="text-yellow-400">⚠️ Today is market closed</span>
                        ) : (
                          ""
                        )}
                      </div>
                      {isTodayMarketOff() && (
                        <div className="text-yellow-200/70 text-[10px] mt-1">
                          No Algo trading profits will be added today
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isLoadingMarketDays && (
                <div className="mt-3 pt-3 border-t border-purple-700/30">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-400"></div>
                    <div className="text-xs text-yellow-300">
                      Loading market schedule...
                    </div>
                  </div>
                </div>
              )}

              {/* Info Tooltip */}
              <div className="mt-2 flex items-center gap-1 text-purple-300/70 text-[10px]">
                <FaInfoCircle className="w-2.5 h-2.5" />
                <span>Algo Trade automatically deactivates after profit calculation</span>
              </div>
            </div>
          </div>

          {/* Trading Pairs Section */}
          <div>
            <UserPairsList
              selectedPair={selectedPair}
              onPairSelect={setSelectedPair}
            />
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
}