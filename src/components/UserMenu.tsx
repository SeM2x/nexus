import React, { useState } from 'react';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const UserMenu: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-background-800/60 hover:bg-background-700/60 text-secondary-300 hover:text-white font-medium rounded-lg transition-all duration-200 border border-background-700/40 h-8"
      >
        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-accent-500 to-accent-600 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
        </div>
        <div className="hidden sm:block text-left min-w-0">
          <div className="text-xs font-semibold text-white truncate max-w-[80px] lg:max-w-[100px]">
            {user.email?.split('@')[0] || 'User'}
          </div>
        </div>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-2 w-56 sm:w-64 bg-background-800/95 backdrop-blur-xl border border-background-700/50 rounded-xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-background-700/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-accent-500 to-accent-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-white truncate">
                    {user.email?.split('@')[0] || 'User'}
                  </div>
                  <div className="text-xs text-secondary-400 truncate">
                    {user.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Add settings functionality here
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-secondary-300 hover:text-white hover:bg-background-700/50 transition-all duration-200"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleSignOut();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-status-blocked-400 hover:text-status-blocked-300 hover:bg-status-blocked-500/10 transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;