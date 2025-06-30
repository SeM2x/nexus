import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { FolderOpen, Plus } from 'lucide-react';
import { CustomNode, TaskDetails } from '../types';
import TaskCard from './TaskCard';

interface PhaseColumnProps {
  phase: CustomNode;
  tasks: CustomNode[];
  taskDetails: TaskDetails;
  onUpdateTask?: (taskId: string, updates: any) => void;
  onAddTask?: (phaseId: string) => void;
  onPhaseClick?: (phase: CustomNode) => void;
  onTaskClick?: (task: CustomNode) => void;
  selectedElement?: CustomNode | null;
}

const PhaseColumn: React.FC<PhaseColumnProps> = ({
  phase,
  tasks,
  taskDetails,
  onUpdateTask,
  onAddTask,
  onPhaseClick,
  onTaskClick,
  selectedElement
}) => {
  const droppableId = `phase-${phase.id}`;
  
  const {
    isOver,
    setNodeRef,
  } = useDroppable({
    id: droppableId,
  });

  const taskIds = tasks.map(task => task.id);

  // Handle phase header click
  const handlePhaseClick = (event: React.MouseEvent) => {
    // Don't trigger selection if clicking on interactive elements
    const target = event.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }

    // Stop propagation to prevent parent handlers
    event.stopPropagation();
    
    // Call the click handler if provided
    if (onPhaseClick) {
      onPhaseClick(phase);
    }
  };

  // Handle add task button click
  const handleAddTaskClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent phase selection
    if (onAddTask) {
      onAddTask(phase.id);
    }
  };

  const isPhaseSelected = selectedElement?.id === phase.id;

  return (
    <div 
      ref={setNodeRef}
      className={`
        flex-shrink-0 w-80 bg-background-800/50 backdrop-blur-xl border border-background-700/50 rounded-xl shadow-xl flex flex-col
        transition-all duration-200
        ${isOver 
          ? 'border-accent-400/50 bg-accent-500/5 shadow-accent-lg' 
          : 'hover:border-background-600/70'
        }
        ${isPhaseSelected 
          ? 'ring-4 ring-accent-400/50 border-accent-400' 
          : ''
        }
      `}
    >
      {/* Column Header - Clickable */}
      <div 
        onClick={handlePhaseClick}
        className="p-4 border-b border-background-700/50 cursor-pointer hover:bg-background-700/20 transition-colors duration-200 rounded-t-xl"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`
              p-2 rounded-lg transition-all duration-200
              ${isOver 
                ? 'bg-accent-500/30' 
                : isPhaseSelected
                ? 'bg-accent-500/40'
                : 'bg-accent-500/20'
              }
            `}>
              <FolderOpen className={`
                w-5 h-5 transition-colors duration-200
                ${isOver 
                  ? 'text-accent-300' 
                  : isPhaseSelected
                  ? 'text-accent-300'
                  : 'text-accent-400'
                }
              `} />
            </div>
            <div>
              <h3 className={`
                text-lg font-bold transition-colors duration-200
                ${isPhaseSelected ? 'text-accent-300' : 'text-white'}
              `}>
                {phase.data.label}
              </h3>
              <p className="text-sm text-secondary-400">
                {tasks.length} task{tasks.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Phase Description */}
        {phase.data.description && (
          <p className="text-sm text-secondary-400 mb-3 leading-relaxed">
            {phase.data.description}
          </p>
        )}

        {/* Add Task Button */}
        {onAddTask && (
          <button
            onClick={handleAddTaskClick}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-accent-600/20 hover:bg-accent-600/30 text-accent-400 hover:text-accent-300 font-medium rounded-lg transition-all duration-200 border border-accent-500/20 hover:border-accent-400/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        )}
      </div>

      {/* Column Content - Droppable Area */}
      <div className={`
        flex-1 p-4 space-y-3 overflow-y-auto min-h-[200px] transition-all duration-200
        ${isOver ? 'bg-accent-500/5' : ''}
      `}>
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className={`
              text-center py-8 transition-all duration-200
              ${isOver ? 'opacity-70' : ''}
            `}>
              <div className="p-3 bg-secondary-500/10 rounded-lg inline-block mb-3">
                <FolderOpen className="w-6 h-6 text-secondary-500/50" />
              </div>
              <p className="text-sm text-secondary-500 font-medium">
                {isOver ? 'Drop task here' : 'No tasks in this phase'}
              </p>
              <p className="text-xs text-secondary-600 mt-1">
                {isOver ? 'Release to move task' : 'Add tasks to get started'}
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                taskDetail={taskDetails[task.id]}
                onUpdateTask={onUpdateTask}
                onTaskClick={onTaskClick}
                isSelected={selectedElement?.id === task.id}
              />
            ))
          )}
        </SortableContext>

        {/* Drop Zone Indicator */}
        {isOver && tasks.length > 0 && (
          <div className="border-2 border-dashed border-accent-400/50 bg-accent-500/10 rounded-xl p-4 text-center">
            <p className="text-sm text-accent-400 font-medium">Drop task here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhaseColumn;