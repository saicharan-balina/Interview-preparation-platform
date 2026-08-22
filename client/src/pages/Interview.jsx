import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getInterviewQuestion, getMockQuestions,
  generateAIInterview, submitInterviewAnswer, submitMockInterview
} from '../services/api';
import InterviewRecorder from '../components/InterviewRecorder';

const TOPICS = ['Java', 'DSA', 'DBMS', 'Operating Systems', 'Computer Networks'];

export default function Interview() {
  const location = useLocation();
  const navigate = useNavigate();

  const [phase, setPhase] = useState('setup'); // setup | recording | submitting
  const [selectedTopic, setSelectedTopic] = useState(location.state?.topic || 'Java');
  const [customTopic, setCustomTopic] = useState('');
  const [context, setContext] = useState(''); // pasted JD or Resume
  const [questionCount, setQuestionCount] = useState(3);
  const [difficultyLevel, setDifficultyLevel] = useState('Intermediate');
  const [experienceLevel, setExperienceLevel] = useState('Entry Level');
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [answers, setAnswers] = useState([]); // Array of { question, transcript }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [, setRecorderReady] = useState(false);

  const startInterview = async () => {
    try {
      setLoading(true);
      setError('');
      
      const topicToLoad = customTopic.trim() ? customTopic.trim() : selectedTopic;
      let loadedQuestions = [];

      // Determine if we need dynamic generation or presets
      if (customTopic.trim() || context.trim() || difficultyLevel !== 'Intermediate' || experienceLevel !== 'Entry Level') {
        const data = await generateAIInterview(topicToLoad, context.trim(), questionCount, difficultyLevel, experienceLevel);
        loadedQuestions = data.questions;
        setSelectedTopic(data.topic);
      } else {
        // Preset topic
        if (questionCount === 1) {
          const data = await getInterviewQuestion(topicToLoad);
          loadedQuestions = [data.question];
        } else {
          const data = await getMockQuestions(topicToLoad, questionCount);
          loadedQuestions = data.questions;
        }
      }

      if (!loadedQuestions || loadedQuestions.length === 0) {
        throw new Error('No questions could be generated. Please try again.');
      }

      setQuestions(loadedQuestions);
      setCurrentIndex(0);
      setTranscript('');
      setAnswers([]);
      setPhase('recording');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!transcript.trim()) {
      setError('Please provide or speak your answer before continuing.');
      return;
    }

    const currentQuestionText = questions[currentIndex].question;
    const updatedAnswers = [...answers, { question: currentQuestionText, transcript }];
    setAnswers(updatedAnswers);
    setTranscript('');
    setError('');

    const nextIdx = currentIndex + 1;
    if (nextIdx < questions.length) {
      setCurrentIndex(nextIdx);
    } else {
      submitAll(updatedAnswers);
    }
  };

  const submitAll = async (finalAnswers) => {
    try {
      setPhase('submitting');
      setError('');

      if (finalAnswers.length === 1) {
        // Single question flow
        const result = await submitInterviewAnswer({
          question: finalAnswers[0].question,
          transcript: finalAnswers[0].transcript,
          topic: selectedTopic,
          userId: 'demo'
        });
        navigate('/results', {
          state: {
            result,
            question: finalAnswers[0].question,
            topic: selectedTopic,
            type: 'interview'
          }
        });
      } else {
        // Multi-question mock flow
        const result = await submitMockInterview({
          topic: selectedTopic,
          userId: 'demo',
          answers: finalAnswers
        });
        navigate('/results', {
          state: {
            result,
            topic: selectedTopic,
            type: 'mock'
          }
        });
      }
    } catch (err) {
      setError(err.message);
      setPhase('recording');
    }
  };

  // ── PHASE: Setup ─────────────────────────────────────────────────────────
  if (phase === 'setup') return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Interview Practice</h1>
        <p className="page-subtitle">Configure your mock session, paste a Job Description, or choose a topic to practice speaking your answers.</p>
      </div>

      <div className="grid-2" style={{ gap: 'var(--sp-5)', alignItems: 'stretch' }}>
        {/* Left Side: Topic & Count Selectors */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ marginBottom: 'var(--sp-5)', fontSize: '1.1rem', fontWeight: 700 }}>Session Setup</h3>

            <div className="form-group" style={{ marginBottom: 'var(--sp-4)' }}>
              <label className="form-label">Preset Topic</label>
              <div className="topic-chips" style={{ marginTop: 'var(--sp-2)' }}>
                {TOPICS.map(t => (
                  <button
                    key={t}
                    className={`topic-chip ${selectedTopic === t && !customTopic ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedTopic(t);
                      setCustomTopic('');
                    }}
                    type="button"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--sp-4)' }}>
              <label className="form-label">Or Custom Topic Concept</label>
              <input
                className="form-input"
                placeholder="E.g., System Design, Microservices, React Hooks"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
              />
            </div>

            <div className="grid-2" style={{ gap: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
              <div className="form-group">
                <label className="form-label">Difficulty Level</label>
                <select
                  className="form-select"
                  value={difficultyLevel}
                  onChange={(e) => setDifficultyLevel(e.target.value)}
                >
                  <option value="Beginner">Beginner (Core Syntax/Basics)</option>
                  <option value="Intermediate">Intermediate (Clean Code/Design)</option>
                  <option value="Advanced">Advanced (Architecture/Optimization)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Role Experience</label>
                <select
                  className="form-select"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                >
                  <option value="Intern">Intern</option>
                  <option value="Entry Level">Entry Level (Junior)</option>
                  <option value="Mid-Senior">Mid-Senior</option>
                  <option value="Lead/Architect">Lead / Architect</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--sp-5)' }}>
              <label className="form-label">Number of Questions</label>
              <select
                className="form-select"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              >
                <option value={1}>1 Question (Quick Practice)</option>
                <option value={3}>3 Questions (Standard Interview)</option>
                <option value={5}>5 Questions (Comprehensive Mock)</option>
              </select>
            </div>
          </div>

          <div>
            {error && <div className="alert alert-error" style={{ marginBottom: 'var(--sp-4)' }}>{error}</div>}

            <button
              className="btn btn-primary btn-lg"
              onClick={startInterview}
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Preparing Session...' : 'Start Interview Session'}
            </button>
          </div>
        </div>

        {/* Right Side: Resume or JD paste */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ marginBottom: 'var(--sp-2)', fontSize: '1.1rem', fontWeight: 700 }}>Tailor with Job Description / Resume</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--sp-4)', fontSize: '0.82rem', lineHeight: 1.5 }}>
              Paste the company job description or your personal resume content below. The system will parse the requirements to generate highly customized interview questions mapping to this profile.
            </p>
          </div>

          <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <label className="form-label" style={{ marginBottom: '6px' }}>Context Details (Optional)</label>
            <textarea
              className="form-textarea"
              placeholder="Paste company job requirements, tech stack details, or your resume bullet points here..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={9}
              style={{ flex: 1, minHeight: '200px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // ── PHASE: Recording ─────────────────────────────────────────────────────
  if (phase === 'recording') {
    const currentQuestion = questions[currentIndex];
    const isLastQuestion = currentIndex === questions.length - 1;

    return (
      <div className="fade-in">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div>
              <h1 className="page-title">Interview Practice</h1>
              <p className="page-subtitle">{selectedTopic} · {difficultyLevel} · {experienceLevel}</p>
            </div>
            {questions.length > 1 && (
              <div style={{ display: 'flex', gap: 6 }}>
                {questions.map((_, i) => (
                  <div key={i} className={`step-dot ${i < currentIndex ? 'done' : i === currentIndex ? 'active' : ''}`} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid-2" style={{ alignItems: 'start', gap: 'var(--sp-6)' }}>
          {/* Left: Camera + Recorder Wrapper with neat dashboard layout */}
          <div className="card" style={{ padding: 'var(--sp-5)' }}>
            <h4 style={{ marginBottom: 'var(--sp-4)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Interview Camera Stream</h4>
            <InterviewRecorder
              key={currentIndex} // Reset recorder state on each question transition
              question={currentQuestion?.question}
              onTranscriptChange={setTranscript}
              onReady={() => setRecorderReady(true)}
            />
          </div>

          {/* Right: Question + Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            {/* Question Card with highlight left accent */}
            <div className="card" style={{ borderLeft: '4px solid var(--accent)', padding: 'var(--sp-5)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 'var(--sp-2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Question {currentIndex + 1} of {questions.length}
              </div>
              <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {currentQuestion?.question}
              </p>
            </div>

            {/* Transcript Preview & Manual Text Input Area */}
            <div className="card" style={{ padding: 'var(--sp-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-2)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Your Answer</span>
                <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>Speech & Typing Supported</span>
              </div>
              <textarea
                className="form-textarea"
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
                placeholder="Speak your response clearly or type your complete answer directly here..."
                rows={8}
                style={{ fontSize: '0.88rem', lineHeight: 1.6, minHeight: '160px', padding: '12px' }}
              />
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {/* Actions Card with navigation indicators */}
            <div className="card" style={{ padding: 'var(--sp-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
                <button
                  className="btn btn-primary"
                  onClick={handleNext}
                  disabled={loading}
                  style={{ flex: 1, minWidth: '160px' }}
                >
                  {isLastQuestion ? 'Submit Entire Interview' : 'Save & Next Question'}
                </button>
                <button className="btn btn-secondary" onClick={() => {
                  if (window.confirm('Are you sure you want to cancel the session? All progress will be lost.')) {
                    setPhase('setup');
                  }
                }} style={{ minWidth: '100px' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── PHASE: Submitting ────────────────────────────────────────────────────
  if (phase === 'submitting') return (
    <div className="loading-state" style={{ minHeight: '60vh' }}>
      <div className="loading-spinner" />
      <h2>Evaluating Session...</h2>
      <p>AI is assessing technical correctness, completeness, clarity and relevance of your answers.</p>
    </div>
  );

  return null;
}
