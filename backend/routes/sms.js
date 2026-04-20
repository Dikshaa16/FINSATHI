const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { Transaction } = require('../models');
const SMSProcessor = require('../services/smsProcessor');
const IntelligenceEngine = require('../services/intelligenceEngine');

const router = express.Router();
const smsProcessor = new SMSProcessor();
const intelligenceEngine = new IntelligenceEngine();

// POST /api/sms/process - Process SMS messages and extract transactions
router.post('/process', authenticateToken, async (req, res) => {
  try {
    const { smsMessages } = req.body;
    const userId = req.user.id;
    
    if (!smsMessages || !Array.isArray(smsMessages)) {
      return res.status(400).json({ 
        error: 'SMS messages array is required' 
      });
    }
    
    // Process SMS messages
    const processingResult = smsProcessor.processBatchSMS(smsMessages);
    
    // Store successful transactions in database
    const savedTransactions = [];
    const errors = [];
    
    for (const transactionData of processingResult.transactions) {
      try {
        const transaction = await Transaction.create({
          ...transactionData,
          userId
        });
        savedTransactions.push(transaction);
      } catch (error) {
        errors.push({
          transactionData,
          error: error.message
        });
      }
    }
    
    // Generate insights from the new data
    let insights = null;
    if (savedTransactions.length > 0) {
      try {
        // Analyze spending patterns with new data
        const velocityAnalysis = await intelligenceEngine.analyzeSpendingVelocity(userId);
        const impulseAnalysis = await intelligenceEngine.detectImpulseSpending(userId, 7); // Last 7 days
        
        insights = {
          spendingVelocity: velocityAnalysis,
          recentImpulseSpending: impulseAnalysis,
          newTransactionsCount: savedTransactions.length,
          totalNewSpending: savedTransactions
            .filter(tx => tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0)
        };
      } catch (insightError) {
        console.error('Error generating insights:', insightError);
      }
    }
    
    res.json({
      success: true,
      processed: {
        total: smsMessages.length,
        financial: processingResult.transactions.length,
        saved: savedTransactions.length,
        errors: errors.length
      },
      transactions: savedTransactions,
      insights,
      processingErrors: [...processingResult.errors, ...errors]
    });
    
  } catch (error) {
    console.error('Error processing SMS:', error);
    res.status(500).json({ 
      error: 'Failed to process SMS messages',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/sms/single - Process a single SMS message
router.post('/single', authenticateToken, async (req, res) => {
  try {
    const { message, timestamp, sender } = req.body;
    const userId = req.user.id;
    
    if (!message) {
      return res.status(400).json({ 
        error: 'SMS message is required' 
      });
    }
    
    // Process single SMS
    const transactionData = smsProcessor.processSMS({
      message,
      timestamp: timestamp || Date.now(),
      sender: sender || 'Unknown'
    });
    
    if (!transactionData) {
      return res.json({
        success: true,
        isFinancial: false,
        message: 'SMS does not contain financial transaction data'
      });
    }
    
    // Save transaction
    const transaction = await Transaction.create({
      ...transactionData,
      userId
    });
    
    // Check if this triggers any affordability alerts
    let affordabilityAlert = null;
    if (transaction.type === 'expense' && transaction.amount > 1000) {
      try {
        const analysis = await intelligenceEngine.analyzeAffordability(
          userId, 
          transaction.amount, 
          transaction.category
        );
        
        if (analysis.decision === 'risky' || analysis.riskScore > 0.6) {
          affordabilityAlert = {
            message: 'This purchase pattern shows elevated risk',
            analysis: analysis.analysis,
            recommendations: analysis.recommendation
          };
        }
      } catch (error) {
        console.error('Error generating affordability alert:', error);
      }
    }
    
    res.json({
      success: true,
      isFinancial: true,
      transaction,
      affordabilityAlert,
      confidence: transactionData.confidence
    });
    
  } catch (error) {
    console.error('Error processing single SMS:', error);
    res.status(500).json({ 
      error: 'Failed to process SMS message',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/sms/patterns - Get spending patterns analysis
router.get('/patterns', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;
    
    // Get comprehensive spending analysis
    const [velocityData, impulseData, recurringData, predictions] = await Promise.all([
      intelligenceEngine.analyzeSpendingVelocity(userId, 7),
      intelligenceEngine.detectImpulseSpending(userId, parseInt(days)),
      intelligenceEngine.detectRecurringExpenses(userId),
      intelligenceEngine.predictFutureExpenses(userId, 30)
    ]);
    
    res.json({
      spendingVelocity: velocityData,
      impulseSpending: impulseData,
      recurringExpenses: recurringData,
      futurePredictions: predictions,
      analysisDate: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error analyzing patterns:', error);
    res.status(500).json({ 
      error: 'Failed to analyze spending patterns',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/sms/test-parsing - Test SMS parsing without saving (for development)
router.post('/test-parsing', authenticateToken, async (req, res) => {
  try {
    const { message, timestamp, sender } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        error: 'SMS message is required' 
      });
    }
    
    // Test parsing without saving
    const result = smsProcessor.processSMS({
      message,
      timestamp: timestamp || Date.now(),
      sender: sender || 'Test'
    });
    
    res.json({
      isFinancial: !!result,
      parsedData: result,
      originalMessage: message
    });
    
  } catch (error) {
    console.error('Error testing SMS parsing:', error);
    res.status(500).json({ 
      error: 'Failed to test SMS parsing',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/sms/stats - Get SMS processing statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get transaction statistics
    const transactions = await Transaction.findAll({
      where: { userId, source: 'sms' },
      attributes: ['type', 'category', 'amount', 'transactionDate', 'confidence']
    });
    
    const stats = {
      totalTransactions: transactions.length,
      totalExpenses: transactions.filter(tx => tx.type === 'expense').length,
      totalIncome: transactions.filter(tx => tx.type === 'income').length,
      totalAmount: transactions.reduce((sum, tx) => sum + tx.amount, 0),
      averageConfidence: transactions.reduce((sum, tx) => sum + tx.confidence, 0) / Math.max(1, transactions.length),
      categoryBreakdown: {},
      monthlyBreakdown: {}
    };
    
    // Category breakdown
    transactions.forEach(tx => {
      stats.categoryBreakdown[tx.category] = (stats.categoryBreakdown[tx.category] || 0) + tx.amount;
    });
    
    // Monthly breakdown
    transactions.forEach(tx => {
      const month = new Date(tx.transactionDate).toISOString().substring(0, 7);
      stats.monthlyBreakdown[month] = (stats.monthlyBreakdown[month] || 0) + tx.amount;
    });
    
    res.json(stats);
    
  } catch (error) {
    console.error('Error getting SMS stats:', error);
    res.status(500).json({ 
      error: 'Failed to get SMS statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;