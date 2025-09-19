// app/wallet/page.tsx - Improved version
'use client';

import { useState } from 'react';
import PrivateLayout from '../../layouts/PrivateLayout';
import DepositRequestForm from '@/components/DepositRequestForm';
import DepositHistory from '@/components/DepositHistory';
import { FaWallet, FaMoneyBillWave, FaHistory } from 'react-icons/fa';
import UserBalance from '@/components/UserBalance';

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<'deposit' | 'history'>('deposit');

  return (
    <PrivateLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaWallet className="mr-3 text-blue-400 text-2xl" />
            <h1 className="text-2xl font-bold text-white">
              Wallet Management
            </h1>
          </div>
          <UserBalance />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('deposit')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'deposit'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <FaMoneyBillWave className="mr-2" />
              Request Deposit
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <FaHistory className="mr-2" />
              Deposit History
            </button>
          </nav>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'deposit' && <DepositRequestForm />}
          {activeTab === 'history' && <DepositHistory />}
        </div>
      </div>
    </PrivateLayout>
  );
}