import React from 'react';
import { Plus, Trash2, Edit3, FileText } from 'lucide-react';
import { MenuItem } from '../types';

interface ContextMenuProps {
  isVisible: boolean;
  position: { x: number; y: number };
  nodeType: 'phase' | 'task' | null;
  onAddTask: () => void;
  onDeletePhase: () => void;
  onEditDetails: () => void;
  onDeleteTask: () => void;
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ 
  isVisible, 
  position, 
  nodeType, 
  onAddTask, 
  onDeletePhase, 
  onEditDetails, 
  onDeleteTask, 
  onClose 
}) => {
  if (!isVisible) return null;

  const menuItems: MenuItem[] = nodeType === 'phase' ? [
    {
      label: 'Add Task',
      icon: Plus,
      onClick: onAddTask,
      color: 'text-accent-600 hover:text-accent-700',
      bgColor: 'hover:bg-accent-50'
    },
    {
      label: 'Delete Phase',
      icon: Trash2,
      onClick: onDeletePhase,
      color: 'text-status-blocked-600 hover:text-status-blocked-700',
      bgColor: 'hover:bg-status-blocked-50'
    }
  ] : [
    {
      label: 'Edit Details',
      icon: Edit3,
      onClick: onEditDetails,
      color: 'text-status-progress-600 hover:text-status-progress-700',
      bgColor: 'hover:bg-status-progress-50'
    },
    {
      label: 'Delete Task',
      icon: Trash2,
      onClick: onDeleteTask,
      color: 'text-status-blocked-600 hover:text-status-blocked-700',
      bgColor: 'hover:bg-status-blocked-50'
    }
  ];

  return (
    <>
      {/* Invisible backdrop to catch clicks */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Context Menu */}
      <div 
        className="fixed z-50 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-secondary-200/50 py-2 min-w-[160px] animate-in fade-in zoom-in-95 duration-200"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                item.onClick();
                onClose();
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all duration-200
                ${item.color} ${item.bgColor}
                ${index === 0 ? 'rounded-t-lg' : ''}
                ${index === menuItems.length - 1 ? 'rounded-b-lg' : ''}
              `}
            >
              <IconComponent className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};

export default ContextMenu;