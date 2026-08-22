import { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../services/api';
import ScoreCard from '../components/ScoreCard';

const TOPICS = ['Java', 'DSA', 'DBMS', 'Operating Systems', 'Computer Networks'];

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', targetRole: '', preferredTopics: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfile(data);
      setForm({
        name: data.name || 'Demo User',
        targetRole: data.targetRole || 'Software Engineer',
        preferredTopics: data.preferredTopics || []
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      await updateProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      setIsEditing(false); // Hide edit form after saving
      loadProfile(); // Refresh profile state
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleTopic = (topic) => {
    setForm(prev => ({
      ...prev,
      preferredTopics: prev.preferredTopics.includes(topic)
        ? prev.preferredTopics.filter(t => t !== topic)
        : [...prev.preferredTopics, topic]
    }));
  };

  if (loading) return (
    <div className="loading-state"><div className="loading-spinner" /><p>Loading profile...</p></div>
  );

  const stats = profile?.stats || {};

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Your preparation profile and performance stats</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: 'var(--sp-6)' }}>
        {/* Left Panel: Profile Summary & Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          {/* Avatar / Name Card */}
          <div className="card" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(90deg, var(--accent-light), var(--accent))' }} />
            <img 
              src="https://api.dicebear.com/7.x/adventurer/svg?seed=FacePrep" 
              alt="Avatar"
              style={{
                width: 110,
                height: 110,
                borderRadius: '50%',
                border: '4px solid var(--bg-card)',
                background: 'var(--bg-app)',
                margin: '30px auto var(--sp-4)',
                position: 'relative',
                display: 'block',
                objectFit: 'cover'
              }}
            />
            <h2 style={{ marginBottom: 4, color: 'var(--text-primary)' }}>{form.name || 'Demo User'}</h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>{form.targetRole}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 'var(--sp-5)', flexWrap: 'wrap' }}>
              {form.preferredTopics.length > 0 ? form.preferredTopics.map(t => (
                <span key={t} className="badge badge-blue" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>{t}</span>
              )) : <span style={{ fontSize: '0.85rem', color: 'var(--text-faint)' }}>No topics selected</span>}
            </div>
          </div>

          {/* Performance Stats */}
          <div className="card">
            <h3 style={{ marginBottom: 'var(--sp-5)' }}>Performance Stats</h3>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 'var(--sp-6)' }}>
              <ScoreCard score={stats.averageScore || 0} label="Avg Score" size={110} />
              <ScoreCard score={stats.bestScore || 0} label="Best Score" size={110} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              {[
                { label: 'Total Sessions', value: stats.totalSessions || 0 },
                { label: 'Interview Sessions', value: stats.mockInterviews || 0 },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Account Settings */}
        <div className="card" style={{ height: '100%' }}>
          <h3 style={{ marginBottom: 'var(--sp-5)' }}>Account Settings</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Role</label>
              <input
                className="form-input"
                value={form.targetRole}
                onChange={e => setForm(prev => ({ ...prev, targetRole: e.target.value }))}
                placeholder="E.g., Senior Full Stack Engineer"
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: '4px' }}>
                Used to tailor your AI interview questions.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Focus Areas</label>
              <div className="topic-chips" style={{ marginTop: 'var(--sp-2)' }}>
                {TOPICS.map(t => (
                  <button
                    key={t}
                    className={`topic-chip ${form.preferredTopics.includes(t) ? 'selected' : ''}`}
                    onClick={() => toggleTopic(t)}
                    type="button"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && <div className="alert alert-error" style={{ marginTop: 'var(--sp-4)' }}>{error}</div>}
          {saved && <div className="alert alert-success" style={{ marginTop: 'var(--sp-4)', backgroundColor: 'var(--green-soft)', color: 'var(--green)', border: '1px solid var(--green-border)', padding: '10px', borderRadius: 'var(--r-sm)' }}>Profile updated successfully!</div>}

          <div style={{ marginTop: 'var(--sp-8)' }}>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
              style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
            >
              {saving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
