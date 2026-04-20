const express = require('express');
const { Transaction } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Get transactions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      limit = 50, 
      offset = 0, 
      type, 
      category, 
      startDate, 
      endDate 
    } = req.query;
    
    const where = { userId: req.user.userId };
    
    if (type) where.type = type;
    if (category) where.category = category;
    
    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate[Op.gte] = new Date(startDate);
      if (endDate) where.transactionDate[Op.lte] = new Date(endDate);
    }
    
    const transactions = await Transaction.findAll({
      where,
      order: [['transactionDate', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    const total = await Transaction.count({ where });
    
    res.json({
      transactions,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

// Create transaction
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      amount,
      type,
      category,
      subcategory,
      description,
      merchant,
      isRecurring,
      isImpulsePurchase,
      transactionDate
    } = req.body;
    
    const transaction = await Transaction.create({
      userId: req.user.userId,
      amount,
      type,
      category,
      subcategory,
      description,
      merchant,
      isRecurring: isRecurring || false,
      isImpulsePurchase: isImpulsePurchase || false,
      transactionDate: transactionDate || new Date()
    });
    
    res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    });
    
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Get transaction by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(transaction);
    
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Failed to get transaction' });
  }
});

// Update transaction
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    await transaction.update(req.body);
    
    res.json({
      message: 'Transaction updated successfully',
      transaction
    });
    
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// Delete transaction
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    await transaction.destroy();
    
    res.json({ message: 'Transaction deleted successfully' });
    
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// Get spending analytics
router.get('/analytics/spending', authenticateToken, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));
    
    const transactions = await Transaction.findAll({
      where: {
        userId: req.user.userId,
        type: 'expense',
        transactionDate: {
          [Op.gte]: daysAgo
        }
      }
    });
    
    // Group by category
    const categorySpending = {};
    let totalSpending = 0;
    
    transactions.forEach(t => {
      const amount = parseFloat(t.amount);
      totalSpending += amount;
      
      if (!categorySpending[t.category]) {
        categorySpending[t.category] = 0;
      }
      categorySpending[t.category] += amount;
    });
    
    // Convert to array and sort
    const categoryArray = Object.entries(categorySpending)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: Math.round((amount / totalSpending) * 100)
      }))
      .sort((a, b) => b.amount - a.amount);
    
    res.json({
      totalSpending,
      categoryBreakdown: categoryArray,
      transactionCount: transactions.length,
      averageTransaction: totalSpending / transactions.length || 0
    });
    
  } catch (error) {
    console.error('Spending analytics error:', error);
    res.status(500).json({ error: 'Failed to get spending analytics' });
  }
});

module.exports = router;