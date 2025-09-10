const express = require('express');
const fetch = require('node-fetch');
const auth = require('../middleware/auth');
const { Deposit } = require('../models');

const router = express.Router();
const COINBASE_API = 'https://api.commerce.coinbase.com/charges';
const API_KEY = process.env.COINBASE_COMMERCE_API_KEY;

router.post('/create-charge', auth, async (req, res) => {
  const { name, description, local_amount, local_currency='USD', asset } = req.body;
  // local_amount is a fiat amount; product pricing_type is fixed_price
  const body = {
    name: name || 'Deposit',
    description: description || `Deposit for user ${req.user.id}`,
    pricing_type: 'fixed_price',
    local_price: { amount: String(local_amount), currency: local_currency },
    metadata: { userId: String(req.user.id), purpose: 'deposit', asset: asset || 'BTC' }
  };

  const r = await fetch(COINBASE_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CC-Api-Key': API_KEY,
      'X-CC-Version': '2018-03-22'
    },
    body: JSON.stringify(body)
  });

  const data = await r.json();
  if (!r.ok) return res.status(400).json({ error: data });

  // store the charge id; later webhook will update deposits
  try {
    const chargeId = data.data && data.data.id;
    await Deposit.create({
      chargeId,
      asset: asset || 'BTC',
      status: 'created',
      UserId: req.user.id
    });
  } catch (err) { /* log but continue */ }

  res.json(data);
});

module.exports = router;
