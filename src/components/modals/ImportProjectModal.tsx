import React, { useState } from 'react';
import { X, Upload, FileText, AlertCircle, TriangleAlert } from 'lucide-react';

interface ImportProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport?: (projectData: unknown) => Promise<void>;
}

const ImportProjectModal: React.FC<ImportProjectModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    setError(null);
    if (files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    if (!file.name.endsWith('.json')) {
      setError('Please select a valid JSON file');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    
    setSelectedFile(file);
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    
    // Show confirmation before proceeding
    if (!showWarning) {
      setShowWarning(true);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const text = await selectedFile.text();
      const projectData = JSON.parse(text);
      
      // Basic validation of project structure
      if (!projectData.nodes || !projectData.edges) {
        throw new Error('Invalid project file format');
      }
      
      if (onImport) {
        await onImport(projectData);
      }
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import project');
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setError(null);
    setIsLoading(false);
    setDragOver(false);
    setShowWarning(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className='relative bg-background-800 border border-background-700 rounded-xl shadow-2xl w-full max-w-md'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-background-700'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center'>
              <Upload className='w-4 h-4 text-white' />
            </div>
            <div>
              <h2 className='text-lg font-semibold text-white'>Import Project</h2>
              <p className='text-sm text-secondary-400'>Load a project from JSON file</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className='text-secondary-400 hover:text-white transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 space-y-4'>
          {/* File Drop Zone */}
          <div
            className={`
              border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
              ${dragOver 
                ? 'border-accent-500 bg-accent-500/10' 
                : 'border-background-600 hover:border-background-500'
              }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <FileText className='w-12 h-12 text-secondary-400 mx-auto mb-3' />
            <div className='space-y-2'>
              <p className='text-secondary-300 font-medium'>
                Drop your JSON file here
              </p>
              <p className='text-sm text-secondary-400'>
                or{' '}
                <label className='text-accent-400 hover:text-accent-300 cursor-pointer underline'>
                  browse files
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className='hidden'
                  />
                </label>
              </p>
              <p className='text-xs text-secondary-500'>
                Maximum file size: 10MB
              </p>
            </div>
          </div>

          {/* Selected File */}
          {selectedFile && (
            <div className='flex items-center gap-3 p-3 bg-background-700/50 rounded-lg'>
              <FileText className='w-5 h-5 text-accent-400' />
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-white truncate'>
                  {selectedFile.name}
                </p>
                <p className='text-xs text-secondary-400'>
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className='text-secondary-400 hover:text-white'
              >
                <X className='w-4 h-4' />
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className='flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg'>
              <AlertCircle className='w-4 h-4 text-red-400 flex-shrink-0' />
              <p className='text-sm text-red-300'>{error}</p>
            </div>
          )}

          {/* Confirmation Step */}
          {showWarning && (
            <div className='flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg'>
              <TriangleAlert className='w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5' />
              <p className='text-sm text-yellow-300'>
                This will replace your current workspace with the imported project. Your current work will be overwritten.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end gap-3 p-6 border-t border-background-700'>
          {showWarning ? (
            <>
              <button
                onClick={() => setShowWarning(false)}
                className='px-4 py-2 text-secondary-300 hover:text-white transition-colors'
              >
                Back
              </button>
              <button
                onClick={handleImport}
                disabled={isLoading}
                className='px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLoading ? 'Importing...' : 'Import Project'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleClose}
                className='px-4 py-2 text-secondary-300 hover:text-white transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!selectedFile || isLoading}
                className='px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLoading ? 'Importing...' : 'Continue'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportProjectModal;
