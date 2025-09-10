/* eslint-disable @typescript-eslint/no-explicit-any */
// components/AdminPairManagement.tsx
"use client";

import { useState, useEffect } from "react";
import Button from "@/components/Button";
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { pairApiService, Pair } from "@/services/pairApi";

export default function AdminPairManagement() {
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPair, setSelectedPair] = useState<Pair | null>(null);
  const [formData, setFormData] = useState({
    pairName: "",
    svgImage: "",
    isActive: true,
    profitLoss: 0
  });

  useEffect(() => {
    loadPairs();
  }, []);

  const loadPairs = async () => {
    try {
      setIsLoading(true);
      const pairsData = await pairApiService.getAllPairs();
      setPairs(pairsData);
    } catch (error) {
      console.error("Failed to load pairs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await pairApiService.createPair(formData);
      setShowCreateModal(false);
      setFormData({ pairName: "", svgImage: "", isActive: true, profitLoss: 0 });
      await loadPairs();
    } catch (error: any) {
      console.error("Failed to create pair:", error);
      alert(error.message || "Failed to create pair");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPair) return;
    
    try {
      await pairApiService.updatePair(selectedPair._id, formData);
      setShowEditModal(false);
      setSelectedPair(null);
      await loadPairs();
    } catch (error: any) {
      console.error("Failed to update pair:", error);
      alert(error.message || "Failed to update pair");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pair?")) return;
    
    try {
      await pairApiService.deletePair(id);
      await loadPairs();
    } catch (error: any) {
      console.error("Failed to delete pair:", error);
      alert(error.message || "Failed to delete pair");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await pairApiService.togglePairStatus(id);
      await loadPairs();
    } catch (error: any) {
      console.error("Failed to toggle pair status:", error);
      alert(error.message || "Failed to toggle pair status");
    }
  };

  const openEditModal = (pair: Pair) => {
    setSelectedPair(pair);
    setFormData({
      pairName: pair.pairName,
      svgImage: pair.svgImage,
      isActive: pair.isActive,
      profitLoss: pair.profitLoss
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
        <h2 className="text-lg font-medium text-white">Trade Pairs Management</h2>
        <Button
          onClick={() => setShowCreateModal(true)}
          variant="primary"
          size="sm"
          icon={<FaPlus />}
        >
          Create Pair
        </Button>
      </div>

      {/* Pairs Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-4 py-3 text-left text-sm text-gray-400">Pair Name</th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">SVG Preview</th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">P/L</th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">Status</th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((pair) => (
              <tr key={pair._id} className="border-b border-gray-700 hover:bg-gray-700/50">
                <td className="px-4 py-3 text-white font-medium">
                  {pair.pairName}
                </td>
                <td className="px-4 py-3">
                  <div 
                    className="w-8 h-8"
                    dangerouslySetInnerHTML={{ __html: pair.svgImage }}
                  />
                </td>
                <td className="px-4 py-3">
                  <span className={`font-mono ${pair.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {pair.profitLoss >= 0 ? '+' : ''}{pair.profitLoss}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    pair.isActive 
                      ? 'bg-green-500/10 text-green-500 border border-green-500' 
                      : 'bg-gray-500/10 text-gray-500 border border-gray-500'
                  }`}>
                    {pair.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => openEditModal(pair)}
                      variant="secondary"
                      size="sm"
                      icon={<FaEdit />}
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleToggleStatus(pair._id)}
                      variant="secondary"
                      size="sm"
                      icon={pair.isActive ? <FaToggleOff /> : <FaToggleOn />}
                    >
                      {pair.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      onClick={() => handleDelete(pair._id)}
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
            <h3 className="text-lg font-medium text-white mb-4">Create New Pair</h3>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pair Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.pairName}
                    onChange={(e) => setFormData({ ...formData, pairName: e.target.value })}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., BTC/USD"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    SVG Image Code
                  </label>
                  <textarea
                    required
                    value={formData.svgImage}
                    onChange={(e) => setFormData({ ...formData, svgImage: e.target.value })}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Paste SVG code here..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Profit/Loss (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.profitLoss}
                    onChange={(e) => setFormData({ ...formData, profitLoss: parseFloat(e.target.value) })}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 2.5 or -1.2"
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
      {showEditModal && selectedPair && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-white mb-4">Edit Pair</h3>
            <form onSubmit={handleUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pair Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.pairName}
                    onChange={(e) => setFormData({ ...formData, pairName: e.target.value })}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    SVG Image Code
                  </label>
                  <textarea
                    required
                    value={formData.svgImage}
                    onChange={(e) => setFormData({ ...formData, svgImage: e.target.value })}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Profit/Loss (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.profitLoss}
                    onChange={(e) => setFormData({ ...formData, profitLoss: parseFloat(e.target.value) })}
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