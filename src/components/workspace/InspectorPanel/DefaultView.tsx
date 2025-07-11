import { useState } from 'react';
import { Loader2, Plus, Wrench, Sparkles, User } from 'lucide-react';
import { useMindMap } from '@/hooks/useMindMap';

const DefaultView = ({
  isGuest,
  overviewStats,
}: {
  isGuest: boolean;
  overviewStats: { phases: number; tasks: number };
}) => {
  const [aiDescription, setAiDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addPhase, generateProjectPlan } = useMindMap();

  const handleGenerateWithAI = async () => {
    if (!aiDescription.trim()) return;
    setIsLoading(true);
    try {
      await generateProjectPlan(aiDescription);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='w-[320px] h-full bg-background-900/95 border-r border-background-700/50 flex flex-col relative'>
      {/* Compact Header */}
      <div className='flex-shrink-0 px-4 py-3 border-b border-background-700/30'>
        <div className='flex items-center gap-2 pr-8'>
          <div className='w-6 h-6 bg-accent-500 rounded-md flex items-center justify-center'>
            <Wrench className='w-3.5 h-3.5 text-white' />
          </div>
          <h2 className='text-sm font-semibold text-white'>Inspector</h2>
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 p-4 space-y-6 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-background-600/50'>
        {/* AI Assistant Section - Only for authenticated users */}
        {!isGuest && (
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <div className='w-4 h-4 bg-purple-500 rounded flex items-center justify-center'>
                <Sparkles className='w-2.5 h-2.5 text-white' />
              </div>
              <h3 className='text-xs font-semibold text-secondary-300 uppercase tracking-wide'>
                AI Assistant
              </h3>
            </div>

            <div className='space-y-3'>
              <p className='text-xs text-secondary-400 leading-relaxed'>
                Describe your project to generate phases and tasks
                automatically.
              </p>

              <div className='space-y-2'>
                <textarea
                  value={aiDescription}
                  onChange={(e) => setAiDescription(e.target.value)}
                  disabled={isLoading}
                  rows={3}
                  maxLength={300}
                  className='w-full px-3 py-2 text-xs border border-background-600/60 bg-background-800/50 rounded-lg focus:ring-1 focus:ring-purple-500/30 focus:border-purple-500/60 transition-all duration-200 resize-none text-white placeholder-secondary-500 font-medium'
                  placeholder='e.g., Mobile app for vintage clothing marketplace...'
                />

                <button
                  onClick={handleGenerateWithAI}
                  disabled={!aiDescription.trim() || isLoading}
                  className='w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-colors duration-200 disabled:opacity-50'
                >
                  {isLoading ? (
                    <div className='flex items-center justify-center gap-2'>
                      <Loader2 className='w-3 h-3 animate-spin' />
                      <span>Generating...</span>
                    </div>
                  ) : (
                    'Generate with AI'
                  )}
                </button>
              </div>

              <div className='p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg'>
                <div className='flex items-start gap-2'>
                  <Sparkles className='w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0' />
                  <div>
                    <p className='text-xs font-medium text-purple-300 mb-1'>
                      Smart Planning
                    </p>
                    <p className='text-xs text-purple-400/80 leading-relaxed'>
                      AI analyzes your description and creates structured
                      project phases with tasks.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guest Mode Notice */}
        {isGuest && (
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <div className='w-4 h-4 bg-purple-500 rounded flex items-center justify-center'>
                <User className='w-2.5 h-2.5 text-white' />
              </div>
              <h3 className='text-xs font-semibold text-secondary-300 uppercase tracking-wide'>
                Guest Mode
              </h3>
            </div>

            <div className='p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg'>
              <div className='flex items-start gap-2'>
                <User className='w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0' />
                <div>
                  <p className='text-xs font-medium text-purple-300 mb-1'>
                    Try Nexus Free
                  </p>
                  <p className='text-xs text-purple-400/80 leading-relaxed'>
                    You're in guest mode. Sign in to access AI features and sync
                    across devices.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Manual Tools Section */}
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <div className='w-1 h-3 bg-accent-500 rounded-full' />
            <h3 className='text-xs font-semibold text-secondary-300 uppercase tracking-wide'>
              Quick Actions
            </h3>
          </div>

          <div className='space-y-2'>
            {/* Add Phase Button */}
            <button
              onClick={() => addPhase()}
              disabled={isLoading}
              className='w-full flex items-center gap-3 px-3 py-2.5 bg-background-800/50 hover:bg-background-700/50 border border-background-600/60 hover:border-accent-500/40 text-secondary-300 hover:text-white text-xs font-medium rounded-lg transition-all duration-200 disabled:opacity-50'
            >
              <div className='p-1.5 bg-background-700/50 rounded-md'>
                <Plus className='w-3 h-3' />
              </div>
              <div className='text-left flex-1'>
                <div className='font-medium'>Add Phase</div>
                <div className='text-secondary-500 mt-0.5'>
                  Create project phase
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Project Overview */}
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <div className='w-1 h-3 bg-secondary-500 rounded-full' />
            <h3 className='text-xs font-semibold text-secondary-300 uppercase tracking-wide'>
              Project Overview
            </h3>
          </div>

          <div className='grid grid-cols-2 gap-2 text-xs'>
            <div className='p-2 bg-background-800/30 rounded-lg border border-background-700/30'>
              <div className='text-secondary-400 font-medium mb-1'>Phases</div>
              <div className='text-white font-semibold'>
                {overviewStats.phases}
              </div>
            </div>
            <div className='p-2 bg-background-800/30 rounded-lg border border-background-700/30'>
              <div className='text-secondary-400 font-medium mb-1'>Tasks</div>
              <div className='text-white font-semibold'>
                {overviewStats.tasks}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <div className='flex-shrink-0 p-4 border-t border-background-700/30'>
        <div className='text-center'>
          <div className='text-xs font-medium text-secondary-400'>Nexus</div>
          <div className='text-xs text-secondary-500 mt-1 flex items-center justify-center gap-1'>
            <div className='w-1 h-1 bg-accent-500 rounded-full' />
            <span>Project Manager</span>
            <div className='w-1 h-1 bg-accent-500 rounded-full' />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefaultView;
