# FacePrep — Interview Preparation & Practice Platform

An AI-powered, end-to-end interview preparation platform built with React, Node.js, MongoDB, and Google Gemini.

---

## What the Application Does

FacePrep helps students prepare for technical interviews through a coherent practice loop:

```
Practice → Interview → Evaluation → Score + Feedback → Weak Areas → Revision → Improvement
```

**Core features:**
- MCQ practice with instant feedback
- Video interview experience (camera + microphone)
- Speech-to-text transcription of spoken answers
- Gemini AI evaluation of technical answers
- Transparent scoring with weighted formulas
- Mock interviews (multi-question sessions)
- Dashboard with weak-topic identification
- Topic revision notes
- Basic profile with performance stats

---

## Why This Was Built

Technical interviews require both knowledge and communication ability. This platform allows candidates to:
1. Test knowledge with MCQs before attempting verbal explanation
2. Practice explaining concepts out loud (the real interview skill)
3. Receive AI-generated feedback that identifies gaps — not just right/wrong

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 4 |
| Styling | Vanilla CSS (custom design system) |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| AI | Google Gemini 1.5 Flash |
| STT | Browser Web Speech API |
| TTS | Browser SpeechSynthesis API |
| Video | Browser MediaDevices API |

---

## Architecture

```
                React Frontend (port 5173)
                       │
                       │ HTTP fetch via api.js
                       ↓
                Express Backend (port 5000)
                       │
             ┌─────────┼─────────┐
             ↓         ↓         ↓
       Interview    Practice  Dashboard
       Controller  Controller Controller
             │         │         │
             ↓         ↓         ↓
       ┌─────────────────────────────┐
       │          Services           │
       │  geminiService.js           │
       │  scoringService.js          │
       │  questionService.js         │
       └──────────────┬──────────────┘
                      │
          ┌───────────┴───────────┐
          ↓                       ↓
      Gemini API               MongoDB
```

---

## Gemini Integration

**Location:** `server/services/geminiService.js`

**Flow:**
```
Question + Transcript
      ↓
geminiService.evaluateAnswer()
      ↓
Gemini 1.5 Flash API (structured JSON prompt)
      ↓
JSON response parsed and validated
      ↓
interviewController.js
      ↓
scoringService.calculateInterviewScore()
      ↓
Saved to MongoDB + returned to React
```

**Key design:** Gemini is always called from the backend. The API key never reaches the browser.

**Prompt strategy:** Gemini is instructed with a carefully structured prompt to return a JSON object with exactly these fields:
- `overallScore`, `technicalAccuracy`, `completeness`, `clarity`, `relevance` (numbers)
- `strengths`, `missingConcepts`, `corrections` (arrays)
- `mentorFeedback`, `improvedAnswer`, `followUpQuestion` (strings)

The response is validated before being sent to the frontend. If Gemini returns malformed JSON (a real issue encountered during development — see below), a graceful fallback evaluation is returned.

---

## Speech-to-Text (STT) Flow

```
User speaks
    ↓
Browser microphone (getUserMedia)
    ↓
SpeechRecognition API (window.SpeechRecognition / webkitSpeechRecognition)
    ↓
onresult event → final + interim transcript
    ↓
InterviewRecorder.jsx → updates transcript state
    ↓
Interview.jsx receives transcript via callback
    ↓
Transcript displayed to user (verification step)
    ↓
User clicks Submit → api.js → backend
```

**Fallback:** If the browser does not support SpeechRecognition, a plain text area is shown so the user can type their answer. The rest of the flow is identical.

---

## Text-to-Speech (TTS) Flow

```
Question text (from DB or Gemini follow-up)
    ↓
User clicks "🔊 Play Question"
    ↓
window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))
    ↓
Browser audio output
```

No backend is involved. TTS is 100% browser-side.

---

## Video / Audio Decision

**The camera is used for the interview experience only.**
**Evaluation is based entirely on the spoken answer (transcript).**

The application does NOT perform:
- Facial recognition
- Emotion detection
- Eye tracking
- Body-language analysis
- Appearance scoring

**Reason:** Video analysis would significantly increase complexity without improving the core learning objective. Audio/speech directly represents how a candidate explains an interview answer and allows a reliable end-to-end experience within the sprint constraint.

---

## MongoDB Structure

### Collections

**`users`** — Profile data
```
name, targetRole, preferredTopics[], createdAt
```

**`questions`** — MCQ and interview questions
```
question, options[], correctAnswer, explanation
topic, type (mcq|interview), difficulty (easy|medium|hard)
```

**`attempts`** — All performance data
```
userId, type (practice|interview|mock)
topic, score
correctAnswers, totalQuestions (for practice)
metrics.technicalAccuracy/completeness/clarity/relevance (for interviews)
transcript, question, feedback{}, createdAt
```

---

## Scoring Formulas

### MCQ Accuracy
```
Accuracy = (correctAnswers / totalQuestions) × 100
```
Located in: `server/services/scoringService.js → calculateMCQAccuracy()`

### Interview Score
```
Interview Score =
  technicalAccuracy × 0.40
  + completeness    × 0.25
  + clarity         × 0.20
  + relevance       × 0.15

(Gemini scores on 0–10; result × 10 = 0–100 scale)
```
**Why:** Technical correctness is weighted highest because the primary goal is technical interview preparation. Communication quality is also rewarded since real interviews assess both.

Located in: `server/services/scoringService.js → calculateInterviewScore()`

### Overall Preparation Score
```
Overall Score =
  practiceAvg × 0.30
  + quizAvg   × 0.25
  + mockAvg   × 0.45
```
**Why:** Mock interviews receive the highest weight because they most closely simulate the real interview experience.

Located in: `server/services/scoringService.js → calculateOverallScore()`

---

## Major Files

```
server/server.js
→ Backend entry point and route registration.

server/config/db.js
→ MongoDB connection only. Single responsibility.

server/services/geminiService.js
→ Gemini API integration, evaluation prompt, response validation, fallback.

server/services/scoringService.js
→ All transparent scoring formulas — MCQ accuracy, interview score, overall score.

server/services/questionService.js
→ Predefined question bank (~30+ questions across 5 topics) with seeding logic.

server/controllers/interviewController.js
→ Coordinates interview: Gemini evaluation → scoring → MongoDB persistence.

server/controllers/practiceController.js
→ Handles MCQ: answer checking, scoring, saving attempt.

server/controllers/dashboardController.js
→ Aggregates attempts into dashboard stats, profile, and revision notes.

server/models/User.js → User profile schema.
server/models/Question.js → Question schema (MCQ + interview).
server/models/Attempt.js → All performance data schema.

client/src/pages/Dashboard.jsx → Dashboard UI with scores and charts.
client/src/pages/Practice.jsx → MCQ practice interface.
client/src/pages/Interview.jsx → Main interview experience (single + mock).
client/src/pages/Results.jsx → Evaluation results display.
client/src/pages/Revision.jsx → Accordion revision notes.
client/src/pages/Profile.jsx → Profile editing and stats.

client/src/components/InterviewRecorder.jsx
→ Camera, microphone, STT (Web Speech API), TTS (SpeechSynthesis).
  Does NOT call Gemini or touch MongoDB.

client/src/services/api.js
→ Single file for ALL frontend API calls. Components never use raw fetch().

client/src/App.jsx → React Router setup and page structure.
client/src/styles.css → Complete design system (dark mode, glassmorphism).
```

---

## Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB running locally: `mongod` on port 27017

### 1. Clone and Install

```bash
# Install root dependencies (concurrently)
npm install

# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and add your Gemini API key:
# GEMINI_API_KEY=your_actual_key_here
```

### 3. Start MongoDB
```bash
# Windows
mongod --dbpath C:\data\db

# macOS / Linux
mongod
```

### 4. Start the Application

```bash
# From root — starts both client (5173) and server (5000)
npm run dev
```

Or start separately:
```bash
cd server && node server.js   # Backend on :5000
cd client && npm run dev      # Frontend on :5173
```

### 5. Open
Navigate to: **http://localhost:5173**

The question bank and demo user are automatically seeded on first run.

---

## Known Limitations

1. **Single demo user** — No authentication. All data is stored under `userId: "demo"`. Multiple users on the same browser share data.

2. **Browser STT compatibility** — Web Speech API works best in Chrome. Firefox support is limited. A text fallback is provided.

3. **Gemini response time** — Evaluation takes 3–8 seconds. A loading state is shown.

4. **Local MongoDB required** — No cloud database in this sprint build. MongoDB must be running locally.

5. **No audio playback of answers** — Audio is captured via STT only; the actual audio file is not stored.

6. **Question bank size** — ~30 questions across 5 topics. Sufficient for demonstration; a production system would need a larger bank.

---

## AI Mistake Encountered During Development

During testing of `geminiService.js`, Gemini occasionally returned its JSON response wrapped in markdown code fences:
```
```json
{ "overallScore": 7.5, ... }
```
```

This caused `JSON.parse()` to throw an error despite the prompt explicitly saying "respond with ONLY a valid JSON object."

**Resolution:** Added a `.replace()` cleanup step before parsing to strip any code fences that Gemini adds:
```javascript
const cleaned = text
  .replace(/^```json\s*/i, '')
  .replace(/^```\s*/i, '')
  .replace(/\s*```$/i, '')
  .trim();
```

Additionally, a `getFallbackEvaluation()` function was added to handle complete parse failures gracefully — ensuring the interview flow completes even when Gemini has issues.

---

## AI-Assisted Development

This project was built with AI assistance (Google Gemini / Antigravity IDE). AI was used to:
- Generate boilerplate code structures
- Write evaluation prompts for Gemini
- Create the question bank content
- Draft revision notes content

All architectural decisions, data flow design, scoring formulas, and engineering tradeoffs were explicitly designed per the project specification.
