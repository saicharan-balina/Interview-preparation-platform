// InterviewRecorder.jsx — Camera, microphone, and speech-recognition component.
//
// Responsibilities:
//   ✓ Request camera permission via getUserMedia
//   ✓ Request microphone permission via getUserMedia
//   ✓ Display camera preview (video element)
//   ✓ Start/stop recording state
//   ✓ Run browser Speech Recognition (STT)
//   ✓ Display live transcript
//   ✓ Text input fallback if STT unavailable
//   ✓ TTS: read question aloud via SpeechSynthesis
//
// Does NOT: call Gemini, calculate scores, access MongoDB.
// Those responsibilities belong to Interview.jsx → api.js → backend.

import { useEffect, useRef, useState, useCallback } from 'react';

// Check browser speech recognition support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const hasSpeechRecognition = !!SpeechRecognition;

export default function InterviewRecorder({ question, onTranscriptChange, onReady }) {
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraStatus, setCameraStatus] = useState('idle'); // idle | loading | active | denied
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [useFallback, setUseFallback] = useState(!hasSpeechRecognition);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState('');

  // ── Start camera on mount ────────────────────────────────────────────────
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      stopRecording();
    };
  }, []);

  // ── Notify parent when transcript changes ────────────────────────────────
  useEffect(() => {
    onTranscriptChange(transcript);
  }, [transcript]);

  const startCamera = async () => {
    setCameraStatus('loading');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 360, facingMode: 'user' },
        audio: true
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraStatus('active');
      if (onReady) onReady();
    } catch (err) {
      console.error('Camera/mic error:', err);
      if (err.name === 'NotAllowedError') {
        setCameraStatus('denied');
        setError('Camera/microphone permission denied. Please allow access and refresh the page.');
      } else {
        setCameraStatus('denied');
        setError(`Could not access camera/microphone: ${err.message}`);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  // ── Speech Recognition (STT) ────────────────────────────────────────────
  // Browser speech recognition provides a lightweight
  // speech-to-text layer without requiring another backend service.
  const startRecording = useCallback(() => {
    if (useFallback) {
      setIsRecording(true);
      return;
    }

    if (!SpeechRecognition) {
      setUseFallback(true);
      setIsRecording(true);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let final = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += text + ' ';
        else interim += text;
      }
      if (final) {
        setTranscript(prev => prev + final);
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') return; // ignore silence
      console.error('STT error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied for speech recognition.');
        setUseFallback(true);
      }
    };

    recognition.onend = () => {
      // Restart if still in recording state
      if (recognitionRef.current && isRecording) {
        try { recognition.start(); } catch (_) {}
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsRecording(true);
      setInterimTranscript('');
    } catch (e) {
      console.error('Could not start recognition:', e);
      setUseFallback(true);
      setIsRecording(true);
    }
  }, [useFallback, isRecording]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    setInterimTranscript('');
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; // prevent auto-restart
      try { recognitionRef.current.stop(); } catch (_) {}
      recognitionRef.current = null;
    }
  }, []);

  // ── Text-to-Speech (TTS) — reads the question aloud ────────────────────
  const playQuestion = () => {
    if (!question) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // stop any ongoing speech
      const utterance = new SpeechSynthesisUtterance(question);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.lang = 'en-US';
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
  };

  const fullTranscript = transcript + (interimTranscript ? interimTranscript : '');

  return (
    <div>
      {/* ── Camera Preview ─────────────────────────────────────────────── */}
      <div className="video-wrapper" style={{ marginBottom: 'var(--space-4)' }}>
        {cameraStatus === 'loading' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
            <div className="loading-spinner" />
          </div>
        )}
        {cameraStatus === 'denied' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0f1e', gap: '12px', padding: '20px', textAlign: 'center' }}>
            <span style={{ fontSize: '2.5rem' }}>📷</span>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Camera unavailable</p>
          </div>
        )}
        <video ref={videoRef} autoPlay muted playsInline style={{ display: cameraStatus === 'active' ? 'block' : 'none' }} />
        <div className="video-overlay" />
        {isRecording && (
          <div className="video-badge">
            <span className="dot" />
            REC
          </div>
        )}
      </div>

      {/* ── Status Row ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        <div className={`mic-indicator ${isRecording ? 'active' : 'inactive'}`}>
          {isRecording ? <span className="mic-pulse" /> : <span>🎙️</span>}
          {isRecording ? 'Listening...' : 'Microphone ready'}
        </div>

        {/* TTS Button */}
        <button className="btn btn-secondary btn-sm" onClick={playQuestion} disabled={!question || isSpeaking}>
          {isSpeaking ? '🔊 Playing...' : '🔊 Play Question'}
        </button>

        {!hasSpeechRecognition && (
          <span className="badge badge-yellow">⚠️ Using text input</span>
        )}
      </div>

      {/* ── Error ──────────────────────────────────────────────────────── */}
      {error && <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>}

      {/* ── Recording Controls ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        {!isRecording ? (
          <button
            className="btn btn-success"
            onClick={startRecording}
            disabled={cameraStatus === 'loading'}
          >
            🎙️ Start Answer
          </button>
        ) : (
          <button className="btn btn-danger" onClick={stopRecording}>
            ⏹ Stop Answer
          </button>
        )}
        {(transcript || interimTranscript) && (
          <button className="btn btn-secondary btn-sm" onClick={clearTranscript}>
            🗑️ Clear
          </button>
        )}
      </div>

      {/* ── Transcript / Fallback Input ─────────────────────────────────── */}
      <div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 'var(--space-2)', fontWeight: 500 }}>
          {useFallback ? 'Type your answer:' : 'Your spoken answer:'}
        </div>

        {useFallback ? (
          // Text fallback for browsers without STT support
          <textarea
            className="form-textarea"
            placeholder="Type your answer here if speech recognition is unavailable..."
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            rows={5}
            style={{ minHeight: '120px' }}
          />
        ) : (
          <div className={`transcript-box ${fullTranscript ? 'has-content' : ''}`}>
            {fullTranscript || (
              <span style={{ color: 'var(--text-muted)' }}>
                {isRecording
                  ? '🎙️ Listening... speak your answer'
                  : 'Click "Start Answer" and speak. Your words will appear here.'}
              </span>
            )}
            {interimTranscript && (
              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                {' '}{interimTranscript}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
