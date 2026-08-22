// chatController.js — Handles the floating study assistant chat.
// Uses Gemini to answer interview-preparation questions in context.

const { generateWithFallback } = require('../services/geminiService');

/**
 * POST /api/chat
 * Body: { question, history: [{ role, content }] }
 *
 * Sends the student's question to Gemini with a tutor system prompt.
 * Returns a concise, helpful answer focused on interview preparation.
 */
const chat = async (req, res) => {
  try {
    const { question, history = [] } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }

    // Build context from recent history (last 6 messages)
    const historyText = history.slice(-6).map(m =>
      `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`
    ).join('\n');

    const prompt = `You are a helpful, concise technical interview tutor.
The student is preparing for software engineering interviews.
Topics: Java, Data Structures & Algorithms, DBMS, Operating Systems, Computer Networks.

${historyText ? `Recent conversation:\n${historyText}\n\n` : ''}Student question: ${question}

Reply in 2-4 short paragraphs. Be clear and direct. Use simple examples where helpful.
Do NOT use markdown formatting like **bold** or ## headers — plain text only.`.trim();

    const answer = (await generateWithFallback(prompt)).trim();

    res.json({ answer });
  } catch (err) {
    console.error('chat error:', err.message);
    res.status(500).json({
      error: 'Failed to get answer',
      answer: 'I had trouble answering that. Please try again in a moment.'
    });
  }
};

module.exports = { chat };
