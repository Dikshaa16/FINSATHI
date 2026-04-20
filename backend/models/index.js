const sequelize = require('../config/database');
const User = require('./User');
const FinancialProfile = require('./FinancialProfile');
const Transaction = require('./Transaction');
const Goal = require('./Goal');

// Define associations
User.hasOne(FinancialProfile, { 
  foreignKey: 'userId', 
  as: 'financialProfile',
  onDelete: 'CASCADE'
});
FinancialProfile.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

User.hasMany(Transaction, { 
  foreignKey: 'userId', 
  as: 'transactions',
  onDelete: 'CASCADE'
});
Transaction.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

User.hasMany(Goal, { 
  foreignKey: 'userId', 
  as: 'goals',
  onDelete: 'CASCADE'
});
Goal.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

module.exports = {
  sequelize,
  User,
  FinancialProfile,
  Transaction,
  Goal
};