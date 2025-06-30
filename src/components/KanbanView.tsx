import React from 'react';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { CustomNode, Edge, TaskDetails } from '../types';
import { Kanban } from 'lucide-react';
import PhaseColumn from './PhaseColumn';
import TaskCard from './TaskCard';
import InspectorPanel from './InspectorPanel';

interface KanbanViewProps {
  projectId: string;
  nodes: CustomNode[];
  edges: Edge[];
  taskDetails: TaskDetails;
  onUpdateTask?: (taskId: string, updates: any) => void;
  onAddTask?: (phaseId: string) => void;
  onMoveTask?: (taskId: string, fromPhaseId: string, toPhaseId: string) => void;
}

const KanbanView: React.FC<KanbanViewProps> = ({ 
  projectId, 
  nodes, 
  edges, 
  taskDetails, 
  onUpdateTask, 
  onAddTask,
  onMoveTask
}) => {
  const [activeTask, setActiveTask] = React.useState<CustomNode | null>(null);
  const [selectedElement, setSelectedElement] = React.useState<CustomNode | null>(null);

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts
      },
    })
  );

  // Get phases (non-task nodes, excluding root)
  const phases = nodes.filter(node => 
    node.type === 'phaseNode' || 
    (node.type !== 'taskNode' && node.type !== 'rootNode')
  );

  // Get all tasks
  const allTasks = nodes.filter(node => node.type === 'taskNode');

  // Helper function to get phase ID from task ID
  const getPhaseIdFromTaskId = (taskId: string): string | null => {
    const match = taskId.match(/^task-([^-]+)-/);
    return match ? match[1] : null;
  };

  // Helper function to find task by ID
  const findTaskById = (taskId: string): CustomNode | undefined => {
    return allTasks.find(task => task.id === taskId);
  };

  // Helper function to find phase by ID
  const findPhaseById = (phaseId: string): CustomNode | undefined => {
    return phases.find(phase => phase.id === phaseId);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = findTaskById(active.id as string);
    setActiveTask(task || null);
    console.log('Drag started for task:', active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // This is where we could implement real-time visual feedback
    // For now, we'll keep it simple
    const { active, over } = event;
    
    if (over) {
      console.log(`Dragging ${active.id} over ${over.id}`);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    console.log('Drag ended:', { activeId: active.id, overId: over?.id });

    if (!over) {
      console.log('No valid drop target');
      return;
    }

    const taskId = active.id as string;
    const overId = over.id as string;

    // Validate that we're dragging a task
    if (!taskId.startsWith('task-')) {
      console.log('Not dragging a task, ignoring');
      return;
    }

    // Get the current phase of the task
    const currentPhaseId = getPhaseIdFromTaskId(taskId);
    
    if (!currentPhaseId) {
      console.error('Could not determine current phase for task:', taskId);
      return;
    }

    // Determine the target phase
    let targetPhaseId: string;
    
    if (overId.startsWith('phase-')) {
      // Dropped on a phase column
      targetPhaseId = overId.replace('phase-', '');
      console.log('Dropped on phase column:', targetPhaseId);
    } else if (overId.startsWith('task-')) {
      // Dropped on another task - get that task's phase
      const targetTaskPhaseId = getPhaseIdFromTaskId(overId);
      if (!targetTaskPhaseId) {
        console.error('Could not determine target phase from task:', overId);
        return;
      }
      targetPhaseId = targetTaskPhaseId;
      console.log('Dropped on task, target phase:', targetPhaseId);
    } else {
      console.log('Invalid drop target:', overId);
      return;
    }

    // Validate that target phase exists
    const targetPhase = findPhaseById(targetPhaseId);
    if (!targetPhase) {
      console.error('Target phase not found:', targetPhaseId);
      return;
    }

    // Only move if dropping on a different phase
    if (currentPhaseId !== targetPhaseId) {
      console.log(`Moving task ${taskId} from phase ${currentPhaseId} to phase ${targetPhaseId}`);
      
      if (onMoveTask) {
        onMoveTask(taskId, currentPhaseId, targetPhaseId);
      } else {
        console.warn('onMoveTask handler not provided');
      }
    } else {
      console.log('Task dropped on same phase, no action needed');
    }
  };

  // Handle task card clicks for selection
  const handleTaskClick = (task: CustomNode) => {
    setSelectedElement(task);
  };

  // Handle phase clicks for selection
  const handlePhaseClick = (phase: CustomNode) => {
    setSelectedElement(phase);
  };

  // Handle background clicks to clear selection
  const handleBackgroundClick = (event: React.MouseEvent) => {
    // Only clear selection if clicking directly on the background
    if (event.target === event.currentTarget) {
      setSelectedElement(null);
    }
  };

  // Handle adding phases
  const handleAddPhase = () => {
    // Clear selection when adding new phase
    setSelectedElement(null);
    // This would typically trigger phase creation in the parent component
    console.log('Add phase requested from Kanban view');
  };

  // Handle updating phases
  const handleUpdatePhase = (phaseId: string, updates: { title?: string; description?: string }) => {
    console.log('Update phase requested:', phaseId, updates);
    // This would typically be handled by the parent component
  };

  return (
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
      
      {/* Main Kanban Board */}
      <div 
        className="flex-1 bg-gradient-to-br from-background-900 via-background-800 to-background-900 p-6 overflow-hidden relative z-10"
        onClick={handleBackgroundClick}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-gradient-to-r from-accent-500 to-accent-600 rounded-lg shadow-lg">
              <Kanban className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Kanban Board</h2>
              <p className="text-sm text-secondary-400 font-medium">
                Organize tasks by phases and track progress • Drag tasks between phases
              </p>
            </div>
          </div>

          {/* Drag and Drop Context */}
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {/* Horizontal Scrolling Container */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full flex gap-6 overflow-x-auto pb-4">
                {phases.length === 0 ? (
                  // Empty State
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="p-6 bg-background-800/30 rounded-2xl inline-block mb-6">
                        <Kanban className="w-16 h-16 text-secondary-500 mx-auto" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">No Phases Yet</h3>
                      <p className="text-secondary-400 mb-8 max-w-md mx-auto">
                        Create phases in the Mind Map view to see them organized here as columns.
                      </p>
                    </div>
                  </div>
                ) : (
                  // Phase Columns
                  phases.map((phase) => {
                    // Filter tasks for this phase
                    const phaseTasks = allTasks.filter(task => 
                      task.id.startsWith(`task-${phase.id}-`)
                    );

                    return (
                      <PhaseColumn
                        key={phase.id}
                        phase={phase}
                        tasks={phaseTasks}
                        taskDetails={taskDetails}
                        onUpdateTask={onUpdateTask}
                        onAddTask={onAddTask}
                        onPhaseClick={handlePhaseClick}
                        onTaskClick={handleTaskClick}
                        selectedElement={selectedElement}
                      />
                    );
                  })
                )}
              </div>
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
              {activeTask ? (
                <div className="rotate-3 opacity-90 scale-105">
                  <TaskCard
                    task={activeTask}
                    taskDetail={taskDetails[activeTask.id]}
                    onUpdateTask={onUpdateTask}
                    isDragging={true}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Inspector Panel */}
      <div className="flex-shrink-0">
        <InspectorPanel 
          onAddPhase={handleAddPhase} 
          selectedNode={selectedElement} 
          onUpdateTask={onUpdateTask}
          onUpdatePhase={handleUpdatePhase}
          taskDetails={taskDetails}
          onAddTask={onAddTask}
        />
      </div>
    </div>
  );
};

export default KanbanView;