// services/cronSettingsApi.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://beecoin.cloud/api';

export interface CronSettings {
  time: string;
  timeZone: string;
}

export interface UpdateCronSettingsRequest {
  time: string;
  timeZone: string;
}

// NEW: Interface for backend response
interface BackendCronSettings {
  balanceUpdateTime: string;
  deactivationTime: string;
  timeZone: string;
}

class CronSettingsApiService {
  private isAdminEndpoint(endpoint: string): boolean {
    const adminEndpoints = [
      '/cron-settings',
      '/cron-settings/',
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

    console.log('DEBUG - Cron Settings API Request:', {
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

  // Get current cron settings - UPDATED
  async getCronSettings(): Promise<CronSettings> {
    const backendResponse = await this.request<BackendCronSettings>('/cron-settings', {
      method: 'GET',
    });

    // Transform backend response to frontend format
    return {
      time: backendResponse.balanceUpdateTime,
      timeZone: backendResponse.timeZone
    };
  }

  // Update cron settings - UPDATED
  async updateCronSettings(settingsData: UpdateCronSettingsRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>('/cron-settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
  }

  // Test cron job (trigger manually)
  async testCronJob(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/cron-settings/test', {
      method: 'POST',
    });
  }
}

export const cronSettingsApiService = new CronSettingsApiService();