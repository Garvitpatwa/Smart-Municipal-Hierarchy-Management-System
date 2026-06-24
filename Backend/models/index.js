// ============================================================
// models/index.js — All Mongoose models for HMS
// ============================================================
const mongoose = require('mongoose');

// ── User (Admin only) ────────────────────────────────────────
const userSchema = new mongoose.Schema({
  username:  { type: String, required: true, unique: true, trim: true, lowercase: true },
  password:  { type: String, required: true },           // bcrypt hash
  role:      { type: String, enum: ['admin'], default: 'admin' },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// ── Department ───────────────────────────────────────────────
const deptSchema = new mongoose.Schema({
  _id:   { type: String, required: true },               // keep same id format as frontend (d1, uid...)
  name:  { type: String, required: true, trim: true },
  hindi: { type: String, trim: true, default: '' },
  icon:  { type: String, default: '🏢' }
}, { _id: false });
deptSchema.set('_id', true);
const Department = mongoose.model('Department', new mongoose.Schema({
  _id:   { type: String, required: true },
  name:  { type: String, required: true, trim: true },
  hindi: { type: String, trim: true, default: '' },
  icon:  { type: String, default: '🏢' }
}, { timestamps: true }));

// ── Zone ─────────────────────────────────────────────────────
const Zone = mongoose.model('Zone', new mongoose.Schema({
  _id:                 { type: String, required: true },
  zone:                { type: String, required: true, trim: true },
  zoneHindi:           { type: String, default: '' },
  wards:               [{ type: String }],
  zonalOfficerName:    { type: String, default: '' },
  zonalOfficerMobile:  { type: String, default: '' }
}, { timestamps: true }));

// ── Officer ──────────────────────────────────────────────────
const Officer = mongoose.model('Officer', new mongoose.Schema({
  _id:     { type: String, required: true },
  deptId:  { type: String, required: true, index: true },
  level:   { type: Number, required: true, min: 1 },
  name:    { type: String, default: '' },
  mobile:  { type: String, default: '' },
  desig:   { type: String, default: '' },
  wards:   [{ type: String }],
  supIds:  [{ type: String }],
  isZonal: { type: Boolean, default: false }
}, { timestamps: true }));

module.exports = { User, Department, Zone, Officer };