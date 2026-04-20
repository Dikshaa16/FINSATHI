import { useState, useEffect } from 'react';
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
  createdAt: string;
}

interface UseTransactionsResult {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTransactions(limit = 10): UseTransactionsResult {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching transactions with limit:', limit);

      const response = await api.getTransactions({ 
        limit,
        // Order by most recent first
      });

      console.log('📊 Transactions API response:', response);

      if (response.error) {
        throw new Error(response.error);
      }

      // Ensure we always set an array, even if response.data is undefined/null
      const transactionData = response.data;
      if (Array.isArray(transactionData)) {
        console.log('✅ Setting transactions array:', transactionData.length, 'items');
        setTransactions(transactionData);
      } else {
        console.warn('⚠️ API returned non-array data for transactions:', transactionData);
        setTransactions([]);
      }
    } catch (err) {
      console.error('❌ Error fetching transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
      setTransactions([]); // Always ensure we have an array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [limit]);

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
  };
}