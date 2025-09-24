"use client";

import { useState } from "react";
import AdminLayout from "../../../layouts/AdminLayout";
import AdminWithdrawalManagement from "../../../components/AdminWithdrawalManagement";
import AllWithdrawalsList from "../../../components/AllWithdrawalsList";

export default function AdminWithdrawalsPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Withdrawal Management</h1>

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 font-medium ${
              activeTab === "pending"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Pending Approval
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 font-medium ${
              activeTab === "all"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            All Withdrawals
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === "pending" && <AdminWithdrawalManagement />}
          {activeTab === "all" && <AllWithdrawalsList />}
        </div>
      </div>
    </AdminLayout>
  );
}
