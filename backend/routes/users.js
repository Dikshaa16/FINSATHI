const express = require('express');
const { User, FinancialProfile } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      include: [{
        model: FinancialProfile,
        as: 'financialProfile'
      }]
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, dateOfBirth } = req.body;
    
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await user.update({
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth
    });
    
    res.json({
      message: 'Profile updated successfully',
      user
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update financial profile
router.put('/financial-profile', authenticateToken, async (req, res) => {
  try {
    const {
      monthlyIncome,
      currentBalance,
      fixedExpenses,
      averageDailySpending,
      spendingConsistency,
      impulsiveness,
      savingsGoalAdherence,
      needsDiscipline,
      wantsDiscipline,
      savingsDiscipline
    } = req.body;
    
    let financialProfile = await FinancialProfile.findOne({
      where: { userId: req.user.userId }
    });
    
    if (!financialProfile) {
      // Create new financial profile
      financialProfile = await FinancialProfile.create({
        userId: req.user.userId,
        monthlyIncome: monthlyIncome || 0,
        currentBalance: currentBalance || 0,
        fixedExpenses: fixedExpenses || 0,
        averageDailySpending: averageDailySpending || 0,
        spendingConsistency: spendingConsistency || 0.5,
        impulsiveness: impulsiveness || 0.3,
        savingsGoalAdherence: savingsGoalAdherence || 0.5,
        needsDiscipline: needsDiscipline || 0.8,
        wantsDiscipline: wantsDiscipline || 0.6,
        savingsDiscipline: savingsDiscipline || 0.7
      });
    } else {
      // Update existing profile
      await financialProfile.update({
        monthlyIncome: monthlyIncome !== undefined ? monthlyIncome : financialProfile.monthlyIncome,
        currentBalance: currentBalance !== undefined ? currentBalance : financialProfile.currentBalance,
        fixedExpenses: fixedExpenses !== undefined ? fixedExpenses : financialProfile.fixedExpenses,
        averageDailySpending: averageDailySpending !== undefined ? averageDailySpending : financialProfile.averageDailySpending,
        spendingConsistency: spendingConsistency !== undefined ? spendingConsistency : financialProfile.spendingConsistency,
        impulsiveness: impulsiveness !== undefined ? impulsiveness : financialProfile.impulsiveness,
        savingsGoalAdherence: savingsGoalAdherence !== undefined ? savingsGoalAdherence : financialProfile.savingsGoalAdherence,
        needsDiscipline: needsDiscipline !== undefined ? needsDiscipline : financialProfile.needsDiscipline,
        wantsDiscipline: wantsDiscipline !== undefined ? wantsDiscipline : financialProfile.wantsDiscipline,
        savingsDiscipline: savingsDiscipline !== undefined ? savingsDiscipline : financialProfile.savingsDiscipline
      });
    }
    
    res.json({
      message: 'Financial profile updated successfully',
      financialProfile
    });
    
  } catch (error) {
    console.error('Update financial profile error:', error);
    res.status(500).json({ error: 'Failed to update financial profile' });
  }
});

module.exports = router;