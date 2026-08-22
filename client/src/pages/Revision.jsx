import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getRevisionNotes, generateAIRevisionNotes } from '../services/api';

const TOPICS = ['Java', 'DSA', 'DBMS', 'Operating Systems', 'Computer Networks'];

export default function Revision() {
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedTopic, setSelectedTopic] = useState(location.state?.topic || 'Java');
  const [customTopic, setCustomTopic] = useState('');
  const [notes, setNotes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openSection, setOpenSection] = useState(null); // accordion

  useEffect(() => {
    // Only load automatically for presets on start
    if (!customTopic) {
      loadNotes(selectedTopic);
    }
  }, [selectedTopic]);

  const loadNotes = async (topic) => {
    try {
      setLoading(true);
      setError('');
      setOpenSection(null);
      const data = await getRevisionNotes(topic);
      setNotes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCustomNotes = async () => {
    if (!customTopic.trim()) {
      setError('Please type a topic name first.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setOpenSection(null);
      const data = await generateAIRevisionNotes(customTopic.trim());
      setNotes(data);
      setSelectedTopic(data.topic);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Revision Notes</h1>
        <p className="page-subtitle">Select a preset topic or let the AI dynamically generate comprehensive revision notes for any technology.</p>
      </div>

      <div className="grid-3" style={{ gap: 'var(--sp-5)', marginBottom: 'var(--sp-6)', alignItems: 'stretch' }}>
        {/* Topic Selector preset */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 'var(--sp-3)' }}>Select Preset Topic</div>
          <div className="topic-chips">
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
        </div>

        {/* AI Custom Generator */}
        <div className="card">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 'var(--sp-2)' }}>Or Generate Custom Topic</div>
          <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
            <input
              className="form-input"
              placeholder="E.g., Docker, Git, Redis"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            />
            <button 
              className="btn btn-primary btn-sm"
              onClick={handleGenerateCustomNotes}
              disabled={loading}
            >
              Generate
            </button>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Generating technical content...</p>
        </div>
      )}

      {!loading && notes && (
        <div className="fade-in">
          {/* Notes display */}
          <div className="card" style={{ marginBottom: 'var(--sp-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-5)' }}>
              <h3>{notes.topic} Study Guide</h3>
              <span className="badge badge-purple">AI Generated Study Material</span>
            </div>

            {/* Accordion Sections */}
            <div style={{ marginBottom: 'var(--sp-5)' }}>
              {notes.sections?.map((section, idx) => (
                <div key={idx} className="revision-section">
                  <div
                    className="revision-section-header"
                    onClick={() => setOpenSection(openSection === idx ? null : idx)}
                  >
                    <span className="revision-section-title">
                      {openSection === idx ? '▼ ' : '▶ '} {section.title}
                    </span>
                    <span className="badge badge-blue">Key Concepts</span>
                  </div>
                  {openSection === idx && (
                    <div className="revision-section-body fade-in">
                      {section.content}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Tips */}
            {notes.quickTips?.length > 0 && (
              <div style={{ background: 'var(--bg-app)', padding: 'var(--sp-4)', borderRadius: 'var(--r-md)', marginBottom: 'var(--sp-4)' }}>
                <h4 style={{ marginBottom: 'var(--sp-2)', color: 'var(--text-primary)' }}>Key Interview Takeaways</h4>
                <ul style={{ paddingLeft: 'var(--sp-4)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {notes.quickTips.map((tip, idx) => (
                    <li key={idx} style={{ marginBottom: '6px' }}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Common Interview Questions */}
          {notes.commonQuestions?.length > 0 && (
            <div className="card" style={{ marginBottom: 'var(--sp-6)' }}>
              <h3 style={{ marginBottom: 'var(--sp-5)' }}>Common Interview Questions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                {notes.commonQuestions.map((q, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)', padding: 'var(--sp-3)', background: 'var(--bg-hover)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                    <span className="q-badge" style={{ flexShrink: 0 }}>{idx + 1}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{q}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/interview', { state: { topic: selectedTopic } })}>
              Practice Interview on {selectedTopic}
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/practice', { state: { topic: selectedTopic } })}>
              Take MCQ Practice
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
