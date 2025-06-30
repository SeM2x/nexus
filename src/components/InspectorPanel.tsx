import React, { useState, useEffect } from 'react';
import { Plus, Zap, Wrench, Target, FolderOpen, FileText, Clock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { CustomNode, TaskDetails, TaskDetailsEntry, StatusOption } from '../types';
import { supabase } from '../lib/supabase';
import { processAndSaveAIProjectPlan, getRootNodeId, clearExistingProjectData } from '../lib/aiProjectGenerator';

interface InspectorPanelProps {
  onAddPhase: () => void;
  selectedNode: CustomNode | null;
  onUpdateTask: (taskId: string, updates: Partial<TaskDetailsEntry>) => void;
  taskDetails: TaskDetails;
  onAddTask: (phaseId: string) => void;
  onUpdatePhase: (phaseId: string, updates: { title?: string; description?: string }) => void;
  projectId?: string;
  onAIGenerationComplete?: () => void;
  aiPromptFromUrl?: string | null;
  isGuest?: boolean; // Add guest mode flag
}

const InspectorPanel: React.FC<InspectorPanelProps> = ({ 
  onAddPhase, 
  selectedNode, 
  onUpdateTask, 
  taskDetails, 
  onAddTask, 
  onUpdatePhase,
  projectId,
  onAIGenerationComplete,
  aiPromptFromUrl,
  isGuest = false // Default to false for authenticated users
}) => {
  // Local state for editing
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [status, setStatus] = useState<string>('To Do');

  // AI Assistant state
  const [aiDescription, setAiDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Status options for task details
  const statusOptions: StatusOption[] = [
    { 
      value: 'To Do', 
      label: 'To Do', 
      color: 'bg-status-todo-500', 
      hoverColor: 'hover:bg-status-todo-500/10',
      icon: Clock,
      dotColor: 'bg-status-todo-500',
      description: 'Ready to start'
    },
    { 
      value: 'In Progress', 
      label: 'In Progress', 
      color: 'bg-status-progress-500', 
      hoverColor: 'hover:bg-status-progress-500/10',
      icon: Zap,
      dotColor: 'bg-status-progress-500',
      description: 'Currently working'
    },
    { 
      value: 'Blocked', 
      label: 'Blocked', 
      color: 'bg-status-blocked-500', 
      hoverColor: 'hover:bg-status-blocked-500/10',
      icon: AlertCircle,
      dotColor: 'bg-status-blocked-500',
      description: 'Needs attention'
    },
    { 
      value: 'Done', 
      label: 'Done', 
      color: 'bg-status-done-500', 
      hoverColor: 'hover:bg-status-done-500/10',
      icon: CheckCircle,
      dotColor: 'bg-status-done-500',
      description: 'Completed'
    }
  ];

  // Set AI prompt from URL when component mounts (only for authenticated users)
  useEffect(() => {
    if (aiPromptFromUrl && !selectedNode && !isGuest) {
      console.log('Setting AI prompt from URL:', aiPromptFromUrl);
      setAiDescription(aiPromptFromUrl);
      
      // Auto-trigger AI generation after a short delay to ensure everything is loaded
      setTimeout(() => {
        console.log('Auto-triggering AI generation...');
        handleAiGenerate();
      }, 1500);
    }
  }, [aiPromptFromUrl, selectedNode, isGuest]);

  // Update local state when selectedNode changes
  useEffect(() => {
    if (selectedNode && selectedNode.type === 'taskNode') {
      const taskData = taskDetails[selectedNode.id] || {};
      setTitle(taskData.title || selectedNode.data.label || 'New Task');
      setDescription(taskData.description || '');
      setStatus(taskData.status || 'To Do');
    } else if (selectedNode && selectedNode.type === 'phaseNode') {
      setTitle(selectedNode.data.label || 'New Phase');
      setDescription(selectedNode.data.description || '');
    }
  }, [selectedNode, taskDetails]);

  const handleTaskSave = (): void => {
    if (selectedNode && selectedNode.type === 'taskNode' && onUpdateTask) {
      onUpdateTask(selectedNode.id, {
        title,
        description,
        status: status as any
      });
    }
  };

  const handlePhaseSave = (): void => {
    if (selectedNode && selectedNode.type === 'phaseNode' && onUpdatePhase) {
      onUpdatePhase(selectedNode.id, {
        title,
        description
      });
    }
  };

  const handleStatusChange = (newStatus: string): void => {
    setStatus(newStatus);
    // Auto-save status changes for tasks
    if (selectedNode && selectedNode.type === 'taskNode' && onUpdateTask) {
      onUpdateTask(selectedNode.id, {
        title,
        description,
        status: newStatus as any
      });
    }
  };

  // AI Assistant handlers (only for authenticated users)
  const handleAiGenerate = async (): Promise<void> => {
    if (!aiDescription.trim() || !projectId || isGuest) return;
    
    setIsLoading(true);
    
    try {
      console.log('🤖 Starting AI generation with prompt:', aiDescription.trim());
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('generate-plan', {
        body: {
          projectDescription: aiDescription.trim()
        }
      });

      if (error) {
        console.error('Error calling generate-plan function:', error);
        
        // Show user-friendly error message
        const errorMessage = error.message || 'Failed to generate project plan. Please try again.';
        showToast('error', errorMessage);
        return;
      }

      if (!data || !data.phases) {
        console.error('Invalid response from generate-plan function:', data);
        showToast('error', 'Received invalid response from AI service. Please try again.');
        return;
      }

      console.log('✅ AI generation successful:', data);

      // Get the root node ID for this project
      const rootNodeId = await getRootNodeId(projectId);
      if (!rootNodeId) {
        showToast('error', 'Could not find project root. Please refresh and try again.');
        return;
      }

      // Ask user for confirmation before clearing existing data
      const hasExistingData = Object.keys(taskDetails).length > 0;
      if (hasExistingData) {
        const confirmReplace = window.confirm(
          'This will replace your existing project structure with the AI-generated plan. This action cannot be undone. Continue?'
        );
        
        if (!confirmReplace) {
          setIsLoading(false);
          return;
        }

        // Clear existing project data (except root node)
        await clearExistingProjectData(projectId, rootNodeId);
      }

      // Process and save the AI-generated project plan
      const result = await processAndSaveAIProjectPlan(data, projectId, rootNodeId);
      
      console.log('💾 AI-generated project plan saved:', result);
      
      // Success! Show success message
      showToast('success', `Successfully generated ${data.phases.length} phases with ${result.nodes.length - data.phases.length} tasks!`);
      
      // Clear the description after successful generation
      setAiDescription('');
      
      // Log the structure for debugging
      data.phases.forEach((phase: any, index: number) => {
        console.log(`Phase ${index + 1}: ${phase.name} (${phase.tasks.length} tasks)`);
      });

      // Trigger the workspace refresh to load new data from database
      console.log('🔄 Triggering workspace refresh...');
      if (onAIGenerationComplete) {
        // Small delay to ensure database operations are complete
        setTimeout(() => {
          onAIGenerationComplete();
        }, 500);
      }

    } catch (error) {
      console.error('Unexpected error generating with AI:', error);
      
      // Show specific error message if available
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      showToast('error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple toast notification function
  const showToast = (type: 'success' | 'error', message: string): void => {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `
      fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border
      ${type === 'success' 
        ? 'bg-green-500/90 border-green-400/50 text-white' 
        : 'bg-red-500/90 border-red-400/50 text-white'
      }
      animate-in fade-in slide-in-from-right-2 duration-300
    `;
    
    toast.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="flex-shrink-0">
          ${type === 'success' 
            ? '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>'
            : '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>'
          }
        </div>
        <div class="font-medium">${message}</div>
      </div>
    `;
    
    // Add to DOM
    document.body.appendChild(toast);
    
    // Remove after 5 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 5000);
  };

  // Default view when no node is selected
  if (!selectedNode) {
    return (
      <div className="w-[350px] h-full bg-background-900/95 backdrop-blur-xl border-l border-background-600/30 shadow-2xl flex flex-col relative">
        {/* Subtle depth shadow */}
        <div className="absolute -left-6 top-0 bottom-0 w-6 bg-gradient-to-r from-black/10 to-transparent pointer-events-none" />
        
        {/* Clean Header */}
        <div className="flex-shrink-0 p-6 border-b border-background-700/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-accent-500 to-accent-600 rounded-lg shadow-lg">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Project Tools</h2>
          </div>
          <p className="text-sm text-secondary-400 font-medium">
            Manage your project structure and workflow
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-8 overflow-y-auto">
          {/* AI Assistant Section - Only for authenticated users */}
          {!isGuest && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                AI Assistant
              </h3>
              
              <div className="space-y-4">
                <p className="text-sm text-secondary-400 leading-relaxed">
                  Describe your project and let AI generate a complete structure with phases and tasks automatically.
                </p>
                
                {/* AI Description Input */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-secondary-300">
                    Project Description
                  </label>
                  <textarea
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)}
                    disabled={isLoading}
                    rows={4}
                    maxLength={500}
                    className="w-full px-4 py-3 border border-background-600 bg-background-800/50 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 resize-none text-white placeholder-secondary-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="e.g., A mobile e-commerce app for selling vintage clothing with user accounts, product catalog, shopping cart, and payment processing..."
                  />
                  <div className="text-xs text-secondary-500 text-right">
                    {aiDescription.length}/500 characters
                  </div>
                </div>
                
                {/* Primary AI CTA Button */}
                <div className="relative group">
                  <button
                    onClick={handleAiGenerate}
                    disabled={!aiDescription.trim() || isLoading || !projectId}
                    className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 via-purple-600 to-purple-700 hover:from-purple-700 hover:via-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 border border-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:scale-[1.02] hover:enabled:shadow-purple-lg"
                  >
                    <div className="flex items-center justify-center gap-3">
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          <span>Generate with AI</span>
                        </>
                      )}
                    </div>
                  </button>
                </div>
                
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Zap className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-purple-300">
                        Smart Project Planning
                      </p>
                      <p className="text-xs text-purple-400/80 leading-relaxed">
                        AI will analyze your project description and automatically create phases, tasks, and timelines tailored to your specific needs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Guest Mode Notice */}
          {isGuest && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                Guest Mode
              </h3>
              
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Zap className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-purple-300">
                      Try Nexus for Free
                    </p>
                    <p className="text-xs text-purple-400/80 leading-relaxed">
                      You're using guest mode. Your work is saved locally in your browser. Sign in to access AI features and sync across devices.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Manual Tools Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-secondary-300 tracking-wide uppercase flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Manual Tools
            </h3>
            
            {/* Add Phase Button */}
            <button
              onClick={onAddPhase}
              disabled={isLoading}
              className="group w-full flex items-center gap-3 px-4 py-3 bg-transparent border border-background-600 hover:border-accent-500/50 text-secondary-300 hover:text-white font-medium rounded-lg transition-all duration-300 hover:bg-background-800/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="p-2 bg-background-700/50 group-hover:bg-accent-500/20 rounded-lg transition-all duration-300">
                <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold">Add Phase</div>
                <div className="text-xs text-secondary-500 group-hover:text-secondary-400">Create a new project phase manually</div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-6 border-t border-background-700/50">
          <div className="text-xs text-secondary-500 text-center">
            <div className="font-medium">Nexus Project Manager</div>
            <div className="mt-1">Organize • Plan • Execute</div>
          </div>
        </div>
      </div>
    );
  }

  // Task Details View
  if (selectedNode.type === 'taskNode') {
    const currentStatusOption = statusOptions.find(option => option.value === status);
    const StatusIcon = currentStatusOption?.icon || Clock;

    return (
      <div className="w-[350px] h-full bg-background-900/95 backdrop-blur-xl border-l border-background-600/30 shadow-2xl flex flex-col relative">
        {/* Subtle depth shadow */}
        <div className="absolute -left-6 top-0 bottom-0 w-6 bg-gradient-to-r from-black/10 to-transparent pointer-events-none" />
        
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-background-700/50 bg-gradient-to-r from-accent-900/20 to-accent-800/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-accent-500 to-accent-600 rounded-lg shadow-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Task Details</h2>
              <p className="text-xs text-secondary-500 font-mono mt-1">
                ID: {selectedNode.id.split('-').pop()?.substring(0, 8)}
              </p>
            </div>
          </div>
          <p className="text-sm text-secondary-400 font-medium">
            Manage your task information
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Title Section */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-secondary-300">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTaskSave}
              className="w-full px-4 py-3 border border-background-600 bg-background-800/50 rounded-lg focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all duration-300 text-base font-semibold text-white placeholder-secondary-500"
              placeholder="Enter task title..."
            />
          </div>

          {/* Status Section */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-secondary-300">
              Status
            </label>
            
            {/* Status Pills - Horizontal Row */}
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => {
                const OptionIcon = option.icon;
                const isSelected = status === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    className={`
                      group flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium 
                      transition-all duration-200 border
                      ${isSelected 
                        ? `${option.color} text-white border-transparent shadow-lg` 
                        : `bg-transparent text-secondary-400 border-background-600 ${option.hoverColor} hover:text-white hover:border-background-500`
                      }
                    `}
                  >
                    <OptionIcon className={`w-4 h-4 transition-colors duration-200`} />
                    <span className="whitespace-nowrap">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-secondary-300">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleTaskSave}
              rows={5}
              className="w-full px-4 py-3 border border-background-600 bg-background-800/50 rounded-lg focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all duration-300 resize-none text-white placeholder-secondary-500 font-medium"
              placeholder="Add a detailed description of this task..."
            />
          </div>

          {/* Current Status Display */}
          <div className="p-4 bg-background-800/30 rounded-lg border border-background-700/50">
            <h3 className="text-sm font-semibold text-secondary-300 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Current Status
            </h3>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${currentStatusOption?.dotColor} shadow-sm`} />
              <span className="font-semibold text-white">{status}</span>
              <StatusIcon className="w-4 h-4 text-secondary-400" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Phase Details View
  if (selectedNode.type === 'phaseNode') {
    return (
      <div className="w-[350px] h-full bg-background-900/95 backdrop-blur-xl border-l border-background-600/30 shadow-2xl flex flex-col relative">
        {/* Subtle depth shadow */}
        <div className="absolute -left-6 top-0 bottom-0 w-6 bg-gradient-to-r from-black/10 to-transparent pointer-events-none" />
        
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-background-700/50 bg-gradient-to-r from-accent-900/20 to-accent-800/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-accent-500 to-accent-600 rounded-lg shadow-lg">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Phase Details</h2>
              <p className="text-xs text-secondary-500 font-mono mt-1">
                ID: {selectedNode.id.substring(0, 8)}
              </p>
            </div>
          </div>
          <p className="text-sm text-secondary-400 font-medium">
            Manage your phase information
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Title Section */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-secondary-300">
              Phase Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handlePhaseSave}
              className="w-full px-4 py-3 border border-background-600 bg-background-800/50 rounded-lg focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all duration-300 text-base font-semibold text-white placeholder-secondary-500"
              placeholder="Enter phase title..."
            />
          </div>

          {/* Description Section */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-secondary-300">
              Phase Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handlePhaseSave}
              rows={6}
              className="w-full px-4 py-3 border border-background-600 bg-background-800/50 rounded-lg focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all duration-300 resize-none text-white placeholder-secondary-500 font-medium"
              placeholder="Describe this phase and its objectives..."
            />
          </div>

          {/* Add Task Button - Moved here for better flow */}
          <div className="pt-2 pb-4">
            <button
              onClick={() => onAddTask && onAddTask(selectedNode.id)}
              className="group w-full px-6 py-4 bg-gradient-to-r from-accent-600 via-accent-600 to-accent-700 hover:from-accent-700 hover:via-accent-700 hover:to-accent-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 hover:shadow-accent-lg hover:scale-[1.02] border border-accent-500/20"
            >
              <span className="flex items-center justify-center gap-3">
                <Plus className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
                Add Task to Phase
              </span>
            </button>
          </div>

          {/* Phase Information Section */}
          <div className="p-4 bg-background-800/30 rounded-lg border border-background-700/50">
            <h3 className="text-sm font-semibold text-secondary-300 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Phase Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-secondary-400 font-medium">Phase Type:</span>
                <span className="text-white font-semibold">Project Phase</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-400 font-medium">Created:</span>
                <span className="text-secondary-300">Just now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for unknown node types
  return (
    <div className="w-[350px] h-full bg-background-900/95 backdrop-blur-xl border-l border-background-600/30 shadow-2xl flex flex-col relative">
      {/* Subtle depth shadow */}
      <div className="absolute -left-6 top-0 bottom-0 w-6 bg-gradient-to-r from-black/10 to-transparent pointer-events-none" />
      
      <div className="p-6">
        <h2 className="text-lg font-bold text-white">Unknown Node Type</h2>
        <p className="text-sm text-secondary-400">Selected node type: {selectedNode.type}</p>
      </div>
    </div>
  );
};

export default InspectorPanel;