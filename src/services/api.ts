// services/api.ts
// const API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  balance: number;
  isAdmin?: boolean;
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

class ApiService {
  private isAdminEndpoint(endpoint: string): boolean {
    // Use regex to properly match admin endpoints
    const adminPatterns = [
      /^\/deposits\/pending$/, // /deposits/pending
      /^\/deposits\/[a-f0-9]{24}\/approve$/, // /deposits/:id/approve (MongoDB ObjectId)
      /^\/deposits\/[a-f0-9]{24}\/reject$/, // /deposits/:id/reject (MongoDB ObjectId)
      /^\/deposits\?/, // /deposits?status=...
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

  async getProfile(): Promise<User> {
    return this.request<User>('/auth/profile');
  }

  async getBalance(): Promise<{ balance: number }> {
    return this.request<{ balance: number }>('/balance');
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