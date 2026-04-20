const express = require('express');
const jwt = require('jsonwebtoken');
const { User, FinancialProfile } = require('../models');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phoneNumber, dateOfBirth } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }
    
    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth
    });
    
    // Create default financial profile
    await FinancialProfile.create({
      userId: user.id,
      monthlyIncome: 0,
      currentBalance: 0,
      fixedExpenses: 0,
      averageDailySpending: 0
    });
    
    // Generate token
    const token = generateToken(user.id);
    
    res.status(201).json({
      message: 'User created successfully',
      user,
      token
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ 
      where: { email, isActive: true },
      include: [{
        model: FinancialProfile,
        as: 'financialProfile'
      }]
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last login
    await user.update({ lastLoginAt: new Date() });
    
    // Generate token
    const token = generateToken(user.id);
    
    res.json({
      message: 'Login successful',
      user,
      token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      include: [{
        model: FinancialProfile,
        as: 'financialProfile'
      }]
    });
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.json({ user });
    
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;