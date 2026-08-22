// MongoDB connection — single responsibility file.
// server.js calls connectDB() once on startup.
// All models use this shared connection automatically via Mongoose.

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/interview_platform';
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected:', uri);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1); // Exit so the dev knows the DB is down
  }
};

module.exports = connectDB;
