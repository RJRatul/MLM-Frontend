// app/withdrawal/page.tsx
'use client';

import { useState } from 'react';
import PrivateLayout from '../../layouts/PrivateLayout';
import WithdrawalRequestForm from '@/components/WithdrawalRequestForm';
import WithdrawalHistory from '@/components/WithdrawalHistory';
import { FaWallet, FaMoneyBillWave, FaHistory } from 'react-icons/fa';
import UserBalance from '@/components/UserBalance';

export default function WithdrawalPage() {
  const [activeTab, setActiveTab] = useState<'withdraw' | 'history'>('withdraw');

  return (
    <PrivateLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">
              Withdrawal Management
            </h1>
          </div>
          <UserBalance />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('withdraw')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'withdraw'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <FaMoneyBillWave className="mr-2" />
              Request Withdrawal
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
              Withdrawal History
            </button>
          </nav>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'withdraw' && <WithdrawalRequestForm />}
          {activeTab === 'history' && <WithdrawalHistory />}
        </div>
      </div>
    </PrivateLayout>
  );
}