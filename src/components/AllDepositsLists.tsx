// components/AllDepositsList.tsx
"use client";

import { useState, useEffect } from "react";
import Button from "@/components/Button";
import { FaEye, FaSync } from "react-icons/fa";
import { apiService, Deposit } from "@/services/api";

export default function AllDepositsList() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);

  useEffect(() => {
    loadAllDeposits();
  }, []);

  const loadAllDeposits = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getAllDeposits({ limit: 100 });
      setDeposits(data.deposits);
    } catch (error) {
      console.error("Failed to load deposits:", error);
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
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${
          statusClasses[status as keyof typeof statusClasses]
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-white">All Deposits</h2>
        <Button
          onClick={loadAllDeposits}
          variant="secondary"
          size="sm"
          icon={<FaSync />}
        >
          Refresh
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-4 py-3 text-left text-sm text-gray-400">User</th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">
                Transaction ID
              </th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">Date</th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {deposits.map((deposit) => (
              <tr
                key={deposit._id}
                className="border-b border-gray-700 hover:bg-gray-700/50"
              >
                <td className="px-4 py-3">
                  <div>
                    <div className="text-white font-medium">
                      {deposit.userId?.firstName} {deposit.userId?.lastName}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {deposit.userId?.email}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-white font-mono">
                  ${deposit.amount.toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <code className="text-gray-300 text-sm bg-gray-700 px-2 py-1 rounded">
                    {deposit.transactionId}
                  </code>
                </td>
                <td className="px-4 py-3">{getStatusBadge(deposit.status)}</td>
                <td className="px-4 py-3 text-gray-400 text-sm">
                  {formatDate(deposit.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <Button
                    onClick={() => setSelectedDeposit(deposit)}
                    variant="secondary"
                    size="sm"
                    icon={<FaEye />}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Deposit Detail Modal */}
      {selectedDeposit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-medium text-white mb-4">
              Deposit Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-gray-400 text-sm">User</label>
                <p className="text-white">
                  {selectedDeposit.userId?.firstName}{" "}
                  {selectedDeposit.userId?.lastName}
                </p>
                <p className="text-gray-400 text-sm">
                  {selectedDeposit.userId?.email}
                </p>
              </div>

              <div>
                <label className="text-gray-400 text-sm">Amount</label>
                <p className="text-white font-mono">
                  ${selectedDeposit.amount.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="text-gray-400 text-sm">Transaction ID</label>
                <p className="text-white font-mono text-sm">
                  {selectedDeposit.transactionId}
                </p>
              </div>

              <div>
                <label className="text-gray-400 text-sm">Status</label>
                <div className="mt-1">
                  {getStatusBadge(selectedDeposit.status)}
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm">Created</label>
                <p className="text-white text-sm">
                  {formatDate(selectedDeposit.createdAt)}
                </p>
              </div>

              {selectedDeposit.admin && (
                <div>
                  <label className="text-gray-400 text-sm">Processed By</label>
                  <p className="text-white text-sm">
                    {selectedDeposit.admin.firstName}{" "}
                    {selectedDeposit.admin.lastName}
                  </p>
                </div>
              )}
            </div>

            {selectedDeposit.adminNote && (
              <div className="mb-4">
                <label className="text-gray-400 text-sm">Admin Note</label>
                <p className="text-white bg-gray-700 p-3 rounded-lg mt-1">
                  {selectedDeposit.adminNote}
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={() => setSelectedDeposit(null)} variant="secondary">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
