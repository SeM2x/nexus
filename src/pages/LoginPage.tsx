import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Zap, Users } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-900 via-background-800 to-background-900 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-center px-12 py-24">
        <div className="max-w-md">
          {/* Clean Logo */}
          <div className="flex items-center gap-3 mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">Nexus</h1>
          </div>

          {/* Hero Content */}
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Organize Your Projects with
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-accent-600"> Visual Clarity</span>
            </h2>
            
            <p className="text-lg text-secondary-300 leading-relaxed">
              Transform your ideas into structured project plans. Create mind maps, manage tasks, and track progress with our intuitive visual interface.
            </p>

            {/* Features */}
            <div className="space-y-4 pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-500/20 rounded-lg">
                  <Zap className="w-5 h-5 text-accent-400" />
                </div>
                <span className="text-secondary-300 font-medium">Lightning-fast project setup</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-accent-400" />
                </div>
                <span className="text-secondary-300 font-medium">Collaborative workspace</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-500/20 rounded-lg">
                  <Shield className="w-5 h-5 text-accent-400" />
                </div>
                <span className="text-secondary-300 font-medium">Secure cloud storage</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Authentication */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">Nexus</h1>
          </div>

          {/* Auth Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
            <p className="mt-2 text-secondary-400 font-medium">
              Sign in to access your projects and continue organizing your work
            </p>
          </div>

          {/* Auth Component Container */}
          <div className="bg-background-800/50 backdrop-blur-xl border border-background-700/50 rounded-xl p-8 shadow-2xl">
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#14b8a6',
                      brandAccent: '#0d9488',
                      brandButtonText: 'white',
                      defaultButtonBackground: '#1e293b',
                      defaultButtonBackgroundHover: '#334155',
                      defaultButtonBorder: '#475569',
                      defaultButtonText: '#f1f5f9',
                      dividerBackground: '#475569',
                      inputBackground: '#1e293b',
                      inputBorder: '#475569',
                      inputBorderHover: '#64748b',
                      inputBorderFocus: '#14b8a6',
                      inputText: '#f1f5f9',
                      inputLabelText: '#cbd5e1',
                      inputPlaceholder: '#94a3b8',
                      messageText: '#f87171',
                      messageTextDanger: '#f87171',
                      anchorTextColor: '#14b8a6',
                      anchorTextHoverColor: '#0d9488',
                    },
                    space: {
                      spaceSmall: '4px',
                      spaceMedium: '8px',
                      spaceLarge: '16px',
                      labelBottomMargin: '8px',
                      anchorBottomMargin: '4px',
                      emailInputSpacing: '4px',
                      socialAuthSpacing: '4px',
                      buttonPadding: '10px 15px',
                      inputPadding: '10px 15px',
                    },
                    fontSizes: {
                      baseBodySize: '14px',
                      baseInputSize: '14px',
                      baseLabelSize: '14px',
                      baseButtonSize: '14px',
                    },
                    fonts: {
                      bodyFontFamily: `'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
                      buttonFontFamily: `'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
                      inputFontFamily: `'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
                      labelFontFamily: `'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
                    },
                    borderWidths: {
                      buttonBorderWidth: '1px',
                      inputBorderWidth: '1px',
                    },
                    radii: {
                      borderRadiusButton: '8px',
                      buttonBorderRadius: '8px',
                      inputBorderRadius: '8px',
                    },
                  },
                },
                className: {
                  anchor: 'text-accent-500 hover:text-accent-400 font-medium transition-colors duration-200',
                  button: 'font-semibold transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl',
                  container: 'space-y-4',
                  divider: 'my-6',
                  input: 'transition-all duration-200 focus:ring-4 focus:ring-accent-500/20',
                  label: 'font-semibold text-secondary-300',
                  loader: 'text-accent-500',
                  message: 'text-sm font-medium',
                },
              }}
              providers={[]}
              redirectTo={`${window.location.origin}/`}
              onlyThirdPartyProviders={false}
              magicLink={false}
              showLinks={true}
              view="sign_in"
            />
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-secondary-500">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;