import { useEffect, useState, useCallback } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Target,
  Zap,
  Copy,
  Calendar,
  User,
  Trash2,
  Edit3,
  Share2,
  Flag,
  Timer,
  Archive,
  ExternalLink,
  MessageSquare,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import type { StatusOption, TaskNode } from '@/types';
import { useMindMap } from '@/hooks/useMindMap';
import { format } from 'date-fns';

// Status options for task details
const statusOptions: StatusOption[] = [
  {
    value: 'todo',
    label: 'To Do',
    color: 'bg-status-todo-500',
    hoverColor: 'hover:bg-status-todo-500/10',
    icon: Clock,
    dotColor: 'bg-status-todo-500',
    description: 'Ready to start',
  },
  {
    value: 'in-progress',
    label: 'In Progress',
    color: 'bg-status-progress-500',
    hoverColor: 'hover:bg-status-progress-500/10',
    icon: Zap,
    dotColor: 'bg-status-progress-500',
    description: 'Currently working',
  },
  {
    value: 'blocked',
    label: 'Blocked',
    color: 'bg-status-blocked-500',
    hoverColor: 'hover:bg-status-blocked-500/10',
    icon: AlertCircle,
    dotColor: 'bg-status-blocked-500',
    description: 'Needs attention',
  },
  {
    value: 'completed',
    label: 'Done',
    color: 'bg-status-done-500',
    hoverColor: 'hover:bg-status-done-500/10',
    icon: CheckCircle,
    dotColor: 'bg-status-done-500',
    description: 'Completed',
  },
];

const TaskView = ({ task }: { task: TaskNode }) => {
  const [title, setTitle] = useState(task.data.label);
  const [description, setDescription] = useState(task.data.description);
  const [status, setStatus] = useState(task.data.status);

  const { handleUpdateTask: onUpdateTask } = useMindMap();

  useEffect(() => {
    setTitle(task.data.label);
    setDescription(task.data.description);
    setStatus(task.data.status);
  }, [task]);

  const StatusIcon =
    statusOptions.find((option) => option.value === status)?.icon ?? Clock;

  const handleSaveChanges = useCallback(() => {
    if (onUpdateTask) {
      onUpdateTask(task.id, {
        title,
        description,
        status,
      });
    }
  }, [onUpdateTask, task.id, title, description, status]);

  const copyTaskId = async () => {
    try {
      await navigator.clipboard.writeText(task.id);
      // You could add a toast notification here if you have a toast system
    } catch (err) {
      console.error('Failed to copy task ID:', err);
    }
  };

  useEffect(() => {
    handleSaveChanges();
  }, [status, handleSaveChanges]);

  return (
    <div className='w-[320px] h-full bg-background-900/95 border-r border-background-700/50 flex flex-col relative'>
      {/* Compact Header */}
      <div className='flex-shrink-0 px-4 py-3 border-b border-background-700/30'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='w-6 h-6 bg-accent-500 rounded-md flex items-center justify-center'>
              <Target className='w-3.5 h-3.5 text-white' />
            </div>
            <div>
              <h2 className='text-sm font-semibold text-white'>Task Details</h2>
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
              <DropdownMenuItem onClick={copyTaskId} className='cursor-pointer'>
                <Copy className='mr-2 h-4 w-4' />
                Copy Task ID
              </DropdownMenuItem>
              <DropdownMenuItem className='cursor-pointer'>
                <Edit3 className='mr-2 h-4 w-4' />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem className='cursor-pointer'>
                <Timer className='mr-2 h-4 w-4' />
                Start Timer
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel>Collaboration</DropdownMenuLabel>
              <DropdownMenuItem className='cursor-pointer'>
                <Share2 className='mr-2 h-4 w-4' />
                Share Task
              </DropdownMenuItem>
              <DropdownMenuItem className='cursor-pointer'>
                <MessageSquare className='mr-2 h-4 w-4' />
                Add Comment
              </DropdownMenuItem>
              <DropdownMenuItem className='cursor-pointer'>
                <ExternalLink className='mr-2 h-4 w-4' />
                Open in New Tab
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel>Organization</DropdownMenuLabel>
              <DropdownMenuItem className='cursor-pointer'>
                <Flag className='mr-2 h-4 w-4' />
                Set Priority
              </DropdownMenuItem>
              <DropdownMenuItem className='cursor-pointer'>
                <Archive className='mr-2 h-4 w-4' />
                Archive Task
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem className='cursor-pointer text-red-400 hover:text-red-300'>
                <Trash2 className='mr-2 h-4 w-4' />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-background-600/50'>
        {/* Task Title */}
        <div className='p-4 border-b border-background-700/30'>
          <label className='block text-xs font-medium text-secondary-400 mb-2'>
            Title
          </label>
          <input
            type='text'
            className='w-full px-0 py-1 bg-transparent border-none text-sm font-medium text-white placeholder-secondary-500 focus:outline-none focus:ring-0'
            placeholder='Enter task title...'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Status */}
        <div className='p-4 border-b border-background-700/30'>
          <label className='block text-xs font-medium text-secondary-400 mb-3'>
            Status
          </label>
          <div className='flex flex-wrap gap-2'>
            {statusOptions.map((option) => {
              const OptionIcon = option.icon;
              const isSelected = status === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => setStatus(option.value)}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 border
                    ${
                      isSelected
                        ? `${option.color} text-white border-transparent`
                        : `bg-background-800/50 text-secondary-400 border-background-600/40 hover:bg-background-700/50 hover:text-white`
                    }
                  `}
                >
                  <OptionIcon className='w-3 h-3' />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div className='p-4 border-b border-background-700/30'>
          <label className='block text-xs font-medium text-secondary-400 mb-2'>
            Description
          </label>
          <textarea
            rows={4}
            className='w-full px-0 py-1 bg-transparent border-none text-xs text-white placeholder-secondary-500 resize-none focus:outline-none focus:ring-0'
            placeholder='Add task description...'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Properties */}
        <div className='p-4 space-y-4'>
          <h3 className='text-xs font-medium text-secondary-400 uppercase tracking-wide'>
            Properties
          </h3>

          {/* Status Info */}
          <div className='flex items-center justify-between py-2'>
            <div className='flex items-center gap-2'>
              <StatusIcon className='w-3.5 h-3.5 text-secondary-400' />
              <span className='text-xs text-secondary-400'>Status</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className={`w-2 h-2 rounded-full bg-status-todo-500`} />
              <span className='text-xs font-medium text-white'>{status}</span>
            </div>
          </div>

          {/* Assignee */}
          <div className='flex items-center justify-between py-2'>
            <div className='flex items-center gap-2'>
              <User className='w-3.5 h-3.5 text-secondary-400' />
              <span className='text-xs text-secondary-400'>Assignee</span>
            </div>
            <span className='text-xs text-secondary-500'>Unassigned</span>
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
              <FileText className='w-3.5 h-3.5 text-secondary-400' />
              <span className='text-xs text-secondary-400'>Created</span>
            </div>
            <span className='text-xs text-secondary-500'>
              {task.data.createdAt
                ? format(Number(task.data.createdAt), 'MMM dd, yyyy')
                : 'Not set'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className='p-4 border-t border-background-700/30'>
          <div className='flex gap-2'>
            <button
              onClick={handleSaveChanges}
              className='flex-1 px-3 py-2 bg-accent-600 hover:bg-accent-700 text-white text-xs font-medium rounded-md transition-colors'
            >
              Save Changes
            </button>
            <button className='p-2 hover:bg-background-700/50 rounded-md transition-colors'>
              <Copy className='w-3.5 h-3.5 text-secondary-400' />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskView;
