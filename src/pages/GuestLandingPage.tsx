import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createGuestProject } from '../lib/guestStorage';
import { ArrowRight, Zap, Users, Loader2, LogIn, BrainCircuit, BotMessageSquare, Workflow } from 'lucide-react';
import Logo from '../components/Logo';

const GuestLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [projectDescription, setProjectDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  React.useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleStartProject = async () => {
    if (!projectDescription.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const guestProject = createGuestProject({
        name: extractProjectName(projectDescription),
        description: projectDescription.substring(0, 200),
        color: 'from-accent-500 to-accent-600'
      });
      
      const searchParams = new URLSearchParams();
      searchParams.set('aiPrompt', projectDescription.trim());
      
      navigate(`/guest/${guestProject.id}?${searchParams.toString()}`);
    } catch (error) {
      console.error('Error creating guest project:', error);
      const guestId = crypto.randomUUID();
      navigate(`/guest/${guestId}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  const extractProjectName = (description: string): string => {
    const words = description.trim().split(' ');
    if (words.length >= 3) {
      return words.slice(0, 3).join(' ') + ' Project';
    }
    return 'My Project';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background-900 via-background-800 to-background-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-accent-500 animate-spin" />
          <p className="text-secondary-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-900 via-background-800 to-background-900 flex flex-col">
      {/* Header matching dashboard and login pages */}
      <div className="sticky top-0 z-50 h-14 bg-background-900/98 backdrop-blur-xl border-b border-background-700/30 shadow-lg">
        <div className="h-full flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6">
          {/* Left Section - Logo */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Logo className='text-2xl' />
          </div>

          {/* Right Section - Sign In Button */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={handleSignIn}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-semibold text-sm rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content with Background Pattern */}
      <div className="flex-1 relative">
        {/* Background Pattern matching dashboard */}
        <div 
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #64748b 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            backgroundPosition: '12px 12px'
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Hero Section */}
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
              Transform Ideas into
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent-400 via-accent-500 to-teal-400 mt-1">
                Visual Project Plans
              </span>
            </h2>
            <p className="text-lg text-secondary-400 max-w-2xl mx-auto leading-relaxed">
              Describe your goal in plain English. Our AI will generate a complete project structure with phases and tasks, visualized as an interactive mind map.
            </p>
          </div>

          {/* AI Prompt CTA - Clean and minimal */}            <div className="bg-background-800/40 backdrop-blur-xl border border-background-700/30 rounded-xl shadow-lg mb-10 sm:mb-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
            
            <div className="relative p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-gradient-to-r from-accent-600 to-accent-700 rounded-lg">
                  <BotMessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Describe Your Project</h3>
                  <p className="text-sm text-secondary-400">AI will generate your project structure</p>
                </div>
              </div>

              <div className="space-y-4">
                <textarea
                  id="projectDescription"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  disabled={isGenerating}
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-3 border border-background-600/50 bg-background-700/30 rounded-lg focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500/50 transition-all duration-200 resize-none text-white placeholder-secondary-400 disabled:opacity-60"
                  placeholder="Launch a new SaaS product for social media analytics that helps businesses track engagement across multiple platforms..."
                />
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary-500">More details = better results</span>
                  <span className="text-secondary-400 font-medium">
                    {projectDescription.length}/500
                  </span>
                </div>
              </div>

              <button
                onClick={handleStartProject}
                disabled={!projectDescription.trim() || isGenerating}
                className="w-full mt-6 px-6 py-3.5 bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="w-5 h-5" />
                    <span>Generate Project Plan</span>
                  </div>
                )}
              </button>
              
              <p className="text-center text-sm text-secondary-500 mt-3">
                No sign-up required
              </p>
            </div>
          </div>

          {/* Features Section with consistent card styling */}
          <div className="mb-10 sm:mb-12">
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">Key Features</h3>
              <p className="text-secondary-400 max-w-xl mx-auto">
                Everything you need to plan, organize, and execute your projects efficiently
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-background-800/40 backdrop-blur-xl border border-background-700/30 rounded-xl p-5 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 to-transparent" />
                <div className="relative">
                  <div className="p-2.5 bg-accent-500/20 rounded-lg inline-block mb-3">
                    <BrainCircuit className="w-5 h-5 text-accent-400" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">AI-Powered Mind Maps</h4>
                  <p className="text-secondary-400 leading-relaxed text-sm">Visualize your entire project from a single idea. Let AI build the structure for you with intelligent node placement.</p>
                </div>
              </div>
              
              <div className="bg-background-800/40 backdrop-blur-xl border border-background-700/30 rounded-xl p-5 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
                <div className="relative">
                  <div className="p-2.5 bg-green-500/20 rounded-lg inline-block mb-3">
                    <Workflow className="w-5 h-5 text-green-400" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Seamless Kanban Workflow</h4>
                  <p className="text-secondary-400 leading-relaxed text-sm">Automatically convert your mind map into an actionable kanban board to track progress and manage tasks.</p>
                </div>
              </div>
              
              <div className="bg-background-800/40 backdrop-blur-xl border border-background-700/30 rounded-xl p-5 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />
                <div className="relative">
                  <div className="p-2.5 bg-purple-500/20 rounded-lg inline-block mb-3">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Team Collaboration</h4>
                  <p className="text-secondary-400 leading-relaxed text-sm">Sign up to save, share, and collaborate on projects with your team in real-time with live updates.</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="bg-background-800/40 backdrop-blur-xl border border-background-700/30 rounded-xl p-5 sm:p-6 shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 to-transparent" />
              <div className="relative">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3">Ready to Get Started?</h3>
                <p className="text-secondary-400 mb-5 max-w-md mx-auto text-sm">
                  Create your first project above, or sign in to access the full suite of collaborative features.
                </p>
                <button
                  onClick={handleSignIn}
                  className="group flex items-center gap-2 px-4 py-2.5 bg-background-700/50 hover:bg-background-600/50 text-secondary-300 hover:text-white font-medium rounded-lg transition-all duration-200 border border-background-600/50 mx-auto text-sm"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In for Full Features</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-background-700/30 bg-background-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm text-secondary-500 font-medium">
            &copy; {new Date().getFullYear()} Nexus. All rights reserved.
          </p>
          <p className="text-sm text-secondary-500 mt-1 sm:mt-0 font-medium">
            AI-powered project planning for modern teams
          </p>
        </div>
      </footer>
    </div>
  );
};

export default GuestLandingPage;
