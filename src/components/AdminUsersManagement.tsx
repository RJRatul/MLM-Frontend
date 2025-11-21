/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Button from "@/components/Button";
import { FaSearch, FaEdit, FaUserCheck, FaUserSlash } from "react-icons/fa";
import { adminUsersApiService, User, UpdateUserRequest } from "@/services/adminUsersApi";

export default function AdminUsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await adminUsersApiService.getUsers(currentPage, 10, searchTerm);
      setUsers(response.users);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      console.error("Failed to load users:", error);
      alert(error.message || "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: 'active' | 'inactive') => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await adminUsersApiService.updateUserStatus(userId, newStatus);
      await loadUsers(); // Reload users to reflect changes
    } catch (error: any) {
      console.error("Failed to update user status:", error);
      alert(error.message || "Failed to update user status");
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setIsUpdating(true);
      
      const updateData: UpdateUserRequest = {
        firstName: selectedUser.firstName,
        lastName: selectedUser.lastName,
        balance: selectedUser.balance
      };

      await adminUsersApiService.updateUser(selectedUser._id, updateData);
      
      alert('User updated successfully!');
      setShowEditModal(false);
      await loadUsers(); // Reload users to reflect changes
    } catch (error: any) {
      console.error("Failed to update user:", error);
      alert(error.message || "Failed to update user");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    loadUsers();
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
        <h2 className="text-lg font-medium text-white">Users Management</h2>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <Button type="submit" variant="secondary" className="ml-2">
            Search
          </Button>
        </form>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-4 py-3 text-left text-sm text-gray-400">User ID</th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">Name</th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">Email</th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">Balance</th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">ALGO Status</th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">Admin</th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">Status</th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b border-gray-700 hover:bg-gray-700/50">
                <td className="px-4 py-3 text-white">
                  {user.userId}
                </td>
                <td className="px-4 py-3 text-white">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-4 py-3 text-white">{user.email}</td>
                <td className="px-4 py-3 text-white font-mono">${user.balance.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.aiStatus 
                      ? 'bg-green-500/10 text-green-500 border border-green-500' 
                      : 'bg-gray-500/10 text-gray-500 border border-gray-500'
                  }`}>
                    {user.aiStatus ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.isAdmin 
                      ? 'bg-blue-500/10 text-blue-500 border border-blue-500' 
                      : 'bg-gray-500/10 text-gray-500 border border-gray-500'
                  }`}>
                    {user.isAdmin ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === 'active'
                      ? 'bg-green-500/10 text-green-500 border border-green-500' 
                      : 'bg-red-500/10 text-red-500 border border-red-500'
                  }`}>
                    {user.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => openEditModal(user)}
                      variant="secondary"
                      size="sm"
                      icon={<FaEdit />}
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleStatusToggle(user._id, user.status)}
                      variant={user.status === 'active' ? 'danger' : 'primary'}
                      size="sm"
                      icon={user.status === 'active' ? <FaUserSlash /> : <FaUserCheck />}
                    >
                      {user.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-2">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            variant="secondary"
            size="sm"
          >
            Previous
          </Button>
          
          <span className="text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            variant="secondary"
            size="sm"
          >
            Next
          </Button>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-white mb-4">Edit User</h3>
            <form onSubmit={handleUpdateUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedUser.firstName}
                    onChange={(e) => setSelectedUser({
                      ...selectedUser,
                      firstName: e.target.value
                    })}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedUser.lastName}
                    onChange={(e) => setSelectedUser({
                      ...selectedUser,
                      lastName: e.target.value
                    })}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Balance
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={selectedUser.balance}
                    onChange={(e) => setSelectedUser({
                      ...selectedUser,
                      balance: parseFloat(e.target.value) || 0
                    })}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  onClick={() => setShowEditModal(false)}
                  variant="secondary"
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Updating...' : 'Update'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}