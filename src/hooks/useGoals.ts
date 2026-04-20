import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface Goal {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused';
  emoji?: string;
  createdAt: string;
  updatedAt: string;
}

interface UseGoalsResult {
  goals: Goal[];
  loading: boolean;
  error: string | null;
  createGoal: (goalData: Omit<Goal, 'id' | 'currentAmount' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  updateProgress: (id: string, amount: number) => Promise<void>;
  refetch: () => void;
}

export function useGoals(): UseGoalsResult {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.getGoals();

      if (response.error) {
        throw new Error(response.error);
      }

      setGoals(response.data || []);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError(err instanceof Error ? err.message : 'Failed to load goals');
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goalData: Omit<Goal, 'id' | 'currentAmount' | 'createdAt' | 'updatedAt' | 'status'>) => {
    try {
      const response = await api.createGoal(goalData);
      
      if (response.error) {
        throw new Error(response.error);
      }

      // Refetch goals to get the updated list
      await fetchGoals();
    } catch (err) {
      console.error('Error creating goal:', err);
      throw err;
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    try {
      const response = await api.updateGoal(id, updates);
      
      if (response.error) {
        throw new Error(response.error);
      }

      // Refetch goals to get the updated list
      await fetchGoals();
    } catch (err) {
      console.error('Error updating goal:', err);
      throw err;
    }
  };

  const updateProgress = async (id: string, amount: number) => {
    try {
      const response = await api.updateGoalProgress(id, amount);
      
      if (response.error) {
        throw new Error(response.error);
      }

      // Refetch goals to get the updated list
      await fetchGoals();
    } catch (err) {
      console.error('Error updating goal progress:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  return {
    goals,
    loading,
    error,
    createGoal,
    updateGoal,
    updateProgress,
    refetch: fetchGoals,
  };
}