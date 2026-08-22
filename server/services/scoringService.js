// scoringService.js
// All scoring formulas live here — transparent and explainable.
// No scores are calculated inside React components or MongoDB queries.

/**
 * MCQ accuracy formula:
 * Accuracy = Correct Answers / Total Questions × 100
 */
const calculateMCQAccuracy = (correctAnswers, totalQuestions) => {
  if (!totalQuestions || totalQuestions === 0) return 0;
  return Math.round((correctAnswers / totalQuestions) * 100);
};

/**
 * Interview score weighting:
 * Technical Accuracy = 40%
 * Completeness       = 25%
 * Clarity            = 20%
 * Relevance          = 15%
 *
 * Technical correctness receives the highest weight
 * because the primary goal is technical interview preparation.
 * Communication quality (clarity, relevance) is also rewarded
 * since interviews assess both knowledge and explanation ability.
 *
 * All Gemini scores are out of 10; result is normalized to 0–100.
 */
const calculateInterviewScore = (metrics) => {
  const { technicalAccuracy = 0, completeness = 0, clarity = 0, relevance = 0 } = metrics;
  const raw =
    technicalAccuracy * 0.40 +
    completeness      * 0.25 +
    clarity           * 0.20 +
    relevance         * 0.15;
  // Gemini scores on 0–10 scale; convert to 0–100
  return Math.round(raw * 10);
};

/**
 * Overall preparation score combines:
 * Practice performance = 40%
 * Interview performance = 60%
 */
const calculateOverallScore = (practiceAvg, interviewAvg) => {
  const score =
    (practiceAvg  || 0) * 0.40 +
    (interviewAvg || 0) * 0.60;
  return Math.round(score);
};

/**
 * Simple average of an array of numbers.
 * Used to aggregate scores across multiple attempts.
 */
const average = (arr) => {
  if (!arr || arr.length === 0) return 0;
  return Math.round(arr.reduce((s, v) => s + v, 0) / arr.length);
};

module.exports = { calculateMCQAccuracy, calculateInterviewScore, calculateOverallScore, average };
