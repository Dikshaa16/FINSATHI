/**
 * User Profile Hook
 * Manages user data and financial profile
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profilePicture?: string;
  financialProfile?: FinancialProfile;
}

interface FinancialProfile {
  currentBalance: number;
  monthlyIncome: number;
  fixedExpenses: number;
  averageDailySpending: number;
  needsPercentage: number;
  wantsPercentage: number;
  savingsPercentage: number;
  autoFlowEnabled: boolean;
}

interface UserStats {
  totalIncome: number;
  totalExpenses: number;
  totalSaved: number;
  balance: number;
  monthlyBudget: number;
  spent: number;
  remaining: number;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getUserProfile();
      
      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        setUser(response.data);
        
        // Calculate stats from financial profile
        const profile = response.data.financialProfile;
        if (profile) {
          const monthlyBudget = profile.monthlyIncome - profile.fixedExpenses;
          const spent = profile.averageDailySpending * 30; // Approximate monthly spending
          const remaining = monthlyBudget - spent;
          const totalSaved = profile.currentBalance - profile.monthlyIncome + spent;

          setStats({
            totalIncome: profile.monthlyIncome,
            totalExpenses: spent,
            totalSaved: totalSaved > 0 ? totalSaved : 0,
            balance: profile.currentBalance,
            monthlyBudget,
            spent,
            remaining: remaining > 0 ? remaining : 0,
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFinancialProfile = useCallback(async (data: Partial<FinancialProfile>) => {
    try {
      const response = await api.updateFinancialProfile(data);
      
      if (response.error) {
        setError(response.error);
        return false;
      }

      // Refresh user profile
      await fetchUserProfile();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to update financial profile');
      return false;
    }
  }, [fetchUserProfile]);

  const refreshUser = useCallback(() => {
    return fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  return {
    user,
    stats,
    loading,
    error,
    refreshUser,
    updateFinancialProfile,
    fullName: user ? `${user.firstName} ${user.lastName}` : '',
    firstName: user?.firstName || '',
    avatar: user?.profilePicture || null,
  };
}
