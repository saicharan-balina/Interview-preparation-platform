// interviewController.js
// Coordinates the interview API flow:
//
//   Question + Transcript
//         ↓
//   interviewController.js
//         ↓
//   geminiService.js → Gemini API
//         ↓
//   scoringService.js → Final Score
//         ↓
//   Save Attempt → Return Result

const { evaluateAnswer, generateInterviewQuestions } = require('../services/geminiService');
const { calculateInterviewScore } = require('../services/scoringService');
const { getInterviewQuestions } = require('../services/questionService');
const Attempt = require('../models/Attempt');

/**
 * GET /api/interview/question?topic=Java
 * Returns a single interview question for the topic.
 */
const getInterviewQuestion = async (req, res) => {
  try {
    const { topic = 'Java' } = req.query;
    const questions = await getInterviewQuestions(topic, 1);

    if (!questions || questions.length === 0) {
      // Fallback question if topic has none
      return res.json({
        question: {
          _id: 'fallback',
          question: `Explain the core concepts of ${topic} and how you would apply them in a real project.`,
          topic,
          type: 'interview'
        }
      });
    }

    res.json({ question: questions[0] });
  } catch (err) {
    console.error('getInterviewQuestion error:', err);
    res.status(500).json({ error: 'Failed to fetch interview question' });
  }
};

/**
 * POST /api/interview/submit
 * Body: { question, transcript, topic, userId }
 *
 * Full flow:
 * 1. Validate transcript exists
 * 2. Send to Gemini for evaluation (geminiService)
 * 3. Calculate weighted score (scoringService)
 * 4. Save attempt to MongoDB
 * 5. Return complete evaluation to frontend
 */
const submitInterviewAnswer = async (req, res) => {
  try {
    const { question, transcript, topic = 'General', userId = 'demo' } = req.body;

    if (!transcript || transcript.trim().length < 5) {
      return res.status(400).json({ error: 'Please provide a more complete answer before submitting.' });
    }

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Step 1: Get Gemini evaluation
    const evaluation = await evaluateAnswer(question, transcript, topic);

    // Step 2: Calculate final score using scoringService
    // The camera is used only for the interview experience.
    // Evaluation is based on the spoken response transcript.
    const score = calculateInterviewScore({
      technicalAccuracy: evaluation.technicalAccuracy,
      completeness: evaluation.completeness,
      clarity: evaluation.clarity,
      relevance: evaluation.relevance
    });

    // Step 3: Save to MongoDB
    const attempt = new Attempt({
      userId,
      type: 'interview',
      topic,
      score,
      question,
      transcript,
      metrics: {
        technicalAccuracy: evaluation.technicalAccuracy,
        completeness: evaluation.completeness,
        clarity: evaluation.clarity,
        relevance: evaluation.relevance,
        overallScore: evaluation.overallScore
      },
      feedback: {
        strengths: evaluation.strengths,
        missingConcepts: evaluation.missingConcepts,
        corrections: evaluation.corrections,
        mentorFeedback: evaluation.mentorFeedback,
        improvedAnswer: evaluation.improvedAnswer,
        followUpQuestion: evaluation.followUpQuestion
      }
    });
    await attempt.save();

    // Step 4: Return full result to frontend
    res.json({
      score,
      evaluation,
      attemptId: attempt._id,
      topic
    });
  } catch (err) {
    console.error('submitInterviewAnswer error:', err);
    const message = err.message.includes('API_KEY')
      ? 'Gemini API key not configured. Please set GEMINI_API_KEY in .env'
      : err.message || 'Failed to evaluate interview answer';
    res.status(500).json({ error: message });
  }
};

/**
 * GET /api/interview/mock/questions?topic=Java&count=3
 * Returns multiple interview questions for a mock interview session.
 */
const getMockQuestions = async (req, res) => {
  try {
    const { topic = 'Java', count = 3 } = req.query;
    const questions = await getInterviewQuestions(topic, parseInt(count));

    // If not enough questions, pad with a generic question
    const padded = [...questions];
    while (padded.length < parseInt(count)) {
      padded.push({
        _id: `generic_${padded.length}`,
        question: `Describe a challenging problem you solved using ${topic} concepts and what approach you took.`,
        topic,
        type: 'interview'
      });
    }

    res.json({ questions: padded, topic });
  } catch (err) {
    console.error('getMockQuestions error:', err);
    res.status(500).json({ error: 'Failed to fetch mock interview questions' });
  }
};

/**
 * POST /api/interview/mock/submit
 * Body: { topic, userId, answers: [{ question, transcript }] }
 *
 * Evaluates each answer via Gemini, aggregates scores, saves one mock attempt.
 */
const submitMockInterview = async (req, res) => {
  try {
    const { topic = 'General', userId = 'demo', answers = [] } = req.body;

    if (!answers.length) {
      return res.status(400).json({ error: 'No answers submitted' });
    }

    // Evaluate each answer via Gemini
    const evaluations = [];
    for (const ans of answers) {
      try {
        const evaluation = await evaluateAnswer(ans.question, ans.transcript || 'No answer provided', topic);
        const score = calculateInterviewScore({
          technicalAccuracy: evaluation.technicalAccuracy,
          completeness: evaluation.completeness,
          clarity: evaluation.clarity,
          relevance: evaluation.relevance
        });
        evaluations.push({ question: ans.question, transcript: ans.transcript, evaluation, score });
      } catch (e) {
        // If one evaluation fails, continue with others
        evaluations.push({
          question: ans.question,
          transcript: ans.transcript,
          evaluation: null,
          score: 0,
          error: e.message
        });
      }
    }

    // Calculate aggregate score
    const validScores = evaluations.filter(e => e.score > 0).map(e => e.score);
    const avgScore = validScores.length
      ? Math.round(validScores.reduce((s, v) => s + v, 0) / validScores.length)
      : 0;

    // Save as interview attempt
    const attempt = new Attempt({
      userId,
      type: 'interview',
      topic,
      score: avgScore,
      feedback: {
        mentorFeedback: `Mock interview completed. ${validScores.length}/${answers.length} answers evaluated successfully.`
      }
    });
    await attempt.save();

    res.json({
      overallScore: avgScore,
      evaluations,
      attemptId: attempt._id,
      topic,
      totalQuestions: answers.length,
      evaluated: validScores.length
    });
  } catch (err) {
    console.error('submitMockInterview error:', err);
    res.status(500).json({ error: 'Failed to process mock interview' });
  }
};

module.exports = { getInterviewQuestion, submitInterviewAnswer, getMockQuestions, submitMockInterview, generateAIInterview };

/**
 * POST /api/interview/generate
 * Body: { topic, context, count }
 * Generates custom interview questions based on topic/JD/resume.
 */
async function generateAIInterview(req, res) {
  try {
    const { topic, context = '', count = 3, level = 'Intermediate', experience = 'Entry Level' } = req.body;
    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const data = await generateInterviewQuestions(topic.trim(), context.trim(), parseInt(count), level, experience);
    
    // Assign temp IDs for frontend mapping
    const questions = data.questions.map((q, i) => ({
      _id: `ai_int_${Date.now()}_${i}`,
      question: q.question,
      topic: data.topic,
      type: 'interview'
    }));

    res.json({ questions, topic: data.topic });
  } catch (err) {
    console.error('generateAIInterview error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate interview questions' });
  }
}

