import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectName?: string;
  isGuest?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  projectName = 'this project',
  isGuest = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Modal */}
      <div className='relative bg-background-800 border border-background-700 rounded-xl shadow-2xl w-full max-w-md'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-background-700'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center'>
              <AlertTriangle className='w-4 h-4 text-white' />
            </div>
            <div>
              <h2 className='text-lg font-semibold text-white'>
                {isGuest ? 'Delete Guest Project' : 'Delete Project'}
              </h2>
              <p className='text-sm text-secondary-400'>
                This action cannot be undone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='text-secondary-400 hover:text-white transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 space-y-4'>
          {/* Warning Message */}
          <div className='flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg'>
            <AlertTriangle className='w-5 h-5 text-red-400 flex-shrink-0 mt-0.5' />
            <div>
              <p className='text-sm font-medium text-red-300 mb-1'>
                Are you sure you want to delete{' '}
                {isGuest ? 'your guest project' : `"${projectName}"`}?
              </p>
              <p className='text-sm text-red-400/80'>
                {isGuest
                  ? 'All your work will be permanently lost and cannot be recovered. Consider exporting your project first.'
                  : 'This will permanently delete the project and all its content. This action cannot be undone.'}
              </p>
            </div>
          </div>

          {/* Project Info */}
          {!isGuest && (
            <div className='p-3 bg-background-700/50 rounded-lg'>
              <div className='text-xs text-secondary-400 mb-1'>
                Project Name
              </div>
              <div className='text-sm font-medium text-white'>
                {projectName}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end gap-3 p-6 border-t border-background-700'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-secondary-300 hover:text-white transition-colors'
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className='flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors'
          >
            <Trash2 className='w-4 h-4' />
            {isGuest ? 'Delete Guest Project' : 'Delete Project'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
