import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, Zap, CheckCircle, AlertCircle, MoreHorizontal, GripVertical } from 'lucide-react';
import { CustomNode, TaskDetailsEntry } from '../types';

interface TaskCardProps {
  task: CustomNode;
  taskDetail?: TaskDetailsEntry;
  onUpdateTask?: (taskId: string, updates: any) => void;
  isDragging?: boolean;
  onTaskClick?: (task: CustomNode) => void;
  isSelected?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  taskDetail,
  onUpdateTask,
  isDragging = false,
  onTaskClick,
  isSelected = false
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Enhanced status configuration with dark theme colors
  const statusConfig = {
    'To Do': {
      icon: Clock,
      color: 'bg-status-todo-500',
      bgColor: 'bg-background-700/50',
      borderColor: 'border-background-600',
      textColor: 'text-secondary-300',
      dotColor: 'bg-secondary-500',
      hoverBg: 'hover:bg-background-600/50',
      selectedBg: 'bg-background-600/70'
    },
    'In Progress': {
      icon: Zap,
      color: 'bg-status-progress-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-300',
      dotColor: 'bg-blue-500',
      hoverBg: 'hover:bg-blue-500/20',
      selectedBg: 'bg-blue-500/20'
    },
    'Blocked': {
      icon: AlertCircle,
      color: 'bg-status-blocked-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-300',
      dotColor: 'bg-red-500',
      hoverBg: 'hover:bg-red-500/20',
      selectedBg: 'bg-red-500/20'
    },
    'Done': {
      icon: CheckCircle,
      color: 'bg-status-done-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      textColor: 'text-green-300',
      dotColor: 'bg-green-500',
      hoverBg: 'hover:bg-green-500/20',
      selectedBg: 'bg-green-500/20'
    }
  };

  const status = taskDetail?.status || 'To Do';
  const config = statusConfig[status] || statusConfig['To Do'];
  const StatusIcon = config.icon;

  const isCurrentlyDragging = isDragging || isSortableDragging;

  // Handle card click
  const handleCardClick = (event: React.MouseEvent) => {
    // Don't trigger selection if clicking on interactive elements
    const target = event.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }

    // Stop propagation to prevent parent handlers
    event.stopPropagation();
    
    // Call the click handler if provided
    if (onTaskClick) {
      onTaskClick(task);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleCardClick}
      className={`
        backdrop-blur-xl border-2 rounded-xl p-4 shadow-lg hover:shadow-xl 
        transition-all duration-200 cursor-pointer group relative overflow-hidden
        ${config.borderColor}
        ${isSelected 
          ? `ring-4 ring-accent-400/50 border-accent-400 ${config.selectedBg}` 
          : `${config.bgColor} ${config.hoverBg}`
        }
        ${isCurrentlyDragging 
          ? 'opacity-50 rotate-3 scale-105 shadow-2xl z-50' 
          : 'hover:scale-[1.02]'
        }
      `}
    >
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-xl" />
      
      {/* Task Header */}
      <div className="flex items-start justify-between mb-3 relative z-10">
        <h4 className={`
          font-semibold transition-colors flex-1 pr-2 leading-tight
          ${isSelected ? 'text-white' : 'text-secondary-200 group-hover:text-white'}
        `}>
          {taskDetail?.title || task.data.label}
        </h4>
        <div className="flex items-center gap-2">
          {/* Status Indicator */}
          <div className={`w-3 h-3 ${config.dotColor} rounded-full flex-shrink-0 shadow-sm`} />
          
          {/* Drag Handle */}
          <button 
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()} // Prevent card selection when dragging
            className={`
              p-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-grab active:cursor-grabbing
              ${isSelected ? 'text-white hover:bg-white/10' : 'text-secondary-400 hover:text-secondary-200 hover:bg-background-600/50'}
            `}
            aria-label="Drag task"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          
          {/* More Options Button */}
          <button 
            onClick={(e) => e.stopPropagation()} // Prevent card selection when clicking options
            className={`
              p-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-200
              ${isSelected ? 'text-white hover:bg-white/10' : 'text-secondary-400 hover:text-secondary-200 hover:bg-background-600/50'}
            `}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Task Description */}
      {taskDetail?.description && (
        <p className={`
          text-sm mb-3 line-clamp-2 leading-relaxed relative z-10
          ${isSelected ? 'text-secondary-300' : 'text-secondary-400 group-hover:text-secondary-300'}
        `}>
          {taskDetail.description}
        </p>
      )}

      {/* Task Footer */}
      <div className="flex items-center justify-between relative z-10">
        {/* Status Badge */}
        <div className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm
          ${config.bgColor} ${config.textColor} border ${config.borderColor}
          ${isSelected ? 'bg-opacity-80' : ''}
        `}>
          <StatusIcon className="w-3 h-3" />
          <span>{status}</span>
        </div>

        {/* Task ID (for debugging/reference) */}
        <div className={`
          text-xs font-mono transition-colors duration-200
          ${isSelected ? 'text-secondary-400' : 'text-secondary-500 group-hover:text-secondary-400'}
        `}>
          #{task.id.split('-').pop()?.substring(0, 8)}
        </div>
      </div>

      {/* Selection indicator line */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent-400 to-accent-600 rounded-l-xl" />
      )}
    </div>
  );
};

export default TaskCard;