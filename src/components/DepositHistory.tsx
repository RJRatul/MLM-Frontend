/* eslint-disable @typescript-eslint/no-explicit-any */
// components/DepositHistory.tsx
'use client';

import { useState, useEffect } from 'react';
import { FaClock, FaCheckCircle, FaTimesCircle, FaHistory } from 'react-icons/fa';
import { apiService } from '@/services/api';

export default function DepositHistory() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDeposits();
  }, []);

  const loadDeposits = async () => {
    try {
      const userDeposits = await apiService.getUserDeposits();
      setDeposits(userDeposits);
    } catch (error) {
      console.error('Failed to load deposit history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <FaCheckCircle className="text-green-500" />;
      case 'rejected': return <FaTimesCircle className="text-red-500" />;
      default: return <FaClock className="text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return 'Pending';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-white mb-6 flex items-center">
        <FaHistory className="mr-2" /> Deposit History
      </h2>

      {deposits.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <FaHistory className="mx-auto h-12 w-12 mb-4" />
          <p>No deposit history found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-4 py-2 text-left text-sm text-gray-400">Amount</th>
                <th className="px-4 py-2 text-left text-sm text-gray-400">Transaction ID</th>
                <th className="px-4 py-2 text-left text-sm text-gray-400">Status</th>
                <th className="px-4 py-2 text-left text-sm text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map((deposit) => (
                <tr key={deposit._id} className="border-b border-gray-700">
                  <td className="px-4 py-3 text-white">${deposit.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-300 font-mono text-sm">{deposit.transactionId}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      {getStatusIcon(deposit.status)}
                      <span className="ml-2">{getStatusText(deposit.status)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">
                    {new Date(deposit.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}