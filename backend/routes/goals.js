const express = require('express');
const { Goal } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get goals
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;
    
    const where = { userId: req.user.userId };
    if (status) where.status = status;
    
    const goals = await Goal.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json(goals);
    
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ error: 'Failed to get goals' });
  }
});

// Create goal
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      description,
      targetAmount,
      targetDate,
      category,
      priority,
      emoji
    } = req.body;
    
    const goal = await Goal.create({
      userId: req.user.userId,
      name,
      description,
      targetAmount,
      targetDate,
      category,
      priority: priority || 'medium',
      emoji
    });
    
    res.status(201).json({
      message: 'Goal created successfully',
      goal
    });
    
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

// Get goal by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    res.json(goal);
    
  } catch (error) {
    console.error('Get goal error:', error);
    res.status(500).json({ error: 'Failed to get goal' });
  }
});

// Update goal
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    await goal.update(req.body);
    
    res.json({
      message: 'Goal updated successfully',
      goal
    });
    
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

// Update goal progress
router.post('/:id/progress', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    
    const goal = await Goal.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    const newCurrentAmount = parseFloat(goal.currentAmount) + parseFloat(amount);
    const targetAmount = parseFloat(goal.targetAmount);
    
    // Check if goal is completed
    const status = newCurrentAmount >= targetAmount ? 'completed' : goal.status;
    
    await goal.update({
      currentAmount: newCurrentAmount,
      status
    });
    
    res.json({
      message: status === 'completed' ? 'Goal completed!' : 'Progress updated',
      goal,
      progressPercentage: Math.round((newCurrentAmount / targetAmount) * 100)
    });
    
  } catch (error) {
    console.error('Update goal progress error:', error);
    res.status(500).json({ error: 'Failed to update goal progress' });
  }
});

// Delete goal
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    await goal.destroy();
    
    res.json({ message: 'Goal deleted successfully' });
    
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

module.exports = router;