/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Button from "@/components/Button";
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { profitRuleApiService, ProfitRule } from "../services/profitRuleApi";

export default function AdminProfitLossManagement() {
  const [rules, setRules] = useState<ProfitRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState<ProfitRule | null>(null);
  const [formData, setFormData] = useState({
    minBalance: 0,
    maxBalance: 0,
    profit: 0,
    isActive: true
  });

  useEffect(() => {
    loadProfitRules();
  }, []);

  const loadProfitRules = async () => {
    try {
      setIsLoading(true);
      const rulesData = await profitRuleApiService.getAllProfitRules();
      setRules(rulesData);
    } catch (error) {
      console.error("Failed to load profit rules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await profitRuleApiService.createProfitRule(formData);
      setShowCreateModal(false);
      setFormData({ minBalance: 0, maxBalance: 0, profit: 0, isActive: true });
      await loadProfitRules();
    } catch (error: any) {
      console.error("Failed to create profit rule:", error);
      alert(error.message || "Failed to create profit rule");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRule) return;
    
    try {
      await profitRuleApiService.updateProfitRule(selectedRule._id, formData);
      setShowEditModal(false);
      setSelectedRule(null);
      await loadProfitRules();
    } catch (error: any) {
      console.error("Failed to update profit rule:", error);
      alert(error.message || "Failed to update profit rule");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this profit rule?")) return;
    
    try {
      await profitRuleApiService.deleteProfitRule(id);
      await loadProfitRules();
    } catch (error: any) {
      console.error("Failed to delete profit rule:", error);
      alert(error.message || "Failed to delete profit rule");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await profitRuleApiService.toggleProfitRuleStatus(id);
      await loadProfitRules();
    } catch (error: any) {
      console.error("Failed to toggle profit rule status:", error);
      alert(error.message || "Failed to toggle profit rule status");
    }
  };

  const openEditModal = (rule: ProfitRule) => {
    setSelectedRule(rule);
    setFormData({
      minBalance: rule.minBalance,
      maxBalance: rule.maxBalance,
      profit: rule.profit,
      isActive: rule.isActive
    });
    setShowEditModal(true);
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
        <Button
          onClick={() => setShowCreateModal(true)}
          variant="primary"
          size="sm"
          icon={<FaPlus />}
        >
          Create Rule
        </Button>
      </div>

      {/* Rules Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-4 py-3 text-left text-sm text-gray-400">Min Balance</th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">Max Balance</th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">Profit/Loss Amount</th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">Status</th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule._id} className="border-b border-gray-700 hover:bg-gray-700/50">
                <td className="px-4 py-3 text-white font-mono">
                  ${rule.minBalance}
                </td>
                <td className="px-4 py-3 text-white font-mono">
                  ${rule.maxBalance}
                </td>
                <td className="px-4 py-3">
                  <span className={`font-mono ${rule.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {rule.profit >= 0 ? '+' : ''}${rule.profit}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    rule.isActive 
                      ? 'bg-green-500/10 text-green-500 border border-green-500' 
                      : 'bg-gray-500/10 text-gray-500 border border-gray-500'
                  }`}>
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => openEditModal(rule)}
                      variant="secondary"
                      size="sm"
                      icon={<FaEdit />}
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleToggleStatus(rule._id)}
                      variant="secondary"
                      size="sm"
                      icon={rule.isActive ? <FaToggleOff /> : <FaToggleOn />}
                    >
                      {rule.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      onClick={() => handleDelete(rule._id)}
                      variant="danger"
                      size="sm"
                      icon={<FaTrash />}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-white mb-4">Create New Profit/Loss Rule</h3>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Minimum Balance ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.minBalance}
                    onChange={(e) => setFormData({ ...formData, minBalance: parseFloat(e.target.value) })}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Maximum Balance ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.maxBalance}
                    onChange={(e) => setFormData({ ...formData, maxBalance: parseFloat(e.target.value) })}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Profit/Loss Amount ($)
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.profit}
                    onChange={(e) => setFormData({ ...formData, profit: parseFloat(e.target.value) })}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Can be positive or negative"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-300">Active</label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  onClick={() => setShowCreateModal(false)}
                  variant="secondary"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-white mb-4">Edit Profit/Loss Rule</h3>
            <form onSubmit={handleUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Minimum Balance ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.minBalance}
                    onChange={(e) => setFormData({ ...formData, minBalance: parseFloat(e.target.value) })}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Maximum Balance ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.maxBalance}
                    onChange={(e) => setFormData({ ...formData, maxBalance: parseFloat(e.target.value) })}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Profit/Loss Amount ($)
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.profit}
                    onChange={(e) => setFormData({ ...formData, profit: parseFloat(e.target.value) })}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-300">Active</label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  onClick={() => setShowEditModal(false)}
                  variant="secondary"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Update
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}