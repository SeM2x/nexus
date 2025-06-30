import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { RootNodeData } from '../types';

const RootNode: React.FC<NodeProps<RootNodeData>> = ({ data, selected }) => {
  // Always use horizontal layout (Left to Right)
  // Root node only needs a source handle (on the right) since it's the starting point
  const sourcePosition = Position.Right;

  // Get style for main project node
  const getMainNodeStyle = (isSelected: boolean = false): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
      color: 'white',
      border: '3px solid #14b8a6',
      borderRadius: '16px',
      fontSize: '18px',
      fontWeight: 'bold',
      minWidth: '180px',
      boxShadow: '0 20px 40px rgba(20, 184, 166, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      padding: '16px 24px',
    };

    // Apply selection styling
    if (isSelected) {
      return {
        ...baseStyle,
        border: '4px solid #2dd4bf',
        boxShadow: '0 0 0 4px rgba(45, 212, 191, 0.3), 0 20px 40px rgba(20, 184, 166, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
      };
    }

    return baseStyle;
  };

  return (
    <div style={getMainNodeStyle(selected)}>
      {/* Source handle - only on the right for horizontal layout */}
      <Handle
        type="source"
        position={sourcePosition}
        className="w-3 h-3 bg-white border-2 border-accent-600"
      />
      
      {/* Content */}
      <div className="text-center">
        <div className="text-lg font-bold text-white leading-tight tracking-tight">
          {data.label}
        </div>
      </div>
    </div>
  );
};

export default RootNode;