import React, { useCallback } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { useMindMap } from '@/hooks/useMindMap';
import type { CustomNode } from '@/types';
import Toolbar from './Toolbar';
import { Sparkles } from 'lucide-react';
import { centerParentNodes, getLayoutedElements } from '@/utils/mindmap/layout';

export default function MindMap({
  setSelectedNode,
}: {
  setSelectedNode: (node: CustomNode | null) => void;
}) {
  const {
    nodes,
    edges,
    onConnect,
    onNodesChange,
    onEdgesChange,
    nodeTypes,
    setNodes,
  } = useMindMap();

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: CustomNode) => {
      setSelectedNode(node);
    },
    [setSelectedNode]
  );

  const { fitView } = useReactFlow();

  // Auto-arrange nodes function - ONLY triggered by user action
  const handleAutoArrange = useCallback(() => {
    if (nodes.length === 0) return;

    console.log('User triggered auto-arrange');
    // Apply layout to current nodes and edges
    const layoutedNodes = getLayoutedElements(nodes, edges);
    const centeredNodes = centerParentNodes(layoutedNodes, edges);

    // Update nodes with new layout
    setNodes(centeredNodes);

    //Center the view on the new layout - this is the ONLY time we auto-center
    setTimeout(() => {
      fitView({
        padding: 0.2,
        includeHiddenNodes: false,
        duration: 800,
      });
    }, 100);
  }, [nodes, edges, setNodes, fitView]);

  return (
    <div className='relative flex-1'>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDrag={onNodeClick}
        //onNodeContextMenu={onNodeContextMenu}
        //onNodeDoubleClick={onNodeDoubleClick}
        onPaneClick={() => {
          setSelectedNode(null); // Clear selection when clicking on empty space
          // setContextMenu({ ...contextMenu, isVisible: false });
          // if (editingNode) handleTextCancel();
        }}
        className='bg-gradient-to-br from-background-900 via-background-800 to-background-900'
        fitView
        //attributionPosition='bottom-left'
      >
        <div className='absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30'>
          <Toolbar />
        </div>
        {/* Auto-Layout Button - Top Right */}
        <div className='absolute top-4 right-4 z-30'>
          <button
            onClick={handleAutoArrange}
            className='flex items-center gap-2 px-3 py-2 bg-background-800/95 backdrop-blur-xl border border-background-700/50 rounded-lg shadow-2xl text-secondary-300 hover:text-white hover:bg-background-700/50 transition-all duration-200'
            title='Auto-arrange nodes for optimal readability'
          >
            <Sparkles className='w-4 h-4' />
            <span className='text-sm font-medium'>Auto Layout</span>
          </button>
        </div>
        <Controls
          position='bottom-left'
          className='bg-background-800/90 backdrop-blur-xl border border-background-700/50 rounded-xl shadow-2xl'
          style={{
            backgroundColor: 'rgba(30, 41, 59, 0.9)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            borderRadius: '12px',
            padding: '4px',
            boxShadow:
              '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
          }}
        >
          {/* Auto-Arrange Button */}
          {/* <ControlButton
              onClick={handleAutoArrange}
              title='Auto-arrange nodes'
              className='!bg-gradient-to-r !from-accent-600 !to-accent-700 hover:!from-accent-700 hover:!to-accent-800 !border-accent-500/50 hover:!border-accent-400/70 !text-white hover:!text-white transition-all duration-200 hover:!scale-105'
            >
              <Sparkles className='w-4 h-4' />
            </ControlButton> */}
        </Controls>
        <MiniMap
          position='bottom-right'
          className='bg-background-800/90 backdrop-blur-xl border border-background-700/50 rounded-xl shadow-2xl'
          nodeColor='#14b8a6'
          maskColor='rgba(0, 0, 0, 0.7)'
          style={{
            backgroundColor: 'rgba(30, 41, 59, 0.9)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            borderRadius: '12px',
            boxShadow:
              '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
          }}
          pannable
          zoomable
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color='#475569'
          className='bg-gradient-to-br from-background-900 via-background-800 to-background-900'
        />
      </ReactFlow>
    </div>
  );
}
