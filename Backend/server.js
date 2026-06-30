// ============================================================
// server.js — Express entry point
// ============================================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db');

const app = express();

// ── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── API Routes ───────────────────────────────────────────────
app.use('/api/auth', require('./Routes/auth'));
app.use('/api/departments', require('./Routes/departments'));
app.use('/api/zones', require('./Routes/zones'));
app.use('/api/officers', require('./Routes/officers'));
app.use('/api/levelnames', require('./Routes/levelnames'));
app.use('/api/admin', require('./Routes/adminOperators'));

// ── Frontend ─────────────────────────────────────────────────
const frontendPath = path.join(__dirname, '../Frontend');

// Login page
app.use('/', express.static(path.join(frontendPath, 'login')));

app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'login', 'index.html'));
});

// Admin
app.use('/admin', express.static(path.join(frontendPath, 'admin')));

app.get('/admin', (req, res) => {
    res.sendFile(path.join(frontendPath, 'admin', 'index.html'));
});

// Operator
app.use('/operator', express.static(path.join(frontendPath, 'operator')));

app.get('/operator', (req, res) => {
    res.sendFile(path.join(frontendPath, 'operator', 'index.html'));
});

// ── Start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 HMS Server running on http://localhost:${PORT}`);
    });
});