/* eslint-disable @typescript-eslint/no-explicit-any */
// services/api.ts
// const API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// services/api.ts - Update User interface
export interface User {
  id: string;
  userId: string
  email: string;
  firstName: string;
  lastName: string;
  balance: number;
  aiStatus?: boolean;
  isAdmin?: boolean;
  referralCode?: string;
  referralCount?: number;
  referralEarnings?: number;
  level?: number;
  tier?: number;
  commissionUnlocked?: boolean;
  commissionRate?: number;

  // Add these new fields
  algoProfitAmount?: number;
  algoProfitPercentage?: number;
  lastProfitCalculation?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  referralCode?: string;
}

export interface Deposit {
  _id: string;
  amount: number;
  transactionId: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
  userId?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  admin?: {
    firstName: string;
    lastName: string;
  };
}

export interface CreateDepositRequest {
  amount: number;
  transactionId: string;
}

export interface DepositResponse {
  message: string;
  deposit: Deposit;
  updatedBalance?: number;
}

export interface DepositsListResponse {
  deposits: Deposit[];
  totalPages?: number;
  currentPage?: number;
  total?: number;
}

// Withdrawal Interfaces
export interface Withdrawal {
  _id: string;
  // userId: string;
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
  userId?: {
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

export interface WithdrawalResponse {
  message: string;
  withdrawal: Withdrawal;
  currentBalance?: number;
}

export interface WithdrawalsListResponse {
  withdrawals: Withdrawal[];
  totalPages?: number;
  currentPage?: number;
  total?: number;
}

class ApiService {
  private isAdminEndpoint(endpoint: string): boolean {
    // Use regex to properly match admin endpoints
    const adminPatterns = [
      /^\/deposits\/pending$/, // /deposits/pending
      /^\/deposits\/[a-f0-9]{24}\/approve$/, // /deposits/:id/approve (MongoDB ObjectId)
      /^\/deposits\/[a-f0-9]{24}\/reject$/, // /deposits/:id/reject (MongoDB ObjectId)
      /^\/deposits\?/, // /deposits?status=...
      /^\/withdrawals\/pending$/, // /withdrawals/pending
      /^\/withdrawals\/[a-f0-9]{24}\/approve$/, // /withdrawals/:id/approve
      /^\/withdrawals\/[a-f0-9]{24}\/reject$/, // /withdrawals/:id/reject
      /^\/withdrawals\?/, // /withdrawals?status=...
      /^\/users/, // any user management endpoints
      /^\/admin\// // any admin-specific endpoints
    ];

    return adminPatterns.some(pattern => pattern.test(endpoint));
  }

  private getTokenForEndpoint(endpoint: string): string | null {
    if (this.isAdminEndpoint(endpoint)) {
      // For admin endpoints, use admin token
      const adminToken = localStorage.getItem('adminAuthToken');
      console.log('Admin endpoint detected, using admin token:', endpoint);
      return adminToken;
    } else {
      // For user endpoints, use regular auth token
      const userToken = localStorage.getItem('authToken');
      console.log('User endpoint detected, using user token:', endpoint);
      return userToken;
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getTokenForEndpoint(endpoint);
    const url = `${API_BASE_URL}${endpoint}`;

    console.log('API Request:', {
      endpoint,
      hasToken: !!token,
      method: options.method || 'GET'
    });

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        headers,
        ...options,
      });

      if (!response.ok) {
        let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // If response is not JSON, use the status text
          console.log('Response is not JSON, using status text');
        }

        console.error('API Error:', {
          status: response.status,
          endpoint,
          error: errorMessage
        });

        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      console.error('API Request failed:', error);

      // Re-throw the error with a more descriptive message if it's not already an Error object
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Network request failed');
      }
    }
  }

  async login(loginData: LoginData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
  }

  async register(registerData: RegisterData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(registerData),
    });
  }

  // Deposit methods - User endpoints
  async createDeposit(depositData: CreateDepositRequest): Promise<DepositResponse> {
    return this.request<DepositResponse>('/deposits', {
      method: 'POST',
      body: JSON.stringify(depositData),
    });
  }

  async getUserDeposits(): Promise<Deposit[]> {
    return this.request<Deposit[]>('/deposits/my-deposits');
  }

  // Deposit methods - Admin endpoints (will use admin token)
  async getPendingDeposits(): Promise<Deposit[]> {
    return this.request<Deposit[]>('/deposits/pending');
  }

  async getAllDeposits(filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<DepositsListResponse> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return this.request<DepositsListResponse>(`/deposits?${params.toString()}`);
  }

  async approveDeposit(depositId: string, adminNote?: string): Promise<DepositResponse> {
    return this.request<DepositResponse>(`/deposits/${depositId}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ adminNote }),
    });
  }

  async rejectDeposit(depositId: string, adminNote?: string): Promise<DepositResponse> {
    return this.request<DepositResponse>(`/deposits/${depositId}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ adminNote }),
    });
  }

  // Withdrawal methods - User endpoints
  async createWithdrawal(withdrawalData: CreateWithdrawalRequest): Promise<WithdrawalResponse> {
    return this.request<WithdrawalResponse>('/withdrawals', {
      method: 'POST',
      body: JSON.stringify(withdrawalData),
    });
  }

  async getUserWithdrawals(): Promise<Withdrawal[]> {
    return this.request<Withdrawal[]>('/withdrawals/my-withdrawals');
  }

  // Withdrawal methods - Admin endpoints (will use admin token)
  async getPendingWithdrawals(): Promise<Withdrawal[]> {
    return this.request<Withdrawal[]>('/withdrawals/pending');
  }

  async getAllWithdrawals(filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<WithdrawalsListResponse> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return this.request<WithdrawalsListResponse>(`/withdrawals?${params.toString()}`);
  }

  async approveWithdrawal(withdrawalId: string, adminNote?: string): Promise<WithdrawalResponse> {
    return this.request<WithdrawalResponse>(`/withdrawals/${withdrawalId}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ adminNote }),
    });
  }

  async rejectWithdrawal(withdrawalId: string, adminNote?: string): Promise<WithdrawalResponse> {
    return this.request<WithdrawalResponse>(`/withdrawals/${withdrawalId}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ adminNote }),
    });
  }

  async toggleAiStatus(): Promise<{
    message: string;
    aiStatus: boolean;
  }> {
    return this.request<{ message: string; aiStatus: boolean }>('/user/toggle-ai', {
      method: 'PATCH',
    });
  }

  async getProfile(): Promise<User> {
    try {
      return await this.request<User>('/user/profile'); // Updated endpoint
    } catch (error: any) {
      if (error.message.includes('404')) {
        throw new Error('User profile not found. Please check the endpoint or authentication.');
      }
      throw error;
    }
  }

  async getBalance(): Promise<{ balance: number }> {
    return this.request<{ balance: number }>('/balance');
  }
  // Add this to services/api.ts in the ApiService class
  async getProfitStats(): Promise<{
    success: boolean;
    data: {
      userId: string;
      email: string;
      currentBalance: number;
      algoProfitAmount: number;
      algoProfitPercentage: number;
      lastProfitCalculation: string;
      aiStatus: boolean;
      profitType: string;
      absoluteProfit: number;
      isProfit: boolean;
      isLoss: boolean;
    };
  }> {
    return this.request<{
      success: boolean;
      data: {
        userId: string;
        email: string;
        currentBalance: number;
        algoProfitAmount: number;
        algoProfitPercentage: number;
        lastProfitCalculation: string;
        aiStatus: boolean;
        profitType: string;
        absoluteProfit: number;
        isProfit: boolean;
        isLoss: boolean;
      };
    }>('/user/profit-stats');
  }

  // Helper method to check if current user is admin
  isAdmin(): boolean {
    // Check if we have an admin token
    const adminToken = localStorage.getItem('adminAuthToken');
    if (adminToken) return true;

    // Check if regular user is admin
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user: User = JSON.parse(userStr);
        return user.isAdmin || false;
      } catch (e) {
        return false;
      }
    }

    return false;
  }

  // Clear both tokens (useful for logout)
  clearTokens(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminAuthToken');
    localStorage.removeItem('user');
  }

  // Check if admin token exists and is valid
  hasAdminAccess(): boolean {
    const adminToken = localStorage.getItem('adminAuthToken');
    return !!adminToken;
  }
}

export const apiService = new ApiService();