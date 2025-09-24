/* eslint-disable @typescript-eslint/no-explicit-any */
// components/WithdrawalHistory.tsx
'use client';

import { useState, useEffect } from 'react';
import { FaHistory, FaCheckCircle, FaTimesCircle, FaClock, FaRedo } from 'react-icons/fa';
import { apiService } from '@/services/api'; // Updated import
import type { Withdrawal } from '@/services/api'; // Updated import

export default function WithdrawalHistory() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      setError(null);
      // Use apiService instead of the separate function
      const data = await apiService.getUserWithdrawals();
      setWithdrawals(data);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch withdrawal history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <FaCheckCircle className="text-green-500" />;
      case 'rejected':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaClock className="text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-400';
      case 'rejected':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FaHistory className="text-blue-500 text-2xl mr-3" />
          <h2 className="text-xl font-semibold text-white">Withdrawal History</h2>
        </div>
        <button
          onClick={fetchWithdrawals}
          disabled={loading}
          className="flex items-center text-sm bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-md transition-colors"
        >
          <FaRedo className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-500 text-white p-3 rounded mb-4">
          {error}
        </div>
      )}

      {withdrawals.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <FaHistory className="text-4xl mx-auto mb-4 opacity-50" />
          <p>No withdrawal history found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Remarks / Admin Note
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {withdrawals.map((withdrawal) => (
                <tr key={withdrawal._id} className="hover:bg-gray-700/50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(withdrawal.createdAt)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">
                    ${withdrawal.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div>
                      {withdrawal.method}
                      {withdrawal.method === 'Binance' && (
                        <div className="text-xs text-gray-400">
                          ID: {withdrawal.accountDetails.binanceId}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <div className={`flex items-center ${getStatusColor(withdrawal.status)}`}>
                      {getStatusIcon(withdrawal.status)}
                      <span className="ml-2 capitalize">{withdrawal.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-300 max-w-xs">
                    {withdrawal.remarks && (
                      <div className="mb-1">
                        <span className="text-gray-400">User: </span>
                        {withdrawal.remarks}
                      </div>
                    )}
                    {withdrawal.adminNote && (
                      <div className="text-xs text-blue-300 mt-1">
                        <span className="text-gray-400">Admin: </span>
                        {withdrawal.adminNote}
                      </div>
                    )}
                    {!withdrawal.remarks && !withdrawal.adminNote && '-'}
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