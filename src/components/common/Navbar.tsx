import React from 'react';
import {
  GitBranch,
  Home,
  LayoutGrid,
  LogIn,
  Menu,
  Save,
  Share2,
  Users,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({
  isGuest,
  projectName,
}: {
  isGuest?: boolean;
  projectName: string;
}) => {
  const [isMobileMenuOpen] = React.useState(false);

  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const id = 0;
  const viewMode: 'mindmap' | 'kanban' = id ? 'kanban' : 'mindmap';
  //isGuest = false;
  return (
    <div className='sticky top-0 z-50 h-12 bg-background-900/95 backdrop-blur-xl border-b border-background-700/50 shadow-sm'>
      <div className='h-full flex items-center justify-between px-3 sm:px-4 max-w-none gap-3'>
        {/* Left Section - Compact Navigation */}
        <div className='flex items-center gap-3 min-w-0 flex-1'>
          {/* Back/Home Button */}
          <button
            onClick={handleBackToDashboard}
            className='flex items-center justify-center w-7 h-7 text-secondary-400 hover:text-white hover:bg-background-700/50 rounded-md transition-colors duration-200'
            title={isGuest ? 'Sign In' : 'Back to Dashboard'}
          >
            {isGuest ? (
              <LogIn className='w-3.5 h-3.5' />
            ) : (
              <Home className='w-3.5 h-3.5' />
            )}
          </button>

          {/* Project Info */}
          <div className='flex items-center gap-2 min-w-0 flex-'>
            {isGuest && (
              <div className='px-1.5 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-medium rounded border border-purple-500/30'>
                GUEST
              </div>
            )}
            <div className='min-w-0 flex-1'>
              <h1 className='text-sm font-medium text-white truncate max-w-[120px] sm:max-w-[200px] lg:max-w-[300px]'>
                {projectName}
              </h1>
            </div>
          </div>

          <div className='h-5 border-l border-background-700' />
          {/* Save Project Button - Guests Only */}
          {isGuest && (
            <button
              //onClick={handleSaveProject}
              className='flex items-center gap-1.5 px-3 py-1.5 bg-accent-600 hover:bg-accent-700 text-white font-medium text-xs rounded-md transition-colors duration-200'
            >
              <Save className='w-3.5 h-3.5' />
              <span className='hidden sm:inline'>Save</span>
            </button>
          )}
          {/* User Avatars */}
          {!isGuest && (
            <div className='flex items-center -space-x-1'>
              <div className='w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full border-2 border-background-900 flex items-center justify-center'>
                <span className='text-[10px] font-semibold text-white'>J</span>
              </div>
              <div className='w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full border-2 border-background-900 flex items-center justify-center'>
                <Users className='w-2.5 h-2.5 text-white' />
              </div>
            </div>
          )}
        </div>

        {/* Center Section - View Mode (Desktop Only) */}
        <div className='hidden lg:flex items-center'>
          <div className='flex items-center bg-background-800/60 rounded-md p-0.5 border border-background-700/50'>
            <button
              //onClick={() => setViewMode('mindmap')}
              className={`
                flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all duration-200
                ${
                  viewMode === 'mindmap'
                    ? 'bg-accent-600 text-white shadow-sm'
                    : 'text-secondary-400 hover:text-white hover:bg-background-700/50'
                }
              `}
            >
              <GitBranch className='w-4 h-4' />
              {/* <span>Mind Map</span> */}
            </button>
            <button
              //onClick={() => setViewMode('kanban')}
              className={`
                flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all duration-200
                ${
                  viewMode === 'kanban'
                    ? 'bg-accent-600 text-white shadow-sm'
                    : 'text-secondary-400 hover:text-white hover:bg-background-700/50'
                }
              `}
            >
              <LayoutGrid className='w-4 h-4' />
              {/* <span>Kanban</span> */}
            </button>
          </div>
        </div>

        {/* Right Section - Actions & Controls */}
        <div className='flex items-center gap-2'>
          {/* Collaboration Section - Authenticated Users */}
          {!isGuest && (
            <div className='hidden sm:flex items-center gap-2'>
              {/* Share Button */}
              <button
                disabled
                className='flex items-center gap-1 px-2 py-1 text-secondary-500 hover:text-secondary-400 text-xs rounded-md transition-colors duration-200 cursor-not-allowed opacity-60'
                title='Collaboration coming soon'
              >
                <Share2 className='w-3 h-3' />
                <span className='hidden lg:inline'>Share</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            //onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className='lg:hidden flex items-center justify-center w-7 h-7 text-secondary-400 hover:text-white hover:bg-background-700/50 rounded-md transition-colors duration-200'
          >
            {isMobileMenuOpen ? (
              <X className='w-3.5 h-3.5' />
            ) : (
              <Menu className='w-3.5 h-3.5' />
            )}
          </button>

          {/* Guest Sign In - Desktop */}
          {isGuest && (
            <button
              onClick={handleSignIn}
              className='hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-background-800/60 hover:bg-background-700/60 text-secondary-300 hover:text-white font-medium text-xs rounded-md border border-background-700/50 transition-colors duration-200'
            >
              <LogIn className='w-3 h-3' />
              <span>Sign In</span>
            </button>
          )}

          {/* User Menu - Authenticated Users */}
          {!isGuest && (
            <div className='hidden sm:flex items-center'>
              {/* <UserMenu /> */}
              <button className='flex items-center gap-1.5 px-2 py-1.5 text-secondary-400 hover:text-white rounded-md transition-colors duration-200'>
                <div className='w-5 h-5 bg-gradient-to-r from-accent-500 to-accent-600 rounded-full flex items-center justify-center'>
                  <span className='text-[10px] font-semibold text-white'>
                    U
                  </span>
                </div>
                <span className='text-xs font-medium hidden lg:inline'>
                  User
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown - Improved */}
      {isMobileMenuOpen && (
        <div className='lg:hidden absolute top-full left-0 right-0 bg-background-900/96 backdrop-blur-xl border-b border-background-700/50 shadow-xl'>
          <div className='p-3 space-y-3'>
            {/* View Mode Switcher */}
            <div className='space-y-1.5'>
              <div className='text-[10px] font-medium text-secondary-400 uppercase tracking-wider px-0.5'>
                View Mode
              </div>
              <div className='flex gap-1'>
                <button
                  // onClick={() => {
                  //   setViewMode('mindmap');
                  //   setIsMobileMenuOpen(false);
                  // }}
                  className={`
                    flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md font-medium text-sm transition-colors duration-200
                    ${
                      viewMode === 'mindmap'
                        ? 'bg-accent-600 text-white'
                        : 'bg-background-800/60 text-secondary-400 hover:text-white hover:bg-background-700/50'
                    }
                  `}
                >
                  <GitBranch className='w-3.5 h-3.5' />
                  <span>Mind Map</span>
                </button>
                <button
                  onClick={() => {
                    //setViewMode('kanban');
                    //setIsMobileMenuOpen(false);
                  }}
                  className={`
                    flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md font-medium text-sm transition-colors duration-200
                    ${
                      viewMode === 'kanban'
                        ? 'bg-accent-600 text-white'
                        : 'bg-background-800/60 text-secondary-400 hover:text-white hover:bg-background-700/50'
                    }
                  `}
                >
                  <LayoutGrid className='w-3.5 h-3.5' />
                  <span>Kanban</span>
                </button>
              </div>
            </div>

            {/* Guest Actions */}
            {isGuest && (
              <div className='pt-2 border-t border-background-700/50 space-y-2'></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
