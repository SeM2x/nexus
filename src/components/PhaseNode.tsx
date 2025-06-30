import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FolderOpen } from 'lucide-react';
import { PhaseNodeData } from '../types';

const PhaseNode: React.FC<NodeProps<PhaseNodeData>> = ({ data, selected }) => {
  // Always use horizontal layout (Left to Right)
  const targetPosition = Position.Left;
  const sourcePosition = Position.Right;

  return (
    <div className={`
      relative px-8 py-5 bg-background-700 text-white rounded-lg border-2 min-w-[180px] font-sans
      transition-all duration-200 shadow-lg
      ${selected 
        ? 'border-accent-400 ring-4 ring-accent-400/30' 
        : 'border-background-600'
      }
    `}>
      {/* Connection handles - always horizontal */}
      <Handle
        type="target"
        position={targetPosition}
        className="w-3 h-3 bg-white border-2 border-background-600"
      />
      <Handle
        type="source"
        position={sourcePosition}
        className="w-3 h-3 bg-white border-2 border-background-600"
      />
      
      {/* Content */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/15 rounded-lg backdrop-blur-sm">
          <FolderOpen className="w-5 h-5 text-white" />
        </div>
        <div className="text-lg font-bold text-white leading-tight tracking-tight">
          {data.label}
        </div>
      </div>
    </div>
  );
};

export default PhaseNode;