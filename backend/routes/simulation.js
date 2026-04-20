const express = require('express');
const { FinancialProfile, Goal, Transaction } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Seasonal spending multipliers
const SEASONAL_MULTIPLIERS = {
  1: 1.2, 2: 0.9, 3: 1.0, 4: 1.0, 5: 1.1, 6: 1.3,
  7: 1.4, 8: 1.2, 9: 1.0, 10: 1.1, 11: 1.5, 12: 1.8
};

// Monte Carlo simulation engine
function runMonteCarloSimulation(goalAmount, timeHorizon, financialData) {
  const { monthlyIncome, currentBalance, fixedExpenses, averageDailySpending } = financialData;
  const monthlyExpenses = fixedExpenses + (averageDailySpending * 30);
  const currentMonth = new Date().getMonth() + 1;
  
  const simulations = 1000;
  const volatilityFactor = 0.15;
  const incomeVolatility = 0.05;
  
  let successfulSimulations = 0;
  let totalTimeToGoal = 0;
  const projectedBalances = [];
  const milestones = [];
  
  // Run first simulation for visualization
  let balance = currentBalance;
  for (let month = 1; month <= timeHorizon; month++) {
    const seasonalMonth = ((currentMonth + month - 1) % 12) + 1;
    const seasonalMultiplier = SEASONAL_MULTIPLIERS[seasonalMonth];
    
    const adjustedIncome = monthlyIncome;
    const adjustedExpenses = monthlyExpenses * seasonalMultiplier;
    const monthlyCashFlow = adjustedIncome - adjustedExpenses;
    
    balance += monthlyCashFlow;
    projectedBalances.push(Math.max(0, balance));
    
    if (month % 6 === 0) {
      milestones.push({
        month,
        balance: Math.max(0, balance),
        event: `${month/12} year${month >= 24 ? 's' : ''} mark`
      });
    }
  }
  
  // Run Monte Carlo simulations
  for (let sim = 0; sim < simulations; sim++) {
    let simBalance = currentBalance;
    let achieved = false;
    
    for (let month = 1; month <= timeHorizon && !achieved; month++) {
      const seasonalMonth = ((currentMonth + month - 1) % 12) + 1;
      const seasonalMultiplier = SEASONAL_MULTIPLIERS[seasonalMonth];
      
      const incomeVariation = 1 + (Math.random() - 0.5) * incomeVolatility;
      const expenseVariation = 1 + (Math.random() - 0.5) * volatilityFactor;
      
      const adjustedIncome = monthlyIncome * incomeVariation;
      const adjustedExpenses = monthlyExpenses * seasonalMultiplier * expenseVariation;
      const monthlyCashFlow = adjustedIncome - adjustedExpenses;
      
      simBalance += monthlyCashFlow;
      
      if (simBalance >= goalAmount && !achieved) {
        achieved = true;
        successfulSimulations++;
        totalTimeToGoal += month;
      }
    }
  }
  
  const successRate = successfulSimulations / simulations;
  const averageTimeToGoal = successfulSimulations > 0 ? totalTimeToGoal / successfulSimulations : timeHorizon;
  const monthlyRequired = Math.max(0, (goalAmount - currentBalance) / timeHorizon);
  
  let riskLevel;
  if (successRate > 0.8) riskLevel = 'low';
  else if (successRate > 0.5) riskLevel = 'medium';
  else riskLevel = 'high';
  
  const recommendations = [];
  const riskFactors = [];
  
  const monthlyNetIncome = monthlyIncome - monthlyExpenses;
  
  if (monthlyRequired > monthlyNetIncome * 0.5) {
    recommendations.push("Consider extending timeline or reducing goal amount");
    riskFactors.push("High savings requirement relative to income");
  }
  
  if (successRate < 0.7) {
    recommendations.push("Increase income or reduce expenses to improve success rate");
    riskFactors.push("Low probability of achieving goal in timeframe");
  }
  
  if (monthlyRequired > 0) {
    recommendations.push(`Save ₹${monthlyRequired.toLocaleString()} monthly to stay on track`);
  }
  
  return {
    canAchieve: successRate > 0.3,
    timeToGoal: Math.round(averageTimeToGoal),
    monthlyRequired: Math.round(monthlyRequired),
    riskLevel,
    projectedBalance: projectedBalances,
    milestones,
    recommendations,
    riskFactors,
    successRate: Math.round(successRate * 100),
    alternativeScenarios: {
      optimistic: {
        timeToGoal: Math.max(1, Math.round(averageTimeToGoal * 0.8)),
        monthlyRequired: Math.round(monthlyRequired * 0.8)
      },
      pessimistic: {
        timeToGoal: Math.round(averageTimeToGoal * 1.3),
        monthlyRequired: Math.round(monthlyRequired * 1.3)
      }
    }
  };
}

// Run simulation
router.post('/run', authenticateToken, async (req, res) => {
  try {
    const { goalAmount, timeHorizon, goalId } = req.body;
    
    // Get user's financial profile
    const financialProfile = await FinancialProfile.findOne({
      where: { userId: req.user.userId }
    });
    
    if (!financialProfile) {
      return res.status(404).json({ error: 'Financial profile not found' });
    }
    
    // Run simulation
    const result = runMonteCarloSimulation(
      goalAmount,
      timeHorizon,
      {
        monthlyIncome: parseFloat(financialProfile.monthlyIncome),
        currentBalance: parseFloat(financialProfile.currentBalance),
        fixedExpenses: parseFloat(financialProfile.fixedExpenses),
        averageDailySpending: parseFloat(financialProfile.averageDailySpending)
      }
    );
    
    // Save simulation results to goal if goalId provided
    if (goalId) {
      await Goal.update({
        simulationResults: result,
        successProbability: result.successRate,
        monthlyRequired: result.monthlyRequired,
        riskLevel: result.riskLevel
      }, {
        where: {
          id: goalId,
          userId: req.user.userId
        }
      });
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({ error: 'Failed to run simulation' });
  }
});

// Get simulation history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const goals = await Goal.findAll({
      where: {
        userId: req.user.userId,
        simulationResults: {
          [require('sequelize').Op.not]: null
        }
      },
      order: [['updatedAt', 'DESC']],
      limit: 20
    });
    
    res.json(goals);
    
  } catch (error) {
    console.error('Simulation history error:', error);
    res.status(500).json({ error: 'Failed to fetch simulation history' });
  }
});

module.exports = router;