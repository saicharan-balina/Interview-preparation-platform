// server.js — Backend entry point.
//
// Responsibility: Initialize Express, connect MongoDB,
// mount API routes, and start the server.
//
// "This is the backend entry point. It initializes Express,
//  connects the database and mounts the API routes."

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { seedQuestions } = require('./services/questionService');

// Route modules
const practiceRoutes = require('./routes/practiceRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const { chat } = require('./controllers/chatController');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── MIDDLEWARE ──────────────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' })); // Allow large transcripts
app.use(express.urlencoded({ extended: true }));

// ─── ROUTES ─────────────────────────────────────────────────────────────────
app.use('/api/practice', practiceRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.post('/api/chat', chat);  // Floating study assistant

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler — prevents stack traces from reaching the client
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ─── STARTUP ─────────────────────────────────────────────────────────────────
const startServer = async () => {
  await connectDB();

  // Seed the question bank on first run (idempotent — checks before inserting)
  await seedQuestions();

  // Seed demo user if not exists
  try {
    const User = require('./models/User');
    const count = await User.countDocuments();
    if (count === 0) {
      await User.create({
        name: 'Demo User',
        targetRole: 'Software Engineer',
        preferredTopics: ['Java', 'DSA', 'DBMS']
      });
      console.log('✅ Demo user seeded');
    }
  } catch (e) {
    console.error('Demo user seed error:', e.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 API endpoints:`);
    console.log(`   GET  /api/health`);
    console.log(`   GET  /api/practice/questions`);
    console.log(`   POST /api/practice/submit`);
    console.log(`   GET  /api/interview/question`);
    console.log(`   POST /api/interview/submit`);
    console.log(`   GET  /api/interview/mock/questions`);
    console.log(`   POST /api/interview/mock/submit`);
    console.log(`   GET  /api/dashboard`);
    console.log(`   GET  /api/dashboard/profile`);
    console.log(`   PUT  /api/dashboard/profile`);
    console.log(`   GET  /api/dashboard/revision`);
  });
};

startServer();
