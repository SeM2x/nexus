import React, { useState } from 'react';
import { X, Download, FileText, Copy, Check } from 'lucide-react';
import type { Project } from '@/types';

interface ExportProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectData?: Partial<Project>;
}

const ExportProjectModal: React.FC<ExportProjectModalProps> = ({
  isOpen,
  onClose,
  projectData,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const exportData = {
    exportDate: new Date().toISOString(),
    version: '1.0.0',
    ...projectData,
  };

  const jsonString = JSON.stringify(exportData, null, 2);

  const handleDownload = async () => {
    setIsExporting(true);

    try {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectData?.name
        ?.replace(/[^a-z0-9]/gi, '_')
        .toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);

      // Close modal after successful download
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Failed to export project:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Modal */}
      <div className='relative bg-background-800 border border-background-700 rounded-xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-background-700'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center'>
              <Download className='w-4 h-4 text-white' />
            </div>
            <div>
              <h2 className='text-lg font-semibold text-white'>
                Export Project
              </h2>
              <p className='text-sm text-secondary-400'>
                Download your project as JSON
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
        <div className='flex-1 p-6 space-y-4 flex flex-col min-h-'>
          {/* Export Info */}
          <div className='grid grid-cols-2 gap-4 flex-shrink-0'>
            <div className='p-3 bg-background-700/50 rounded-lg'>
              <div className='text-xs text-secondary-400 mb-1'>
                Project Name
              </div>
              <div className='text-sm font-medium text-white'>
                {projectData?.name ?? 'Untitled Project'}
              </div>
            </div>
            <div className='p-3 bg-background-700/50 rounded-lg'>
              <div className='text-xs text-secondary-400 mb-1'>Export Date</div>
              <div className='text-sm font-medium text-white'>
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* JSON Preview */}
          <div className='flex-1 flex flex-col min-h-0'>
            <div className='flex items-center justify-between mb-2 flex-shrink-0'>
              <div className='flex items-center gap-2'>
                <FileText className='w-4 h-4 text-secondary-400' />
                <span className='text-sm font-medium text-secondary-300'>
                  JSON Preview
                </span>
              </div>
              <button
                onClick={handleCopyToClipboard}
                className='flex items-center gap-2 px-3 py-1.5 text-xs text-secondary-300 hover:text-white bg-background-700/50 hover:bg-background-600/50 rounded-md transition-colors'
              >
                {copied ? (
                  <>
                    <Check className='w-3 h-3' />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className='w-3 h-3' />
                    Copy
                  </>
                )}
              </button>
            </div>

            <div className='relative flex-1 bg-background-900/50 border border-background-600 rounded-lg min-h-'>
              <pre className='absolute inset-0 text-xs text-secondary-300 whitespace-pre font-mono leading-relaxed p-4 overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-background-600/50'>
                {jsonString}
              </pre>
            </div>
          </div>
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
            onClick={handleDownload}
            disabled={isExporting}
            className='flex items-center gap-2 px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <Download className='w-4 h-4' />
            {isExporting ? 'Exporting...' : 'Download JSON'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportProjectModal;
