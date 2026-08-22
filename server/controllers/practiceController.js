// practiceController.js
// Handles MCQ practice flow:
//   Request → Get Questions → Submit Answers → Score → Save Attempt → Return Result

const { getQuestions } = require('../services/questionService');
const { calculateMCQAccuracy } = require('../services/scoringService');
const { generateMCQQuestions } = require('../services/geminiService');
const Attempt = require('../models/Attempt');

/**
 * GET /api/practice/questions?topic=Java&count=5
 * Returns shuffled MCQ questions for the selected topic.
 * Correct answers are NOT sent to the frontend to prevent cheating.
 */
const getPracticeQuestions = async (req, res) => {
  try {
    const { topic = 'Java', count = 5 } = req.query;
    const questions = await getQuestions(topic, parseInt(count));

    if (!questions || questions.length === 0) {
      return res.status(404).json({ error: `No questions found for topic: ${topic}` });
    }

    // Strip correct answers before sending to frontend
    const safeQuestions = questions.map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      topic: q.topic,
      difficulty: q.difficulty
    }));

    res.json({ questions: safeQuestions, total: safeQuestions.length });
  } catch (err) {
    console.error('getPracticeQuestions error:', err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

/**
 * POST /api/practice/submit
 * Body: { topic, userId, answers: [{ questionId, selectedAnswer }] }
 * Checks each answer against DB, calculates accuracy, saves attempt.
 */
const submitPractice = async (req, res) => {
  try {
    const { topic, userId = 'demo', answers = [] } = req.body;

    if (!answers.length) {
      return res.status(400).json({ error: 'No answers submitted' });
    }

    // Fetch original questions to check correctness
    const Question = require('../models/Question');
    const questionIds = answers.map(a => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } }).lean();

    const questionMap = {};
    questions.forEach(q => { questionMap[q._id.toString()] = q; });

    // Check each answer
    let correctCount = 0;
    const checkedAnswers = answers.map(a => {
      const original = questionMap[a.questionId];
      const isCorrect = original && original.correctAnswer === a.selectedAnswer;
      if (isCorrect) correctCount++;
      return {
        questionId: a.questionId,
        selected: a.selectedAnswer,
        correct: isCorrect,
        correctAnswer: original?.correctAnswer,
        explanation: original?.explanation,
        question: original?.question
      };
    });

    // Calculate score using scoringService formula
    const score = calculateMCQAccuracy(correctCount, answers.length);

    // Save attempt to MongoDB
    const attempt = new Attempt({
      userId,
      type: 'practice',
      topic,
      score,
      correctAnswers: correctCount,
      totalQuestions: answers.length,
      answers: checkedAnswers.map(a => ({
        questionId: a.questionId,
        selected: a.selected,
        correct: a.correct
      }))
    });
    await attempt.save();

    res.json({
      score,
      correctAnswers: correctCount,
      totalQuestions: answers.length,
      checkedAnswers,
      attemptId: attempt._id
    });
  } catch (err) {
    console.error('submitPractice error:', err);
    res.status(500).json({ error: 'Failed to submit practice attempt' });
  }
};

module.exports = { getPracticeQuestions, submitPractice, generateAIQuestions };

/**
 * POST /api/practice/generate
 * Body: { topic, count }
 * Uses Gemini to generate fresh MCQ questions for any user-typed topic.
 */
async function generateAIQuestions(req, res) {
  try {
    const { topic, count = 5 } = req.body;
    if (!topic || !topic.trim()) return res.status(400).json({ error: 'Topic is required' });
    const data = await generateMCQQuestions(topic.trim(), parseInt(count));

    const Question = require('../models/Question');
    const questionsToSave = data.questions.map(q => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty || 'medium',
      topic: data.topic,
      type: 'mcq'
    }));
    const savedDocs = await Question.insertMany(questionsToSave);

    res.json({ questions: savedDocs, topic: data.topic, aiGenerated: true });
  } catch (err) {
    console.error('generateAIQuestions error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate questions' });
  }
}
