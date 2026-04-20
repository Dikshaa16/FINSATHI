const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Goal = sequelize.define('Goal', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  targetAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  currentAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  targetDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    allowNull: false,
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'paused', 'cancelled'),
    allowNull: false,
    defaultValue: 'active'
  },
  emoji: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Simulation results
  simulationResults: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  successProbability: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  monthlyRequired: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  riskLevel: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    allowNull: true
  }
}, {
  tableName: 'goals',
  timestamps: true,
  indexes: [
    {
      fields: ['userId', 'status']
    },
    {
      fields: ['targetDate']
    }
  ]
});

module.exports = Goal;