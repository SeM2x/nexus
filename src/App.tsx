import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthenticatedRedirect from './components/AuthenticatedRedirect';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import GuestLandingPage from './pages/GuestLandingPage';
import Workspace from './components/Workspace';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-900">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/" 
              element={
                <AuthenticatedRedirect>
                  <GuestLandingPage />
                </AuthenticatedRedirect>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/project/:projectId" 
              element={
                <ProtectedRoute>
                  <Workspace />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/guest/:guestId" 
              element={<Workspace isGuest={true} />} 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;