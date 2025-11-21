// app/trade/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import PrivateLayout from "@/layouts/PrivateLayout";
import UserPairsList from "@/components/UserPairsList";
import UserBalance from "@/components/UserBalance";
import SmallAiToggle from "@/components/SmallAiToggle";

import { FaArrowDown, FaQrcode, FaRobot } from "react-icons/fa";

export default function Trade() {
  const { user } = useAuth();
  const [selectedPair, setSelectedPair] = useState("");
  
  const getUserName = () => {
    if (user?.firstName && user?.lastName)
      return `${user.firstName} ${user.lastName}`;
    if (user?.firstName) return user.firstName;
    if (user?.lastName) return user.lastName;
    return "User";
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
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Balance & Actions */}
            <div className="lg:col-span-3 space-y-6">
              {/* Account Header */}
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4 gap-4">
                  <div>
                    <h2 className="text-white text-xl font-bold">
                      {getUserName()}
                    </h2>
                  </div>
                  <div className="flex items-center flex-col">
                    <div className="text-white text-3xl font-bold mb-1">
                      <UserBalance />
                    </div>
                    {/* <div className="text-green-400 text-sm">
                      +$345.70 +2.76%
                    </div> */}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center gap-2 mt-6">
                  {actionButtons.map((action) => (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors flex-1"
                    >
                      <div className="p-3 bg-gray-600 rounded-full">
                        {action.icon}
                      </div>
                      <span className="text-white text-sm font-medium text-center">
                        {action.label}
                      </span>
                    </Link>
                  ))}

                  {/* ALGO Toggle Button - Perfect design */}
                  <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors flex-1">
                    <div className="flex items-center justify-center gap-3">
                      <div className="p-3 bg-gray-600 rounded-full">
                        <FaRobot className="w-5 h-5 text-white" />
                      </div>
                      <SmallAiToggle />
                    </div>
                    <span className="text-white text-sm font-medium text-center">
                      ALGO Trade
                    </span>
                  </div>
                </div>
              </div>

              {/* Trading Pairs Section - Full width */}
              <div className="bg-gray-800 rounded-2xl p-6">
                <h3 className="text-white text-lg font-semibold mb-4">
                  Trading Pairs
                </h3>
                <UserPairsList
                  selectedPair={selectedPair}
                  onPairSelect={setSelectedPair}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
}