// API service for backend communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Request failed' };
      }

      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return { error: 'Network error' };
    }
  }

  // Auth methods
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Authentication
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    dateOfBirth?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async verifyToken() {
    return this.request('/auth/verify');
  }

  // User profile
  async getUserProfile() {
    return this.request('/users/profile');
  }

  async updateUserProfile(profileData: any) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async updateFinancialProfile(financialData: any) {
    return this.request('/users/financial-profile', {
      method: 'PUT',
      body: JSON.stringify(financialData),
    });
  }

  // Affordability
  async analyzeAffordability(data: { price: number; category?: string }) {
    return this.request('/affordability/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAffordabilityHistory(limit = 20, offset = 0) {
    return this.request(`/affordability/history?limit=${limit}&offset=${offset}`);
  }

  // Simulation
  async runSimulation(data: { goalAmount: number; timeHorizon: number; goalId?: string }) {
    return this.request('/simulation/run', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSimulationHistory() {
    return this.request('/simulation/history');
  }

  // Auto Flow
  async getAutoFlowStatus() {
    return this.request('/autoflow/status');
  }

  async toggleAutoFlow(enabled: boolean) {
    return this.request('/autoflow/toggle', {
      method: 'POST',
      body: JSON.stringify({ enabled }),
    });
  }

  async updateFlowPercentages(percentages: {
    needsPercentage: number;
    wantsPercentage: number;
    savingsPercentage: number;
  }) {
    return this.request('/autoflow/update-percentages', {
      method: 'POST',
      body: JSON.stringify(percentages),
    });
  }

  async resetAutoFlow() {
    return this.request('/autoflow/reset', {
      method: 'POST',
    });
  }

  // Transactions
  async getTransactions(params: {
    limit?: number;
    offset?: number;
    type?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  } = {}) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/transactions?${queryString}`);
  }

  async createTransaction(transactionData: {
    amount: number;
    type: 'income' | 'expense';
    category: string;
    subcategory?: string;
    description?: string;
    merchant?: string;
    isRecurring?: boolean;
    isImpulsePurchase?: boolean;
    transactionDate?: string;
  }) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  async updateTransaction(id: string, transactionData: any) {
    return this.request(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transactionData),
    });
  }

  async deleteTransaction(id: string) {
    return this.request(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  async getSpendingAnalytics(period = '30') {
    return this.request(`/transactions/analytics/spending?period=${period}`);
  }

  // Goals
  async getGoals(params: { status?: string; limit?: number; offset?: number } = {}) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/goals?${queryString}`);
  }

  async createGoal(goalData: {
    name: string;
    description?: string;
    targetAmount: number;
    targetDate: string;
    category: string;
    priority?: 'low' | 'medium' | 'high';
    emoji?: string;
  }) {
    return this.request('/goals', {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
  }

  async updateGoal(id: string, goalData: any) {
    return this.request(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(goalData),
    });
  }

  async updateGoalProgress(id: string, amount: number) {
    return this.request(`/goals/${id}/progress`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async deleteGoal(id: string) {
    return this.request(`/goals/${id}`, {
      method: 'DELETE',
    });
  }

  // Personality
  async analyzePersonality() {
    return this.request('/personality/analyze');
  }

  async getPersonalityTypes() {
    return this.request('/personality/types');
  }

  async getPersonalityHistory() {
    return this.request('/personality/history');
  }

  // SMS Processing
  async processSMSBatch(smsMessages: Array<{
    message: string;
    timestamp: number;
    sender: string;
  }>) {
    return this.request('/sms/process', {
      method: 'POST',
      body: JSON.stringify({ smsMessages }),
    });
  }

  async processSingleSMS(message: string, timestamp?: number, sender?: string) {
    return this.request('/sms/single', {
      method: 'POST',
      body: JSON.stringify({ 
        message, 
        timestamp: timestamp || Date.now(), 
        sender: sender || 'Unknown' 
      }),
    });
  }

  async getSpendingPatterns(days = 30) {
    return this.request(`/sms/patterns?days=${days}`);
  }

  async testSMSParsing(message: string, timestamp?: number, sender?: string) {
    return this.request('/sms/test-parsing', {
      method: 'POST',
      body: JSON.stringify({ 
        message, 
        timestamp: timestamp || Date.now(), 
        sender: sender || 'Test' 
      }),
    });
  }

  async getSMSStats() {
    return this.request('/sms/stats');
  }
}

// Create and export API instance
export const api = new ApiService(API_BASE_URL);

// Export types
export type { ApiResponse };