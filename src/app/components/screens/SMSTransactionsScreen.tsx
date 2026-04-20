import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { api } from '../../../services/api';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  merchant: string;
  description: string;
  transactionDate: string;
  createdAt: string;
}

export function SMSTransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    income: 0,
    expense: 0,
    totalAmount: 0
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.getTransactions({ limit: 100 });
      if (response.data) {
        setTransactions(response.data.transactions || []);
        calculateStats(response.data.transactions || []);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (txns: Transaction[]) => {
    const stats = {
      total: txns.length,
      income: txns.filter(t => t.type === 'income').length,
      expense: txns.filter(t => t.type === 'expense').length,
      totalAmount: txns.reduce((sum, t) => {
        return sum + (t.type === 'expense' ? -t.amount : t.amount);
      }, 0)
    };
    setStats(stats);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">📱 SMS Transactions</h1>
          <p className="text-gray-400">
            Real-time financial transactions extracted from your SMS messages
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardDescription>Total Transactions</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardDescription>Income</CardDescription>
              <CardTitle className="text-3xl text-green-500">
                {stats.income}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardDescription>Expenses</CardDescription>
              <CardTitle className="text-3xl text-red-500">
                {stats.expense}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardDescription>Net Amount</CardDescription>
              <CardTitle className={`text-3xl ${stats.totalAmount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatAmount(stats.totalAmount)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Refresh Button */}
        <div className="mb-6">
          <Button
            onClick={loadTransactions}
            className="bg-green-600 hover:bg-green-700"
          >
            🔄 Refresh Transactions
          </Button>
        </div>

        {/* Transactions List */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Automatically extracted from SMS messages
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">
                  No transactions found. Extract SMS from your mobile app to see transactions here.
                </p>
                <div className="bg-zinc-800 rounded-lg p-6 max-w-md mx-auto">
                  <h3 className="font-semibold mb-2">📱 How to Extract SMS:</h3>
                  <ol className="text-left text-sm text-gray-400 space-y-2">
                    <li>1. Open FINSATHI mobile app</li>
                    <li>2. Login with your credentials</li>
                    <li>3. Tap "Extract Real SMS Messages"</li>
                    <li>4. Grant SMS permission</li>
                    <li>5. Tap "Process & Send to Backend"</li>
                    <li>6. ✅ Transactions will appear here!</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg hover:bg-zinc-750 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <Badge
                          variant={transaction.type === 'income' ? 'default' : 'destructive'}
                          className={transaction.type === 'income' ? 'bg-green-600' : 'bg-red-600'}
                        >
                          {transaction.type === 'income' ? '↓ Credit' : '↑ Debit'}
                        </Badge>
                        <span className="font-semibold">{transaction.merchant}</span>
                        <Badge variant="outline" className="text-xs">
                          {transaction.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400">
                        {transaction.description || 'No description'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(transaction.transactionDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${
                        transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatAmount(transaction.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Insights Section */}
        {transactions.length > 0 && (
          <Card className="bg-zinc-900 border-zinc-800 mt-6">
            <CardHeader>
              <CardTitle>🤖 AI Insights</CardTitle>
              <CardDescription>
                Intelligent analysis of your spending patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-800 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">💰 Top Category</h4>
                  <p className="text-2xl text-green-500">
                    {getMostFrequentCategory(transactions)}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Most frequent spending
                  </p>
                </div>

                <div className="bg-zinc-800 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">📊 Average Transaction</h4>
                  <p className="text-2xl text-blue-500">
                    {formatAmount(getAverageAmount(transactions))}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Per transaction
                  </p>
                </div>

                <div className="bg-zinc-800 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">🎯 Spending Trend</h4>
                  <p className="text-2xl text-purple-500">
                    {getSpendingTrend(transactions)}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Compared to average
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Helper functions
function getMostFrequentCategory(transactions: Transaction[]): string {
  const categories = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sorted = Object.entries(categories).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || 'N/A';
}

function getAverageAmount(transactions: Transaction[]): number {
  if (transactions.length === 0) return 0;
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  return total / transactions.length;
}

function getSpendingTrend(transactions: Transaction[]): string {
  if (transactions.length < 2) return 'Stable';
  
  const recent = transactions.slice(0, Math.floor(transactions.length / 2));
  const older = transactions.slice(Math.floor(transactions.length / 2));
  
  const recentAvg = recent.reduce((sum, t) => sum + t.amount, 0) / recent.length;
  const olderAvg = older.reduce((sum, t) => sum + t.amount, 0) / older.length;
  
  const diff = ((recentAvg - olderAvg) / olderAvg) * 100;
  
  if (diff > 10) return '📈 Increasing';
  if (diff < -10) return '📉 Decreasing';
  return '➡️ Stable';
}
