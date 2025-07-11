import React, { useState } from 'react';
import { X, FolderOpen, FileText, Palette, Plus, Zap } from 'lucide-react';
import type { ProjectFormData, ColorOption } from '@/types';

interface ProjectCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (projectData: ProjectFormData) => Promise<void>;
}

const ProjectCreationModal: React.FC<ProjectCreationModalProps> = ({ isOpen, onClose, onCreateProject }) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    color: 'from-blue-500 to-blue-600',
    aiPrompt: ''
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Color options for projects
  const colorOptions: ColorOption[] = [
    { value: 'from-blue-500 to-blue-600', label: 'Ocean Blue', preview: 'bg-gradient-to-r from-blue-500 to-blue-600' },
    { value: 'from-purple-500 to-purple-600', label: 'Royal Purple', preview: 'bg-gradient-to-r from-purple-500 to-purple-600' },
    { value: 'from-green-500 to-green-600', label: 'Forest Green', preview: 'bg-gradient-to-r from-green-500 to-green-600' },
    { value: 'from-red-500 to-red-600', label: 'Crimson Red', preview: 'bg-gradient-to-r from-red-500 to-red-600' },
    { value: 'from-yellow-500 to-yellow-600', label: 'Golden Yellow', preview: 'bg-gradient-to-r from-yellow-500 to-yellow-600' },
    { value: 'from-pink-500 to-pink-600', label: 'Rose Pink', preview: 'bg-gradient-to-r from-pink-500 to-pink-600' },
    { value: 'from-indigo-500 to-indigo-600', label: 'Deep Indigo', preview: 'bg-gradient-to-r from-indigo-500 to-indigo-600' },
    { value: 'from-teal-500 to-teal-600', label: 'Teal Mint', preview: 'bg-gradient-to-r from-teal-500 to-teal-600' },
    { value: 'from-orange-500 to-orange-600', label: 'Sunset Orange', preview: 'bg-gradient-to-r from-orange-500 to-orange-600' },
    { value: 'from-cyan-500 to-cyan-600', label: 'Sky Cyan', preview: 'bg-gradient-to-r from-cyan-500 to-cyan-600' },
    { value: 'from-emerald-500 to-emerald-600', label: 'Emerald Green', preview: 'bg-gradient-to-r from-emerald-500 to-emerald-600' },
    { value: 'from-violet-500 to-violet-600', label: 'Electric Violet', preview: 'bg-gradient-to-r from-violet-500 to-violet-600' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleColorSelect = (colorValue: string): void => {
    setFormData(prev => ({
      ...prev,
      color: colorValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onCreateProject(formData);
      // Reset form
      setFormData({
        name: '',
        description: '',
        color: 'from-blue-500 to-blue-600',
        aiPrompt: ''
      });
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = (): void => {
    if (!isSubmitting) {
      setFormData({
        name: '',
        description: '',
        color: 'from-blue-500 to-blue-600',
        aiPrompt: ''
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-background-800/95 backdrop-blur-xl border border-background-700/50 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          {/* Clean Header */}
          <div className="flex items-center justify-between p-6 border-b border-background-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-accent-500 to-accent-600 rounded-lg shadow-lg">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Create New Project</h2>
                <p className="text-sm text-secondary-400 font-medium">Set up your project with AI assistance</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 text-secondary-400 hover:text-white hover:bg-background-700/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Project Name */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-secondary-300 tracking-wide uppercase">
                <FolderOpen className="w-4 h-4" />
                Project Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-background-600 bg-background-700/50 rounded-lg focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all duration-300 text-base font-semibold text-white placeholder-secondary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter your project name..."
                maxLength={100}
              />
            </div>

            {/* Project Description - Secondary Field */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-secondary-300 tracking-wide uppercase">
                <FileText className="w-4 h-4" />
                Project Summary (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={isSubmitting}
                rows={3}
                className="w-full px-4 py-3 border border-background-600 bg-background-700/50 rounded-lg focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all duration-300 resize-none text-white placeholder-secondary-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Brief summary for your project dashboard..."
                maxLength={200}
              />
              <div className="text-xs text-secondary-500 text-right">
                {formData.description.length}/200 characters
              </div>
            </div>

            {/* Color Selection */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-secondary-300 tracking-wide uppercase">
                <Palette className="w-4 h-4" />
                Project Color
              </label>
              
              {/* Selected Color Preview */}
              <div className="flex items-center gap-4 p-4 bg-background-700/30 rounded-lg border border-background-600/50">
                <div className={`w-12 h-12 rounded-lg shadow-lg ${formData.color.replace('from-', 'bg-gradient-to-r from-').replace(' to-', ' to-')}`} />
                <div>
                  <div className="text-white font-semibold">
                    {colorOptions.find(option => option.value === formData.color)?.label || 'Custom Color'}
                  </div>
                  <div className="text-sm text-secondary-400">Selected project color</div>
                </div>
              </div>

              {/* Color Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {colorOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleColorSelect(option.value)}
                    disabled={isSubmitting}
                    className={`
                      group relative w-full aspect-square rounded-lg shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed
                      ${option.preview}
                      ${formData.color === option.value 
                        ? 'ring-4 ring-accent-400 scale-105' 
                        : 'hover:ring-2 hover:ring-white/30'
                      }
                    `}
                    title={option.label}
                  >
                    {formData.color === option.value && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full shadow-lg" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center gap-4 pt-6 border-t border-background-700/50">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-background-700/50 hover:bg-background-600/50 text-secondary-300 hover:text-white font-semibold rounded-lg transition-all duration-300 border border-background-600/50 hover:border-background-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.name.trim() || isSubmitting}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-accent-600 via-accent-600 to-accent-700 hover:from-accent-700 hover:via-accent-700 hover:to-accent-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 hover:shadow-accent-lg hover:scale-[1.02] border border-accent-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {formData.aiPrompt?.trim() ? (
                      <>
                        <Zap className="w-5 h-5" />
                        Create with AI
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        Create Project
                      </>
                    )}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ProjectCreationModal;