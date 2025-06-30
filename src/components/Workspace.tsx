import React, { useState, useCallback, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Home, Loader2, LayoutGrid, GitBranch, Share2, Users, Menu, X, LogIn, Save } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useProjectData } from '../hooks/useProjectData';
import { useGuestProjects } from '../hooks/useGuestProjects';
import { useGuestProjectData } from '../hooks/useGuestProjectData';
import { useAuth } from '../contexts/AuthContext';
import MindMap from './MindMap';
import KanbanView from './KanbanView';
import UserMenu from './UserMenu';
import SaveProjectModal from './SaveProjectModal';

interface WorkspaceProps {
  isGuest?: boolean;
}

const Workspace: React.FC<WorkspaceProps> = ({ isGuest = false }) => {
  const { projectId, guestId } = useParams<{ projectId?: string; guestId?: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  
  // Determine the actual project ID to use
  const actualProjectId = isGuest ? guestId : projectId;
  
  // Use appropriate hooks based on guest mode - conditionally call hooks
  const { projects: authProjects, loading: authProjectsLoading } = !isGuest ? useProjects() : { projects: [], loading: false };
  const { projects: guestProjects, loading: guestProjectsLoading } = isGuest ? useGuestProjects() : { projects: [], loading: false };
  
  const projects = isGuest ? guestProjects : authProjects;
  const projectsLoading = isGuest ? guestProjectsLoading : authProjectsLoading;
  
  // Conditionally call project data hooks based on guest mode
  const authProjectData = !isGuest ? useProjectData(actualProjectId || '') : null;
  const guestProjectData = isGuest ? useGuestProjectData(actualProjectId || '', 'My Guest Project') : null;
  
  // Extract data from the appropriate hook
  const projectData = isGuest ? guestProjectData : authProjectData;
  
  const {
    nodes,
    edges,
    taskDetails,
    loading: projectDataLoading,
    error: projectDataError,
    setNodes,
    setEdges,
    setTaskDetails,
    saveData,
    updateTaskDetailInDb,
    forceRefresh
  } = projectData || {
    nodes: [],
    edges: [],
    taskDetails: {},
    loading: false,
    error: null,
    setNodes: () => {},
    setEdges: () => {},
    setTaskDetails: () => {},
    saveData: async () => {},
    updateTaskDetailInDb: async () => {},
    forceRefresh: async () => {}
  };
  
  const [viewMode, setViewMode] = useState<'mindmap' | 'kanban'>('mindmap');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [aiPromptFromUrl, setAiPromptFromUrl] = useState<string | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  
  // Get project info from projects data
  const project = projects.find(p => p.id === actualProjectId);
  const projectName = project?.name || (isGuest ? 'My Guest Project' : 'Loading...');

  // Check for AI prompt in URL params on component mount
  useEffect(() => {
    const aiPrompt = searchParams.get('aiPrompt');
    if (aiPrompt) {
      setAiPromptFromUrl(aiPrompt);
      // Clear the URL parameter after capturing it
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('aiPrompt');
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleBackToDashboard = (): void => {
    if (isGuest) {
      // For guests, go to login page
      navigate('/login');
    } else {
      // For authenticated users, go to dashboard
      navigate('/dashboard');
    }
  };

  const handleSignIn = (): void => {
    navigate('/login');
  };

  const handleSaveProject = (): void => {
    setIsSaveModalOpen(true);
  };

  // Handle moving tasks between phases in Kanban view
  const handleMoveTask = useCallback(async (taskId: string, fromPhaseId: string, toPhaseId: string) => {
    console.log(`Moving task ${taskId} from ${fromPhaseId} to ${toPhaseId}`);
    
    try {
      // Generate new task ID with the new phase
      const taskIdParts = taskId.split('-');
      if (taskIdParts.length < 3) {
        console.error('Invalid task ID format:', taskId);
        return;
      }
      
      const newTaskId = `task-${toPhaseId}-${taskIdParts.slice(2).join('-')}`;
      console.log('New task ID:', newTaskId);

      // Find the task being moved
      const taskToMove = nodes.find(node => node.id === taskId);
      if (!taskToMove) {
        console.error('Task not found:', taskId);
        return;
      }

      // Update nodes: replace old task with new task ID
      const updatedNodes = nodes.map(node => {
        if (node.id === taskId) {
          return {
            ...node,
            id: newTaskId
          };
        }
        return node;
      });

      // Update edges: update any edges that reference the old task ID
      const updatedEdges = edges.map(edge => {
        // Update source references
        if (edge.source === taskId) {
          return { ...edge, source: newTaskId };
        }
        // Update target references and reconnect to new phase
        if (edge.target === taskId) {
          return {
            ...edge,
            id: crypto.randomUUID(), // Generate new edge ID
            source: toPhaseId,
            target: newTaskId
          };
        }
        return edge;
      });

      // Update task details: move the task detail to the new ID
      const updatedTaskDetails = { ...taskDetails };
      if (updatedTaskDetails[taskId]) {
        updatedTaskDetails[newTaskId] = updatedTaskDetails[taskId];
        delete updatedTaskDetails[taskId];
      }

      console.log('Updated data:', {
        nodes: updatedNodes.length,
        edges: updatedEdges.length,
        taskDetails: Object.keys(updatedTaskDetails).length
      });

      // Update local state immediately for responsive UI
      setNodes(updatedNodes);
      setEdges(updatedEdges);
      setTaskDetails(updatedTaskDetails);

      // Save to storage
      await saveData(updatedNodes, updatedEdges, updatedTaskDetails);
      
      console.log('Task moved successfully');
    } catch (error) {
      console.error('Error moving task:', error);
      alert('Failed to move task. Please try again.');
    }
  }, [nodes, edges, taskDetails, setNodes, setEdges, setTaskDetails, saveData]);

  // Handle adding tasks from Kanban view
  const handleAddTask = useCallback((phaseId: string) => {
    // Switch to mind map view and trigger add task
    setViewMode('mindmap');
  }, []);

  // Handle updating tasks from Kanban view
  const handleUpdateTask = useCallback(async (taskId: string, updates: any) => {
    try {
      await updateTaskDetailInDb(taskId, updates);
      console.log('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task. Please try again.');
    }
  }, [updateTaskDetailInDb]);

  const loading = projectsLoading || projectDataLoading;

  if (loading) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-accent-500 animate-spin" />
          <p className="text-secondary-400 font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (projectDataError) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="p-6 bg-status-blocked-500/20 rounded-2xl inline-block mb-6">
            <Home className="w-16 h-16 text-status-blocked-400 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Error Loading Project</h3>
          <p className="text-secondary-400 mb-8 max-w-md mx-auto">{projectDataError}</p>
          <button
            onClick={handleBackToDashboard}
            className="px-6 py-3 bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-semibold rounded-xl transition-all duration-300"
          >
            {isGuest ? 'Sign In' : 'Back to Dashboard'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Responsive Header */}
      <div className="sticky top-0 z-50 h-14 bg-background-900/98 backdrop-blur-xl border-b border-background-700/30 shadow-lg">
        <div className="h-full flex items-center justify-between px-4 sm:px-6">
          {/* Left Section - Navigation */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              onClick={handleBackToDashboard}
              className="flex items-center justify-center w-8 h-8 text-secondary-400 hover:text-white hover:bg-background-700/50 rounded-lg transition-all duration-200"
              title={isGuest ? 'Sign In' : 'Back to Dashboard'}
            >
              {isGuest ? <LogIn className="w-4 h-4" /> : <Home className="w-4 h-4" />}
            </button>
            
            <div className="h-5 w-px bg-background-600/50" />
            
            {/* Project Title - Responsive */}
            <div className="flex items-center min-w-0">
              {isGuest && (
                <div className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-semibold rounded mr-2 hidden sm:block">
                  GUEST
                </div>
              )}
              <h1 className="text-sm font-semibold text-white tracking-tight truncate max-w-[150px] sm:max-w-[300px]">
                {projectName}
              </h1>
            </div>
          </div>

          {/* Right Section - Responsive Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Save Project Button - Only for guests */}
            {isGuest && (
              <button
                onClick={handleSaveProject}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-semibold text-sm rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">Save Project</span>
                <span className="sm:hidden">Save</span>
              </button>
            )}

            {/* View Mode Switcher - Hidden on mobile, shown on tablet+ */}
            <div className="hidden md:flex items-center bg-background-800/60 backdrop-blur-xl border border-background-700/40 rounded-lg p-0.5 shadow-sm">
              <button
                onClick={() => setViewMode('mindmap')}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-md font-medium text-xs transition-all duration-200
                  ${viewMode === 'mindmap'
                    ? 'bg-accent-600 text-white shadow-sm'
                    : 'text-secondary-400 hover:text-white hover:bg-background-700/50'
                  }
                `}
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Mind Map</span>
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-md font-medium text-xs transition-all duration-200
                  ${viewMode === 'kanban'
                    ? 'bg-accent-600 text-white shadow-sm'
                    : 'text-secondary-400 hover:text-white hover:bg-background-700/50'
                  }
                `}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Kanban</span>
              </button>
            </div>

            {/* Mobile Menu Button - Shown only on mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-8 h-8 text-secondary-400 hover:text-white hover:bg-background-700/50 rounded-lg transition-all duration-200"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            {/* Guest Sign In Button - Hidden on mobile for authenticated users */}
            {isGuest && (
              <button
                onClick={handleSignIn}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-background-800/60 hover:bg-background-700/60 text-secondary-300 hover:text-white font-medium text-xs rounded-lg transition-all duration-200 border border-background-700/40"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Collaboration Hint - Hidden on mobile, only for authenticated users */}
            {!isGuest && (
              <div className="hidden lg:flex items-center gap-3">
                <div className="h-5 w-px bg-background-600/50" />
                
                {/* User Avatars */}
                <div className="flex items-center -space-x-2">
                  <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full border-2 border-background-900 flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">You</span>
                  </div>
                  <div className="w-7 h-7 bg-gradient-to-r from-green-500 to-green-600 rounded-full border-2 border-background-900 flex items-center justify-center">
                    <Users className="w-3 h-3 text-white" />
                  </div>
                  <div className="w-7 h-7 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full border-2 border-background-900 flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">+</span>
                  </div>
                </div>

                {/* Share Button */}
                <button
                  disabled
                  className="flex items-center gap-2 px-3 py-1.5 bg-background-800/60 hover:bg-background-700/60 text-secondary-500 font-medium text-xs rounded-lg transition-all duration-200 border border-background-700/40 cursor-not-allowed opacity-60"
                  title="Collaboration features coming soon"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Share</span>
                </button>
              </div>
            )}

            {!isGuest && (
              <>
                <div className="hidden sm:block h-5 w-px bg-background-600/50" />
                <UserMenu />
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background-900/98 backdrop-blur-xl border-b border-background-700/30 shadow-lg">
            <div className="p-4 space-y-4">
              {/* Mobile View Mode Switcher */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-secondary-300 uppercase tracking-wide">View Mode</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setViewMode('mindmap');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`
                      flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200
                      ${viewMode === 'mindmap'
                        ? 'bg-accent-600 text-white'
                        : 'bg-background-800/60 text-secondary-400 hover:text-white'
                      }
                    `}
                  >
                    <GitBranch className="w-4 h-4" />
                    <span>Mind Map</span>
                  </button>
                  <button
                    onClick={() => {
                      setViewMode('kanban');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`
                      flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200
                      ${viewMode === 'kanban'
                        ? 'bg-accent-600 text-white'
                        : 'bg-background-800/60 text-secondary-400 hover:text-white'
                      }
                    `}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span>Kanban</span>
                  </button>
                </div>
              </div>

              {/* Mobile Actions for guests */}
              {isGuest && (
                <div className="pt-2 border-t border-background-700/50 space-y-2">
                  <button
                    onClick={() => {
                      handleSaveProject();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-semibold rounded-lg transition-all duration-200"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Project</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      handleSignIn();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-background-800/60 hover:bg-background-700/60 text-secondary-300 hover:text-white font-medium rounded-lg transition-all duration-200 border border-background-700/40"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Workspace Content - Flex container for canvas and inspector */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #64748b 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            backgroundPosition: '12px 12px'
          }}
        />
        
        {viewMode === 'mindmap' ? (
          <ReactFlowProvider>
            <MindMap 
              projectId={actualProjectId || ''} 
              onAIGenerationComplete={forceRefresh}
              aiPromptFromUrl={aiPromptFromUrl}
              isGuest={isGuest}
            />
          </ReactFlowProvider>
        ) : (
          <KanbanView
            projectId={actualProjectId || ''}
            nodes={nodes}
            edges={edges}
            taskDetails={taskDetails}
            onUpdateTask={handleUpdateTask}
            onAddTask={handleAddTask}
            onMoveTask={handleMoveTask}
          />
        )}
      </div>

      {/* Save Project Modal */}
      <SaveProjectModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
      />
    </div>
  );
};

export default Workspace;