const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false
});

const User = require('./user')(sequelize, DataTypes);
const Balance = require('./balance')(sequelize, DataTypes);
const Deposit = require('./deposit')(sequelize, DataTypes);
const Withdrawal = require('./withdrawal')(sequelize, DataTypes);

// relations
User.hasMany(Deposit);
Deposit.belongsTo(User);

User.hasMany(Withdrawal);
Withdrawal.belongsTo(User);

User.hasMany(Balance);
Balance.belongsTo(User);

module.exports = { sequelize, User, Balance, Deposit, Withdrawal };
