/**
 * API Service for Backend Communication
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Update this to your backend URL
// For local development: use your computer's IP address (not localhost)
// IMPORTANT: Change this IP if your computer's IP changes
const API_BASE_URL = 'http://10.107.61.226:3001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
  }

  async setToken(token) {
    this.token = token;
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.warn('Could not save token to storage:', error.message);
      // Token is still set in memory, so login will work for this session
    }
  }

  async clearToken() {
    this.token = null;
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.warn('Could not clear token from storage:', error.message);
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Login user
   */
  async login(email, password) {
    try {
      console.log('API Service - Login attempt:', { 
        email, 
        password: password.length + ' chars',
        url: `${this.baseURL}/auth/login`
      });
      
      const response = await axios.post(
        `${this.baseURL}/auth/login`,
        { email, password },
        { headers: this.getHeaders() }
      );

      console.log('API Service - Login response:', response.status, response.data);

      if (response.data.token) {
        await this.setToken(response.data.token);
      }

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  }

  /**
   * Register new user
   */
  async register(userData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/auth/register`,
        userData,
        { headers: this.getHeaders() }
      );

      if (response.data.token) {
        await this.setToken(response.data.token);
      }

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  }

  /**
   * Process batch SMS messages
   */
  async processSMSBatch(smsMessages) {
    try {
      const response = await axios.post(
        `${this.baseURL}/sms/process`,
        { smsMessages },
        { headers: this.getHeaders() }
      );

      return { success: true, data: response.data };
    } catch (error) {
      console.error('SMS processing error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'SMS processing failed'
      };
    }
  }

  /**
   * Process single SMS message
   */
  async processSingleSMS(message, timestamp, sender) {
    try {
      const response = await axios.post(
        `${this.baseURL}/sms/single`,
        { message, timestamp, sender },
        { headers: this.getHeaders() }
      );

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Single SMS processing error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'SMS processing failed'
      };
    }
  }

  /**
   * Get spending patterns
   */
  async getSpendingPatterns(days = 30) {
    try {
      const response = await axios.get(
        `${this.baseURL}/sms/patterns?days=${days}`,
        { headers: this.getHeaders() }
      );

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Patterns fetch error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch patterns'
      };
    }
  }

  /**
   * Get SMS processing stats
   */
  async getSMSStats() {
    try {
      const response = await axios.get(
        `${this.baseURL}/sms/stats`,
        { headers: this.getHeaders() }
      );

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Stats fetch error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch stats'
      };
    }
  }

  /**
   * Get user transactions
   */
  async getTransactions(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await axios.get(
        `${this.baseURL}/transactions?${queryString}`,
        { headers: this.getHeaders() }
      );

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Transactions fetch error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch transactions'
      };
    }
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      // Health endpoint is at /health, not /api/health
      const healthUrl = this.baseURL.replace('/api', '/health');
      console.log('Testing connection to:', healthUrl);
      const response = await axios.get(healthUrl);
      console.log('Connection test successful:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Connection test error:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      return {
        success: false,
        error: 'Cannot connect to backend. Check API_BASE_URL in apiService.js'
      };
    }
  }
}

export default new ApiService();
