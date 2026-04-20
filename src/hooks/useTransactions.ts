/**
 * Transactions Hook
 * Manages transaction data and analytics
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  subcategory?: string;
  description?: string;
  merchant?: string;
  transactionDate: string;
  isRecurring: boolean;
  isImpulsePurchase: boolean;
  createdAt: string;
}

interface TransactionStats {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  transactionCount: number;
  categoryBreakdown: Record<string, number>;
}

export function useTransactions(limit = 10) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getTransactions({ limit, offset: 0 });
      
      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data && response.data.transactions) {
        const txns = response.data.transactions;
        setTransactions(txns);
        
        // Calculate stats
        const totalIncome = txns
          .filter((t: Transaction) => t.type === 'income')
          .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
        
        const totalExpenses = txns
          .filter((t: Transaction) => t.type === 'expense')
          .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
        
        const categoryBreakdown: Record<string, number> = {};
        txns.forEach((t: Transaction) => {
          if (t.type === 'expense') {
            categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
          }
        });

        setStats({
          totalIncome,
          totalExpenses,
          netAmount: totalIncome - totalExpenses,
          transactionCount: txns.length,
          categoryBreakdown,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const addTransaction = useCallback(async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      const response = await api.createTransaction(data);
      
      if (response.error) {
        setError(response.error);
        return false;
      }

      // Refresh transactions
      await fetchTransactions();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to add transaction');
      return false;
    }
  }, [fetchTransactions]);

  const refreshTransactions = useCallback(() => {
    return fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    stats,
    loading,
    error,
    refreshTransactions,
    addTransaction,
  };
}
