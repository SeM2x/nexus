import React, { useState } from 'react';
import { Database, Trash2, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { seedDatabase, clearUserData } from '../lib/seedData';

const DatabaseSeeder: React.FC = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setMessage(null);
    
    try {
      await seedDatabase();
      setMessage({
        type: 'success',
        text: 'Database seeded successfully! 5 realistic projects have been created with phases and tasks.'
      });
      
      // Refresh the page after a short delay to show the new projects
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error: any) {
      console.error('Seeding error:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to seed database. Please try again.'
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearData = async () => {
    if (!window.confirm('Are you sure you want to delete ALL your projects? This action cannot be undone.')) {
      return;
    }

    setIsClearing(true);
    setMessage(null);
    
    try {
      await clearUserData();
      setMessage({
        type: 'success',
        text: 'All user data cleared successfully!'
      });
      
      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error: any) {
      console.error('Clearing error:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to clear data. Please try again.'
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="bg-background-800/50 backdrop-blur-xl border border-background-700/50 rounded-xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-r from-accent-500 to-accent-600 rounded-lg shadow-lg">
          <Database className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Database Tools</h3>
          <p className="text-sm text-secondary-400 font-medium">Populate with sample data or clear existing data</p>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`
          p-4 rounded-lg mb-4 flex items-center gap-3
          ${message.type === 'success' 
            ? 'bg-status-done-500/10 border border-status-done-500/20' 
            : message.type === 'error'
            ? 'bg-status-blocked-500/10 border border-status-blocked-500/20'
            : 'bg-accent-500/10 border border-accent-500/20'
          }
        `}>
          {message.type === 'success' && <CheckCircle className="w-5 h-5 text-status-done-400 flex-shrink-0" />}
          {message.type === 'error' && <AlertCircle className="w-5 h-5 text-status-blocked-400 flex-shrink-0" />}
          {message.type === 'info' && <Database className="w-5 h-5 text-accent-400 flex-shrink-0" />}
          <p className={`
            text-sm font-medium
            ${message.type === 'success' 
              ? 'text-status-done-300' 
              : message.type === 'error'
              ? 'text-status-blocked-300'
              : 'text-accent-300'
            }
          `}>
            {message.text}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {/* Seed Database Button */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-secondary-300 tracking-wide uppercase">Sample Data</h4>
          <p className="text-sm text-secondary-400 leading-relaxed">
            Populate your account with 5 realistic projects including:
          </p>
          <ul className="text-sm text-secondary-400 space-y-1 ml-4">
            <li>• E-commerce Website Redesign (4 phases, 16 tasks)</li>
            <li>• Mobile App Development (4 phases, 16 tasks)</li>
            <li>• Marketing Campaign Q1 2024 (4 phases, 16 tasks)</li>
            <li>• Data Migration Project (4 phases, 16 tasks)</li>
            <li>• Office Relocation Project (4 phases, 16 tasks)</li>
          </ul>
          <button
            onClick={handleSeedDatabase}
            disabled={isSeeding || isClearing}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-accent-600 via-accent-600 to-accent-700 hover:from-accent-700 hover:via-accent-700 hover:to-accent-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 hover:shadow-accent-lg hover:scale-[1.02] border border-accent-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
            {isSeeding ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating Projects...</span>
              </>
            ) : (
              <>
                <Database className="w-5 h-5" />
                <span>Seed Database with Sample Projects</span>
              </>
            )}
          </button>
        </div>

        {/* Clear Data Button */}
        <div className="space-y-3 pt-4 border-t border-background-700/50">
          <h4 className="text-sm font-semibold text-secondary-300 tracking-wide uppercase">Clear Data</h4>
          <p className="text-sm text-secondary-400 leading-relaxed">
            Remove all your projects, phases, and tasks. This action cannot be undone.
          </p>
          <button
            onClick={handleClearData}
            disabled={isSeeding || isClearing}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-status-blocked-600 via-status-blocked-600 to-status-blocked-700 hover:from-status-blocked-700 hover:via-status-blocked-700 hover:to-status-blocked-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 hover:shadow-status-blocked-lg hover:scale-[1.02] border border-status-blocked-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isClearing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Clearing Data...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-5 h-5" />
                <span>Clear All Data</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSeeder;