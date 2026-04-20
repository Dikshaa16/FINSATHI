const express = require('express');
const { FinancialProfile, Transaction } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Category insights data
const CATEGORY_INSIGHTS = {
  electronics: { monthlyBudget: 15000, advice: "Tech purchases - consider if it's an upgrade or necessity" },
  food: { monthlyBudget: 8000, advice: "Food spending is healthy, but watch delivery fees" },
  transport: { monthlyBudget: 3000, advice: "Transport costs are reasonable" },
  subscription: { monthlyBudget: 2000, advice: "Review subscriptions monthly to avoid waste" },
  health: { monthlyBudget: 4000, advice: "Health investments are always worthwhile" },
  travel: { monthlyBudget: 10000, advice: "Travel budget has room, but plan ahead" },
  fashion: { monthlyBudget: 5000, advice: "Fashion spending is near limit this month" }
};

// Advanced affordability calculation
function calculateAffordability(price, currentHour, category, financialData, spendingHistory) {
  const { monthlyIncome, currentBalance, fixedExpenses, averageDailySpending } = financialData;
  const availableBalance = currentBalance - fixedExpenses;
  
  // Calculate spending volatility
  const spendingVariance = spendingHistory.reduce((acc, transaction) => {
    return acc + Math.pow(transaction.amount - averageDailySpending, 2);
  }, 0) / Math.max(spendingHistory.length, 1);
  
  const volatilityMultiplier = spendingVariance > 500000 ? 1.2 : 1.0;
  
  // Category-based risk assessment
  let categoryMultiplier = 1.0;
  let categoryInsight = "";
  
  if (category && CATEGORY_INSIGHTS[category]) {
    const catData = CATEGORY_INSIGHTS[category];
    const currentMonthSpending = spendingHistory
      .filter(t => t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const categoryUsage = currentMonthSpending / catData.monthlyBudget;
    
    if (categoryUsage > 0.9) {
      categoryMultiplier = 1.3;
      categoryInsight = `⚠️ ${category} budget 90% used. ${catData.advice}`;
    } else if (categoryUsage > 0.7) {
      categoryMultiplier = 1.1;
      categoryInsight = `📊 ${category} budget 70% used. ${catData.advice}`;
    } else {
      categoryMultiplier = 0.95;
      categoryInsight = `✅ ${category} budget healthy. ${catData.advice}`;
    }
  }
  
  // Time-based risk
  const timeRiskMultiplier = (currentHour >= 22 || currentHour <= 6) ? 1.3 : 1.0;
  
  // Weekend multiplier
  const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
  const weekendMultiplier = isWeekend ? 1.15 : 1.0;
  
  // Impulse detection
  const impulseThreshold = averageDailySpending * 5;
  const impulseMultiplier = price > impulseThreshold ? 1.25 : 1.0;
  
  // Combined risk
  const totalRiskMultiplier = timeRiskMultiplier * weekendMultiplier * volatilityMultiplier * impulseMultiplier * categoryMultiplier;
  const adjustedPrice = price * totalRiskMultiplier;
  
  // Safety buffer
  const safetyBuffer = availableBalance * 0.2;
  const remainingAfterPurchase = availableBalance - adjustedPrice;
  const daysUntilBroke = Math.floor(remainingAfterPurchase / (averageDailySpending * volatilityMultiplier));
  
  // Decision logic
  if (adjustedPrice > availableBalance) {
    return {
      canAfford: false,
      riskLevel: 'dangerous',
      message: "❌ Cannot afford this",
      explanation: `This purchase (₹${adjustedPrice.toLocaleString()}) exceeds your available balance of ₹${availableBalance.toLocaleString()}`,
      recommendation: totalRiskMultiplier > 1.2 
        ? "High-risk purchase detected. Consider waiting and reassessing tomorrow."
        : "Consider saving up or finding a cheaper alternative",
      categoryInsight
    };
  }
  
  if (remainingAfterPurchase < safetyBuffer) {
    return {
      canAfford: false,
      riskLevel: 'dangerous',
      message: "🚨 High risk purchase",
      explanation: `This would leave you with only ₹${remainingAfterPurchase.toLocaleString()}, below your safety buffer`,
      daysUntilBroke,
      recommendation: "Wait until next month or reduce the amount",
      categoryInsight
    };
  }
  
  if (daysUntilBroke < 7) {
    return {
      canAfford: true,
      riskLevel: 'risky',
      message: "⚠️ Risky but possible",
      explanation: `You could run out of money in ${daysUntilBroke} days if you maintain current spending patterns`,
      daysUntilBroke,
      recommendation: "Monitor your spending closely for the next week",
      categoryInsight
    };
  }
  
  return {
    canAfford: true,
    riskLevel: 'safe',
    message: "✅ Safe to buy",
    explanation: `This fits comfortably within your budget. You'll have ₹${remainingAfterPurchase.toLocaleString()} remaining`,
    recommendation: "Good choice! This aligns with your financial goals",
    categoryInsight
  };
}

// Analyze affordability
router.post('/analyze', authenticateToken, async (req, res) => {
  try {
    const { price, category } = req.body;
    const currentHour = new Date().getHours();
    
    // Get user's financial profile
    const financialProfile = await FinancialProfile.findOne({
      where: { userId: req.user.userId }
    });
    
    if (!financialProfile) {
      return res.status(404).json({ error: 'Financial profile not found' });
    }
    
    // Get recent spending history (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const spendingHistory = await Transaction.findAll({
      where: {
        userId: req.user.userId,
        type: 'expense',
        transactionDate: {
          [require('sequelize').Op.gte]: thirtyDaysAgo
        }
      },
      order: [['transactionDate', 'DESC']],
      limit: 100
    });
    
    // Calculate affordability
    const result = calculateAffordability(
      price,
      currentHour,
      category,
      {
        monthlyIncome: parseFloat(financialProfile.monthlyIncome),
        currentBalance: parseFloat(financialProfile.currentBalance),
        fixedExpenses: parseFloat(financialProfile.fixedExpenses),
        averageDailySpending: parseFloat(financialProfile.averageDailySpending)
      },
      spendingHistory.map(t => ({
        amount: parseFloat(t.amount),
        category: t.category
      }))
    );
    
    // Save analysis result if it's a significant purchase
    if (price > financialProfile.averageDailySpending * 2) {
      await Transaction.create({
        userId: req.user.userId,
        amount: price,
        type: 'expense',
        category: category || 'general',
        description: `Affordability analysis - ${result.message}`,
        riskLevel: result.riskLevel,
        affordabilityScore: result.canAfford ? (result.riskLevel === 'safe' ? 100 : 70) : 30,
        transactionDate: new Date()
      });
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('Affordability analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze affordability' });
  }
});

// Get affordability history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const analyses = await Transaction.findAll({
      where: {
        userId: req.user.userId,
        affordabilityScore: {
          [require('sequelize').Op.not]: null
        }
      },
      order: [['transactionDate', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json(analyses);
    
  } catch (error) {
    console.error('Affordability history error:', error);
    res.status(500).json({ error: 'Failed to fetch affordability history' });
  }
});

module.exports = router;