const express = require('express');
const crypto = require('crypto');
const { Deposit, Balance } = require('../models');

const router = express.Router();
const SHARED_SECRET = process.env.COINBASE_COMMERCE_WEBHOOK_SHARED_SECRET;

// Note: body parser for this route was set to raw in index.js
router.post('/coinbase', async (req, res) => {
  const signature = req.headers['x-cc-webhook-signature'];
  const rawBody = req.body; // Buffer

  if (!signature || !SHARED_SECRET) return res.status(400).send('Missing signature or secret');

  const computed = crypto.createHmac('sha256', SHARED_SECRET).update(rawBody).digest('hex');
  if (!crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature))) {
    return res.status(400).send('Invalid signature');
  }

  // parse JSON now:
  let payload;
  try { payload = JSON.parse(rawBody.toString()); }
  catch (err) { return res.status(400).send('Invalid JSON'); }

  const event = payload.event || {};
  const type = event.type;
  const charge = event.data;

  // Example: charge:confirmed -> credit user after confirmations
  if (type === 'charge:confirmed' || type === 'charge:pending') {
    const chargeId = charge.id;
    const metadata = charge.metadata || {};
    const userId = metadata.userId;

    // update deposit
    await Deposit.update({ status: type }, { where: { chargeId } });

    // If confirmed, credit user's balance
    if (type === 'charge:confirmed') {
      // find how much in asset to credit.
      // Coinbase charge has payments array; sum amounts per crypto. Here we'll
      // look at 'pricing' or the 'payments' array to determine asset amount.
      const payments = charge.payments || [];
      // naive: take first payment and its value
      const payment = payments[0];
      if (payment) {
        const asset = payment.network || (payment.currency) || 'UNKNOWN';
        const amount = payment.value && payment.value.amount ? payment.value.amount : null;
        if (userId && amount) {
          // update/create balance row
          const [bal] = await Balance.findOrCreate({ where: { UserId: userId, asset }, defaults: { amount } });
          if (!bal.isNewRecord) {
            // add amounts safely (string decimal)
            const newAmount = (parseFloat(bal.amount) + parseFloat(amount)).toString();
            await bal.update({ amount: newAmount });
          }
        }
      }
    }
  }

  res.status(200).send('OK');
});

module.exports = router;
