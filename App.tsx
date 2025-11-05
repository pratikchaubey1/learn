import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import Views/Pages
import LandingPage from './components/LandingPage';
import Onboarding from './components/TestGenerator';
import TestTakerWrapper from './components/TestTakerWrapper';
import ResultsWrapper from './components/ResultsWrapper';
import Dashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import ResetPasswordPage from './components/ResetPasswordPage';
import FullScreenLoader from './components/FullScreenLoader';

const AppRoutes: React.FC = () => {
    const { isAuthenticated, user, isLoading } = useAuth();

    if (isLoading) {
        return <FullScreenLoader />;
    }

    return (
        <Routes>
            <Route path="/" element={!isAuthenticated ? <LandingPage /> : <Navigate to={user?.isAdmin ? "/admin" : "/dashboard"} replace />} />
            
            {/* Public route for password reset */}
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            {/* Authenticated Routes */}
            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/test" element={<TestTakerWrapper />} />
                <Route path="/results" element={<ResultsWrapper />} />
            </Route>

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

const App: React.FC = () => {
  return (
    <div className="min-h-screen font-sans bg-slate-50 text-slate-800">
      <AuthProvider>
          <AppRoutes />
      </AuthProvider>
    </div>
  );
};

export default App;