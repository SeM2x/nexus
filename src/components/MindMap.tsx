import React, { useCallback, useState, useEffect, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ControlButton,
  Node,
  Edge,
  Connection,
  NodeMouseHandler,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  NodeChange,
  EdgeChange,
} from 'reactflow';
import { Sparkles, Loader2 } from 'lucide-react';
import { getMindMapLayout } from '../layout-utils';
import { CustomNode, TaskDetails, TaskDetailsEntry, ContextMenuState, EditPosition } from '../types';
import { useProjectData } from '../hooks/useProjectData';
import { useGuestProjectData } from '../hooks/useGuestProjectData';
import ContextMenu from './ContextMenu';
import InspectorPanel from './InspectorPanel';
import RootNode from './RootNode';
import PhaseNode from './PhaseNode';
import TaskNode from './TaskNode';

import 'reactflow/dist/style.css';

// Define custom node types - always horizontal layout
const nodeTypes = {
  rootNode: (props: any) => <RootNode {...props} />,
  phaseNode: (props: any) => <PhaseNode {...props} />,
  taskNode: (props: any) => <TaskNode {...props} />,
};

interface MindMapProps {
  projectId: string;
  onAIGenerationComplete?: () => void;
  aiPromptFromUrl?: string | null;
  isGuest?: boolean;
}

const MindMap: React.FC<MindMapProps> = ({ 
  projectId, 
  onAIGenerationComplete, 
  aiPromptFromUrl,
  isGuest = false 
}) => {
  // Use appropriate hook based on guest mode
  const authProjectData = useProjectData(projectId);
  const guestProjectData = useGuestProjectData(projectId, 'Guest Project');
  
  const {
    nodes: dataNodes,
    edges: dataEdges,
    taskDetails: dataTaskDetails,
    loading,
    error,
    setNodes: setDataNodes,
    setEdges: setDataEdges,
    setTaskDetails: setDataTaskDetails,
    saveData,
    updateTaskDetailInDb,
    forceRefresh
  } = isGuest ? guestProjectData : authProjectData;

  const [nodes, setNodes, onNodesChange]: [CustomNode[], (nodes: CustomNode[]) => void, OnNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange]: [Edge[], (edges: Edge[]) => void, OnEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<CustomNode | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [editPosition, setEditPosition] = useState<EditPosition>({ x: 0, y: 0 });
  
  // Task details state
  const [taskDetails, setTaskDetails] = useState<TaskDetails>({});

  // Context menu state
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isVisible: false,
    position: { x: 0, y: 0 },
    nodeId: null,
    nodeType: null
  });

  // Get React Flow instance for viewport calculations and layout
  const { fitView } = useReactFlow();

  // Debounce timer for saving
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to find the root node
  const getRootNode = useCallback((nodeList: CustomNode[]) => {
    return nodeList.find(node => node.type === 'rootNode');
  }, []);

  // Sync data from hook to local state
  useEffect(() => {
    if (!loading && dataNodes.length > 0) {
      console.log('Syncing data from hook to local state:', { dataNodes, dataEdges, dataTaskDetails });
      
      setNodes(dataNodes);
      setEdges(dataEdges);
      setTaskDetails(dataTaskDetails);
    }
  }, [dataNodes, dataEdges, dataTaskDetails, loading, setNodes, setEdges]);

  // Handle AI generation completion callback
  const handleAIGenerationComplete = useCallback(async () => {
    console.log('🎯 AI generation completed, refreshing data...');
    
    // Use the robust forceRefresh method instead of page reload
    await forceRefresh();
    
    // Call the parent callback if provided
    if (onAIGenerationComplete) {
      onAIGenerationComplete();
    }
    
    console.log('✅ Data refresh completed');
  }, [forceRefresh, onAIGenerationComplete]);

  // Debounced save function
  const debouncedSave = useCallback((currentNodes: CustomNode[], currentEdges: Edge[], currentTaskDetails: TaskDetails) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('Saving project state:', { currentNodes, currentEdges, currentTaskDetails });
        
        // Update local data state
        setDataNodes(currentNodes);
        setDataEdges(currentEdges);
        setDataTaskDetails(currentTaskDetails);
        
        // Save to storage (database or localStorage)
        await saveData(currentNodes, currentEdges, currentTaskDetails);
      } catch (error) {
        console.error('Error saving project state:', error);
      }
    }, 500); // 500ms debounce
  }, [saveData, setDataNodes, setDataEdges, setDataTaskDetails]);

  // Save project state
  const saveProjectState = useCallback(async (currentNodes: CustomNode[], currentEdges: Edge[], currentTaskDetails: TaskDetails) => {
    debouncedSave(currentNodes, currentEdges, currentTaskDetails);
  }, [debouncedSave]);

  // Handle real-time node changes
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    console.log('Node changes:', changes);
    
    // Apply changes locally first for immediate feedback
    onNodesChange(changes);
    
    // Check if any changes require storage updates
    const hasPositionChanges = changes.some(change => 
      change.type === 'position' && change.dragging === false
    );
    
    const hasRemoveChanges = changes.some(change => change.type === 'remove');
    const hasAddChanges = changes.some(change => change.type === 'add');
    
    if (hasPositionChanges || hasRemoveChanges || hasAddChanges) {
      // Save position updates after dragging stops
      setTimeout(() => {
        setNodes(currentNodes => {
          console.log('Saving nodes after changes:', currentNodes);
          saveProjectState(currentNodes, edges, taskDetails);
          return currentNodes;
        });
      }, 100);
    }
  }, [onNodesChange, edges, taskDetails, saveProjectState, setNodes]);

  // Handle real-time edge changes
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    console.log('Edge changes:', changes);
    
    // Apply changes locally first
    onEdgesChange(changes);
    
    // Save to storage after edge changes
    setTimeout(() => {
      setEdges(currentEdges => {
        console.log('Saving edges after changes:', currentEdges);
        saveProjectState(nodes, currentEdges, taskDetails);
        return currentEdges;
      });
    }, 100);
  }, [onEdgesChange, nodes, taskDetails, saveProjectState, setEdges]);

  // Auto-arrange nodes function - ONLY triggered by user action
  const handleAutoArrange = useCallback(() => {
    if (nodes.length === 0) return;
    
    console.log('User triggered auto-arrange');
    
    // Apply layout to current nodes and edges
    const layoutedNodes = getMindMapLayout(nodes, edges);
    
    // Update nodes with new layout
    setNodes(layoutedNodes);
    
    // Save the new layout
    saveProjectState(layoutedNodes, edges, taskDetails);
    
    // Center the view on the new layout - this is the ONLY time we auto-center
    setTimeout(() => {
      fitView({ 
        padding: 0.2,
        includeHiddenNodes: false,
        duration: 800
      });
    }, 100);
  }, [nodes, edges, taskDetails, setNodes, saveProjectState, fitView]);

  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      console.log('New connection:', params);
      
      const newEdge = {
        ...params,
        id: crypto.randomUUID(),
        type: 'simplebezier',
        style: {
          stroke: '#64748b',
          strokeWidth: 2.5,
        },
        markerEnd: {
          type: 'arrowclosed',
          color: '#64748b',
        },
      };
      
      setEdges((eds) => {
        const updatedEdges = addEdge(newEdge, eds);
        console.log('Saving new edge:', updatedEdges);
        // Save to storage
        saveProjectState(nodes, updatedEdges, taskDetails);
        return updatedEdges;
      });
    },
    [setEdges, nodes, taskDetails, saveProjectState],
  );

  const onNodeClick: NodeMouseHandler = useCallback((event, node) => {
    // Set the selected node for visual feedback and inspector panel
    setSelectedNode(node as CustomNode);
  }, []);

  // Handle right-click context menu
  const onNodeContextMenu: NodeMouseHandler = useCallback((event, node) => {
    event.preventDefault();
    
    // Don't show context menu for root node
    if (node.type === 'rootNode') return;
    
    const nodeType = node.id.startsWith('task-') ? 'task' : 'phase';
    
    setContextMenu({
      isVisible: true,
      position: { x: event.clientX, y: event.clientY },
      nodeId: node.id,
      nodeType: nodeType
    });
    
    // Set selected node for visual feedback
    setSelectedNode(node as CustomNode);
  }, []);

  const onNodeDoubleClick: NodeMouseHandler = useCallback((event, node) => {
    // Don't allow editing the root node
    if (node.type === 'rootNode') return;
    
    // Extract current text from the node
    let currentText = '';
    if (node.id.startsWith('task-')) {
      currentText = taskDetails[node.id]?.title || node.data.label || 'New Task';
    } else {
      currentText = node.data.label || 'New Phase';
    }
    
    // Calculate the screen position of the node using React Flow's project function
    const nodeElement = (event.target as HTMLElement).closest('.react-flow__node');
    if (nodeElement) {
      const rect = nodeElement.getBoundingClientRect();
      const flowContainer = document.querySelector('.react-flow');
      const flowRect = flowContainer?.getBoundingClientRect();
      
      if (flowRect) {
        // Position relative to the flow container
        setEditPosition({
          x: rect.left - flowRect.left,
          y: rect.top - flowRect.top,
          width: rect.width,
          height: rect.height
        });
      }
    }
    
    setEditingNode(node.id);
    setEditText(currentText);
    setContextMenu({ ...contextMenu, isVisible: false }); // Hide context menu
  }, [taskDetails, contextMenu]);

  const handleTextSubmit = useCallback((nodeId: string) => {
    if (!editText.trim()) return;
    
    setNodes((nds) => {
      const updatedNodes = nds.map(node => {
        if (node.id === nodeId) {
          const isTask = nodeId.startsWith('task-');
          
          // Update task details if it's a task node
          if (isTask) {
            setTaskDetails(prev => {
              const updated = {
                ...prev,
                [nodeId]: {
                  ...prev[nodeId],
                  title: editText.trim()
                }
              };
              // Save to storage
              saveProjectState(nds, edges, updated);
              return updated;
            });
          }
          
          return {
            ...node,
            data: {
              ...node.data,
              label: editText.trim()
            }
          };
        }
        return node;
      });
      
      // Save to storage for phase updates
      if (!nodeId.startsWith('task-')) {
        saveProjectState(updatedNodes, edges, taskDetails);
      }
      
      return updatedNodes;
    });
    
    setEditingNode(null);
    setEditText('');
  }, [editText, setNodes, edges, taskDetails, saveProjectState]);

  const handleTextCancel = useCallback(() => {
    setEditingNode(null);
    setEditText('');
  }, []);

  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && editingNode) {
      handleTextSubmit(editingNode);
    } else if (event.key === 'Escape') {
      handleTextCancel();
    }
  }, [editingNode, handleTextSubmit, handleTextCancel]);

  const addPhase = useCallback(() => {
    // Generate unique ID using UUID
    const newNodeId = crypto.randomUUID();
    const rootNode = getRootNode(nodes);
    
    if (!rootNode) {
      console.error('No root node found');
      return;
    }
    
    // Calculate position for new phase (don't auto-layout, just place it reasonably)
    const existingPhases = nodes.filter(node => node.type === 'phaseNode');
    const yOffset = 100 + (existingPhases.length * 120);
    
    const newNode: CustomNode = {
      id: newNodeId,
      type: 'phaseNode',
      position: { x: 400, y: yOffset }, // Place it manually without auto-layout
      data: { 
        label: 'New Phase',
        description: '',
        isExpanded: false // Initialize with collapsed state
      },
      selected: false,
    };

    // Add edge connecting to the root node
    const newEdge: Edge = {
      id: crypto.randomUUID(),
      source: rootNode.id,
      target: newNodeId,
      type: 'simplebezier',
      style: {
        stroke: '#64748b',
        strokeWidth: 2.5,
      },
      markerEnd: {
        type: 'arrowclosed',
        color: '#64748b',
      },
    };

    const updatedNodes = [...nodes, newNode];
    const updatedEdges = [...edges, newEdge];
    
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    
    // Save to storage
    saveProjectState(updatedNodes, updatedEdges, taskDetails);
  }, [setNodes, setEdges, taskDetails, saveProjectState, nodes, edges, getRootNode]);

  const addTask = useCallback((phaseId: string) => {
    // Generate unique task ID using UUID with phase prefix for readability
    const taskId = `task-${phaseId}-${crypto.randomUUID()}`;
    const phaseNode = nodes.find(node => node.id === phaseId);
    
    if (!phaseNode) return;

    // Calculate position for new task (place it near the phase without auto-layout)
    const existingTasks = nodes.filter(node => node.id.startsWith(`task-${phaseId}-`));
    const xOffset = phaseNode.position.x + 250;
    const yOffset = phaseNode.position.y + (existingTasks.length * 60);

    const defaultStatus = 'todo';
    const newTask: CustomNode = {
      id: taskId,
      type: 'taskNode',
      position: { x: xOffset, y: yOffset }, // Place it manually without auto-layout
      data: { 
        label: 'New Task',
        status: defaultStatus
      },
      selected: false,
    };

    // Add edge connecting task to phase
    const newEdge: Edge = {
      id: crypto.randomUUID(),
      source: phaseId,
      target: taskId,
      type: 'simplebezier',
      style: {
        stroke: '#9ca3af',
        strokeWidth: 2,
      },
      markerEnd: {
        type: 'arrowclosed',
        color: '#9ca3af',
      },
    };

    // Initialize task details
    const newTaskDetails: TaskDetailsEntry = {
      title: 'New Task',
      description: '',
      status: 'To Do'
    };

    const updatedNodes = [...nodes, newTask];
    const updatedEdges = [...edges, newEdge];
    const updatedTaskDetails = {
      ...taskDetails,
      [taskId]: newTaskDetails
    };

    setNodes(updatedNodes);
    setEdges(updatedEdges);
    setTaskDetails(updatedTaskDetails);
    
    // Save to storage
    saveProjectState(updatedNodes, updatedEdges, updatedTaskDetails);
  }, [nodes, edges, taskDetails, setNodes, setEdges, setTaskDetails, saveProjectState]);

  const deletePhase = useCallback((phaseId: string) => {
    // Get all task IDs that belong to this phase
    const taskIdsToDelete = nodes
      .filter(node => node.id.startsWith(`task-${phaseId}-`))
      .map(node => node.id);
    
    // Remove task details for deleted tasks
    const updatedTaskDetails = { ...taskDetails };
    taskIdsToDelete.forEach(taskId => {
      delete updatedTaskDetails[taskId];
    });
    
    // Remove the phase node and all its connected task nodes
    const updatedNodes = nodes.filter(node => 
      node.id !== phaseId && !node.id.startsWith(`task-${phaseId}-`)
    );
    
    // Remove all edges connected to the phase and its tasks
    const updatedEdges = edges.filter(edge => 
      edge.source !== phaseId && 
      edge.target !== phaseId &&
      !edge.source.startsWith(`task-${phaseId}-`) &&
      !edge.target.startsWith(`task-${phaseId}-`)
    );
    
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    setTaskDetails(updatedTaskDetails);
    
    // Save to storage
    saveProjectState(updatedNodes, updatedEdges, updatedTaskDetails);
    
    // Clear selection if the deleted phase was selected
    if (selectedNode && (selectedNode.id === phaseId || taskIdsToDelete.includes(selectedNode.id))) {
      setSelectedNode(null);
    }
  }, [setNodes, setEdges, setTaskDetails, nodes, edges, taskDetails, selectedNode, saveProjectState]);

  const deleteTask = useCallback((taskId: string) => {
    // Remove task details
    const updatedTaskDetails = { ...taskDetails };
    delete updatedTaskDetails[taskId];
    
    // Remove the task node
    const updatedNodes = nodes.filter(node => node.id !== taskId);
    
    // Remove all edges connected to the task
    const updatedEdges = edges.filter(edge => 
      edge.source !== taskId && edge.target !== taskId
    );
    
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    setTaskDetails(updatedTaskDetails);
    
    // Save to storage
    saveProjectState(updatedNodes, updatedEdges, updatedTaskDetails);
    
    // Clear selection if the deleted task was selected
    if (selectedNode && selectedNode.id === taskId) {
      setSelectedNode(null);
    }
  }, [setNodes, setEdges, setTaskDetails, nodes, edges, taskDetails, selectedNode, saveProjectState]);

  // Handle task updates from the inspector panel
  const handleUpdateTask = useCallback(async (taskId: string, updates: Partial<TaskDetailsEntry>) => {
    console.log('Updating task:', taskId, updates);
    
    // Update task details state
    setTaskDetails(prev => {
      const updated = {
        ...prev,
        [taskId]: {
          ...prev[taskId],
          ...updates
        }
      };

      // Update the node data
      setNodes((nds) => {
        const updatedNodes = nds.map(node => {
          if (node.id === taskId) {
            const updatedTask = {
              ...prev[taskId],
              ...updates
            };
            
            // Map status values to match TaskNode expectations
            const statusMapping: Record<string, string> = {
              'To Do': 'todo',
              'In Progress': 'in-progress',
              'Blocked': 'blocked',
              'Done': 'completed'
            };
            
            const nodeStatus = statusMapping[updates.status || ''] || statusMapping[updatedTask.status] || 'todo';
            
            return {
              ...node,
              data: {
                ...node.data,
                label: updates.title || node.data.label,
                status: nodeStatus
              }
            };
          }
          return node;
        });
        
        // Save to storage
        saveProjectState(updatedNodes, edges, updated);
        return updatedNodes;
      });
      
      return updated;
    });

    // Also update in storage immediately for task details
    try {
      await updateTaskDetailInDb(taskId, updates);
    } catch (error) {
      console.error('Error updating task detail in storage:', error);
    }
  }, [setNodes, edges, saveProjectState, updateTaskDetailInDb]);

  // Handle phase updates from the inspector panel
  const handleUpdatePhase = useCallback((phaseId: string, updates: { title?: string; description?: string }) => {
    console.log('Updating phase:', phaseId, updates);
    
    setNodes((nds) => {
      const updatedNodes = nds.map(node => {
        if (node.id === phaseId) {
          return {
            ...node,
            data: {
              ...node.data,
              label: updates.title || node.data.label,
              description: updates.description || node.data.description || ''
            }
          };
        }
        return node;
      });
      
      // Save to storage
      saveProjectState(updatedNodes, edges, taskDetails);
      return updatedNodes;
    });
  }, [setNodes, edges, taskDetails, saveProjectState]);

  // Context menu handlers
  const handleContextMenuAddTask = useCallback(() => {
    if (contextMenu.nodeId) {
      addTask(contextMenu.nodeId);
    }
  }, [contextMenu.nodeId, addTask]);

  const handleContextMenuDeletePhase = useCallback(() => {
    if (contextMenu.nodeId) {
      deletePhase(contextMenu.nodeId);
    }
  }, [contextMenu.nodeId, deletePhase]);

  const handleContextMenuEditDetails = useCallback(() => {
    if (contextMenu.nodeId) {
      const node = nodes.find(n => n.id === contextMenu.nodeId);
      if (node) {
        setSelectedNode(node);
      }
    }
  }, [contextMenu.nodeId, nodes]);

  const handleContextMenuDeleteTask = useCallback(() => {
    if (contextMenu.nodeId) {
      deleteTask(contextMenu.nodeId);
    }
  }, [contextMenu.nodeId, deleteTask]);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu({ ...contextMenu, isVisible: false });
  }, [contextMenu]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background-900 via-background-800 to-background-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-accent-500 animate-spin" />
          <p className="text-secondary-400 font-medium">Loading project...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background-900 via-background-800 to-background-900">
        <div className="text-center">
          <div className="p-6 bg-status-blocked-500/20 rounded-2xl inline-block mb-6">
            <Sparkles className="w-16 h-16 text-status-blocked-400 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Error Loading Project</h3>
          <p className="text-secondary-400 mb-8 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-semibold rounded-xl transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Canvas Area - Takes remaining space */}
      <div className="flex-1 relative">
        {/* Context Menu */}
        <ContextMenu
          isVisible={contextMenu.isVisible}
          position={contextMenu.position}
          nodeType={contextMenu.nodeType}
          onAddTask={handleContextMenuAddTask}
          onDeletePhase={handleContextMenuDeletePhase}
          onEditDetails={handleContextMenuEditDetails}
          onDeleteTask={handleContextMenuDeleteTask}
          onClose={handleCloseContextMenu}
        />

        {/* Inline Text Editor - Positioned directly over the node */}
        {editingNode && (
          <div 
            className="absolute z-50 pointer-events-none"
            style={{
              left: editPosition.x,
              top: editPosition.y,
              width: editPosition.width,
              height: editPosition.height,
            }}
          >
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={() => handleTextSubmit(editingNode)}
              autoFocus
              className="w-full h-full bg-transparent border-none outline-none text-center font-semibold text-secondary-800 pointer-events-auto"
              style={{
                fontSize: editingNode.startsWith('task-') ? '14px' : '16px',
                fontWeight: '600',
                padding: editingNode.startsWith('task-') ? '12px 16px' : '16px 24px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                border: '2px solid rgba(20, 184, 166, 0.5)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2) inset'
              }}
              placeholder="Enter text..."
            />
          </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeContextMenu={onNodeContextMenu}
          onNodeDoubleClick={onNodeDoubleClick}
          onPaneClick={() => {
            setSelectedNode(null); // Clear selection when clicking on empty space
            setContextMenu({ ...contextMenu, isVisible: false });
            if (editingNode) handleTextCancel();
          }}
          className="bg-gradient-to-br from-background-900 via-background-800 to-background-900"
          fitView
          attributionPosition="bottom-left"
        >
          <Controls 
            position="bottom-right"
            className="bg-background-800/90 backdrop-blur-xl border border-background-700/50 rounded-xl shadow-2xl"
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.9)',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              borderRadius: '12px',
              padding: '8px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
            }}
          >
            {/* Auto-Arrange Button */}
            <ControlButton
              onClick={handleAutoArrange}
              title="Auto-arrange nodes"
              className="!bg-gradient-to-r !from-accent-600 !to-accent-700 hover:!from-accent-700 hover:!to-accent-800 !border-accent-500/50 hover:!border-accent-400/70 !text-white hover:!text-white transition-all duration-200 hover:!scale-105"
            >
              <Sparkles className="w-4 h-4" />
            </ControlButton>
          </Controls>
          <MiniMap 
            position="bottom-left"
            className="bg-background-800/90 backdrop-blur-xl border border-background-700/50 rounded-xl shadow-2xl"
            nodeColor="#14b8a6"
            maskColor="rgba(0, 0, 0, 0.7)"
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.9)',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              borderRadius: '12px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
            }}
          />
          <Background 
            variant="dots" 
            gap={24} 
            size={1.5} 
            color="#475569"
            className="bg-gradient-to-br from-background-900 via-background-800 to-background-900"
          />
        </ReactFlow>
      </div>

      {/* Inspector Panel - Fixed width, full height */}
      <div className="flex-shrink-0">
        <InspectorPanel 
          onAddPhase={addPhase} 
          selectedNode={selectedNode} 
          onUpdateTask={handleUpdateTask}
          onUpdatePhase={handleUpdatePhase}
          taskDetails={taskDetails}
          onAddTask={addTask}
          projectId={projectId}
          onAIGenerationComplete={handleAIGenerationComplete}
          aiPromptFromUrl={aiPromptFromUrl}
        />
      </div>
    </>
  );
};

export default MindMap;