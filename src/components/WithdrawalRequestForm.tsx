/* eslint-disable @typescript-eslint/no-explicit-any */
// components/WithdrawalRequestForm.tsx
'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import { FaDollarSign, FaExchangeAlt, FaInfoCircle } from 'react-icons/fa';
import { apiService } from '@/services/api'; // Updated import

export default function WithdrawalRequestForm() {
  const [formData, setFormData] = useState({
    amount: '',
    binanceId: '',
    remarks: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const withdrawalData = {
        amount: parseFloat(formData.amount),
        method: 'Binance',
        binanceId: formData.binanceId,
        remarks: formData.remarks
      };

      // Use the apiService instead of the separate function
      const response = await apiService.createWithdrawal(withdrawalData);

      setMessage({
        type: 'success',
        text: `${response.message} Current balance: $${response.currentBalance}`
      });
      setFormData({ amount: '', binanceId: '', remarks: '' });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to submit withdrawal request'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-white mb-6">
        Request Withdrawal
      </h2>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500 text-green-500'
              : 'bg-red-500/10 border border-red-500 text-red-500'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
            Amount (USD)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaDollarSign className="h-5 w-5 text-gray-500" />
            </div>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="10"
              value={formData.amount}
              onChange={handleChange}
              required
              className="block w-full pl-10 pr-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              placeholder="Enter amount (min $10)"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Minimum withdrawal: $10</p>
        </div>

        {/* Binance ID */}
        <div>
          <label htmlFor="binanceId" className="block text-sm font-medium text-gray-300 mb-2">
            Binance ID
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaExchangeAlt className="h-5 w-5 text-gray-500" />
            </div>
            <input
              id="binanceId"
              name="binanceId"
              type="text"
              value={formData.binanceId}
              onChange={handleChange}
              required
              className="block w-full pl-10 pr-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              placeholder="Your Binance account ID"
            />
          </div>
        </div>

        {/* Remarks */}
        <div>
          <label htmlFor="remarks" className="block text-sm font-medium text-gray-300 mb-2">
            Remarks (Optional)
          </label>
          <div className="relative">
            <div className="absolute top-2 left-0 pl-3 flex items-start pointer-events-none">
              <FaInfoCircle className="h-5 w-5 text-gray-500 mt-1" />
            </div>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows={3}
              className="block w-full pl-10 pr-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              placeholder="Any additional information..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          isLoading={loading}
          className="w-full"
        >
          Submit Withdrawal Request
        </Button>
      </form>
    </div>
  );
}