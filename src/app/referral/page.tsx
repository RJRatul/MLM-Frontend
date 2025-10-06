/* eslint-disable react-hooks/exhaustive-deps */
// app/affiliate/page.tsx (updated)
"use client";
import PrivateLayout from "@/layouts/PrivateLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import {
  FaCopy,
  FaCheck,
  FaUsers,
  FaDollarSign,
  FaStar,
  FaChartLine,
  FaTrophy,
  FaFire,
  FaArrowRight,
  FaSync,
} from "react-icons/fa";
import { User } from "@/services/api";

// Define proper TypeScript interfaces
interface CommissionLevel {
  3: number;
  2: number;
  1: number;
  label: string;
  nextLevel: number | null;
}

interface CommissionStructure {
  [key: number]: CommissionLevel;
}

// Commission structure for display
const COMMISSION_STRUCTURE: CommissionStructure = {
  0: { 3: 3, 2: 8, 1: 12, label: "Base", nextLevel: 8 },
  1: { 3: 5, 2: 10, 1: 15, label: "Level 1", nextLevel: 11 },
  2: { 3: 6, 2: 12, 1: 18, label: "Level 2", nextLevel: 14 },
  3: { 3: 7, 2: 14, 1: 21, label: "Level 3", nextLevel: 17 },
  4: { 3: 9, 2: 16, 1: 25, label: "Level 4", nextLevel: 20 },
  5: { 3: 12, 2: 18, 1: 30, label: "Level 5", nextLevel: null },
};

// Helper function to safely get commission data
const getCommissionData = (level: number | undefined): CommissionLevel => {
  const defaultLevel: CommissionLevel = {
    3: 3,
    2: 8,
    1: 12,
    label: "Base",
    nextLevel: 8,
  };
  if (level === undefined || level === null) return defaultLevel;
  return COMMISSION_STRUCTURE[level] || defaultLevel;
};

export default function Affiliate() {
  const { user, refreshUser } = useAuth();
  const [copied, setCopied] = useState(false);
  const [progressAnimation, setProgressAnimation] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const referralLink = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/register?ref=${user?.referralCode}`;
  useEffect(() => {
    loadFreshData();
  }, []);
  // Animate progress bar on load and when user data changes
  useEffect(() => {
    if (user) {
      setProgressAnimation(0);
      const timer = setTimeout(() => {
        const progress = Math.min(
          100,
          ((user.referralCount || 0) / (userCommissionData.nextLevel || 8)) *
            100
        );
        setProgressAnimation(progress);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [user]);

  const loadFreshData = async () => {
    try {
      setIsRefreshing(true);
      await refreshUser();
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const userCommissionData = getCommissionData(user?.level);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate progress towards next milestone
  // Simplified progress calculation
interface ProgressData {
  current: number;
  target: number;
  percentage: number;
  nextMilestone: string;
}

const getProgressData = (user: User | null): ProgressData => {
  if (!user) {
    return { current: 0, target: 5, percentage: 0, nextMilestone: "5 referrals" };
  }

  const referralCount = user.referralCount || 0;
  const level = user.level || 0;
  const tier = user.tier || 3;
  
  let target = 5;
  let nextMilestone = "Unlock Commission (5 referrals)";

  if (!user.commissionUnlocked) {
    target = 5;
    nextMilestone = "Unlock Commission (5 referrals)";
  } else {
    const levelData = COMMISSION_STRUCTURE[level];
    if (levelData) {
      if (tier === 3) {
        target = 6;
        nextMilestone = "Tier 2 (6 referrals)";
      } else if (tier === 2) {
        target = 7;
        nextMilestone = "Tier 1 (7 referrals)";
      } else if (tier === 1) {
        target = levelData.nextLevel || 8;
        nextMilestone = `Level ${level + 1} (${target} referrals)`;
      }
    }
  }

  const percentage = Math.min(100, (referralCount / target) * 100);
  
  return { 
    current: referralCount, 
    target, 
    percentage, 
    nextMilestone 
  };
};

  const progressData = getProgressData(user);

  // Get tier badge color and icon
  const getTierBadge = (tier: number) => {
    const tierConfig = {
      1: {
        color: "from-yellow-500 to-orange-500",
        icon: FaFire,
        label: "Tier 1",
      },
      2: { color: "from-gray-400 to-gray-600", icon: FaStar, label: "Tier 2" },
      3: {
        color: "from-orange-400 to-red-500",
        icon: FaTrophy,
        label: "Tier 3",
      },
    };

    return tierConfig[tier as keyof typeof tierConfig] || tierConfig[3];
  };

  const tierBadge = getTierBadge(user?.tier || 3);
  const TierIcon = tierBadge.icon;

  // Get level badge
  const getLevelBadge = (level: number) => {
    const levels = [
      "Beginner",
      "Bronze",
      "Silver",
      "Gold",
      "Platinum",
      "Diamond",
    ];
    const colors = [
      "from-gray-400 to-gray-600",
      "from-orange-400 to-red-500",
      "from-gray-300 to-gray-500",
      "from-yellow-400 to-orange-400",
      "from-cyan-400 to-blue-500",
      "from-purple-400 to-pink-500",
    ];

    return {
      label: levels[level] || "Beginner",
      color: colors[level] || colors[0],
      level: level,
    };
  };

  const levelBadge = getLevelBadge(user?.level || 0);

  // Format last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return "Never";
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;

    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  };
  return (
    <PrivateLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header with Refresh Button */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Refferal Bonus</h1>
          <button
            onClick={loadFreshData}
            disabled={isRefreshing}
            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <FaSync className={isRefreshing ? "animate-spin" : ""} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>

        {/* Last Updated Indicator */}
        {lastUpdated && (
          <div className="text-sm text-gray-400 text-right">
            Last updated: {formatLastUpdated()}
          </div>
        )}

        {/* Dynamic Progress Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 mb-6 border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <FaChartLine className="mr-2 text-blue-400" />
              Your Progress Journey
            </h2>
            <div className="text-sm text-gray-400">
              Referrals:{" "}
              <span className="font-bold text-white">
                {user?.referralCount || 0}
              </span>
            </div>
          </div>

          {/* Level and Tier Badges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div
              className={`bg-gradient-to-r ${levelBadge.color} rounded-lg p-4 text-white`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Current Level</p>
                  <p className="text-2xl font-bold">{levelBadge.label}</p>
                  <p className="text-sm">Level {levelBadge.level}</p>
                </div>
                <FaStar className="text-3xl opacity-80" />
              </div>
            </div>

            <div
              className={`bg-gradient-to-r ${tierBadge.color} rounded-lg p-4 text-white`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Current Tier</p>
                  <p className="text-2xl font-bold">{tierBadge.label}</p>
                  <p className="text-sm">
                    {userCommissionData[user?.tier as 1 | 2 | 3] || 0}% Commission
                  </p>
                </div>
                <TierIcon className="text-3xl opacity-80" />
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>🚀 Progress to {progressData.nextMilestone}</span>
              <span>
                {progressData.current} / {progressData.target} referrals
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4 relative overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressAnimation}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div className="bg-gray-700/50 rounded-lg p-3">
              <p className="text-2xl font-bold text-white">
                {user?.referralCount || 0}
              </p>
              <p className="text-xs text-gray-400">Total Referrals</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <p className="text-2xl font-bold text-green-400">
                ${(user?.referralEarnings || 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-400">Earned</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <p className="text-2xl font-bold text-blue-400">
                {userCommissionData[user?.tier as 1 | 2 | 3] || 0}%
              </p>
              <p className="text-xs text-gray-400">Rate</p>
            </div>
          </div>

          {/* Commission Unlock Status */}
          {!user?.commissionUnlocked ? (
            <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse mr-2"></div>
                <p className="text-yellow-300 text-sm">
                  💡 Commission feature unlocks after 5 referrals (
                  {5 - (user?.referralCount || 0)} more needed)
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <p className="text-green-300 text-sm">
                  ✅ Commission feature unlocked! You are earning{" "}
                  {userCommissionData[user?.tier as 1 | 2 | 3] || 0}
                  % on referrals.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Referral Link Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Your Referral Link
          </h2>
          <p className="text-gray-400 mb-4">
            Share this link with friends and earn commissions on their deposits!
            Commission unlocks after 5 referrals and is based on your level and
            tier.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 bg-gray-700 rounded-lg p-3">
              <code className="text-white break-all">{referralLink}</code>
            </div>
            <button
              onClick={() => copyToClipboard(referralLink)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center"
            >
              {copied ? (
                <>
                  <FaCheck className="mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <FaCopy className="mr-2" />
                  Copy Link
                </>
              )}
            </button>
          </div>
        </div>

        {/* Referral Code Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Your Referral Code
          </h2>
          <p className="text-gray-400 mb-4">
            You can also share just your code for manual entry during
            registration.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 bg-gray-700 rounded-lg p-3">
              <code className="text-white text-xl font-mono">
                {user?.referralCode}
              </code>
            </div>
            <button
              onClick={() => copyToClipboard(user?.referralCode || "")}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all flex items-center justify-center"
            >
              {copied ? (
                <>
                  <FaCheck className="mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <FaCopy className="mr-2" />
                  Copy Code
                </>
              )}
            </button>
          </div>
        </div>

        {/* Commission Structure */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Commission Structure
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-400">
              <thead className="text-xs uppercase bg-gray-700 text-gray-400">
                <tr>
                  <th className="px-4 py-3">Level</th>
                  <th className="px-4 py-3">Tier 3</th>
                  <th className="px-4 py-3">Tier 2</th>
                  <th className="px-4 py-3">Tier 1</th>
                  <th className="px-4 py-3">Requirement</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(COMMISSION_STRUCTURE).map(([level, data]) => (
                  <tr
                    key={level}
                    className={`border-b bg-gray-800 border-gray-700 ${
                      user?.level === parseInt(level) ? "bg-blue-900/20" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-white">
                      {data.label} {user?.level === parseInt(level) && "✓"}
                    </td>
                    <td className="px-4 py-3">{data[3]}%</td>
                    <td className="px-4 py-3">{data[2]}%</td>
                    <td className="px-4 py-3">{data[1]}%</td>
                    <td className="px-4 py-3">
                      {level === "0"
                        ? "5+ referrals"
                        : `${data.nextLevel}+ referrals`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-400 font-bold">1</span>
              </div>
              <h3 className="font-semibold text-white mb-2">Share Your Link</h3>
              <p className="text-gray-400 text-sm">
                Share your unique referral link with friends
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-400 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-white mb-2">They Sign Up</h3>
              <p className="text-gray-400 text-sm">
                Friends register using your referral code
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-400 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-white mb-2">
                Unlock Commission
              </h3>
              <p className="text-gray-400 text-sm">
                After 5 referrals, commission feature unlocks
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-yellow-400 font-bold">4</span>
              </div>
              <h3 className="font-semibold text-white mb-2">
                Earn on Deposits
              </h3>
              <p className="text-gray-400 text-sm">
                Get commission when referred users make deposits
              </p>
            </div>
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
}
