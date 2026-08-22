const mongoose = require('mongoose');

// User stores basic profile information.
// No complex authentication — a demo user is seeded on first run.
const UserSchema = new mongoose.Schema({
  name: { type: String, default: 'Demo User' },
  targetRole: { type: String, default: 'Software Engineer' },
  preferredTopics: {
    type: [String],
    default: ['Java', 'DSA', 'DBMS']
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
