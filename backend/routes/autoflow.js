const express = require('express');
const { FinancialProfile, Transaction } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Auto flow optimization engine
function optimizeMoneyFlow(financialData, behaviorData, historicalData) {
  const categories = [
    {
      id: 'needs',
      name: 'Needs',
      defaultPercentage: 50,
      currentPercentage: 50,
      adaptable: false
    },
    {
      id: 'wants',
      name: 'Wants',
      defaultPercentage: 30,
      currentPercentage: 30,
      adaptable: true
    },
    {
      id: 'savings',
      name: 'Savings',
      defaultPercentage: 20,
      currentPercentage: 20,
      adaptable: true
    }
  ];
  
  const { spendingConsistency, impulsiveness, savingsGoalAdherence } = behaviorData;
  const { savingsGoalMisses, impulsePurchases, lastMonthSavings } = historicalData;
  
  categories.forEach(category => {
    if (!category.adaptable) return;
    
    switch (category.id) {
      case 'wants':
        // Reduce wants if user is impulsive or overspending
        if (impulsiveness > 0.3 || impulsePurchases > 5) {
          category.currentPercentage = Math.max(20, category.defaultPercentage - 5);
        }
        // Increase wants if user is very disciplined
        else if (behaviorData.wantsDiscipline > 0.8 && spendingConsistency > 0.9) {
          category.currentPercentage = Math.min(35, category.defaultPercentage + 5);
        }
        break;
        
      case 'savings':
        // Increase savings if user missed goals (motivation boost)
        if (savingsGoalMisses > 1) {
          category.currentPercentage = Math.min(30, category.defaultPercentage + 5);
        }
        // Maintain higher savings if user is consistent
        else if (savingsGoalAdherence > 0.8) {
          category.currentPercentage = Math.min(25, category.defaultPercentage + 3);
        }
        // Reduce slightly if user consistently oversaves (lifestyle balance)
        else if (lastMonthSavings > financialData.monthlyIncome * 0.25) {
          category.currentPercentage = Math.max(15, category.defaultPercentage - 2);
        }
        break;
    }
  });
  
  // Ensure percentages add up to 100%
  const totalPercentage = categories.reduce((sum, cat) => sum + cat.currentPercentage, 0);
  if (totalPercentage !== 100) {
    const diff = 100 - totalPercentage;
    const wantsCategory = categories.find(cat => cat.id === 'wants');
    if (wantsCategory) {
      wantsCategory.currentPercentage = Math.max(15, Math.min(40, wantsCategory.currentPercentage + diff));
    }
  }
  
  return categories;
}

// Generate behavioral insights
function generateInsights(categories, behaviorData, historicalData) {
  const insights = [];
  
  const wantsCategory = categories.find(cat => cat.id === 'wants');
  const savingsCategory = categories.find(cat => cat.id === 'savings');
  
  if (wantsCategory && wantsCategory.currentPercentage < wantsCategory.defaultPercentage) {
    insights.push({
      type: 'optimization',
      message: 'Wants budget reduced due to recent impulsive spending',
      impact: `Saving ₹${Math.round(historicalData.monthlyIncome * 0.05)} monthly`,
      action: 'Track spending for 2 weeks to restore full budget'
    });
  }
  
  if (savingsCategory && savingsCategory.currentPercentage > savingsCategory.defaultPercentage) {
    insights.push({
      type: 'achievement',
      message: 'Savings rate increased due to missed goals',
      impact: `Extra ₹${Math.round(historicalData.monthlyIncome * 0.05)} towards goals`,
      action: 'Stay consistent to maintain this boost'
    });
  }
  
  if (behaviorData.impulsiveness > 0.3) {
    insights.push({
      type: 'warning',
      message: 'High impulsive spending detected',
      impact: 'May affect long-term financial goals',
      action: 'Enable spending alerts and 24-hour purchase delays'
    });
  }
  
  return insights;
}

// Get auto flow status and optimization
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const financialProfile = await FinancialProfile.findOne({
      where: { userId: req.user.userId }
    });
    
    if (!financialProfile) {
      return res.status(404).json({ error: 'Financial profile not found' });
    }
    
    // Get recent transaction data for behavioral analysis
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentTransactions = await Transaction.findAll({
      where: {
        userId: req.user.userId,
        transactionDate: {
          [require('sequelize').Op.gte]: thirtyDaysAgo
        }
      },
      order: [['transactionDate', 'DESC']]
    });
    
    // Calculate behavioral metrics
    const impulsePurchases = recentTransactions.filter(t => t.isImpulsePurchase).length;
    const lastMonthSavings = recentTransactions
      .filter(t => t.category === 'savings')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    // Behavioral data from profile
    const behaviorData = {
      spendingConsistency: parseFloat(financialProfile.spendingConsistency),
      impulsiveness: parseFloat(financialProfile.impulsiveness),
      savingsGoalAdherence: parseFloat(financialProfile.savingsGoalAdherence),
      wantsDiscipline: parseFloat(financialProfile.wantsDiscipline)
    };
    
    const historicalData = {
      savingsGoalMisses: 2, // This would be calculated from goal history
      impulsePurchases,
      lastMonthSavings,
      monthlyIncome: parseFloat(financialProfile.monthlyIncome)
    };
    
    // Optimize flow
    const optimizedCategories = optimizeMoneyFlow(
      {
        monthlyIncome: parseFloat(financialProfile.monthlyIncome),
        currentBalance: parseFloat(financialProfile.currentBalance)
      },
      behaviorData,
      historicalData
    );
    
    // Generate insights
    const insights = generateInsights(optimizedCategories, behaviorData, historicalData);
    
    // Calculate monthly allocations
    const monthlyAllocations = {};
    optimizedCategories.forEach(cat => {
      monthlyAllocations[cat.id] = Math.round((parseFloat(financialProfile.monthlyIncome) * cat.currentPercentage) / 100);
    });
    
    res.json({
      isEnabled: financialProfile.autoFlowEnabled,
      categories: optimizedCategories,
      monthlyAllocations,
      insights,
      behaviorData,
      currentPercentages: {
        needs: financialProfile.needsPercentage,
        wants: financialProfile.wantsPercentage,
        savings: financialProfile.savingsPercentage
      }
    });
    
  } catch (error) {
    console.error('Auto flow status error:', error);
    res.status(500).json({ error: 'Failed to get auto flow status' });
  }
});

// Enable/disable auto flow
router.post('/toggle', authenticateToken, async (req, res) => {
  try {
    const { enabled } = req.body;
    
    const financialProfile = await FinancialProfile.findOne({
      where: { userId: req.user.userId }
    });
    
    if (!financialProfile) {
      return res.status(404).json({ error: 'Financial profile not found' });
    }
    
    await financialProfile.update({
      autoFlowEnabled: enabled
    });
    
    res.json({
      message: `Auto flow ${enabled ? 'enabled' : 'disabled'}`,
      isEnabled: enabled
    });
    
  } catch (error) {
    console.error('Auto flow toggle error:', error);
    res.status(500).json({ error: 'Failed to toggle auto flow' });
  }
});

// Update flow percentages
router.post('/update-percentages', authenticateToken, async (req, res) => {
  try {
    const { needsPercentage, wantsPercentage, savingsPercentage } = req.body;
    
    // Validate percentages add up to 100
    if (needsPercentage + wantsPercentage + savingsPercentage !== 100) {
      return res.status(400).json({ error: 'Percentages must add up to 100' });
    }
    
    const financialProfile = await FinancialProfile.findOne({
      where: { userId: req.user.userId }
    });
    
    if (!financialProfile) {
      return res.status(404).json({ error: 'Financial profile not found' });
    }
    
    await financialProfile.update({
      needsPercentage,
      wantsPercentage,
      savingsPercentage
    });
    
    res.json({
      message: 'Flow percentages updated successfully',
      percentages: {
        needs: needsPercentage,
        wants: wantsPercentage,
        savings: savingsPercentage
      }
    });
    
  } catch (error) {
    console.error('Update percentages error:', error);
    res.status(500).json({ error: 'Failed to update percentages' });
  }
});

// Reset to default percentages
router.post('/reset', authenticateToken, async (req, res) => {
  try {
    const financialProfile = await FinancialProfile.findOne({
      where: { userId: req.user.userId }
    });
    
    if (!financialProfile) {
      return res.status(404).json({ error: 'Financial profile not found' });
    }
    
    await financialProfile.update({
      needsPercentage: 50,
      wantsPercentage: 30,
      savingsPercentage: 20,
      autoFlowEnabled: false
    });
    
    res.json({
      message: 'Flow percentages reset to defaults',
      percentages: {
        needs: 50,
        wants: 30,
        savings: 20
      }
    });
    
  } catch (error) {
    console.error('Reset flow error:', error);
    res.status(500).json({ error: 'Failed to reset flow' });
  }
});

module.exports = router;