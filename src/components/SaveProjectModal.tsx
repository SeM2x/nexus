import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Save, Shield, Zap, Users, Cloud, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { migrateGuestProjectToSupabase, getMostRecentGuestProjectId } from '../lib/guestMigration';

interface SaveProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SaveProjectModal: React.FC<SaveProjectModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'migrating' | 'success' | 'error'>('idle');
  const [migrationError, setMigrationError] = useState<string | null>(null);

  // Listen for authentication state changes
  useEffect(() => {
    if (!isOpen) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state changed:', event, session?.user?.email);

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ User successfully signed in, starting migration...');
        
        setMigrationStatus('migrating');
        setMigrationError(null);

        try {
          // Get the most recent guest project to migrate
          const guestProjectId = getMostRecentGuestProjectId();
          
          if (!guestProjectId) {
            console.warn('⚠️ No guest project found to migrate');
            setMigrationStatus('error');
            setMigrationError('No guest project found to migrate');
            return;
          }

          console.log('📦 Migrating guest project:', guestProjectId);

          // Perform the migration
          const result = await migrateGuestProjectToSupabase(guestProjectId);

          if (result.success && result.newProjectId) {
            console.log('🎉 Migration successful, redirecting to:', result.newProjectId);
            
            setMigrationStatus('success');
            
            // Close the modal
            onClose();
            
            // Redirect to the new permanent project URL after a short delay
            setTimeout(() => {
              navigate(`/project/${result.newProjectId}`, { replace: true });
            }, 1000);
            
          } else {
            console.error('❌ Migration failed:', result.error);
            setMigrationStatus('error');
            setMigrationError(result.error || 'Migration failed');
          }

        } catch (error) {
          console.error('💥 Unexpected migration error:', error);
          setMigrationStatus('error');
          setMigrationError(error instanceof Error ? error.message : 'Unexpected error during migration');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isOpen, navigate, onClose]);

  // Reset migration status when modal opens
  useEffect(() => {
    if (isOpen) {
      setMigrationStatus('idle');
      setMigrationError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Show migration progress
  if (migrationStatus === 'migrating') {
    return (
      <>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-background-800/95 backdrop-blur-xl border border-background-700/50 rounded-xl shadow-2xl w-full max-w-md p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-accent-500/20 rounded-full">
                <Loader2 className="w-8 h-8 text-accent-400 animate-spin" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Saving Your Project</h3>
                <p className="text-secondary-400">
                  We're migrating your guest project to your account...
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show migration success
  if (migrationStatus === 'success') {
    return (
      <>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-background-800/95 backdrop-blur-xl border border-background-700/50 rounded-xl shadow-2xl w-full max-w-md p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-green-500/20 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Project Saved!</h3>
                <p className="text-secondary-400">
                  Your project has been successfully saved to your account. Redirecting...
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show migration error
  if (migrationStatus === 'error') {
    return (
      <>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-background-800/95 backdrop-blur-xl border border-background-700/50 rounded-xl shadow-2xl w-full max-w-md p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-red-500/20 rounded-full">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Migration Failed</h3>
                <p className="text-secondary-400 mb-4">
                  {migrationError || 'Failed to save your project. Please try again.'}
                </p>
                <button
                  onClick={() => {
                    setMigrationStatus('idle');
                    setMigrationError(null);
                  }}
                  className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-background-800/95 backdrop-blur-xl border border-background-700/50 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-background-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-accent-500 to-accent-600 rounded-lg shadow-lg">
                <Save className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Save Your Project</h2>
                <p className="text-sm text-secondary-400 font-medium">Create a free account to save your work and access it from anywhere</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-secondary-400 hover:text-white hover:bg-background-700/50 rounded-lg transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex">
            {/* Left Side - Benefits */}
            <div className="flex-1 p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Why create an account?</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg mt-0.5">
                      <Cloud className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Cloud Sync</h4>
                      <p className="text-sm text-secondary-400 leading-relaxed">
                        Access your projects from any device, anywhere. Your work is automatically saved and synced.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg mt-0.5">
                      <Zap className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">AI-Powered Planning</h4>
                      <p className="text-sm text-secondary-400 leading-relaxed">
                        Unlock AI features to automatically generate project phases and tasks from your descriptions.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg mt-0.5">
                      <Users className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Team Collaboration</h4>
                      <p className="text-sm text-secondary-400 leading-relaxed">
                        Share projects with team members and collaborate in real-time (coming soon).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-accent-500/20 rounded-lg mt-0.5">
                      <Shield className="w-5 h-5 text-accent-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Secure & Reliable</h4>
                      <p className="text-sm text-secondary-400 leading-relaxed">
                        Your data is encrypted and backed up. Never lose your work again.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Project Info */}
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Save className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-purple-300 mb-1">Your Current Project</h4>
                    <p className="text-sm text-purple-400/80 leading-relaxed">
                      Don't lose your progress! Sign up now to save your current project and continue working on it later.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="flex-1 p-6 border-l border-background-700/50">
              <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-white mb-2">Get Started for Free</h3>
                  <p className="text-sm text-secondary-400">
                    Create your account in seconds
                  </p>
                </div>

                {/* Auth Component */}
                <div className="bg-background-700/30 rounded-lg p-6 border border-background-600/50">
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
                    redirectTo={`${window.location.origin}/dashboard`}
                    onlyThirdPartyProviders={false}
                    magicLink={false}
                    showLinks={true}
                    view="sign_up"
                  />
                </div>

                {/* Footer */}
                <div className="mt-6 text-center">
                  <p className="text-xs text-secondary-500">
                    By creating an account, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SaveProjectModal;