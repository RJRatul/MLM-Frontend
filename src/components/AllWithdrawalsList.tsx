"use client";

import { useState, useEffect } from "react";
import Button from "@/components/Button";
import { FaEye, FaSync } from "react-icons/fa";
import { apiService, Withdrawal } from "@/services/api";

export default function AllWithdrawalsList() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);

  useEffect(() => {
    loadAllWithdrawals();
  }, []);

  const loadAllWithdrawals = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getAllWithdrawals({ limit: 100 });
      setWithdrawals(data.withdrawals);
    } catch (error) {
      console.error("Failed to load withdrawals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500",
      approved: "bg-green-500/10 text-green-500 border-green-500",
      rejected: "bg-red-500/10 text-red-500 border-red-500",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusClasses[status as keyof typeof statusClasses]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  if (isLoading) return <div className="bg-gray-800 rounded-lg shadow p-6 animate-pulse">Loading...</div>;

  return (
    <div className="bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-white">All Withdrawals</h2>
        <Button onClick={loadAllWithdrawals} variant="secondary" size="sm" icon={<FaSync />}>Refresh</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-4 py-3 text-left text-sm text-gray-400">User</th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">Amount</th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">Method</th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">Status</th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">Date</th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((w) => (
              <tr key={w._id} className="border-b border-gray-700 hover:bg-gray-700/50">
                <td className="px-4 py-3">
                  <div>
                    <div className="text-white font-medium">{w.userId?.firstName} {w.userId?.lastName}</div>
                    <div className="text-gray-400 text-sm">{w.userId?.email}</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-white font-mono">${w.amount.toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-400">{w.method}</td>
                <td className="px-4 py-3">{getStatusBadge(w.status)}</td>
                <td className="px-4 py-3 text-gray-400 text-sm">{formatDate(w.createdAt)}</td>
                <td className="px-4 py-3">
                  <Button onClick={() => setSelectedWithdrawal(w)} variant="secondary" size="sm" icon={<FaEye />}>View</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-medium text-white mb-4">Withdrawal Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-gray-400 text-sm">User</label>
                <p className="text-white">{selectedWithdrawal.userId?.firstName} {selectedWithdrawal.userId?.lastName}</p>
                <p className="text-gray-400 text-sm">{selectedWithdrawal.userId?.email}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Amount</label>
                <p className="text-white font-mono">${selectedWithdrawal.amount.toFixed(2)}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Method</label>
                <p className="text-white">{selectedWithdrawal.method}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Status</label>
                <div className="mt-1">{getStatusBadge(selectedWithdrawal.status)}</div>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Created</label>
                <p className="text-white text-sm">{formatDate(selectedWithdrawal.createdAt)}</p>
              </div>
              {selectedWithdrawal.adminId && (
                <div>
                  <label className="text-gray-400 text-sm">Processed By</label>
                  <p className="text-white text-sm">{selectedWithdrawal.adminId}</p>
                </div>
              )}
            </div>

            {selectedWithdrawal.adminNote && (
              <div className="mb-4">
                <label className="text-gray-400 text-sm">Admin Note</label>
                <p className="text-white bg-gray-700 p-3 rounded-lg mt-1">{selectedWithdrawal.adminNote}</p>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={() => setSelectedWithdrawal(null)} variant="secondary">Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
