import { useState } from 'react';
import MindMap from './MindMap';
import InspectorPanel from './InspectorPanel';
import Navbar from '../common/Navbar';
import type { CustomNode } from '@/types';
import { ReactFlowProvider } from '@xyflow/react';
import { useMindMap } from '@/hooks/useMindMap';
import { AlertCircle, Loader2 } from 'lucide-react';

const Workspace = () => {
  const id = 0;
  const viewMode: 'mindmap' | 'kanban' = id ? 'kanban' : 'mindmap';

  const [selectedNode, setSelectedNode] = useState<CustomNode | null>(null);

  const { project, projectLoading, error, isGuest } = useMindMap();

  if (projectLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-background-900 via-background-800 to-background-900 flex items-center justify-center w-full'>
        <div className='flex flex-col items-center gap-4'>
          <Loader2 className='w-8 h-8 text-accent-500 animate-spin' />
          <p className='text-secondary-400 font-medium'>
            Loading your project...
          </p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-background-900 via-background-800 to-background-900 flex items-center justify-center w-full'>
        <div className='text-center'>
          <div className='p-6 bg-status-blocked-500/20 rounded-2xl inline-block mb-6'>
            <AlertCircle className='w-16 h-16 text-status-blocked-400 mx-auto' />
          </div>
          <h3 className='text-2xl font-bold text-white mb-4'>
            Error Loading Projects
          </h3>
          <p className='text-secondary-400 mb-8 max-w-md mx-auto'>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='px-6 py-3 bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-semibold rounded-xl transition-all duration-300'
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='h-screen bg-gray-900 flex flex-col overflow-hidden'>
      {/* Responsive Header */}
      <Navbar isGuest={isGuest} projectName={project.name} />

      {/* Main Workspace Content - Flex container for canvas and inspector */}
      <div className='flex-1 flex overflow-hidden relative'>
        {/* Background Pattern */}
        <InspectorPanel
          project={project}
          isGuest={isGuest}
          selectedNode={selectedNode}
        />
        <div
          className='absolute inset-0 opacity-[0.015] pointer-events-none'
          style={{
            backgroundImage: `radial-gradient(circle, #64748b 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            backgroundPosition: '12px 12px',
          }}
        />

        {viewMode === 'mindmap' ? (
          <ReactFlowProvider>
            <MindMap
              // projectId={actualProjectId || ''}
              // onAIGenerationComplete={forceRefresh}
              // aiPromptFromUrl={aiPromptFromUrl}
              // isGuest={isGuest}
              setSelectedNode={setSelectedNode}
            />
          </ReactFlowProvider>
        ) : (
          // <KanbanView
          //   projectId={actualProjectId || ''}
          //   nodes={nodes}
          //   edges={edges}
          //   taskDetails={taskDetails}
          //   onUpdateTask={handleUpdateTask}
          //   onAddTask={handleAddTask}
          //   onMoveTask={handleMoveTask}
          // />
          <></>
        )}
      </div>
    </div>
  );
};

export default Workspace;
