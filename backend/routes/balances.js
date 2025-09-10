const express = require('express');
const auth = require('../middleware/auth');
const { Balance } = require('../models');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  const balances = await Balance.findAll({ where: { UserId: req.user.id } });
  res.json(balances);
});

module.exports = router;
