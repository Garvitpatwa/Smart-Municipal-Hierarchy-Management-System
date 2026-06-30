// ============================================================
// db.js — MongoDB connection + initial admin seed
// ============================================================
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
    await seedAdmin();
    await seedDefaultData();
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
}

async function seedAdmin() {
  const { User } = require('./models');
  const exists = await User.findOne({ username: process.env.ADMIN_USERNAME || 'admin' });
  if (!exists) {
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@Jhansi#2024', 12);
    console.log("Password used for seed:", process.env.ADMIN_PASSWORD);
    await User.create({ username: process.env.ADMIN_USERNAME || 'admin', password: hash, role: 'admin' });
    console.log('✅ Admin user seeded — username:', process.env.ADMIN_USERNAME || 'admin');
  }
  const operatorExists = await User.findOne({
    username: 'operator'
  });
  
  if (!operatorExists) {
    const operatorHash = await bcrypt.hash('Operator@123', 12);
  
    await User.create({
      username: 'operator',
      password: operatorHash,
      role: 'operator'
    });
  
    console.log('✅ Operator user seeded');
  }
}



async function seedDefaultData() {
  const { Department, Zone } = require('./models');

  // Only seed if collections are empty
  const deptCount = await Department.countDocuments();
  if (deptCount === 0) {
    await Department.insertMany([
      { _id: 'd1', name: 'Tax Department',         hindi: 'कर विभाग',              icon: '🏛️' },
      { _id: 'd2', name: 'Health Department',      hindi: 'स्वास्थ्य विभाग',       icon: '🏥' },
      { _id: 'd3', name: 'Engineering Department', hindi: 'इंजीनियरिंग विभाग',    icon: '🔧' },
      { _id: 'd4', name: 'Water Department',       hindi: 'जल विभाग',             icon: '💧' },
    ]);
    console.log('✅ Default departments seeded');
  }

  const zoneCount = await Zone.countDocuments();
  if (zoneCount === 0) {
    await Zone.insertMany([
      { _id: 'z1', zone: 'Zone 1', zoneHindi: 'पिछोर',     wards: ['13','19','20','30','32','38','42','45','48','50','52','59','60'], zonalOfficerName: 'Gaurav Kumar', zonalOfficerMobile: '6394566084' },
      { _id: 'z2', zone: 'Zone 2', zoneHindi: 'हंसारी',    wards: ['01','03','05','06','07','09','10','12','15','22','24','25','26','28','29'], zonalOfficerName: 'Ritu Tanya',   zonalOfficerMobile: '8373975192' },
      { _id: 'z3', zone: 'Zone 3', zoneHindi: 'लहरगिर्द',  wards: ['08','34','36','37','40','43','44','46','47','49','51','53','55','56','57','58'], zonalOfficerName: 'CP Pandey',    zonalOfficerMobile: '8808053864' },
    ]);
    console.log('✅ Default zones seeded');
  }
}

module.exports = connectDB;