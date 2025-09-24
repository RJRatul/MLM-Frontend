"use client";

import { useState, useEffect } from "react";
import Button from "@/components/Button";
import { FaCheck, FaTimes, FaEye, FaSync } from "react-icons/fa";
import { apiService, Withdrawal } from "@/services/api";

export default function AdminWithdrawalManagement() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [adminNote, setAdminNote] = useState("");

  useEffect(() => {
    loadPendingWithdrawals();
  }, []);

  const loadPendingWithdrawals = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getPendingWithdrawals();
      setWithdrawals(data);
    } catch (error) {
      console.error("Failed to load pending withdrawals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await apiService.approveWithdrawal(id, adminNote);
      setSelectedWithdrawal(null);
      setAdminNote("");
      await loadPendingWithdrawals();
    } catch (error) {
      console.error("Failed to approve withdrawal:", error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await apiService.rejectWithdrawal(id, adminNote);
      setSelectedWithdrawal(null);
      setAdminNote("");
      await loadPendingWithdrawals();
    } catch (error) {
      console.error("Failed to reject withdrawal:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-white">Pending Withdrawal Requests</h2>
        <Button onClick={loadPendingWithdrawals} variant="secondary" size="sm" icon={<FaSync />}>
          Refresh
        </Button>
      </div>

      {withdrawals.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <FaEye className="mx-auto h-12 w-12 mb-4" />
          <p>No pending withdrawal requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {withdrawals.map((w) => (
            <div key={w._id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-white font-medium">
                    {w.userId?.firstName} {w.userId?.lastName}
                  </h3>
                  <p className="text-gray-400 text-sm">{w.userId?.email}</p>
                  <p className="text-white mt-2">Amount: <span className="text-green-400">${w.amount.toFixed(2)}</span></p>
                  <p className="text-gray-400 text-sm">Method: {w.method} </p>
                  <p className="text-gray-400 text-sm"> {w.method} ID: {w.accountDetails.binanceId}</p>
                  <p className="text-gray-400 text-sm">Requested: {new Date(w.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => setSelectedWithdrawal(w)} variant="primary" size="sm" icon={<FaEye />}>
                    Review
                  </Button>
                </div>
              </div>

              {selectedWithdrawal?._id === w._id && (
                <div className="mt-4 p-4 bg-gray-600 rounded-lg">
                  <h4 className="text-white font-medium mb-3">Review Withdrawal</h4>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Add admin note (optional)"
                    className="w-full p-3 bg-gray-500 border border-gray-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  <div className="flex space-x-3 mt-3">
                    <Button onClick={() => handleApprove(w._id)} variant="primary" size="sm" icon={<FaCheck />}>Approve</Button>
                    <Button onClick={() => handleReject(w._id)} variant="secondary" size="sm" icon={<FaTimes />}>Reject</Button>
                    <Button onClick={() => { setSelectedWithdrawal(null); setAdminNote(""); }} variant="secondary" size="sm">Cancel</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
