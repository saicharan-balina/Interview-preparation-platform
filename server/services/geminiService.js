// geminiService.js — Core Gemini integration.
// Exports: evaluateAnswer, generateMCQQuestions, generateRevisionNotes

const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI;
const getClient = () => {
  if (!genAI) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI;
};

const MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.7-flash'
];

const generateWithFallback = async (prompt) => {
  let lastError;

  for (const modelName of MODELS) {
    try {
      console.log(`Trying ${modelName}...`);
      const model = getClient().getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      console.log(`Success with ${modelName}`);
      return result.response.text();
    } catch (error) {
      lastError = error;
      const status = error?.status || error?.response?.status;

      if (status === 429) {
        console.log(`${modelName} quota exhausted. Trying next model...`);
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error('All Gemini models are currently unavailable. Please try again later.');
};

// ─── ANSWER EVALUATION ──────────────────────────────────────────────────────
// Sends the interview question and candidate transcript to Gemini.
// Gemini is called from the backend so the API key never reaches the browser.
// Returns structured JSON so the frontend receives predictable scoring fields.

const evaluateAnswer = async (question, transcript, topic = 'General') => {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set');
  if (!transcript || transcript.trim().length < 5)
    throw new Error('Transcript is too short. Please provide a more complete answer.');

  const prompt = `
You are an expert technical interviewer evaluating a candidate's spoken answer.

INTERVIEW QUESTION (Topic: ${topic}):
"${question}"

CANDIDATE'S SPOKEN ANSWER (transcribed from speech):
"${transcript}"

Evaluate this answer and respond with ONLY a valid JSON object. No markdown, no backticks, no extra text.

{
  "overallScore": <number 0-10, one decimal>,
  "technicalAccuracy": <integer 0-10>,
  "completeness": <integer 0-10>,
  "clarity": <integer 0-10>,
  "relevance": <integer 0-10>,
  "strengths": [<1-3 specific strengths>],
  "missingConcepts": [<0-3 important gaps>],
  "corrections": [<0-3 factual corrections, empty if none>],
  "mentorFeedback": "<2-3 sentences of constructive feedback>",
  "improvedAnswer": "<A model answer in 3-4 sentences>",
  "followUpQuestion": "<One follow-up question>"
}

Scoring: technicalAccuracy=40%, completeness=25%, clarity=20%, relevance=15%.
Be constructive. This student is preparing for technical interviews.`.trim();

  try {
    const text = (await generateWithFallback(prompt)).trim()
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    return validateEvaluation(JSON.parse(text));
  } catch (err) {
    console.error('Gemini evaluateAnswer error:', err.message);
    if (err.message.includes('JSON') || err.message.includes('parse')) return getFallbackEvaluation(transcript);
    throw err;
  }
};

// ─── GENERATE MCQ QUESTIONS ─────────────────────────────────────────────────
// Generates fresh MCQ questions for any topic the user types.
// This makes the platform dynamic — not limited to the predefined question bank.

const generateMCQQuestions = async (topic, count = 5) => {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set');

  const prompt = `
You are a technical interview question generator.
Generate exactly ${count} multiple-choice questions about: "${topic}"

These should be suitable for software engineering interview preparation.
Mix difficulty: some conceptual, some practical.

Respond with ONLY valid JSON — no markdown, no backticks, no explanation.

{
  "topic": "${topic}",
  "questions": [
    {
      "question": "<clear, specific question>",
      "options": ["<option A>", "<option B>", "<option C>", "<option D>"],
      "correctAnswer": "<exact text of the correct option>",
      "explanation": "<2-3 sentence explanation of why it's correct>",
      "difficulty": "<easy|medium|hard>"
    }
  ]
}

Rules:
- Each question must have exactly 4 options
- correctAnswer must be the exact text of one of the options
- Make questions test real understanding, not just definitions
- Cover different aspects of the topic`.trim();

  try {
    const text = (await generateWithFallback(prompt)).trim()
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(text);

    // Validate structure
    if (!parsed.questions || !Array.isArray(parsed.questions)) throw new Error('Invalid structure');
    parsed.questions.forEach((q, i) => {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || !q.correctAnswer)
        throw new Error(`Question ${i + 1} missing required fields`);
      // Ensure correctAnswer is in options
      if (!q.options.includes(q.correctAnswer)) {
        q.correctAnswer = q.options[0]; // fallback
      }
    });

    return { topic: parsed.topic || topic, questions: parsed.questions };
  } catch (err) {
    console.error('generateMCQQuestions error:', err.message);
    throw new Error(`Failed to generate questions for "${topic}". ${err.message}`);
  }
};

// ─── GENERATE REVISION NOTES ────────────────────────────────────────────────
// Generates comprehensive interview revision notes for any topic.
// Real dynamic generation — not limited to the 5 hardcoded topics.

const generateRevisionNotes = async (topic) => {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set');

  const prompt = `
You are a technical interview preparation expert.
Generate comprehensive revision notes for: "${topic}"

Respond with ONLY valid JSON — no markdown formatting inside strings, no backticks.

{
  "topic": "${topic}",
  "sections": [
    {
      "title": "<section title>",
      "content": "<detailed content — use plain text, newlines for structure, bullet points with •>"
    }
  ],
  "commonQuestions": [
    "<common interview question 1>",
    "<common interview question 2>",
    "<common interview question 3>",
    "<common interview question 4>",
    "<common interview question 5>"
  ],
  "quickTips": [
    "<one-line interview tip>",
    "<one-line interview tip>",
    "<one-line interview tip>"
  ]
}

Requirements:
- Generate 4-6 sections covering the most important aspects
- Each section content should be detailed (5-10 bullet points)
- Use • for bullet points in content
- Common questions should be actual interview questions
- Quick tips should be memorable, practical advice
- Focus on what interviewers actually ask`.trim();

  try {
    const text = (await generateWithFallback(prompt)).trim()
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(text);
    if (!parsed.sections || !Array.isArray(parsed.sections)) throw new Error('Invalid structure');
    return parsed;
  } catch (err) {
    console.error('generateRevisionNotes error:', err.message);
    throw new Error(`Failed to generate revision notes for "${topic}". ${err.message}`);
  }
};

// ─── GENERATE INTERVIEW QUESTIONS ───────────────────────────────────────────
// Generates custom interview questions based on topic, optional JD/resume text, and count.

const generateInterviewQuestions = async (topic, context = '', count = 3, level = 'Intermediate', experience = 'Entry Level') => {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set');

  const prompt = `
You are a senior technical interviewer.
Generate exactly ${count} interview questions about the topic: "${topic}".

Target Candidate Profile:
- Difficulty Level: ${level} (e.g. Beginner means focus on core syntax, definitions and fundamental constructs; Intermediate means clean code, design patterns, testing; Advanced means architecture, concurrency, optimization, trade-offs)
- Role Experience: ${experience} (e.g. Intern, Junior Developer, Mid-Senior, Lead/Architect)

${context ? `Additional Context (Job Description / Resume):\n"${context}"\n` : ''}

Generate questions that are typical of real technical interviews matching this target profile. They should be open-ended and suitable for verbal explanation.

Respond with ONLY valid JSON — no markdown, no backticks, no extra text.

{
  "topic": "${topic}",
  "questions": [
    {
      "question": "<interview question text>"
    }
  ]
}
`.trim();

  try {
    const text = (await generateWithFallback(prompt)).trim()
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(text);

    if (!parsed.questions || !Array.isArray(parsed.questions)) throw new Error('Invalid structure');
    parsed.questions.forEach((q, i) => {
      if (!q.question) throw new Error(`Question ${i + 1} is missing question text`);
    });

    return { topic: parsed.topic || topic, questions: parsed.questions };
  } catch (err) {
    console.error('generateInterviewQuestions error:', err.message);
    throw new Error(`Failed to generate interview questions. ${err.message}`);
  }
};

// ─── HELPERS ────────────────────────────────────────────────────────────────
const validateEvaluation = (data) => {
  const d = {
    overallScore: 5, technicalAccuracy: 5, completeness: 5, clarity: 5, relevance: 5,
    strengths: ['Attempted the question'], missingConcepts: [], corrections: [],
    mentorFeedback: 'Keep practicing to improve your answer quality.',
    improvedAnswer: 'A complete answer would cover the core concepts with examples.',
    followUpQuestion: 'Can you elaborate further on this topic?',
    ...data
  };
  ['overallScore','technicalAccuracy','completeness','clarity','relevance'].forEach(f => {
    d[f] = Math.max(0, Math.min(10, Number(d[f]) || 5));
  });
  ['strengths','missingConcepts','corrections'].forEach(f => {
    if (!Array.isArray(d[f])) d[f] = [];
  });
  return d;
};

const getFallbackEvaluation = (transcript) => {
  const words = transcript.trim().split(/\s+/).length;
  const score = Math.min(6, Math.max(3, Math.floor(words / 15)));
  return {
    overallScore: score, technicalAccuracy: score, completeness: Math.max(3, score-1),
    clarity: score, relevance: score,
    strengths: ['You provided a spoken answer — keep practicing!'],
    missingConcepts: ['Could not fully analyze — please try again'],
    corrections: [],
    mentorFeedback: 'We had trouble analyzing your answer in detail. Your transcript was received. Please try submitting again.',
    improvedAnswer: 'A strong answer would clearly define the concept, provide an example, and explain the practical use case.',
    followUpQuestion: 'Can you explain this concept with a real-world example?'
  };
};

module.exports = {
  evaluateAnswer,
  generateMCQQuestions,
  generateRevisionNotes,
  generateInterviewQuestions,
  generateWithFallback
};

