// ============================================================
// routes/officers.js
// GET    /api/officers              — public
// GET    /api/officers?deptId=xxx   — public (filtered)
// POST   /api/officers              — admin only
// PUT    /api/officers/:id          — admin only
// DELETE /api/officers/:id          — admin only
// ============================================================
const express = require('express');
const { Officer } = require('../models');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();
const uid = () => 'i' + Date.now() + Math.random().toString(36).slice(2, 5);

// GET — public
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.deptId) filter.deptId = req.query.deptId;
    const officers = await Officer.find(filter).sort({ level: 1, createdAt: 1 });
    res.json(officers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch officers.' });
  }
});

// POST — admin only
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { deptId, level, name, mobile, desig, wards, supIds, isZonal } = req.body;
    if (!deptId || !level)
      return res.status(400).json({ error: 'deptId and level are required.' });
    if (!isZonal && (!name || !name.trim()))
      return res.status(400).json({ error: 'Officer name is required.' });

    const officer = await Officer.create({
      _id: uid(), deptId, level: Number(level),
      name: (name||'').trim(), mobile: (mobile||'').trim(),
      desig: (desig||'').trim(), wards: wards||[], supIds: supIds||[],
      isZonal: !!isZonal
    });
    res.status(201).json(officer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create officer.' });
  }
});

// PUT — admin only
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { level, name, mobile, desig, wards, supIds, isZonal } = req.body;
    const officer = await Officer.findByIdAndUpdate(
      req.params.id,
      { level: Number(level), name: (name||'').trim(), mobile: (mobile||'').trim(),
        desig: (desig||'').trim(), wards: wards||[], supIds: supIds||[], isZonal: !!isZonal },
      { new: true }
    );
    if (!officer) return res.status(404).json({ error: 'Officer not found.' });
    res.json(officer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update officer.' });
  }
});

// DELETE — admin only
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await Officer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Officer deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete officer.' });
  }
});

module.exports = router;