// QuestionCard.jsx — Renders a single MCQ question with selectable options.
// Handles both "answering" state and "review" state (after submit).

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelect,
  reviewData = null, // null during quiz, populated after submit
  disabled = false
}) {
  const getOptionClass = (option) => {
    let cls = 'option-btn';
    if (reviewData) {
      // Review mode: show correct/incorrect
      if (option === reviewData.correctAnswer) cls += ' correct';
      else if (option === selectedAnswer && option !== reviewData.correctAnswer) cls += ' incorrect';
    } else {
      // Quiz mode: show selection
      if (option === selectedAnswer) cls += ' selected';
    }
    return cls;
  };

  return (
    <div className="card fade-in" style={{ marginBottom: 'var(--space-6)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        <span className="q-badge">{questionNumber}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Question {questionNumber} of {totalQuestions}
            {question.difficulty && (
              <span className={`badge badge-${question.difficulty === 'easy' ? 'green' : question.difficulty === 'hard' ? 'red' : 'yellow'}`}
                style={{ marginLeft: '8px' }}>
                {question.difficulty}
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1rem', lineHeight: 1.6 }}>
            {question.question}
          </p>
        </div>
      </div>

      <div>
        {question.options.map((option, idx) => (
          <button
            key={idx}
            className={getOptionClass(option)}
            onClick={() => !disabled && !reviewData && onSelect(option)}
            disabled={disabled || !!reviewData}
          >
            <span style={{ color: 'var(--text-muted)', marginRight: '10px', fontWeight: 600 }}>
              {String.fromCharCode(65 + idx)}.
            </span>
            {option}
          </button>
        ))}
      </div>

      {/* Explanation shown after submit */}
      {reviewData && question.explanation && (
        <div className="alert alert-info" style={{ marginTop: 'var(--space-4)', marginBottom: 0 }}>
          <span>💡</span>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Explanation</div>
            {question.explanation}
          </div>
        </div>
      )}
    </div>
  );
}
