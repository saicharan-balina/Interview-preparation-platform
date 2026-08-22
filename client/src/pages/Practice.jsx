import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPracticeQuestions, generatePracticeQuestions, submitPractice } from '../services/api';
import QuestionCard from '../components/QuestionCard';
import ScoreCard from '../components/ScoreCard';

const TOPICS = ['Java', 'DSA', 'DBMS', 'Operating Systems', 'Computer Networks'];

export default function Practice() {
  const location = useLocation();
  const navigate = useNavigate();

  const [phase, setPhase] = useState('select'); // select | quiz | result
  const [selectedTopic, setSelectedTopic] = useState(location.state?.topic || 'Java');
  const [customTopic, setCustomTopic] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { questionId: selectedAnswer }
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAiGenerated, setIsAiGenerated] = useState(false);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError('');
      
      const topicToLoad = customTopic.trim() ? customTopic.trim() : selectedTopic;
      let data;
      
      if (customTopic.trim()) {
        data = await generatePracticeQuestions(topicToLoad, 5);
        setIsAiGenerated(true);
        setSelectedTopic(data.topic);
      } else {
        data = await getPracticeQuestions(topicToLoad, 5);
        setIsAiGenerated(false);
      }
      
      setQuestions(data.questions);
      setAnswers({});
      setPhase('quiz');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length) {
      const confirmSubmit = window.confirm(`You've only answered ${answeredCount}/${questions.length} questions. Submit anyway?`);
      if (!confirmSubmit) return;
    }

    try {
      setLoading(true);
      setError('');
      const payload = {
        topic: selectedTopic,
        userId: 'demo',
        answers: questions.map(q => ({
          questionId: q._id,
          selectedAnswer: answers[q._id] || ''
        }))
      };
      const data = await submitPractice(payload);
      setResult(data);
      setPhase('result');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPhase('select');
    setQuestions([]);
    setAnswers({});
    setResult(null);
    setCustomTopic('');
    setError('');
  };

  // ── PHASE: Topic Selection ──────────────────────────────────────────────
  if (phase === 'select') return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Practice</h1>
        <p className="page-subtitle">Select a topic or type in a custom concept to generate fresh AI questions.</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: 'var(--sp-4)' }}>Select Preset Topic</h3>
          <div className="topic-chips" style={{ marginBottom: 'var(--sp-6)' }}>
            {TOPICS.map(t => (
              <button
                key={t}
                className={`topic-chip ${selectedTopic === t && !customTopic ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedTopic(t);
                  setCustomTopic('');
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--sp-6)' }}>
            <label className="form-label">Or generate a custom topic with AI</label>
            <input
              className="form-input"
              placeholder="E.g., System Design, React Hooks, REST APIs, Cryptography"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
            />
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: 'var(--sp-4)' }}>{error}</div>}

          <button
            className="btn btn-primary btn-lg"
            onClick={loadQuestions}
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Generating dynamic quiz...' : 'Start Practice Session'}
          </button>

          <div style={{ marginTop: 'var(--sp-4)', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            5 questions · Multiple choice · Live feedback
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: 'var(--accent-soft)', border: 'none' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: 'var(--sp-6)' }}>Master Any Topic with AI</h2>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
            <li style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'flex-start' }}>
              <div style={{ padding: '10px', background: 'white', borderRadius: '50%', color: 'var(--accent)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '45px', height: '45px', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>🧠</div>
              <div>
                <strong style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>Dynamic Generation</strong>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Enter any custom topic and our AI will instantly generate a tailored, challenging quiz specifically for you.</p>
              </div>
            </li>
            <li style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'flex-start' }}>
              <div style={{ padding: '10px', background: 'white', borderRadius: '50%', color: 'var(--accent)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '45px', height: '45px', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>⚡</div>
              <div>
                <strong style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>Live Feedback</strong>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Get immediate scores and detailed AI-driven explanations to understand exactly where you went wrong.</p>
              </div>
            </li>
            <li style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'flex-start' }}>
              <div style={{ padding: '10px', background: 'white', borderRadius: '50%', color: 'var(--accent)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '45px', height: '45px', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>📈</div>
              <div>
                <strong style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>Track Progress</strong>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Every session contributes to your overall preparation score and identifies your weak topics on the dashboard.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  // ── PHASE: Quiz ──────────────────────────────────────────────────────────
  if (phase === 'quiz') {
    const answeredCount = Object.keys(answers).length;
    const progress = (answeredCount / questions.length) * 100;

    return (
      <div className="fade-in">
        <div className="page-header">
          <h1 className="page-title">Practice: {selectedTopic}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginTop: 'var(--sp-2)' }}>
            <div className="progress-bar-container" style={{ flex: 1, maxWidth: 300 }}>
              <div className="progress-bar green" style={{ width: `${progress}%` }} />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {answeredCount} / {questions.length} answered {isAiGenerated && '(AI-generated)'}
            </span>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {questions.map((q, idx) => (
          <QuestionCard
            key={q._id}
            question={q}
            questionNumber={idx + 1}
            totalQuestions={questions.length}
            selectedAnswer={answers[q._id]}
            onSelect={(ans) => setAnswers(prev => ({ ...prev, [q._id]: ans }))}
          />
        ))}

        <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', marginTop: 'var(--sp-5)' }}>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Answers'}
          </button>
          <button className="btn btn-secondary" onClick={reset}>
            Back
          </button>
        </div>
      </div>
    );
  }

  // ── PHASE: Result ────────────────────────────────────────────────────────
  if (phase === 'result') {
    const { score, correctAnswers, totalQuestions, checkedAnswers } = result;
    const questionMap = {};
    questions.forEach(q => { questionMap[q._id] = q; });

    return (
      <div className="fade-in">
        <div className="page-header">
          <h1 className="page-title">Practice Result</h1>
          <p className="page-subtitle">{selectedTopic}</p>
        </div>

        {/* Score Summary */}
        <div className="card" style={{ marginBottom: 'var(--sp-6)', display: 'flex', alignItems: 'center', gap: 'var(--sp-8)', flexWrap: 'wrap' }}>
          <ScoreCard score={score} label="Your Score" size={110} />
          <div>
            <h2 style={{ marginBottom: 'var(--sp-2)' }}>
              {score >= 80 ? 'Excellent!' : score >= 60 ? 'Good job!' : score >= 40 ? 'Room to improve' : 'Keep trying'}
            </h2>
            <p style={{ marginBottom: 'var(--sp-4)', color: 'var(--text-muted)' }}>
              You got {correctAnswers} out of {totalQuestions} correct.
            </p>
            <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={reset}>Practice Again</button>
              <button className="btn btn-secondary" onClick={() => navigate('/interview', { state: { topic: selectedTopic } })}>
                Try Interview
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/revision', { state: { topic: selectedTopic } })}>
                Revision Notes
              </button>
            </div>
          </div>
        </div>

        {/* Question Review */}
        <h3 style={{ marginBottom: 'var(--sp-4)' }}>Answer Review</h3>
        {checkedAnswers?.map((ca, idx) => {
          const q = questionMap[ca.questionId] || {
            question: ca.question || 'Question',
            options: [],
            explanation: ca.explanation || ''
          };
          const enriched = { ...q, explanation: ca.explanation };
          return (
            <QuestionCard
              key={idx}
              question={enriched}
              questionNumber={idx + 1}
              totalQuestions={totalQuestions}
              selectedAnswer={ca.selected}
              reviewData={{ correctAnswer: ca.correctAnswer }}
              disabled
            />
          );
        })}
      </div>
    );
  }
}
