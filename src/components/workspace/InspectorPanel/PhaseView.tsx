import React, { useEffect, useMemo, useState } from 'react';
import {
  FileText,
  FolderOpen,
  Plus,
  MoreVertical,
  Target,
  Calendar,
  Users,
  Copy,
  Edit3,
  Share2,
  Archive,
  Trash2,
  ExternalLink,
  Settings,
  Clock,
  Flag,
  GitBranch,
  Layers,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import type { PhaseNode } from '@/types';
import { useMindMap } from '@/hooks/useMindMap';

const PhaseView = ({ phase }: { phase: PhaseNode }) => {
  const [title, setTitle] = useState(phase.data.label);
  const [description, setDescription] = useState(phase.data.description);

  const {
    handleUpdatePhase: onUpdatePhase,
    addTask: onAddTask,
    nodes,
  } = useMindMap();

  useEffect(() => {
    setTitle(phase.data.label);
    setDescription(phase.data.description);
  }, [phase]);

  const handlePhaseSave = () => {
    if (!onUpdatePhase) return;
    onUpdatePhase(phase.id, { title, description });
  };

  const copyPhaseId = async () => {
    try {
      await navigator.clipboard.writeText(phase.id);
      // You could add a toast notification here if you have a toast system
    } catch (err) {
      console.error('Failed to copy phase ID:', err);
    }
  };

  const stats = useMemo(() => {
    const tasks = nodes.filter((node) => {
      return node.id.startsWith(`task-${phase.id}-`);
    });
    const stats = {
      taskCount: tasks.length,
      completedCount: tasks.filter((task) => task.data.status === 'completed')
        .length,
      inProgressCount: tasks.filter(
        (task) => task.data.status === 'in-progress'
      ).length,
      todoCount: tasks.filter((task) => task.data.status === 'todo').length,
      progess: 0,
    };
    stats.progess = stats.taskCount
      ? Math.round((stats.completedCount / stats.taskCount) * 100)
      : 0;
    return stats;
  }, [nodes, phase.id]);

  return (
    <div className='w-[320px] h-full bg-background-900/95 border-r border-background-700/50 flex flex-col relative'>
      {/* Compact Header */}
      <div className='flex-shrink-0 px-4 py-3 border-b border-background-700/30'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='w-6 h-6 bg-accent-500 rounded-md flex items-center justify-center'>
              <FolderOpen className='w-3.5 h-3.5 text-white' />
            </div>
            <div>
              <h2 className='text-sm font-semibold text-white'>
                Phase Details
              </h2>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='p-1 hover:bg-background-700/50 rounded-md transition-colors'>
                <MoreVertical className='w-4 h-4 text-secondary-400' />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-48 bg-background-800/95'>
              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={copyPhaseId} className='cursor-pointer'>
                <Copy className='mr-2 h-4 w-4' />
                Copy Phase ID
              </DropdownMenuItem>
              <DropdownMenuItem className='cursor-pointer'>
                <Edit3 className='mr-2 h-4 w-4' />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem className='cursor-pointer'>
                <Settings className='mr-2 h-4 w-4' />
                Phase Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel>Management</DropdownMenuLabel>
              <DropdownMenuItem className='cursor-pointer'>
                <Clock className='mr-2 h-4 w-4' />
                Set Due Date
              </DropdownMenuItem>
              <DropdownMenuItem className='cursor-pointer'>
                <Flag className='mr-2 h-4 w-4' />
                Set Priority
              </DropdownMenuItem>
              <DropdownMenuItem className='cursor-pointer'>
                <GitBranch className='mr-2 h-4 w-4' />
                Create Template
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel>Collaboration</DropdownMenuLabel>
              <DropdownMenuItem className='cursor-pointer'>
                <Share2 className='mr-2 h-4 w-4' />
                Share Phase
              </DropdownMenuItem>
              <DropdownMenuItem className='cursor-pointer'>
                <ExternalLink className='mr-2 h-4 w-4' />
                Export Phase
              </DropdownMenuItem>
              <DropdownMenuItem className='cursor-pointer'>
                <Layers className='mr-2 h-4 w-4' />
                Duplicate Phase
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem className='cursor-pointer'>
                <Archive className='mr-2 h-4 w-4' />
                Archive Phase
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem className='cursor-pointer text-red-400 hover:text-red-300'>
                <Trash2 className='mr-2 h-4 w-4' />
                Delete Phase
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-background-600/50'>
        {/* Phase Title */}
        <div className='p-4 border-b border-background-700/30'>
          <label className='block text-xs font-medium text-secondary-400 mb-2'>
            Phase Title
          </label>
          <input
            type='text'
            className='w-full px-0 py-1 bg-transparent border-none text-sm font-medium text-white placeholder-secondary-500 focus:outline-none focus:ring-0'
            placeholder='Enter phase title...'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handlePhaseSave}
          />
        </div>

        {/* Description */}
        <div className='p-4 border-b border-background-700/30'>
          <label className='block text-xs font-medium text-secondary-400 mb-2'>
            Description
          </label>
          <textarea
            rows={4}
            className='w-full px-0 py-1 bg-transparent border-none text-xs text-white placeholder-secondary-500 resize-none focus:outline-none focus:ring-0'
            placeholder='Describe this phase and its objectives...'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handlePhaseSave}
          />
        </div>

        {/* Add Task Button */}
        <div className='p-4 border-b border-background-700/30'>
          <button
            onClick={() => onAddTask && onAddTask(phase.id)}
            className='w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent-600 hover:bg-accent-700 text-white text-xs font-medium rounded-md transition-colors'
          >
            <Plus className='w-3.5 h-3.5' />
            Add Task to Phase
          </button>
        </div>

        {/* Properties */}
        <div className='p-4 space-y-4'>
          <h3 className='text-xs font-medium text-secondary-400 uppercase tracking-wide'>
            Properties
          </h3>

          {/* Phase Type */}
          <div className='flex items-center justify-between py-2'>
            <div className='flex items-center gap-2'>
              <Target className='w-3.5 h-3.5 text-secondary-400' />
              <span className='text-xs text-secondary-400'>Type</span>
            </div>
            <span className='text-xs font-medium text-white'>
              Project Phase
            </span>
          </div>

          {/* Task Count */}
          <div className='flex items-center justify-between py-2'>
            <div className='flex items-center gap-2'>
              <FileText className='w-3.5 h-3.5 text-secondary-400' />
              <span className='text-xs text-secondary-400'>Tasks</span>
            </div>
            <span className='text-xs font-medium text-white'>
              {stats.taskCount}
            </span>
          </div>

          {/* Team Members */}
          <div className='flex items-center justify-between py-2'>
            <div className='flex items-center gap-2'>
              <Users className='w-3.5 h-3.5 text-secondary-400' />
              <span className='text-xs text-secondary-400'>Team</span>
            </div>
            <span className='text-xs text-secondary-500'>No members</span>
          </div>

          {/* Due Date */}
          <div className='flex items-center justify-between py-2'>
            <div className='flex items-center gap-2'>
              <Calendar className='w-3.5 h-3.5 text-secondary-400' />
              <span className='text-xs text-secondary-400'>Due Date</span>
            </div>
            <span className='text-xs text-secondary-500'>Not set</span>
          </div>

          {/* Created */}
          <div className='flex items-center justify-between py-2'>
            <div className='flex items-center gap-2'>
              <FolderOpen className='w-3.5 h-3.5 text-secondary-400' />
              <span className='text-xs text-secondary-400'>Created</span>
            </div>
            <span className='text-xs text-secondary-500'>
              {phase.data.createdAt
                ? format(Number(phase.data.createdAt), 'MMM dd, yyyy')
                : 'Not set'}
            </span>
          </div>
        </div>

        {/* Progress Overview */}
        <div className='p-4 border-t border-background-700/30'>
          <h3 className='text-xs font-medium text-secondary-400 uppercase tracking-wide mb-3'>
            Progress
          </h3>
          <div className='space-y-3'>
            {/* Progress Bar */}
            <div>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-xs text-secondary-400'>Completion</span>
                <span className='text-xs font-medium text-white'>
                  {stats.progess}%
                </span>
              </div>
              <div className='w-full bg-background-700/50 rounded-full h-1.5'>
                <div
                  className='bg-accent-500 h-1.5 rounded-full'
                  style={{ width: `${stats.progess}%` }}
                ></div>
              </div>
            </div>

            {/* Task Stats */}
            <div className='grid grid-cols-3 gap-2'>
              <div className='text-center p-2 bg-background-800/30 rounded border border-background-700/30'>
                <div className='text-xs font-medium text-white'>
                  {stats.todoCount}
                </div>
                <div className='text-xs text-secondary-500'>To Do</div>
              </div>
              <div className='text-center p-2 bg-background-800/30 rounded border border-background-700/30'>
                <div className='text-xs font-medium text-white'>
                  {stats.inProgressCount}
                </div>
                <div className='text-xs text-secondary-500'>In Progress</div>
              </div>
              <div className='text-center p-2 bg-background-800/30 rounded border border-background-700/30'>
                <div className='text-xs font-medium text-white'>
                  {stats.completedCount}
                </div>
                <div className='text-xs text-secondary-500'>Done</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhaseView;
