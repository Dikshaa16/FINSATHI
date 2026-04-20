const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { User, FinancialProfile, Transaction } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// Financial personality types with detailed profiles
const PERSONALITY_TYPES = {
  'disciplined-saver': {
    name: 'Disciplined Saver',
    emoji: '🎯',
    color: '#00D68F',
    description: 'You have excellent financial discipline and consistently save towards your goals.',
    traits: ['Goal-oriented', 'Consistent', 'Risk-aware', 'Future-focused'],
    scoreRange: [80, 100]
  },
  'balanced-planner': {
    name: 'Balanced Planner',
    emoji: '⚖️',
    color: '#7C3AED',
    description: 'You maintain a healthy balance between saving, spending, and enjoying life.',
    traits: ['Balanced', 'Practical', 'Adaptable', 'Moderate risk'],
    scoreRange: [60, 79]
  },
  'impulsive-spender': {
    name: 'Impulsive Spender',
    emoji: '🛍️',
    color: '#F59E0B',
    description: 'You enjoy spending and sometimes make purchases without much planning.',
    traits: ['Spontaneous', 'Present-focused', 'Social', 'Experience-driven'],
    scoreRange: [40, 59]
  },
  'anxious-saver': {
    name: 'Anxious Saver',
    emoji: '😰',
    color: '#EF4444',
    description: 'You worry about money and tend to over-save at the expense of current enjoyment.',
    traits: ['Cautious', 'Worry-prone', 'Risk-averse', 'Security-focused'],
    scoreRange: [20, 39]
  },
  'financial-novice': {
    name: 'Financial Novice',
    emoji: '🌱',
    color: '#10B981',
    description: 'You\'re just starting your financial journey and learning about money management.',
    traits: ['Learning', 'Growing', 'Curious', 'Developing'],
    scoreRange: [0, 19]
  }
};

// Calculate comprehensive personality score
function calculatePersonalityScore(behaviorData, historicalData) {
  let score = 0;
  const weights = {
    consistency: 15,
    savingsGoalAdherence: 20,
    budgetAdherence: 15,
    emergencyFund: 15,
    savingsRate: 15,
    impulsiveness: -10, // Negative weight
    emotionalSpending: -8,
    spendingVolatility: -7,
    goalCompletion: 10,
    riskTolerance: 5,
    planningHorizon: 10
  };
  
  // Positive factors
  score += behaviorData.consistency * weights.consistency;
  score += behaviorData.savingsGoalAdherence * weights.savingsGoalAdherence;
  score += historicalData.budgetAdherenceRate * weights.budgetAdherence;
  score += Math.min(historicalData.emergencyFundMonths / 6, 1) * weights.emergencyFund;
  score += Math.min(historicalData.savingsRate / 0.2, 1) * weights.savingsRate;
  score += historicalData.goalCompletionRate * weights.goalCompletion;
  score += behaviorData.riskTolerance * weights.riskTolerance;
  score += behaviorData.planningHorizon * weights.planningHorizon;
  
  // Negative factors (higher values reduce score)
  score += (1 - behaviorData.impulsiveness) * Math.abs(weights.impulsiveness);
  score += (1 - behaviorData.emotionalSpending) * Math.abs(weights.emotionalSpending);
  score += (1 - historicalData.spendingVolatility) * Math.abs(weights.spendingVolatility);
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Determine personality type based on score and behavior patterns
function determinePersonalityType(score, behaviorData) {
  // Special cases based on behavior patterns
  if (behaviorData.impulsiveness > 0.6 && score < 70) {
    return 'impulsive-spender';
  }
  
  if (behaviorData.consistency > 0.9 && behaviorData.savingsGoalAdherence > 0.8 && score >= 80) {
    return 'disciplined-saver';
  }
  
  if (behaviorData.emotionalSpending < 0.2 && behaviorData.riskTolerance < 0.3) {
    return 'anxious-saver';
  }
  
  // Default to score-based determination
  for (const [typeId, type] of Object.entries(PERSONALITY_TYPES)) {
    if (score >= type.scoreRange[0] && score <= type.scoreRange[1]) {
      return typeId;
    }
  }
  
  return 'balanced-planner';
}

// Analyze user's financial behavior from transaction data
async function analyzeFinancialBehavior(userId) {
  try {
    // Get user's transactions from last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const transactions = await Transaction.findAll({
      where: {
        userId,
        transactionDate: {
          [Op.gte]: sixMonthsAgo
        }
      },
      order: [['transactionDate', 'DESC']]
    });

    const user = await User.findByPk(userId, {
      include: [FinancialProfile]
    });

    if (!user || !user.FinancialProfile) {
      throw new Error('User financial profile not found');
    }

    const profile = user.FinancialProfile;
    
    // Calculate behavioral metrics
    const totalTransactions = transactions.length;
    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');
    
    // Calculate spending consistency (lower variance = higher consistency)
    const monthlySpending = {};
    expenses.forEach(tx => {
      const month = tx.transactionDate.toISOString().substring(0, 7);
      monthlySpending[month] = (monthlySpending[month] || 0) + tx.amount;
    });
    
    const spendingAmounts = Object.values(monthlySpending);
    const avgSpending = spendingAmounts.reduce((a, b) => a + b, 0) / spendingAmounts.length;
    const variance = spendingAmounts.reduce((sum, amount) => sum + Math.pow(amount - avgSpending, 2), 0) / spendingAmounts.length;
    const consistency = Math.max(0, 1 - (Math.sqrt(variance) / avgSpending));
    
    // Calculate impulsiveness (based on impulse purchase flag and spending patterns)
    const impulsePurchases = expenses.filter(t => t.isImpulsePurchase).length;
    const impulsiveness = Math.min(1, impulsePurchases / Math.max(1, expenses.length));
    
    // Calculate savings rate
    const totalIncome = income.reduce((sum, tx) => sum + tx.amount, 0);
    const totalExpenses = expenses.reduce((sum, tx) => sum + tx.amount, 0);
    const savingsRate = totalIncome > 0 ? Math.max(0, (totalIncome - totalExpenses) / totalIncome) : 0;
    
    // Mock some additional behavioral data (in real app, this would be calculated from more data)
    const behaviorData = {
      consistency: Math.min(1, consistency || 0.75),
      impulsiveness: Math.min(1, impulsiveness || 0.25),
      savingsGoalAdherence: Math.min(1, savingsRate * 1.2 || 0.78),
      riskTolerance: 0.65, // Could be calculated from investment choices
      planningHorizon: 0.72, // Could be calculated from goal setting behavior
      emotionalSpending: Math.min(1, impulsiveness * 1.2 || 0.30),
      socialInfluence: 0.40, // Could be calculated from social spending patterns
      categoryDiscipline: {
        needs: 0.95,
        wants: Math.max(0.3, 1 - impulsiveness),
        savings: Math.min(1, savingsRate * 1.5),
      }
    };
    
    const historicalData = {
      monthsTracked: 6,
      goalCompletionRate: 0.67, // Could be calculated from goals table
      budgetAdherenceRate: Math.min(1, consistency * 1.1 || 0.73),
      emergencyFundMonths: profile.currentBalance / (avgSpending || 1),
      investmentDiversification: 0.45,
      debtToIncomeRatio: 0.15,
      savingsRate,
      spendingVolatility: Math.max(0, 1 - consistency)
    };
    
    return { behaviorData, historicalData };
  } catch (error) {
    console.error('Error analyzing financial behavior:', error);
    throw error;
  }
}

// Generate personalized insights
function generatePersonalizedInsights(personalityType, score, behaviorData) {
  const insights = [];
  
  // Score-based insights
  if (score >= 80) {
    insights.push({
      type: 'achievement',
      title: 'Excellent Financial Health',
      message: 'Your financial discipline is in the top 20% of users',
      priority: 'high'
    });
  } else if (score >= 60) {
    insights.push({
      type: 'positive',
      title: 'Good Financial Foundation',
      message: 'You have solid financial habits with room for optimization',
      priority: 'medium'
    });
  } else {
    insights.push({
      type: 'improvement',
      title: 'Growth Opportunity',
      message: 'Focus on building consistent financial habits',
      priority: 'high'
    });
  }
  
  // Behavior-specific insights
  if (behaviorData.consistency > 0.8) {
    insights.push({
      type: 'strength',
      title: 'Consistent Spender',
      message: 'Your spending patterns are predictable and manageable',
      priority: 'low'
    });
  }
  
  if (behaviorData.impulsiveness > 0.4) {
    insights.push({
      type: 'warning',
      title: 'Impulse Control',
      message: 'Consider implementing purchase delays for non-essential items',
      priority: 'high'
    });
  }
  
  if (behaviorData.savingsGoalAdherence > 0.75) {
    insights.push({
      type: 'achievement',
      title: 'Goal Achiever',
      message: 'You consistently work towards your financial goals',
      priority: 'medium'
    });
  }
  
  return insights;
}

// GET /api/personality/analyze - Analyze user's financial personality
router.get('/analyze', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Analyze user's financial behavior
    const { behaviorData, historicalData } = await analyzeFinancialBehavior(userId);
    
    // Calculate personality score
    const score = calculatePersonalityScore(behaviorData, historicalData);
    
    // Determine personality type
    const personalityTypeId = determinePersonalityType(score, behaviorData);
    const personalityType = PERSONALITY_TYPES[personalityTypeId];
    
    // Generate insights
    const insights = generatePersonalizedInsights(personalityTypeId, score, behaviorData);
    
    res.json({
      score,
      personalityType: {
        id: personalityTypeId,
        ...personalityType
      },
      behaviorData,
      historicalData,
      insights,
      analysisDate: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error analyzing personality:', error);
    res.status(500).json({ 
      error: 'Failed to analyze financial personality',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/personality/types - Get all personality types
router.get('/types', (req, res) => {
  res.json(PERSONALITY_TYPES);
});

// GET /api/personality/history - Get personality analysis history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    // In a real app, you'd store personality analysis results in a table
    // For now, return mock historical data
    const mockHistory = [
      {
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        score: 71,
        personalityType: 'balanced-planner'
      },
      {
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        score: 68,
        personalityType: 'balanced-planner'
      }
    ];
    
    res.json(mockHistory);
    
  } catch (error) {
    console.error('Error fetching personality history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch personality history',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;