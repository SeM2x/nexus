import React, { useState } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { Project } from '../types';

interface ProjectDeletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteProject: (projectId: string) => Promise<void>;
  project: Project | null;
}

const ProjectDeletionModal: React.FC<ProjectDeletionModalProps> = ({ 
  isOpen, 
  onClose, 
  onDeleteProject, 
  project 
}) => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [confirmText, setConfirmText] = useState<string>('');

  const handleDelete = async (): Promise<void> => {
    if (!project || confirmText !== project.name) {
      return;
    }

    setIsDeleting(true);
    
    try {
      await onDeleteProject(project.id);
      handleClose();
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = (): void => {
    if (!isDeleting) {
      setConfirmText('');
      onClose();
    }
  };

  const isConfirmValid = confirmText === project?.name;

  if (!isOpen || !project) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-background-800/95 backdrop-blur-xl border border-background-700/50 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-background-700/50 bg-gradient-to-r from-status-blocked-900/20 to-status-blocked-800/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-r from-status-blocked-500 to-status-blocked-600 rounded-lg shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Delete Project</h2>
                <p className="text-sm text-secondary-400 font-medium">This action cannot be undone</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isDeleting}
              className="p-2 text-secondary-400 hover:text-white hover:bg-background-700/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Warning Message */}
            <div className="p-4 bg-status-blocked-500/10 border border-status-blocked-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-status-blocked-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-status-blocked-300">
                    You are about to permanently delete this project
                  </p>
                  <p className="text-sm text-secondary-400 leading-relaxed">
                    This will delete all phases, tasks, and project data. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            {/* Project Info */}
            <div className="space-y-3">
              <div className="p-4 bg-background-700/30 rounded-xl border border-background-600/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 bg-gradient-to-r ${project.color} rounded-lg shadow-lg`}>
                    <Trash2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{project.name}</h3>
                    <p className="text-sm text-secondary-400">{project.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2 bg-background-800/50 rounded-lg">
                    <div className="text-sm font-bold text-white">{project.phases}</div>
                    <div className="text-xs text-secondary-400">Phases</div>
                  </div>
                  <div className="p-2 bg-background-800/50 rounded-lg">
                    <div className="text-sm font-bold text-white">{project.tasks}</div>
                    <div className="text-xs text-secondary-400">Tasks</div>
                  </div>
                  <div className="p-2 bg-background-800/50 rounded-lg">
                    <div className="text-sm font-bold text-white">{project.completedTasks}</div>
                    <div className="text-xs text-secondary-400">Completed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmation Input */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-secondary-300 tracking-wide">
                Type the project name to confirm deletion:
              </label>
              <div className="space-y-2">
                <div className="text-sm text-secondary-400 font-mono bg-background-700/30 px-3 py-2 rounded-lg border border-background-600/50">
                  {project.name}
                </div>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  disabled={isDeleting}
                  className="w-full px-4 py-3 border-2 border-background-600 bg-background-700/50 rounded-xl focus:ring-4 focus:ring-status-blocked-500/20 focus:border-status-blocked-500 transition-all duration-300 text-base font-semibold text-white placeholder-secondary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter project name..."
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-background-700/50">
              <button
                type="button"
                onClick={handleClose}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 bg-background-700/50 hover:bg-background-600/50 text-secondary-300 hover:text-white font-semibold rounded-xl transition-all duration-300 border border-background-600/50 hover:border-background-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!isConfirmValid || isDeleting}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-status-blocked-600 via-status-blocked-600 to-status-blocked-700 hover:from-status-blocked-700 hover:via-status-blocked-700 hover:to-status-blocked-800 text-white font-bold rounded-xl shadow-xl transition-all duration-300 hover:shadow-status-blocked-lg hover:scale-105 border border-status-blocked-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-xl"
              >
                {isDeleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    Delete Project
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDeletionModal;