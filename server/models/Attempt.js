const mongoose = require('mongoose');

// Attempt stores every practice and interview result.
// MongoDB stores attempts so dashboard statistics
// can be calculated across multiple sessions.
const AttemptSchema = new mongoose.Schema({
  userId: { type: String, default: 'demo' },
  type: {
    type: String,
    enum: ['practice', 'interview', 'mock'],
    required: true
  },
  topic: { type: String, required: true },
  score: { type: Number },   // Final calculated score (0–100)

  // MCQ practice fields
  correctAnswers: { type: Number },
  totalQuestions: { type: Number },
  answers: [{ questionId: String, selected: String, correct: Boolean }],

  // Interview / mock fields — populated from Gemini evaluation
  metrics: {
    technicalAccuracy: Number,
    completeness: Number,
    clarity: Number,
    relevance: Number,
    overallScore: Number
  },
  transcript: { type: String },
  question: { type: String },
  feedback: {
    strengths: [String],
    missingConcepts: [String],
    corrections: [String],
    mentorFeedback: String,
    improvedAnswer: String,
    followUpQuestion: String
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attempt', AttemptSchema);
