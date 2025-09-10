// services/pairApi.ts - FIXED VERSION
// const API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Pair {
  _id: string;
  pairName: string;
  svgImage: string;
  isActive: boolean;
  profitLoss: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePairRequest {
  pairName: string;
  svgImage: string;
  isActive: boolean;
  profitLoss: number;
}

export interface UpdatePairRequest {
  pairName?: string;
  svgImage?: string;
  isActive?: boolean;
  profitLoss?: number;
}

export interface PairResponse {
  message: string;
  pair: Pair;
}

class PairApiService {
  private isAdminEndpoint(endpoint: string): boolean {
    const adminEndpoints = [
      '/pairs',
      '/pairs/',
      '/pairs/toggle-status'
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

 console.log('DEBUG - Pair API Request:', {
    endpoint,
    token: token, // Log the actual token
    tokenType: token === 'admin-hardcoded-token-12345' ? 'Hardcoded Admin Token' : 'JWT Token',
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

  // Create a new pair (Admin only)
  async createPair(pairData: CreatePairRequest): Promise<PairResponse> {
    return this.request<PairResponse>('/pairs', {
      method: 'POST',
      body: JSON.stringify(pairData),
    });
  }

  // Get all pairs (Admin - all pairs, User - only active)
  async getAllPairs(): Promise<Pair[]> {
    return this.request<Pair[]>('/pairs');
  }

  // Get single pair by ID
  async getPairById(id: string): Promise<Pair> {
    return this.request<Pair>(`/pairs/${id}`);
  }

  // Update a pair (Admin only)
  async updatePair(id: string, pairData: UpdatePairRequest): Promise<PairResponse> {
    return this.request<PairResponse>(`/pairs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pairData),
    });
  }

  // Delete a pair (Admin only)
  async deletePair(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/pairs/${id}`, {
      method: 'DELETE',
    });
  }

  // Toggle pair status (Admin only)
  async togglePairStatus(id: string): Promise<PairResponse> {
    return this.request<PairResponse>(`/pairs/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  // Get only active pairs (for users) - uses user token
  async getActivePairs(): Promise<Pair[]> {
    // Use user token for this endpoint
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/pairs`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch pairs');
    }

    const allPairs: Pair[] = await response.json();
    return allPairs.filter(pair => pair.isActive);
  }
}

export const pairApiService = new PairApiService();