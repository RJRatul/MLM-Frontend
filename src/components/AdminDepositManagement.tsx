/* eslint-disable @typescript-eslint/no-explicit-any */
// components/AdminDepositManagement.tsx
"use client";

import { useState, useEffect } from "react";
import Button from "@/components/Button";
import { FaCheck, FaTimes, FaEye, FaSync } from "react-icons/fa";
import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminDepositManagement() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDeposit, setSelectedDeposit] = useState<any>(null);
  const [adminNote, setAdminNote] = useState("");
  
  // Get both refreshUser AND updateUserBalance from AuthContext
//   const { refreshUser, updateUserBalance } = useAuth();
  
  useEffect(() => {
    loadPendingDeposits();
  }, []);

  const loadPendingDeposits = async () => {
    try {
      const pendingDeposits = await apiService.getPendingDeposits();
      setDeposits(pendingDeposits);
    } catch (error) {
      console.error("Failed to load pending deposits:", error);
    } finally {
      setIsLoading(false);
    }
  };

const handleApprove = async (depositId: string) => {
  try {
    await apiService.approveDeposit(depositId, adminNote);
    
    // No need to update balance manually anymore
    // The next time user views their balance, it will be fetched fresh
    
    setAdminNote('');
    setSelectedDeposit(null);
    await loadPendingDeposits();
  } catch (error) {
    console.error('Failed to approve deposit:', error);
  }
};

  const handleReject = async (depositId: string) => {
    try {
      await apiService.rejectDeposit(depositId, adminNote);
      setAdminNote("");
      setSelectedDeposit(null);
      await loadPendingDeposits();
    } catch (error) {
      console.error("Failed to reject deposit:", error);
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-white">
          Pending Deposit Requests
        </h2>
        <Button
          onClick={loadPendingDeposits}
          variant="secondary"
          size="sm"
          icon={<FaSync />}
        >
          Refresh
        </Button>
      </div>

      {deposits.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <FaEye className="mx-auto h-12 w-12 mb-4" />
          <p>No pending deposit requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deposits.map((deposit) => (
            <div key={deposit._id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-white font-medium">
                    {deposit.user?.firstName} {deposit.user?.lastName}
                  </h3>
                  <p className="text-gray-400 text-sm">{deposit.user?.email}</p>
                  <div className="mt-2">
                    <p className="text-white">
                      Amount:{" "}
                      <span className="text-green-400">
                        ${deposit.amount.toFixed(2)}
                      </span>
                    </p>
                    <p className="text-gray-400 text-sm">
                      Transaction ID: {deposit.transactionId}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Requested: {new Date(deposit.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setSelectedDeposit(deposit)}
                    variant="primary"
                    size="sm"
                    icon={<FaEye />}
                  >
                    Review
                  </Button>
                </div>
              </div>

              {selectedDeposit?._id === deposit._id && (
                <div className="mt-4 p-4 bg-gray-600 rounded-lg">
                  <h4 className="text-white font-medium mb-3">
                    Review Deposit
                  </h4>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Add admin note (optional)"
                    className="w-full p-3 bg-gray-500 border border-gray-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  <div className="flex space-x-3 mt-3">
                    <Button
                      onClick={() => handleApprove(deposit._id)}
                      variant="primary"
                      size="sm"
                      icon={<FaCheck />}
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(deposit._id)}
                      variant="secondary"
                      size="sm"
                      icon={<FaTimes />}
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedDeposit(null);
                        setAdminNote("");
                      }}
                      variant="secondary"
                      size="sm"
                    >
                      Cancel
                    </Button>
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
