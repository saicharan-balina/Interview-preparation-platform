// FloatingChat.jsx — Gemini-powered doubt assistant chat widget.
// Provides contextual help about interview topics and platform usage.
// Fixed to bottom-right corner; toggle open/closed.

import { useState, useRef, useEffect } from 'react';
import { askChatQuestion } from '../services/api';

const SUGGESTIONS = [
  'Explain polymorphism',
  'What is ACID?',
  'BFS vs DFS?',
  'TCP vs UDP?',
  'What is virtual memory?',
];

const WELCOME = {
  role: 'assistant',
  content: "Hi! I'm your AI study assistant 🎓 Ask me anything about Java, DSA, DBMS, OS, or Computer Networks — I'm here to help you prepare!"
};

export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendMessage = async (text) => {
    const question = (text || input).trim();
    if (!question || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setLoading(true);

    try {
      const data = await askChatQuestion(question, messages.slice(-6));
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I couldn't get an answer right now. (${err.message}). Make sure the server is running with a valid API key.`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Window */}
      {open && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">🎓</div>
              <div>
                <div className="chat-header-name">Study Assistant</div>
                <div className="chat-header-status">Powered by AI · Always ready</div>
              </div>
            </div>
            <button className="chat-close-btn" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.role}`}>
                <div className="chat-bubble-icon">
                  {msg.role === 'assistant' ? '🎓' : '👤'}
                </div>
                <div className="chat-bubble">{msg.content}</div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="chat-msg assistant">
                <div className="chat-bubble-icon">🎓</div>
                <div className="chat-bubble">
                  <div className="chat-typing">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions (show only at start) */}
          {messages.length <= 1 && (
            <div className="chat-suggestions">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  className="chat-suggestion-btn"
                  onClick={() => sendMessage(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input Row */}
          <div className="chat-input-row">
            <textarea
              ref={inputRef}
              className="chat-input"
              placeholder="Ask a question..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button
              className="chat-send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              title="Send (Enter)"
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button
        className={`chat-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen(o => !o)}
        title={open ? 'Close chat' : 'Ask a doubt'}
      >
        {open ? '✕' : '💬'}
      </button>
    </>
  );
}
