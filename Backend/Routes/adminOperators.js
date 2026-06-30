// ============================================================
// routes/adminOperators.js
// Admin-only: list operators & change an operator's password
// ============================================================
const express = require('express');
const bcrypt  = require('bcryptjs');
const { User } = require('../models');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/operators
// Returns all operator accounts (id, username, role — no password hash)
router.get('/operators', requireAdmin, async (req, res) => {
  try {
    const operators = await User.find({ role: 'operator' })
      .select('_id username role createdAt')
      .sort({ username: 1 });
    res.json(operators);
  } catch (err) {
    console.error('List operators error:', err);
    res.status(500).json({ error: 'Server error fetching operators.' });
  }
});

// PUT /api/admin/operators/:id/password
// Admin sets a new password for an operator (no old-password check needed)
router.put('/operators/:id/password', requireAdmin, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || typeof password !== 'string')
      return res.status(400).json({ error: 'Password is required.' });

    if (password.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });

    const operator = await User.findById(req.params.id);
    if (!operator)
      return res.status(404).json({ error: 'Operator not found.' });

    if (operator.role !== 'operator')
      return res.status(403).json({ error: 'Target account is not an operator.' });

    operator.password = await bcrypt.hash(password, 12);
    await operator.save();

    res.json({ message: 'Operator password updated successfully.' });
  } catch (err) {
    console.error('Change operator password error:', err);
    res.status(500).json({ error: 'Server error updating password.' });
  }
});

module.exports = router;