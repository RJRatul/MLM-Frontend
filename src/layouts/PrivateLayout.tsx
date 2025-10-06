"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import { usePathname } from "next/navigation";
import Button from "@/components/Button";
import {
  FaSignOutAlt,
  FaUser,
  FaWallet,
  FaGift,
  FaChartLine,
  FaRobot,
  FaBars,
  FaTimes,
  FaHandshake,
  FaExchangeAlt, // Added affiliate icon
} from "react-icons/fa";
import UserBalance from "@/components/UserBalance";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Get user initials from firstName and lastName
  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(
        0
      )}`.toUpperCase();
    } else if (user?.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    } else if (user?.lastName) {
      return user.lastName.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Get full name for display
  const getUserName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user?.firstName) {
      return user.firstName;
    } else if (user?.lastName) {
      return user.lastName;
    }
    return "User";
  };

  // Check if a navigation item is active
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-900 text-gray-100">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-80 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-20 bg-gray-800 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-start h-16 px-4 bg-gray-900 border-b border-gray-700">
              <div className="flex items-center">
                <div className="w-20 h-10 relative left-[-17px]">
                  <Image
                    src="/logo.png"
                    alt="BeeCoin Logo"
                    fill
                    className="object-contain "
                  />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  BeeCoin
                </span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              <Link
                href="/trade"
                className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive("/trade")
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <FaChartLine className="w-5 h-5" />
                {/* <span className="ml-3">Trade</span> */}
              </Link>

              

              <Link
                href="/aiTrade"
                className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive("/aiTrade")
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <FaRobot className="w-5 h-5" />
                {/* <span className="ml-3">AI Trade Activation</span> */}
              </Link>

              {/* New Affiliate Menu Item */}
              <Link
                href="/referral"
                className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive("/referral")
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <FaGift className="w-5 h-5" />
                {/* <span className="ml-3">Referral Bonus</span> */}
              </Link>

              <Link
                href="/deposit"
                className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive("/deposit")
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <FaWallet className="w-5 h-5" />
                {/* <span className="ml-3">Deposit</span> */}
              </Link>
              <Link
                href="/withdrawal"
                className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive("/withdrawal")
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <FaExchangeAlt className="w-5 h-5" />
                {/* <span className="ml-3">Withdrawal</span> */}
              </Link>

              <Link
                href="/account"
                className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive("/account")
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <FaUser className="w-5 h-5" />
                {/* <span className="ml-3">Account</span> */}
              </Link>
            </nav>

            {/* Sign out button at bottom */}
            <div className="p-4 border-t border-gray-700">
              <Button
                onClick={logout}
                variant="secondary"
                className="w-full justify-start text-red-400 hover:text-red-300"
                // icon={<FaSignOutAlt className="w-5 h-5" />}
              >
                <FaSignOutAlt className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top header */}
          <header className="bg-gray-800 border-b border-gray-700">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
              {/* Mobile menu button */}
              <div className="lg:hidden">
                <Button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  variant="secondary"
                  size="sm"
                  icon={
                    sidebarOpen ? (
                      <FaTimes className="w-4 h-4" />
                    ) : (
                      <FaBars className="w-4 h-4" />
                    )
                  }
                  aria-label="Toggle menu"
                >
                  {sidebarOpen ? "Close" : "Menu"}
                </Button>
              </div>

              {/* Empty div to push items to the right on desktop */}
              <div className="hidden lg:block flex-1"></div>

              {/* Right side items */}
              <div className="flex items-center space-x-4">
                <Link href="/deposit" passHref>
                    <UserBalance />
                </Link>

                {/* AI Button */}
                <Link href="/aiTrade" passHref>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<FaRobot className="w-4 h-4" />}
                    className="rounded-full"
                  >
                    AI
                  </Button>
                </Link>
                {/* User info with hover effect */}
                <div className="flex items-center">
                  <div className="relative group">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold cursor-pointer">
                      {getUserInitials()}
                    </div>
                    {/* Tooltip that appears on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                      {getUserName()}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                  <span className="ml-2 text-sm font-medium hidden md:block">
                    {getUserName()}
                  </span>
                </div>

                {/* Sign out button */}
                <Button
                  onClick={logout}
                  variant="secondary"
                  size="sm"
                  icon={<FaSignOutAlt className="w-4 h-4" />}
                  className="hidden lg:flex"
                  aria-label="Sign out"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto bg-gray-900">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}