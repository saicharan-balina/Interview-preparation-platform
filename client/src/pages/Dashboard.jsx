import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard } from '../services/api';
import ScoreCard from '../components/ScoreCard';

const topicColors = {
  Java: '#4f46e5', DSA: '#6366f1', DBMS: '#10b981',
  'Operating Systems': '#f59e0b', 'Computer Networks': '#ef4444'
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAllActivity, setShowAllActivity] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const result = await getDashboard();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="loading-state">
      <div className="loading-spinner" />
      <p>Loading dashboard...</p>
    </div>
  );

  if (error) return (
    <div className="fade-in">
      <div className="alert alert-error">{error}. Make sure MongoDB and backend server are running.</div>
      <button className="btn btn-primary" onClick={fetchDashboard}>Retry</button>
    </div>
  );

  const isEmpty = !data || data.counts?.total === 0;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">
          Welcome back, {data?.user?.name ? data.user.name.split(' ')[0] : 'User'} 👋
        </h1>
        <p className="page-subtitle">
          {data?.user?.targetRole ? `Here is your preparation overview for ${data.user.targetRole}` : 'Your preparation overview'}
        </p>
      </div>

      {/* ── Top Stats ── */}
      <div className="grid-4" style={{ marginBottom: 'var(--sp-5)' }}>
        <div className="stat-card">
          <div>
            <div className="stat-number">{data?.overallScore ?? 0}</div>
            <div className="stat-label">Overall Score</div>
          </div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-number">{data?.counts?.practice ?? 0}</div>
            <div className="stat-label">Practice Sessions</div>
          </div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-number">{data?.counts?.interview ?? 0}</div>
            <div className="stat-label">Interview Sessions</div>
          </div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-number">{data?.bestScore ?? 0}</div>
            <div className="stat-label">Best Score</div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 'var(--sp-5)' }}>
        {/* ── Score Breakdown ── */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: 'var(--sp-5)' }}>Score Breakdown</h3>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--sp-4)', padding: 'var(--sp-4) 0' }}>
            <ScoreCard score={data?.practiceAvg ?? 0} label="Practice" size={160} />
            <ScoreCard score={data?.interviewAvg ?? 0} label="Interviews" size={160} />
          </div>
        </div>

        {/* ── Weak Topics + CTA ── */}
        <div className="card">
          <h3 style={{ marginBottom: 'var(--sp-3)' }}>Weak Topics</h3>
          {data?.weakTopics?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', marginBottom: 'var(--sp-4)' }}>
              {data.weakTopics.map(topic => (
                <div key={topic} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: 500 }}>{topic}</span>
                  <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                    <button className="btn btn-sm btn-outline"
                      onClick={() => navigate('/practice', { state: { topic } })}>
                      Practice
                    </button>
                    <button className="btn btn-sm btn-secondary"
                      onClick={() => navigate('/revision', { state: { topic } })}>
                      Revise
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 'var(--sp-6)' }}>
              <p>{isEmpty ? 'Complete sessions to populate weak topics.' : 'Performance is optimal across all topics.'}</p>
            </div>
          )}

          <div className="divider" />
          <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/interview')}>
              Start Interview
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/practice')}>
              Practice MCQ
            </button>
          </div>
        </div>
      </div>

      {/* ── Topic Performance ── */}
      <div className="card" style={{ marginBottom: 'var(--sp-5)' }}>
        <h3 style={{ marginBottom: 'var(--sp-4)' }}>Topic Performance</h3>
        {data?.topicPerformance?.map(tp => (
          <div key={tp.topic} style={{ marginBottom: 'var(--sp-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-2)' }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{tp.topic}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {tp.averageScore}% · {tp.attempts} session{tp.attempts !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="progress-bar-container">
              <div
                className={`progress-bar`}
                style={{ width: `${tp.averageScore || (tp.attempts > 0 ? 5 : 0)}%`, background: topicColors[tp.topic] || 'var(--accent)' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent Activity ── */}
      <div className="card" style={{ marginBottom: 'var(--sp-6)' }}>
        <h3 style={{ marginBottom: 'var(--sp-4)' }}>Recent Activity</h3>
        {data?.recentActivity?.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            {(showAllActivity ? data.recentActivity : data.recentActivity.slice(0, 3)).map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', padding: '10px 14px', borderRadius: 'var(--r-md)', background: 'var(--bg-app)', border: '1px solid var(--border)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {a.type.charAt(0).toUpperCase() + a.type.slice(1)} — {a.topic}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(a.date).toLocaleDateString()} {new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <span style={{
                  fontWeight: 700, fontSize: '0.9rem',
                  color: a.score >= 80 ? 'var(--green)' : a.score >= 60 ? 'var(--accent)' : 'var(--red)'
                }}>
                  {a.score}%
                </span>
              </div>
            ))}
            {data.recentActivity.length > 3 && (
              <button 
                className="btn btn-secondary btn-sm" 
                style={{ marginTop: 'var(--sp-3)', alignSelf: 'flex-start' }}
                onClick={() => setShowAllActivity(!showAllActivity)}
              >
                {showAllActivity ? 'View Less' : 'View More'}
              </button>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No activity records</h3>
            <p>Your practice and interview sessions will be listed here.</p>
            <button className="btn btn-primary" onClick={() => navigate('/practice')} style={{ marginTop: 'var(--sp-3)' }}>
              Start Practicing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
