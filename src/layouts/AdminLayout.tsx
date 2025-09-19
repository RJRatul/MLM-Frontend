// components/AdminLayout.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Button from '@/components/Button';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import { 
  FaSignOutAlt, 
  FaUsers,
  FaExchangeAlt,
  FaMoneyBillWave,
  FaCreditCard,
  FaChartLine,
  FaBars,
  FaTimes,
  FaCog,
  FaShieldAlt,
  FaPercentage,
  FaChartBar,
  FaClock  // Add this import for the schedule icon
} from 'react-icons/fa';
import { adminLogout } from '@/utils/adminAuth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Check if a navigation item is active
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  return (
    <AdminAuthGuard>
      <div className="flex h-screen bg-gray-900 text-gray-100">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-80 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-start h-16 px-4 bg-gray-900 border-b border-gray-700">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center mr-2">
                  <FaShieldAlt className="text-white text-lg" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  Admin Panel
                </span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              <Link 
                href="/admin/dashboard" 
                className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive('/admin/dashboard') 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <FaChartLine className="w-5 h-5" />
                <span className="ml-3">Dashboard</span>
              </Link>
              
              <Link 
                href="/admin/users" 
                className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive('/admin/users') 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <FaUsers className="w-5 h-5" />
                <span className="ml-3">Users</span>
              </Link>
              
              <Link 
                href="/admin/trade-pair" 
                className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive('/admin/trade-pair') 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <FaExchangeAlt className="w-5 h-5" />
                <span className="ml-3">Trade Pair</span>
              </Link>
              
              <Link 
                href="/admin/deposit" 
                className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive('/admin/deposit') 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <FaMoneyBillWave className="w-5 h-5" />
                <span className="ml-3">Deposit</span>
              </Link>
              
              <Link 
                href="/admin/withdrawal" 
                className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive('/admin/withdrawal') 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <FaCreditCard className="w-5 h-5" />
                <span className="ml-3">Withdrawal</span>
              </Link>

              {/* Profit/Loss Rules Menu Item */}
              <Link 
                href="/admin/profit-loss" 
                className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive('/admin/profit-loss') 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <FaPercentage className="w-5 h-5" />
                <span className="ml-3">Profit/Loss Rules</span>
              </Link>

              {/* Profit Loss Schedule Menu Item */}
              <Link 
                href="/admin/profit-loss-schedule" 
                className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive('/admin/profit-loss-schedule') 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <FaClock className="w-5 h-5" />
                <span className="ml-3">Profit Loss Schedule</span>
              </Link>
              
              <Link 
                href="/admin/settings" 
                className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive('/admin/settings') 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <FaCog className="w-5 h-5" />
                <span className="ml-3">Settings</span>
              </Link>
            </nav>

            {/* Sign out button at bottom */}
            <div className="p-4 border-t border-gray-700">
              <Button
                onClick={adminLogout}
                variant="secondary"
                className="w-full justify-start text-red-400 hover:text-red-300"
                icon={<FaSignOutAlt className="w-5 h-5" />}
              >
                Sign Out
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
                  icon={sidebarOpen ? <FaTimes className="w-4 h-4" /> : <FaBars className="w-4 h-4" />}
                  aria-label="Toggle menu"
                >
                  {sidebarOpen ? "Close" : "Menu"}
                </Button>
              </div>

              {/* Page title */}
              <div className="flex-1 lg:flex-none">
                <h1 className="text-xl font-semibold text-white">
                  {pathname === '/admin/dashboard' && 'Dashboard'}
                  {pathname === '/admin/users' && 'User Management'}
                  {pathname === '/admin/trade-pair' && 'Trade Pair Settings'}
                  {pathname === '/admin/deposit' && 'Deposit Management'}
                  {pathname === '/admin/withdrawal' && 'Withdrawal Management'}
                  {pathname === '/admin/profit-loss' && 'Profit/Loss Rules'}
                  {pathname === '/admin/profit-loss-schedule' && 'Profit Loss Schedule'} {/* Add this line */}
                  {pathname === '/admin/settings' && 'System Settings'}
                </h1>
              </div>

              {/* Right side items */}
              <div className="flex items-center space-x-4">
                {/* Admin badge */}
                <div className="hidden md:flex items-center px-3 py-1 rounded-full bg-blue-900/30 text-blue-400 text-sm">
                  <FaShieldAlt className="w-3 h-3 mr-1" />
                  Administrator
                </div>

                {/* Sign out button */}
                <Button
                  onClick={adminLogout}
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
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-900">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}