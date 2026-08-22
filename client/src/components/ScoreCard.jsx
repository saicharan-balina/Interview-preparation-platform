// ScoreCard.jsx — Reusable circular score display component.
// Accepts a score (0–100), label, and optional color variant.

const getColor = (score) => {
  if (score >= 80) return { stroke: '#10b981', ring: '#10b981' };
  if (score >= 60) return { stroke: '#4f8ef7', ring: '#4f8ef7' };
  if (score >= 40) return { stroke: '#f59e0b', ring: '#f59e0b' };
  return { stroke: '#ef4444', ring: '#ef4444' };
};

export default function ScoreCard({ score = 0, label = 'Score', size = 100, showLabel = true }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const normalized = Math.min(100, Math.max(0, score));
  const offset = circumference - (normalized / 100) * circumference;
  const { stroke } = getColor(normalized);

  return (
    <div className="score-ring-wrap">
      <div className="score-ring" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 100 100">
          <circle className="score-ring-bg" cx="50" cy="50" r={radius} />
          <circle
            className="score-ring-fill"
            cx="50" cy="50" r={radius}
            stroke={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="score-ring-text" style={{ fontSize: `${size / 70}rem` }}>
          {normalized}
          <span className="score-ring-label" style={{ fontSize: `${size / 180}rem` }}>/ 100</span>
        </div>
      </div>
      {showLabel && (
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          {label}
        </div>
      )}
    </div>
  );
}
