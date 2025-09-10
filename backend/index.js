require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const balanceRoutes = require('./routes/balances');
const depositRoutes = require('./routes/deposit');
const webhookRoutes = require('./routes/webhook');
const withdrawRoutes = require('./routes/withdraw');

const app = express();
app.use(cors());
// Need raw body for webhook signature verification
app.use('/api/webhook/coinbase', bodyParser.raw({ type: '*/*' }));
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/balances', balanceRoutes);
app.use('/api/deposit', depositRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/withdraw', withdrawRoutes);

const PORT = process.env.PORT || 3001;
(async () => {
  await sequelize.sync({ alter: true }); // in dev; use migrations in prod
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();
