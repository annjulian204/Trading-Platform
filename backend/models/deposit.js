module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Deposit', {
    chargeId: { type: DataTypes.STRING, allowNull: false, unique: true }, // coinbase charge id
    asset: { type: DataTypes.STRING },
    amount: { type: DataTypes.DECIMAL(30, 10) },
    status: { type: DataTypes.STRING } // created, pending, confirmed, failed
  });
};
