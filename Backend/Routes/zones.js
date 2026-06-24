// ============================================================
// routes/zones.js
// GET    /api/zones        — public
// POST   /api/zones        — admin only
// PUT    /api/zones/:id    — admin only
// DELETE /api/zones/:id    — admin only
// ============================================================
const express = require('express');
const { Zone } = require('../models');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();
const uid = () => 'z' + Date.now() + Math.random().toString(36).slice(2, 5);

// GET all — public
router.get('/', async (req, res) => {
  try {
    const zones = await Zone.find().sort({ createdAt: 1 });
    res.json(zones);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch zones.' });
  }
});

// POST — admin only
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { zone, zoneHindi, wards, zonalOfficerName, zonalOfficerMobile } = req.body;
    if (!zone || !zone.trim() || !wards || !wards.length)
      return res.status(400).json({ error: 'Zone name and wards are required.' });

    // Check for ward conflicts
    const existing = await Zone.find();
    const allUsed = existing.flatMap(z => z.wards);
    const conflicts = wards.filter(w => allUsed.includes(w));
    if (conflicts.length)
      return res.status(400).json({ error: 'Wards already assigned: ' + conflicts.join(', ') });

    const doc = await Zone.create({
      _id: uid(), zone: zone.trim(), zoneHindi: (zoneHindi||'').trim(),
      wards, zonalOfficerName: (zonalOfficerName||'').trim(),
      zonalOfficerMobile: (zonalOfficerMobile||'').trim()
    });
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create zone.' });
  }
});

// PUT — admin only
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { zone, zoneHindi, wards, zonalOfficerName, zonalOfficerMobile } = req.body;
    if (!zone || !zone.trim() || !wards || !wards.length)
      return res.status(400).json({ error: 'Zone name and wards are required.' });

    // Ward conflict check (excluding self)
    const others = await Zone.find({ _id: { $ne: req.params.id } });
    const allUsed = others.flatMap(z => z.wards);
    const conflicts = wards.filter(w => allUsed.includes(w));
    if (conflicts.length)
      return res.status(400).json({ error: 'Wards already assigned: ' + conflicts.join(', ') });

    const doc = await Zone.findByIdAndUpdate(
      req.params.id,
      { zone: zone.trim(), zoneHindi: (zoneHindi||'').trim(), wards, zonalOfficerName: (zonalOfficerName||'').trim(), zonalOfficerMobile: (zonalOfficerMobile||'').trim() },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: 'Zone not found.' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update zone.' });
  }
});

// DELETE — admin only
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await Zone.findByIdAndDelete(req.params.id);
    res.json({ message: 'Zone deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete zone.' });
  }
});

module.exports = router;