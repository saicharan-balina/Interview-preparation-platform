import { useLocation, useNavigate } from 'react-router-dom';
import ScoreCard from '../components/ScoreCard';
import FeedbackCard from '../components/FeedbackCard';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();

  const { result, question, topic, type } = location.state || {};

  if (!result) {
    return (
      <div className="fade-in">
        <div className="empty-state" style={{ minHeight: '60vh' }}>
          <h3>No results to display</h3>
          <p>Complete an interview to see your evaluation here</p>
          <button className="btn btn-primary" onClick={() => navigate('/interview')}>
            Start Interview
          </button>
        </div>
      </div>
    );
  }

  const isMock = type === 'mock';
  const evaluation = result.evaluation || {};
  const score = result.score || result.overallScore || 0;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">
          {isMock ? 'Mock Interview Results' : 'Interview Results'}
        </h1>
        <p className="page-subtitle">{topic}</p>
      </div>

      {/* ── Overall Score ── */}
      <div className="card" style={{ marginBottom: 'var(--sp-6)', display: 'flex', alignItems: 'center', gap: 'var(--sp-8)', flexWrap: 'wrap' }}>
        <ScoreCard score={score} label="Overall Score" size={120} />
        <div style={{ flex: 1 }}>
          <h2 style={{ marginBottom: 'var(--sp-2)' }}>
            {score >= 80 ? 'Outstanding Performance!' :
             score >= 65 ? 'Good Answer!' :
             score >= 50 ? 'Room to Improve' : 'Keep Practicing!'}
          </h2>
          {question && !isMock && (
            <div style={{ marginBottom: 'var(--sp-3)', padding: 'var(--sp-3)', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: '0.88rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              Question: "{question}"
            </div>
          )}
          {isMock && (
            <p style={{ marginBottom: 'var(--sp-3)', color: 'var(--text-muted)' }}>
              Evaluated {result.evaluated} of {result.totalQuestions} questions.
            </p>
          )}
        </div>
      </div>

      {/* ── Metric Breakdown (single interview only) ── */}
      {!isMock && evaluation.technicalAccuracy !== undefined && (
        <div className="card" style={{ marginBottom: 'var(--sp-6)' }}>
          <h3 style={{ marginBottom: 'var(--sp-4)' }}>Score Breakdown</h3>

          <div style={{ display: 'flex', gap: 'var(--sp-4)', flexWrap: 'wrap', justifyContent: 'space-around' }}>
            <ScoreCard score={Math.round((evaluation.technicalAccuracy || 0) * 10)} label="Technical" size={80} />
            <ScoreCard score={Math.round((evaluation.completeness || 0) * 10)} label="Completeness" size={80} />
            <ScoreCard score={Math.round((evaluation.clarity || 0) * 10)} label="Clarity" size={80} />
            <ScoreCard score={Math.round((evaluation.relevance || 0) * 10)} label="Relevance" size={80} />
          </div>
        </div>
      )}

      {/* ── Feedback (single interview) ── */}
      {!isMock && (
        <div className="card" style={{ marginBottom: 'var(--sp-6)' }}>
          <h3 style={{ marginBottom: 'var(--sp-5)' }}>Detailed Feedback</h3>
          <FeedbackCard evaluation={evaluation} />
        </div>
      )}

      {/* ── Mock: per-question results ── */}
      {isMock && result.evaluations?.length > 0 && (
        <div style={{ marginBottom: 'var(--sp-6)' }}>
          <h3 style={{ marginBottom: 'var(--sp-4)' }}>Per-Question Breakdown</h3>
          {result.evaluations.map((ev, idx) => (
            <div key={idx} className="card" style={{ marginBottom: 'var(--sp-4)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
                <ScoreCard score={ev.score || 0} label={`Q${idx + 1}`} size={70} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--sp-2)', fontSize: '0.95rem' }}>
                    {ev.question}
                  </p>
                  {ev.transcript && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 'var(--sp-3)' }}>
                      "{ev.transcript.slice(0, 200)}{ev.transcript.length > 200 ? '...' : ''}"
                    </div>
                  )}
                  {ev.evaluation && (
                    <div style={{ marginTop: 'var(--sp-3)' }}>
                      <FeedbackCard evaluation={ev.evaluation} />
                    </div>
                  )}
                  {ev.error && (
                    <div className="alert alert-warning" style={{ marginTop: 'var(--sp-2)' }}>
                      Could not evaluate this answer: {ev.error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Action Buttons ── */}
      <div className="card">
        <h4 style={{ marginBottom: 'var(--sp-4)' }}>What's Next?</h4>
        <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/interview', { state: { topic } })}>
            Try Again
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/practice', { state: { topic } })}>
            Practice Weak Areas
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/revision', { state: { topic } })}>
            Revision Notes
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
