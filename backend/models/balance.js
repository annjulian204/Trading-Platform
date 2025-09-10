module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Balance', {
    asset: { type: DataTypes.STRING, allowNull: false }, // e.g., BTC, ETH, USDC
    amount: { type: DataTypes.DECIMAL(30, 10), allowNull: false, defaultValue: '0' }
  }, {
    indexes: [{ unique: true, fields: ['UserId', 'asset'] }]
  });
};
