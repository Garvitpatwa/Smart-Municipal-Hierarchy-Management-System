// routes/levelnames.js
const express    = require('express');
const { LevelName } = require('../models');
const { requireAdmin } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// GET /api/levelnames  — return all level name records
router.get('/', async (req, res) => {
    try {
        const levelNames = await LevelName.find();
        res.json(levelNames);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/levelnames  — upsert (deptId + level) record
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { deptId, level, nameEn, nameHi, defaultDesig } = req.body;  // ← add defaultDesig

    if (!deptId || !level)
      return res.status(400).json({ error: 'deptId and level are required.' });

    const existing = await LevelName.findOne({ deptId, level: Number(level) });

    if (existing) {
      existing.nameEn = (nameEn || '').trim();
      existing.nameHi = (nameHi || '').trim();
      // Only overwrite defaultDesig if a non-empty value is sent
      if (defaultDesig !== undefined && defaultDesig !== null)
        existing.defaultDesig = String(defaultDesig).trim();
      await existing.save();
      return res.json(existing);
    }

    const record = new LevelName({
      _id:          uuidv4(),
      deptId,
      level:        Number(level),
      nameEn:       (nameEn  || '').trim(),
      nameHi:       (nameHi  || '').trim(),
      defaultDesig: (defaultDesig || '').trim()   // ← add defaultDesig
    });
    await record.save();
    res.status(201).json(record);

  } catch (err) {
    console.error('LevelName upsert error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;