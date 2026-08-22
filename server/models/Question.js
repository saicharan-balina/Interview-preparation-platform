const mongoose = require('mongoose');

// Question stores MCQ and interview questions.
// The question bank is predefined in questionService.js
// and seeded into MongoDB on first run.
const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [String],              // For MCQ questions
  correctAnswer: { type: String }, // For MCQ validation
  explanation: { type: String },   // Shown after MCQ answer
  topic: {
    type: String,
    enum: ['Java', 'DSA', 'DBMS', 'Operating Systems', 'Computer Networks'],
    required: true
  },
  type: {
    type: String,
    enum: ['mcq', 'interview'],
    default: 'mcq'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
});

module.exports = mongoose.model('Question', QuestionSchema);
