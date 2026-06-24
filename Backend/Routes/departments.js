// ============================================================
// routes/departments.js
// GET  /api/departments        — public (operator can read)
// POST /api/departments        — admin only
// PUT  /api/departments/:id    — admin only
// DELETE /api/departments/:id  — admin only
// ============================================================
const express = require('express');
const { Department, Officer } = require('../models');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();
const uid = () => 'i' + Date.now() + Math.random().toString(36).slice(2, 5);

// GET all departments — public
router.get('/', async (req, res) => {
  try {
    const depts = await Department.find().sort({ createdAt: 1 });
    res.json(depts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch departments.' });
  }
});

// POST — admin only
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, hindi, icon } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ error: 'Department name is required.' });
    const dept = await Department.create({ _id: uid(), name: name.trim(), hindi: (hindi||'').trim(), icon: icon||'🏢' });
    res.status(201).json(dept);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create department.' });
  }
});

// PUT — admin only
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { name, hindi, icon } = req.body;
    const dept = await Department.findByIdAndUpdate(req.params.id, { name, hindi, icon }, { new: true });
    if (!dept) return res.status(404).json({ error: 'Department not found.' });
    res.json(dept);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update department.' });
  }
});

// DELETE — admin only
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    await Officer.deleteMany({ deptId: req.params.id });
    res.json({ message: 'Department and its officers deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete department.' });
  }
});

module.exports = router;