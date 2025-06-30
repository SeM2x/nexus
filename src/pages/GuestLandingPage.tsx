import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createGuestProject } from '../lib/guestStorage';
import { Sparkles, ArrowRight, Zap, Users, Shield, GitBranch, Loader2, LogIn, BrainCircuit, BotMessageSquare, Workflow } from 'lucide-react';

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
      <div className="min-h-screen bg-background-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-900 text-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 h-16 bg-background-900/70 backdrop-blur-lg border-b border-background-800/50">
        <div className="h-full flex items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-accent-500 to-accent-400 rounded-lg">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Nexus</h1>
          </div>
          <button
            onClick={handleSignIn}
            className="flex items-center gap-2 px-4 py-2 bg-background-800 hover:bg-background-700 text-gray-300 hover:text-white font-medium text-sm rounded-lg transition-colors duration-200 border border-background-700/50"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter mb-6">
              From Prompt to Project Plan
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent-400 via-teal-400 to-green-400 mt-2">
                Instantly with AI
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-secondary-400 max-w-2xl mx-auto leading-relaxed">
              Describe your goal in plain English. Our AI will generate a complete project structure with phases and tasks, visualized as an interactive mind map.
            </p>
          </div>

          {/* AI Prompt CTA */}
          <div className="bg-background-900/50 border border-background-800/60 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-accent-500/5 backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-gradient-to-br from-accent-500 to-teal-400 rounded-full mt-1">
                <BotMessageSquare className="w-6 h-6 text-white" />
              </div>
              <div className="w-full">
                <label htmlFor="projectDescription" className="text-xl font-bold text-white mb-3 block">
                  Describe Your Project
                </label>
                <textarea
                  id="projectDescription"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  disabled={isGenerating}
                  rows={5}
                  maxLength={500}
                  className="w-full px-5 py-4 border-2 border-background-700 bg-background-800/60 rounded-xl focus:ring-4 focus:ring-accent-500/30 focus:border-accent-500 transition-all duration-300 resize-none text-lg text-secondary-200 placeholder-secondary-500 disabled:opacity-60"
                  placeholder="e.g., Launch a new SaaS product for social media analytics..."
                />
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-accent-400 font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>AI will generate a mind map and kanban board</span>
                  </div>
                  <div className="text-sm text-secondary-500">
                    {projectDescription.length}/500
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={handleStartProject}
                disabled={!projectDescription.trim() || isGenerating}
                className="group w-full px-8 py-4 bg-gradient-to-r from-accent-600 to-teal-500 hover:from-accent-700 hover:to-teal-600 text-white font-bold text-lg rounded-xl shadow-lg transition-all duration-300 hover:shadow-accent-500/20 hover:scale-[1.01] border border-accent-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-3">
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Generating Project...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-6 h-6" />
                      <span>Generate Project Plan</span>
                      <ArrowRight className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                  )}
                </div>
              </button>
              <p className="text-center text-sm text-secondary-500 mt-4">
                No sign-up required to start.
              </p>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-24">
            <h3 className="text-3xl font-bold text-center mb-12">A new era of project management</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-background-900 p-6 rounded-lg border border-background-800">
                <div className="p-2 bg-accent-500/10 rounded-md inline-block mb-4 border border-accent-500/20">
                  <BrainCircuit className="w-6 h-6 text-accent-400" />
                </div>
                <h4 className="text-xl font-bold mb-2">AI-Powered Mind Maps</h4>
                <p className="text-secondary-400">Visualize your entire project from a single idea. Let AI build the structure for you.</p>
              </div>
              <div className="bg-background-900 p-6 rounded-lg border border-background-800">
                <div className="p-2 bg-green-500/10 rounded-md inline-block mb-4 border border-green-500/20">
                  <Workflow className="w-6 h-6 text-green-400" />
                </div>
                <h4 className="text-xl font-bold mb-2">Seamless Kanban Workflow</h4>
                <p className="text-secondary-400">Automatically convert your mind map into an actionable kanban board to track progress.</p>
              </div>
              <div className="bg-background-900 p-6 rounded-lg border border-background-800">
                <div className="p-2 bg-purple-500/10 rounded-md inline-block mb-4 border border-purple-500/20">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <h4 className="text-xl font-bold mb-2">Built for Collaboration</h4>
                <p className="text-secondary-400">Sign up to save, share, and collaborate on projects with your team in real-time.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-background-800/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm text-secondary-500">
            &copy; {new Date().getFullYear()} Nexus. All rights reserved.
          </p>
          <p className="text-sm text-secondary-500 mt-2 sm:mt-0">
            AI-powered project planning for modern teams.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default GuestLandingPage;
