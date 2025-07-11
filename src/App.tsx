import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/routes/ProtectedRoute';
import AuthenticatedRedirect from './components/auth/AuthenticatedRedirect';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import Workspace from './components/workspace/Workspace';
import FloatingBadge from './components/FloatingBadge';
import { MindMapProvider } from './contexts/MindMapContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className='min-h-screen bg-gray-900'>
          <Routes>
            <Route path='/login' element={<LoginPage />} />
            <Route
              path='/'
              element={
                <AuthenticatedRedirect>
                  <HomePage />
                </AuthenticatedRedirect>
              }
            />
            <Route
              path='/dashboard'
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path='/project/:projectId'
              element={
                <ProtectedRoute>
                  <MindMapProvider isGuest={false}>
                    <Workspace />
                  </MindMapProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path='/guest/:guestId'
              element={
                <MindMapProvider isGuest={true}>
                  <Workspace />
                </MindMapProvider>
              }
            />
          </Routes>

          {/* Floating Badge - visible across all pages */}
          <FloatingBadge />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
