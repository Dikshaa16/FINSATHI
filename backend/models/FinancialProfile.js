const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FinancialProfile = sequelize.define('FinancialProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  monthlyIncome: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  currentBalance: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  fixedExpenses: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  averageDailySpending: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  // Spending behavior metrics
  spendingConsistency: {
    type: DataTypes.DECIMAL(3, 2), // 0.00 to 1.00
    allowNull: false,
    defaultValue: 0.5
  },
  impulsiveness: {
    type: DataTypes.DECIMAL(3, 2), // 0.00 to 1.00
    allowNull: false,
    defaultValue: 0.3
  },
  savingsGoalAdherence: {
    type: DataTypes.DECIMAL(3, 2), // 0.00 to 1.00
    allowNull: false,
    defaultValue: 0.5
  },
  // Category discipline scores
  needsDiscipline: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 0.8
  },
  wantsDiscipline: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 0.6
  },
  savingsDiscipline: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 0.7
  },
  // Auto flow settings
  autoFlowEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  needsPercentage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 50
  },
  wantsPercentage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 30
  },
  savingsPercentage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 20
  },
  // Financial personality score
  personalityScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  personalityType: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'financial_profiles',
  timestamps: true
});

module.exports = FinancialProfile;