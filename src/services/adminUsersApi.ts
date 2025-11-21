// services/adminUsersApi.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface User {
  _id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  balance: number;
  isAdmin: boolean;
  aiStatus: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  users: User[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export interface UpdateUserStatusRequest {
  status: 'active' | 'inactive';
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  balance: number;
}

class AdminUsersApiService {
  private isAdminEndpoint(endpoint: string): boolean {
    const adminEndpoints = [
      '/admin/users',
      '/admin/users/',
    ];
    
    return adminEndpoints.some(adminEndpoint => endpoint.includes(adminEndpoint));
  }

  private getTokenForEndpoint(endpoint: string): string | null {
    if (this.isAdminEndpoint(endpoint)) {
      // For admin endpoints, use admin token
      return localStorage.getItem('adminAuthToken');
    } else {
      // For user endpoints, use regular auth token
      return localStorage.getItem('authToken');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getTokenForEndpoint(endpoint);
    const url = `${API_BASE_URL}${endpoint}`;

    console.log('DEBUG - Admin Users API Request:', {
      endpoint,
      token: token ? 'Present' : 'Missing',
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
        const errorData = await response.json().catch(() => ({ message: 'Something went wrong' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Get all users with pagination and search
  async getUsers(page: number = 1, limit: number = 10, search: string = ''): Promise<UsersResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);

    return this.request<UsersResponse>(`/admin/users?${params.toString()}`, {
      method: 'GET',
    });
  }

  // Get single user by ID
  async getUserById(id: string): Promise<User> {
    return this.request<User>(`/admin/users/${id}`, {
      method: 'GET',
    });
  }

  // Update user status
  async updateUserStatus(id: string, status: 'active' | 'inactive'): Promise<{ message: string; user: User }> {
    return this.request<{ message: string; user: User }>(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Update user profile - NEW METHOD
  async updateUser(id: string, userData: UpdateUserRequest): Promise<{ message: string; user: User }> {
    return this.request<{ message: string; user: User }>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }
}

export const adminUsersApiService = new AdminUsersApiService();