// services/withdrawalService.ts
import { apiRequest } from './apiService';

export interface Withdrawal {
  _id: string;
  userId: string;
  amount: number;
  method: string;
  accountDetails: {
    binanceId: string;
  };
  remarks?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminId?: string;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateWithdrawalRequest {
  amount: number;
  method: string;
  binanceId: string;
  remarks?: string;
}

export interface UpdateWithdrawalRequest {
  adminNote?: string;
}

// Create a new withdrawal request (User)
export const createWithdrawal = async (withdrawalData: CreateWithdrawalRequest): Promise<{
  message: string;
  withdrawal: Withdrawal;
  currentBalance: number;
}> => {
  return apiRequest('/api/withdrawal', {
    method: 'POST',
    body: JSON.stringify(withdrawalData),
  });
};

// Get user's withdrawal history (User)
export const getUserWithdrawals = async (): Promise<Withdrawal[]> => {
  return apiRequest('/api/withdrawal/my-withdrawals');
};

// Get all pending withdrawals (Admin)
export const getPendingWithdrawals = async (): Promise<Withdrawal[]> => {
  return apiRequest('/api/withdrawal/pending');
};

// Get all withdrawals with filters (Admin)
export const getAllWithdrawals = async (filters?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ 
  withdrawals: Withdrawal[]; 
  totalPages: number; 
  currentPage: number; 
  total: number 
}> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  
  return apiRequest(`/api/withdrawal?${params.toString()}`);
};

// Approve a withdrawal (Admin)
export const approveWithdrawal = async (withdrawalId: string, adminNote?: string): Promise<{
  message: string;
  withdrawal: Withdrawal;
}> => {
  return apiRequest(`/api/withdrawal/${withdrawalId}/approve`, {
    method: 'PATCH',
    body: JSON.stringify({ adminNote }),
  });
};

// Reject a withdrawal (Admin)
export const rejectWithdrawal = async (withdrawalId: string, adminNote?: string): Promise<{
  message: string;
  withdrawal: Withdrawal;
  returnedBalance?: number;
}> => {
  return apiRequest(`/api/withdrawal/${withdrawalId}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ adminNote }),
  });
};