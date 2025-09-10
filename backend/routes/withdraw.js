const express = require('express');
const auth = require('../middleware/auth');
const { Withdrawal, Balance } = require('../models');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  const { asset, amount, toAddress } = req.body;
  // basic checks
  if (!asset || !amount || !toAddress) return res.status(400).json({ error: 'Missing fields' });

  const bal = await Balance.findOne({ where: { UserId: req.user.id, asset } });
  if (!bal || parseFloat(bal.amount) < parseFloat(amount)) return res.status(400).json({ error: 'Insufficient balance' });

  // decrement balance immediately to avoid double spend (business decision)
  const newBal = (parseFloat(bal.amount) - parseFloat(amount)).toString();
  await bal.update({ amount: newBal });

  // create withdrawal request (status pending)
  const w = await Withdrawal.create({
    UserId: req.user.id,
    asset,
    amount,
    toAddress,
    status: 'pending'
  });

  // In production: push this request to a worker, or integrate with custodial API to send funds.
  res.json({ message: 'Withdrawal queued', withdrawalId: w.id });
});

module.exports = router;
