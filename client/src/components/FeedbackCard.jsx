// FeedbackCard.jsx — Renders all sections of a Gemini interview evaluation.
// Receives the full evaluation object and displays each section clearly.

export default function FeedbackCard({ evaluation }) {
  if (!evaluation) return null;

  const {
    strengths = [],
    missingConcepts = [],
    corrections = [],
    mentorFeedback,
    improvedAnswer,
    followUpQuestion
  } = evaluation;

  return (
    <div className="fade-in">
      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="feedback-section">
          <div className="feedback-section-title green">✅ Strengths</div>
          <ul className="feedback-list green">
            {strengths.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}

      {/* Missing Concepts */}
      {missingConcepts.length > 0 && (
        <div className="feedback-section">
          <div className="feedback-section-title yellow">⚠️ Missing Concepts</div>
          <ul className="feedback-list yellow">
            {missingConcepts.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </div>
      )}

      {/* Corrections */}
      {corrections.length > 0 && (
        <div className="feedback-section">
          <div className="feedback-section-title red">🔧 Corrections Needed</div>
          <ul className="feedback-list red">
            {corrections.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      )}

      {/* Mentor Feedback */}
      {mentorFeedback && (
        <div className="feedback-section">
          <div className="feedback-section-title blue">🎓 Mentor Feedback</div>
          <div style={{
            background: 'rgba(79,142,247,0.06)',
            border: '1px solid rgba(79,142,247,0.15)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            color: 'var(--text-secondary)',
            fontSize: '0.92rem',
            lineHeight: 1.8,
            fontStyle: 'italic'
          }}>
            "{mentorFeedback}"
          </div>
        </div>
      )}

      {/* Improved Answer */}
      {improvedAnswer && (
        <div className="feedback-section">
          <div className="feedback-section-title green">💡 Model Answer</div>
          <div className="improved-answer-box">{improvedAnswer}</div>
        </div>
      )}

      {/* Follow-up Question */}
      {followUpQuestion && (
        <div className="followup-box">
          <span className="followup-icon">🤔</span>
          <div>
            <div className="followup-label">Follow-up Question</div>
            <div className="followup-text">{followUpQuestion}</div>
          </div>
        </div>
      )}
    </div>
  );
}
