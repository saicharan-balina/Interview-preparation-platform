// api.js — Central frontend API communication layer.
//
// ALL API calls go through this file.
// React components call these functions, NOT raw fetch().
// This makes the API architecture easy to explain and maintain.

const BASE_URL = 'http://localhost:5000/api';

// Generic request helper with error handling
const request = async (method, path, body = null) => {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `API error: ${res.status}`);
  }
  return data;
};

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
export const getDashboard = () => request('GET', '/dashboard');
export const getProfile = () => request('GET', '/dashboard/profile');
export const updateProfile = (data) => request('PUT', '/dashboard/profile', data);
export const getRevisionNotes = (topic) => request('GET', `/dashboard/revision?topic=${encodeURIComponent(topic)}`);
export const generateAIRevisionNotes = (topic) => request('POST', `/dashboard/revision/generate`, { topic });

// ─── PRACTICE (MCQ) ──────────────────────────────────────────────────────────
export const getPracticeQuestions = (topic, count = 5) =>
  request('GET', `/practice/questions?topic=${encodeURIComponent(topic)}&count=${count}`);

export const generatePracticeQuestions = (topic, count = 5) =>
  request('POST', `/practice/generate`, { topic, count });

export const submitPractice = (data) => request('POST', '/practice/submit', data);

// ─── INTERVIEW ───────────────────────────────────────────────────────────────
export const getInterviewQuestion = (topic) =>
  request('GET', `/interview/question?topic=${encodeURIComponent(topic)}`);

export const generateAIInterview = (topic, context = '', count = 3, level = 'Intermediate', experience = 'Entry Level') =>
  request('POST', `/interview/generate`, { topic, context, count, level, experience });

export const submitInterviewAnswer = (data) => request('POST', '/interview/submit', data);

// ─── MOCK INTERVIEW ──────────────────────────────────────────────────────────
export const getMockQuestions = (topic, count = 3) =>
  request('GET', `/interview/mock/questions?topic=${encodeURIComponent(topic)}&count=${count}`);

export const submitMockInterview = (data) => request('POST', '/interview/mock/submit', data);

// ─── CHAT (Floating Assistant) ───────────────────────────────────────────────
// Sends a question and short message history to Gemini via the backend.
export const askChatQuestion = (question, history = []) =>
  request('POST', '/chat', { question, history });

// ─── HEALTH ──────────────────────────────────────────────────────────────────
export const checkHealth = () => request('GET', '/health');
