module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Withdrawal', {
    asset: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.DECIMAL(30, 10), allowNull: false },
    toAddress: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'pending' } // pending, processing, completed, failed
  });
};
