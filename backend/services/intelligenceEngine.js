/**
 * Financial Intelligence Engine
 * Analyzes spending patterns and provides AI-powered insights
 */

const { Op } = require('sequelize');

class IntelligenceEngine {
  constructor() {
    this.patterns = {
      // Spending velocity thresholds
      velocityThresholds: {
        low: 0.3,    // 30% of monthly budget in a week
        medium: 0.5, // 50% of monthly budget in a week
        high: 0.7    // 70% of monthly budget in a week
      },
      
      // Impulse spending indicators
      impulseIndicators: {
        lateNightHours: [22, 23, 0, 1, 2],
        highRiskCategories: ['shopping', 'entertainment', 'food'],
        rapidSuccessionMinutes: 30
      },
      
      // Recurring expense patterns
      recurringPatterns: {
        minOccurrences: 3,
        dayVariance: 5, // +/- 5 days
        amountVariance: 0.1 // +/- 10%
      }
    };
  }

  /**
   * Analyze spending velocity - how fast user is spending
   */
  async analyzeSpendingVelocity(userId, timeframe = 7) {
    try {
      const { Transaction } = require('../models');
      
      // Get transactions from last N days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeframe);
      
      const transactions = await Transaction.findAll({
        where: {
          userId,
          type: 'expense',
          transactionDate: {
            [Op.gte]: startDate
          }
        },
        order: [['transactionDate', 'DESC']]
      });
      
      if (transactions.length === 0) {
        return {
          velocity: 'low',
          totalSpent: 0,
          dailyAverage: 0,
          trend: 'stable',
          riskLevel: 'low'
        };
      }
      
      const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
      const dailyAverage = totalSpent / timeframe;
      
      // Calculate trend (comparing first half vs second half)
      const midPoint = Math.floor(transactions.length / 2);
      const recentHalf = transactions.slice(0, midPoint);
      const olderHalf = transactions.slice(midPoint);
      
      const recentAvg = recentHalf.reduce((sum, tx) => sum + tx.amount, 0) / Math.max(1, recentHalf.length);
      const olderAvg = olderHalf.reduce((sum, tx) => sum + tx.amount, 0) / Math.max(1, olderHalf.length);
      
      let trend = 'stable';
      if (recentAvg > olderAvg * 1.2) trend = 'increasing';
      else if (recentAvg < olderAvg * 0.8) trend = 'decreasing';
      
      // Determine velocity level
      let velocity = 'low';
      let riskLevel = 'low';
      
      // Assume monthly budget of 50,000 (this would come from user profile)
      const monthlyBudget = 50000;
      const weeklyBudgetRatio = totalSpent / (monthlyBudget * (timeframe / 30));
      
      if (weeklyBudgetRatio > this.patterns.velocityThresholds.high) {
        velocity = 'high';
        riskLevel = 'high';
      } else if (weeklyBudgetRatio > this.patterns.velocityThresholds.medium) {
        velocity = 'medium';
        riskLevel = 'medium';
      }
      
      return {
        velocity,
        totalSpent,
        dailyAverage,
        trend,
        riskLevel,
        budgetRatio: weeklyBudgetRatio,
        transactionCount: transactions.length
      };
      
    } catch (error) {
      console.error('Error analyzing spending velocity:', error);
      throw error;
    }
  }

  /**
   * Detect impulse spending patterns
   */
  async detectImpulseSpending(userId, days = 30) {
    try {
      const { Transaction } = require('../models');
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const transactions = await Transaction.findAll({
        where: {
          userId,
          type: 'expense',
          transactionDate: {
            [Op.gte]: startDate
          }
        },
        order: [['transactionDate', 'DESC']]
      });
      
      const impulseTransactions = [];
      const patterns = [];
      
      for (let i = 0; i < transactions.length; i++) {
        const tx = transactions[i];
        const txDate = new Date(tx.transactionDate);
        const hour = txDate.getHours();
        
        let impulseScore = 0;
        let reasons = [];
        
        // Late night spending
        if (this.patterns.impulseIndicators.lateNightHours.includes(hour)) {
          impulseScore += 0.3;
          reasons.push('Late night purchase');
        }
        
        // High-risk categories
        if (this.patterns.impulseIndicators.highRiskCategories.includes(tx.category)) {
          impulseScore += 0.2;
          reasons.push('High-risk category');
        }
        
        // Large amount for category
        const categoryAvg = this.calculateCategoryAverage(transactions, tx.category);
        if (tx.amount > categoryAvg * 1.5) {
          impulseScore += 0.3;
          reasons.push('Above average amount');
        }
        
        // Rapid succession (multiple purchases within 30 minutes)
        const rapidPurchases = transactions.filter(otherTx => {
          const timeDiff = Math.abs(new Date(otherTx.transactionDate) - txDate);
          return timeDiff <= this.patterns.impulseIndicators.rapidSuccessionMinutes * 60 * 1000;
        });
        
        if (rapidPurchases.length > 1) {
          impulseScore += 0.4;
          reasons.push('Rapid succession purchases');
        }
        
        // Weekend spending (higher impulse likelihood)
        const dayOfWeek = txDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          impulseScore += 0.1;
          reasons.push('Weekend purchase');
        }
        
        if (impulseScore > 0.5) {
          impulseTransactions.push({
            ...tx.toJSON(),
            impulseScore,
            reasons
          });
        }
      }
      
      // Identify patterns
      const hourlyDistribution = this.analyzeHourlyDistribution(impulseTransactions);
      const categoryDistribution = this.analyzeCategoryDistribution(impulseTransactions);
      
      return {
        impulseTransactions,
        totalImpulseSpending: impulseTransactions.reduce((sum, tx) => sum + tx.amount, 0),
        impulsePercentage: (impulseTransactions.length / Math.max(1, transactions.length)) * 100,
        patterns: {
          hourlyDistribution,
          categoryDistribution,
          averageImpulseAmount: impulseTransactions.reduce((sum, tx) => sum + tx.amount, 0) / Math.max(1, impulseTransactions.length)
        },
        recommendations: this.generateImpulseRecommendations(impulseTransactions)
      };
      
    } catch (error) {
      console.error('Error detecting impulse spending:', error);
      throw error;
    }
  }

  /**
   * Detect recurring expenses
   */
  async detectRecurringExpenses(userId, months = 6) {
    try {
      const { Transaction } = require('../models');
      
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);
      
      const transactions = await Transaction.findAll({
        where: {
          userId,
          type: 'expense',
          transactionDate: {
            [Op.gte]: startDate
          }
        },
        order: [['transactionDate', 'ASC']]
      });
      
      // Group by merchant and amount (with tolerance)
      const merchantGroups = {};
      
      transactions.forEach(tx => {
        const key = tx.merchant.toLowerCase().trim();
        if (!merchantGroups[key]) {
          merchantGroups[key] = [];
        }
        merchantGroups[key].push(tx);
      });
      
      const recurringExpenses = [];
      
      Object.entries(merchantGroups).forEach(([merchant, txs]) => {
        if (txs.length < this.patterns.recurringPatterns.minOccurrences) {
          return;
        }
        
        // Check for regular intervals
        const intervals = [];
        for (let i = 1; i < txs.length; i++) {
          const daysDiff = Math.abs(
            (new Date(txs[i].transactionDate) - new Date(txs[i-1].transactionDate)) / (1000 * 60 * 60 * 24)
          );
          intervals.push(daysDiff);
        }
        
        // Check if intervals are consistent (monthly ~30 days, weekly ~7 days, etc.)
        const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        const intervalVariance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
        
        // Determine if it's recurring based on consistency
        let frequency = 'irregular';
        if (avgInterval >= 28 && avgInterval <= 32 && intervalVariance < 10) {
          frequency = 'monthly';
        } else if (avgInterval >= 5 && avgInterval <= 9 && intervalVariance < 5) {
          frequency = 'weekly';
        } else if (avgInterval >= 85 && avgInterval <= 95 && intervalVariance < 20) {
          frequency = 'quarterly';
        }
        
        if (frequency !== 'irregular') {
          const avgAmount = txs.reduce((sum, tx) => sum + tx.amount, 0) / txs.length;
          const nextExpectedDate = new Date(txs[txs.length - 1].transactionDate);
          nextExpectedDate.setDate(nextExpectedDate.getDate() + avgInterval);
          
          recurringExpenses.push({
            merchant,
            frequency,
            averageAmount: avgAmount,
            lastAmount: txs[txs.length - 1].amount,
            occurrences: txs.length,
            nextExpectedDate,
            category: txs[0].category,
            confidence: this.calculateRecurringConfidence(intervals, intervalVariance)
          });
        }
      });
      
      return {
        recurringExpenses: recurringExpenses.sort((a, b) => b.averageAmount - a.averageAmount),
        totalRecurringAmount: recurringExpenses.reduce((sum, exp) => sum + exp.averageAmount, 0),
        upcomingExpenses: recurringExpenses.filter(exp => {
          const daysUntilNext = (new Date(exp.nextExpectedDate) - new Date()) / (1000 * 60 * 60 * 24);
          return daysUntilNext <= 7 && daysUntilNext >= 0;
        })
      };
      
    } catch (error) {
      console.error('Error detecting recurring expenses:', error);
      throw error;
    }
  }

  /**
   * Predict future expenses based on patterns
   */
  async predictFutureExpenses(userId, daysAhead = 30) {
    try {
      const recurringData = await this.detectRecurringExpenses(userId);
      const velocityData = await this.analyzeSpendingVelocity(userId);
      
      const predictions = [];
      const today = new Date();
      
      // Predict recurring expenses
      recurringData.recurringExpenses.forEach(expense => {
        const nextDate = new Date(expense.nextExpectedDate);
        const daysUntil = (nextDate - today) / (1000 * 60 * 60 * 24);
        
        if (daysUntil <= daysAhead && daysUntil >= 0) {
          predictions.push({
            type: 'recurring',
            merchant: expense.merchant,
            amount: expense.averageAmount,
            date: nextDate,
            confidence: expense.confidence,
            category: expense.category
          });
        }
      });
      
      // Predict variable expenses based on historical patterns
      const { Transaction } = require('../models');
      const historicalData = await Transaction.findAll({
        where: {
          userId,
          type: 'expense',
          transactionDate: {
            [Op.gte]: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
          }
        }
      });
      
      // Calculate daily variable spending (excluding recurring)
      const recurringMerchants = new Set(recurringData.recurringExpenses.map(e => e.merchant));
      const variableTransactions = historicalData.filter(tx => 
        !recurringMerchants.has(tx.merchant.toLowerCase().trim())
      );
      
      const dailyVariableSpending = variableTransactions.reduce((sum, tx) => sum + tx.amount, 0) / 90;
      
      // Predict variable expenses for the next period
      for (let i = 1; i <= daysAhead; i++) {
        const futureDate = new Date(today);
        futureDate.setDate(futureDate.getDate() + i);
        
        predictions.push({
          type: 'variable',
          merchant: 'Variable Expenses',
          amount: dailyVariableSpending,
          date: futureDate,
          confidence: 0.6,
          category: 'mixed'
        });
      }
      
      return {
        predictions: predictions.sort((a, b) => new Date(a.date) - new Date(b.date)),
        totalPredictedAmount: predictions.reduce((sum, pred) => sum + pred.amount, 0),
        recurringAmount: predictions.filter(p => p.type === 'recurring').reduce((sum, pred) => sum + pred.amount, 0),
        variableAmount: predictions.filter(p => p.type === 'variable').reduce((sum, pred) => sum + pred.amount, 0)
      };
      
    } catch (error) {
      console.error('Error predicting future expenses:', error);
      throw error;
    }
  }

  /**
   * Generate intelligent affordability decision
   */
  async analyzeAffordability(userId, purchaseAmount, category = 'other') {
    try {
      const { User, FinancialProfile } = require('../models');
      
      // Get user financial data
      const user = await User.findByPk(userId, {
        include: [FinancialProfile]
      });
      
      if (!user || !user.FinancialProfile) {
        throw new Error('User financial profile not found');
      }
      
      const currentBalance = user.FinancialProfile.currentBalance;
      
      // Get spending analysis
      const velocityData = await this.analyzeSpendingVelocity(userId);
      const futureExpenses = await this.predictFutureExpenses(userId);
      const impulseData = await this.detectImpulseSpending(userId);
      
      // Calculate safety buffer (emergency fund)
      const monthlyExpenses = velocityData.dailyAverage * 30;
      const recommendedBuffer = monthlyExpenses * 2; // 2 months emergency fund
      
      // Calculate available spending money
      const upcomingExpenses = futureExpenses.predictions
        .filter(p => (new Date(p.date) - new Date()) <= 7 * 24 * 60 * 60 * 1000) // Next 7 days
        .reduce((sum, p) => sum + p.amount, 0);
      
      const availableAmount = currentBalance - recommendedBuffer - upcomingExpenses;
      
      // Risk factors
      const riskFactors = [];
      let riskScore = 0;
      
      // High spending velocity
      if (velocityData.velocity === 'high') {
        riskFactors.push('High spending velocity detected');
        riskScore += 0.3;
      }
      
      // Recent impulse purchases
      if (impulseData.impulsePercentage > 20) {
        riskFactors.push('Recent impulse spending pattern');
        riskScore += 0.2;
      }
      
      // Low balance relative to expenses
      if (currentBalance < monthlyExpenses * 1.5) {
        riskFactors.push('Low balance relative to monthly expenses');
        riskScore += 0.4;
      }
      
      // Category-specific risks
      if (impulseData.patterns.categoryDistribution[category] > 30) {
        riskFactors.push(`High impulse spending in ${category} category`);
        riskScore += 0.2;
      }
      
      // Time-based risk (late night purchases)
      const currentHour = new Date().getHours();
      if (this.patterns.impulseIndicators.lateNightHours.includes(currentHour)) {
        riskFactors.push('Late night purchase - higher impulse risk');
        riskScore += 0.3;
      }
      
      // Make decision
      let decision = 'yes';
      let explanation = '';
      let recommendation = '';
      
      if (purchaseAmount > availableAmount) {
        decision = 'no';
        explanation = `This purchase would exceed your available spending money (₹${availableAmount.toLocaleString()}) after accounting for emergency buffer and upcoming expenses.`;
        recommendation = 'Consider waiting or finding a less expensive alternative.';
      } else if (riskScore > 0.6 || purchaseAmount > availableAmount * 0.5) {
        decision = 'risky';
        explanation = `You can afford this, but there are risk factors to consider: ${riskFactors.join(', ')}.`;
        recommendation = 'Consider waiting 24 hours before making this purchase to avoid impulse buying.';
      } else {
        decision = 'yes';
        explanation = `This purchase fits within your budget. You have ₹${availableAmount.toLocaleString()} available for discretionary spending.`;
        recommendation = 'This looks like a reasonable purchase based on your spending patterns.';
      }
      
      return {
        decision,
        explanation,
        recommendation,
        analysis: {
          purchaseAmount,
          currentBalance,
          availableAmount,
          upcomingExpenses,
          emergencyBuffer: recommendedBuffer,
          riskScore,
          riskFactors,
          spendingVelocity: velocityData.velocity,
          impulseRisk: impulseData.impulsePercentage
        }
      };
      
    } catch (error) {
      console.error('Error analyzing affordability:', error);
      throw error;
    }
  }

  // Helper methods
  calculateCategoryAverage(transactions, category) {
    const categoryTxs = transactions.filter(tx => tx.category === category);
    if (categoryTxs.length === 0) return 0;
    return categoryTxs.reduce((sum, tx) => sum + tx.amount, 0) / categoryTxs.length;
  }

  analyzeHourlyDistribution(transactions) {
    const hourly = {};
    transactions.forEach(tx => {
      const hour = new Date(tx.transactionDate).getHours();
      hourly[hour] = (hourly[hour] || 0) + 1;
    });
    return hourly;
  }

  analyzeCategoryDistribution(transactions) {
    const categories = {};
    transactions.forEach(tx => {
      categories[tx.category] = (categories[tx.category] || 0) + 1;
    });
    
    const total = transactions.length;
    Object.keys(categories).forEach(cat => {
      categories[cat] = (categories[cat] / total) * 100;
    });
    
    return categories;
  }

  calculateRecurringConfidence(intervals, variance) {
    // Lower variance = higher confidence
    if (variance < 5) return 0.9;
    if (variance < 15) return 0.7;
    if (variance < 30) return 0.5;
    return 0.3;
  }

  generateImpulseRecommendations(impulseTransactions) {
    const recommendations = [];
    
    if (impulseTransactions.length > 0) {
      const lateNightCount = impulseTransactions.filter(tx => 
        this.patterns.impulseIndicators.lateNightHours.includes(new Date(tx.transactionDate).getHours())
      ).length;
      
      if (lateNightCount > 2) {
        recommendations.push('Consider implementing a "sleep on it" rule for purchases after 10 PM');
      }
      
      const avgAmount = impulseTransactions.reduce((sum, tx) => sum + tx.amount, 0) / impulseTransactions.length;
      if (avgAmount > 1000) {
        recommendations.push('Set up purchase approval delays for amounts over ₹1,000');
      }
      
      recommendations.push('Try the 24-hour rule: wait a day before making non-essential purchases');
    }
    
    return recommendations;
  }
}

module.exports = IntelligenceEngine;