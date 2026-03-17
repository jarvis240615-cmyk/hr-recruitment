import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Pipeline from './pages/Pipeline';
import Candidates from './pages/Candidates';
import CandidateDetail from './pages/CandidateDetail';
import Analytics from './pages/Analytics';
import Apply from './pages/Apply';

function ProtectedLayout() {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/apply/:jobId" element={<Apply />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/candidates/:id" element={<CandidateDetail />} />
          <Route path="/analytics" element={<Analytics />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
