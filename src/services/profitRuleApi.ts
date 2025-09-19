// services/profitRuleApi.ts - FIXED VERSION
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ProfitRule {
  _id: string;
  minBalance: number;
  maxBalance: number;
  profit: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfitRuleRequest {
  minBalance: number;
  maxBalance: number;
  profit: number;
  isActive: boolean;
}

export interface UpdateProfitRuleRequest {
  minBalance?: number;
  maxBalance?: number;
  profit?: number;
  isActive?: boolean;
}

export interface ProfitRuleResponse {
  message: string;
  rule: ProfitRule;
}

class ProfitRuleApiService {
  private isAdminEndpoint(endpoint: string): boolean {
    const adminEndpoints = [
      '/profit-rules',
      '/profit-rules/',
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

    console.log('DEBUG - Profit Rule API Request:', {
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

  // Create a new profit rule (Admin only)
  async createProfitRule(ruleData: CreateProfitRuleRequest): Promise<ProfitRuleResponse> {
    return this.request<ProfitRuleResponse>('/profit-rules', {
      method: 'POST',
      body: JSON.stringify(ruleData),
    });
  }

  // Get all profit rules (Admin only)
  async getAllProfitRules(): Promise<ProfitRule[]> {
    return this.request<ProfitRule[]>('/profit-rules');
  }

  // Update a profit rule (Admin only)
  async updateProfitRule(id: string, ruleData: UpdateProfitRuleRequest): Promise<ProfitRuleResponse> {
    return this.request<ProfitRuleResponse>(`/profit-rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ruleData),
    });
  }

  // Delete a profit rule (Admin only)
  async deleteProfitRule(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/profit-rules/${id}`, {
      method: 'DELETE',
    });
  }

  // Toggle profit rule status (Admin only)
  async toggleProfitRuleStatus(id: string): Promise<ProfitRuleResponse> {
    // First get the current rule to toggle the status
    const rules = await this.getAllProfitRules();
    const rule = rules.find(r => r._id === id);
    
    if (!rule) {
      throw new Error('Profit rule not found');
    }

    return this.updateProfitRule(id, { isActive: !rule.isActive });
  }
}

export const profitRuleApiService = new ProfitRuleApiService();