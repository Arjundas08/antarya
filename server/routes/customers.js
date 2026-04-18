const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const { authMiddleware } = require('../middleware');

const router = express.Router();
router.use(authMiddleware);

// GET /api/customers - All customers for shop
router.get('/', async (req, res) => {
  try {
    const customers = await db.customers.find({ shopId: req.shopId }).sort({ totalSpent: -1 });
    res.json(customers);
  } catch (err) {
    console.error('Get customers error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/customers - Add customer
router.post('/', async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name) return res.status(400).json({ error: 'Customer name is required' });

    const customer = new db.customers({
      id: uuidv4(),
      shopId: req.shopId,
      name,
      phone: phone || '',
      totalSpent: 0,
      totalCredit: 0,
      lastVisit: new Date()
    });

    await customer.save();
    res.status(201).json(customer);
  } catch (err) {
    console.error('Add customer error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/customers/:id
router.put('/:id', async (req, res) => {
  try {
    const customer = await db.customers.findOne({ id: req.params.id, shopId: req.shopId });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.phone !== undefined) updates.phone = req.body.phone;

    const updated = await db.customers.findOneAndUpdate(
      { id: req.params.id, shopId: req.shopId },
      { $set: updates },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error('Update customer error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/customers/:id/pay-credit - Customer pays udhaar
router.put('/:id/pay-credit', async (req, res) => {
  try {
    const customer = await db.customers.findOne({ id: req.params.id, shopId: req.shopId });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const amount = Number(req.body.amount) || 0;
    if (amount <= 0) return res.status(400).json({ error: 'Amount must be positive' });

    const newCredit = Math.max(0, (customer.totalCredit || 0) - amount);
    await db.customers.findOneAndUpdate(
      { id: req.params.id, shopId: req.shopId },
      { $set: { totalCredit: newCredit } }
    );

    res.json({ success: true, newCredit, amountReceived: amount });
  } catch (err) {
    console.error('Pay credit error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/customers/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.customers.findOneAndDelete({ id: req.params.id, shopId: req.shopId });
    if (!result) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Delete customer error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
