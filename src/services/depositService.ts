// services/depositService.ts
import { apiRequest } from './apiService';

export interface Deposit {
  _id: string;
  userId: string;
  amount: number;
  transactionId: string;
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

export interface CreateDepositRequest {
  amount: number;
  transactionId: string;
}

export interface UpdateDepositRequest {
  adminNote?: string;
}

// Create a new deposit request (User)
export const createDeposit = async (depositData: CreateDepositRequest): Promise<Deposit> => {
  return apiRequest('/api/deposits', {
    method: 'POST',
    body: JSON.stringify(depositData),
  });
};

// Get user's deposit history (User)
export const getUserDeposits = async (): Promise<Deposit[]> => {
  return apiRequest('/api/deposits/my-deposits');
};

// Get all pending deposits (Admin)
export const getPendingDeposits = async (): Promise<Deposit[]> => {
  return apiRequest('/api/deposits/pending');
};

// Get all deposits with filters (Admin)
export const getAllDeposits = async (filters?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ deposits: Deposit[]; totalPages: number; currentPage: number; total: number }> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  
  return apiRequest(`/api/deposits?${params.toString()}`);
};

// Approve a deposit (Admin)
export const approveDeposit = async (depositId: string, adminNote?: string): Promise<Deposit> => {
  return apiRequest(`/api/deposits/${depositId}/approve`, {
    method: 'PATCH',
    body: JSON.stringify({ adminNote }),
  });
};

// Reject a deposit (Admin)
export const rejectDeposit = async (depositId: string, adminNote?: string): Promise<Deposit> => {
  return apiRequest(`/api/deposits/${depositId}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ adminNote }),
  });
};