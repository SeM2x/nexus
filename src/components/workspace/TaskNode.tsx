import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Clock, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import type { TaskNode as TaskNodeType, StatusConfig } from '@/types';

const TaskNode: React.FC<NodeProps<TaskNodeType>> = ({ data, selected }) => {
  // Always use horizontal layout (Left to Right)
  const targetPosition = Position.Left;
  const sourcePosition = Position.Right;

  // Enhanced status configuration with dark theme colors matching TaskCard
  const statusConfig: Record<string, StatusConfig> = {
    todo: {
      borderColor: 'border-background-600',
      bgColor: 'bg-background-700/80',
      iconColor: 'text-secondary-400',
      icon: Clock,
      hoverBorder: 'hover:border-background-500',
      hoverBg: 'hover:bg-background-600/80',
      ringColor: 'ring-secondary-400/30',
      dotColor: 'bg-secondary-500',
      textColor: 'text-secondary-200',
    },
    'in-progress': {
      borderColor: 'border-blue-500/40',
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
      icon: Zap,
      hoverBorder: 'hover:border-blue-400/60',
      hoverBg: 'hover:bg-blue-500/20',
      ringColor: 'ring-blue-400/30',
      dotColor: 'bg-blue-500',
      textColor: 'text-blue-200',
    },
    completed: {
      borderColor: 'border-green-500/40',
      bgColor: 'bg-green-500/10',
      iconColor: 'text-green-400',
      icon: CheckCircle,
      hoverBorder: 'hover:border-green-400/60',
      hoverBg: 'hover:bg-green-500/20',
      ringColor: 'ring-green-400/30',
      dotColor: 'bg-green-500',
      textColor: 'text-green-200',
    },
    blocked: {
      borderColor: 'border-red-500/40',
      bgColor: 'bg-red-500/10',
      iconColor: 'text-red-400',
      icon: AlertCircle,
      hoverBorder: 'hover:border-red-400/60',
      hoverBg: 'hover:bg-red-500/20',
      ringColor: 'ring-red-400/30',
      dotColor: 'bg-red-500',
      textColor: 'text-red-200',
    },
  };

  // Get status from data, default to 'todo'
  const status = data.status?.toLowerCase() || 'todo';
  const config = statusConfig[status] || statusConfig['todo'];
  const StatusIcon = config.icon;

  return (
    <div
      className={`
      relative px-4 py-3 border-2 rounded-xl min-w-[140px] font-sans
      backdrop-blur-xl transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl
      ${config.borderColor} ${config.bgColor} ${config.hoverBorder} ${
        config.hoverBg
      }
      ${
        selected
          ? `ring-4 ring-accent-400/50 border-accent-400 ${config.hoverBg}`
          : ''
      }
    `}
    >
      {/* Subtle gradient overlay for depth */}
      <div className='absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-xl' />

      {/* Connection handles - always horizontal */}
      <Handle
        type='target'
        position={targetPosition}
        className='w-3 h-3 bg-white border-2 border-secondary-400 shadow-sm'
      />
      <Handle
        type='source'
        position={sourcePosition}
        className='w-3 h-3 bg-white border-2 border-secondary-400 shadow-sm'
      />

      {/* Content */}
      <div className='flex items-center gap-3 relative z-10'>
        {/* Status indicator with icon */}
        <div className='flex items-center justify-center'>
          <StatusIcon
            className={`w-4 h-4 ${config.iconColor} transition-colors duration-200`}
          />
        </div>

        {/* Task title */}
        <div
          className={`
          text-sm font-semibold leading-tight tracking-tight transition-colors duration-200
          ${selected ? 'text-white' : config.textColor}
        `}
        >
          {data.label}
        </div>

        {/* Status dot indicator */}
        <div
          className={`w-2 h-2 ${config.dotColor} rounded-full shadow-sm flex-shrink-0`}
        />
      </div>

      {/* Status label for accessibility */}
      <div className='sr-only'>Status: {status.replace('-', ' ')}</div>
    </div>
  );
};

export default TaskNode;
