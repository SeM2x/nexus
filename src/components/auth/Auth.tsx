import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import ResetPasswordForm from './ResetPasswordForm';
import UpdatePasswordForm from './UpdatePasswordForm';

type AuthView = 'login' | 'signup' | 'reset' | 'update-password';

const Auth: React.FC = () => {
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const location = useLocation();

  // Check URL parameters on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const hashParams = new URLSearchParams(location.hash.slice(1));
    
    // Check for password reset parameters (either in search or hash)
    const accessToken = searchParams.get('access_token') || hashParams.get('access_token');
    const type = searchParams.get('type') || hashParams.get('type');
    
    // If we have access token and type=recovery, show update password form
    if (accessToken && type === 'recovery') {
      setCurrentView('update-password');
    }
    // Check for explicit view parameter
    else if (searchParams.get('view') === 'reset') {
      setCurrentView('reset');
    }
    else if (searchParams.get('view') === 'signup') {
      setCurrentView('signup');
    }
  }, [location]);

  const switchToLogin = () => setCurrentView('login');
  const switchToSignup = () => setCurrentView('signup');
  const switchToReset = () => setCurrentView('reset');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return (
          <LoginForm 
            onSwitchToSignup={switchToSignup}
            onSwitchToReset={switchToReset}
          />
        );
      case 'signup':
        return (
          <SignupForm 
            onSwitchToLogin={switchToLogin}
          />
        );
      case 'reset':
        return (
          <ResetPasswordForm 
            onSwitchToLogin={switchToLogin}
          />
        );
      case 'update-password':
        return (
          <UpdatePasswordForm 
            onSwitchToLogin={switchToLogin}
          />
        );
      default:
        return (
          <LoginForm 
            onSwitchToSignup={switchToSignup}
            onSwitchToReset={switchToReset}
          />
        );
    }
  };

  return (
    <div className="w-full">
      <div className="animate-in fade-in zoom-in-95 duration-300">
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default Auth;