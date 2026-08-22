import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import FloatingChat from './components/FloatingChat';
import Dashboard from './pages/Dashboard';
import Practice from './pages/Practice';
import Interview from './pages/Interview';
import Results from './pages/Results';
import Revision from './pages/Revision';
import Profile from './pages/Profile';

// App.jsx — Application routes and page structure.
// FloatingChat is rendered outside the route tree so it persists across all pages.
export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/results" element={<Results />} />
            <Route path="/revision" element={<Revision />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
        {/* Floating chat widget — available on all pages */}
        <FloatingChat />
      </div>
    </BrowserRouter>
  );
}
