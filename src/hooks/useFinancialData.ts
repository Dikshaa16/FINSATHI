import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface FinancialData {
  balance: number;
  monthlyIncome: number;
  currentExpenses: number;
  savings: number;
  loading: boolean;
  error: string | null;
}

export function useFinancialData(): FinancialData {
  const [data, setData] = useState<FinancialData>({
    balance: 0,
    monthlyIncome: 0,
    currentExpenses: 0,
    savings: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        // Get user profile with financial data
        const profileResponse = await api.getUserProfile();
        
        if (profileResponse.error) {
          throw new Error(profileResponse.error);
        }

        const user = profileResponse.data;
        const financialProfile = user?.financialProfile;

        // Get current month's spending from transactions
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const transactionsResponse = await api.getTransactions({
          startDate: startOfMonth.toISOString(),
          endDate: endOfMonth.toISOString(),
          limit: 1000, // Get all transactions for the month
        });

        let currentExpenses = 0;
        if (transactionsResponse.data && Array.isArray(transactionsResponse.data)) {
          currentExpenses = transactionsResponse.data
            .filter((tx: any) => tx.type === 'expense')
            .reduce((sum: number, tx: any) => sum + Math.abs(tx.amount), 0);
        }

        const monthlyIncome = financialProfile?.monthlyIncome || 0;
        const balance = financialProfile?.currentBalance || 0;
        const savings = monthlyIncome - currentExpenses;

        setData({
          balance,
          monthlyIncome,
          currentExpenses,
          savings: Math.max(0, savings),
          loading: false,
          error: null,
        });

      } catch (error) {
        console.error('Error fetching financial data:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load financial data',
        }));
      }
    };

    fetchFinancialData();
  }, []);

  return data;
}