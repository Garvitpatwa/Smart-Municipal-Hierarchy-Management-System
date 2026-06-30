// ============================================================
// routes/auth.js — Login / token refresh
// ============================================================
const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { User } = require('../models');
const { requireAdmin, requireAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'Username and password are required.' });

    const user = await User.findOne({ username: username.toLowerCase().trim() });
    if (!user)
      return res.status(401).json({ error: 'Invalid credentials.' });

    const valid = await bcrypt.compare(password, user.password);

    if (!valid)
      return res.status(401).json({ error: 'Invalid credentials.' });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({ token, username: user.username, role: user.role, expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// POST /api/auth/change-password  (admin only)
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: 'Both fields are required.' });
    if (newPassword.length < 8)
      return res.status(400).json({ error: 'New password must be at least 8 characters.' });

    const user = await User.findById(req.user.id);
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid)
      return res.status(401).json({ error: 'Current password is incorrect.' });

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/auth/change-operator-password  (admin only)
router.post('/change-operator-password', requireAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: 'Both fields are required.' });

    if (newPassword.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });

    // Always targets the single operator account
    const operator = await User.findOne({ role: 'operator' });
    if (!operator)
      return res.status(404).json({ error: 'Operator account not found.' });

    const valid = await bcrypt.compare(currentPassword, operator.password);
    if (!valid)
      return res.status(401).json({ error: 'Current password is incorrect.' });

    operator.password = await bcrypt.hash(newPassword, 12);
    await operator.save();

    res.json({ message: 'Operator password updated successfully.' });
  } catch (err) {
    console.error('Change operator password error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/auth/verify  — verify token validity
router.get('/verify', requireAdmin, (req, res) => {
  res.json({ valid: true, username: req.user.username, role: req.user.role });
});

module.exports = router;