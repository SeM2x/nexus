import React, { useCallback, useEffect } from 'react';
import {
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type NodeProps,
} from '@xyflow/react';
import { MindMapContext } from '@/hooks/useMindMap';
import type {
  RootNode as RootNodeType,
  PhaseNode as PhaseNodeType,
  TaskNode as TaskNodeType,
  CustomNode,
  TaskDetailsEntry,
} from '@/types';
import RootNode from '@/components/workspace/RootNode';
import PhaseNode from '@/components/workspace/PhaseNode';
import TaskNode from '@/components/workspace/TaskNode';
import { saveLocalProject } from '@/lib/localStorage';
import useProject from '@/hooks/useProject';
import { saveProjectData } from '@/lib/database';
import { debounce } from 'lodash';
import { addNode } from '@/utils/mindmap/addNode';
import generateProject from '@/utils/generateProject';

// Define custom node types - always horizontal layout
const nodeTypes = {
  rootNode: (props: NodeProps<RootNodeType>) => <RootNode {...props} />,
  phaseNode: (props: NodeProps<PhaseNodeType>) => <PhaseNode {...props} />,
  taskNode: (props: NodeProps<TaskNodeType>) => <TaskNode {...props} />,
};

interface MindMapProviderProps {
  children: React.ReactNode;
  isGuest: boolean;
}

export const MindMapProvider: React.FC<MindMapProviderProps> = ({
  children,
  isGuest,
}) => {
  const { project, loading, error } = useProject({ isGuest });
  const [nodes, setNodes, onNodesChange] = useNodesState(project?.nodes ?? []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(project?.edges ?? []);

  useEffect(() => {
    if (project?.nodes) setNodes(project.nodes);
    if (project?.edges) setEdges(project.edges);
  }, [project, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const debouncedSave = useCallback(
    debounce(
      (projectId: string, nodesToSave: CustomNode[], edgesToSave: Edge[]) => {
        saveProjectData(projectId, nodesToSave, edgesToSave);
      },
      500,
      { leading: false, trailing: true, maxWait: 2000 }
    ),
    []
  );

  useEffect(() => {
    if (!project) return;
    if (nodes.length === 0 && edges.length === 0) return;

    saveLocalProject({ nodes, edges }, { isGuest });

    if (!isGuest && project.id) {
      debouncedSave(project.id, nodes, edges);
    }
  }, [nodes, edges, project, isGuest, debouncedSave]);

  const addPhase = useCallback(
    (phaseLabel = 'New Phase') => {
      const res = addNode({ nodes, label: phaseLabel });
      if (res) {
        const { newNode, newEdge } = res;
        const updatedNodes = [...nodes, newNode];
        const updatedEdges = [...edges, newEdge];

        setNodes(updatedNodes);
        setEdges(updatedEdges);

        return newNode;
      }
    },
    [nodes, edges, setNodes, setEdges]
  );

  const addTask = useCallback(
    (phaseId: string, taskLabel = 'New Task') => {
      const res = addNode({ nodes, label: taskLabel, phaseId });
      if (res) {
        const { newNode: newTask, newEdge } = res;
        const updatedNodes = [...nodes, newTask];
        const updatedEdges = [...edges, newEdge];

        setNodes(updatedNodes);
        setEdges(updatedEdges);

        return newTask;
      }
    },
    [nodes, edges, setNodes, setEdges]
  );

  // Handle task updates from the inspector panel
  const handleUpdateTask = useCallback(
    (taskId: string, updates: Partial<TaskDetailsEntry>) => {
      console.log('Updating task:', taskId, updates);

      // Update the node data
      setNodes((nds) => {
        const updatedNodes = nds.map((node) => {
          if (node.id === taskId) {
            return {
              ...node,
              data: {
                ...node.data,
                label: updates.title || node.data.label,
                status: updates.status || node.data.status,
                description: updates.description || node.data.description,
              },
            };
          }
          return node;
        });
        return updatedNodes;
      });
    },
    [setNodes]
  );

  // Handle phase updates from the inspector panel
  const handleUpdatePhase = useCallback(
    (phaseId: string, updates: { title?: string; description?: string }) => {
      console.log('Updating phase:', phaseId, updates);

      setNodes((nds) => {
        const updatedNodes = nds.map((node) => {
          if (node.id === phaseId) {
            return {
              ...node,
              data: {
                ...node.data,
                label: updates.title || node.data.label,
                description: updates.description || node.data.description || '',
              },
            };
          }
          return node;
        });
        return updatedNodes;
      });
    },
    [setNodes]
  );

  const generateProjectPlan = async (prompt: string) => {
    // Call the Supabase Edge Function
    const res = await generateProject({ prompt, nodes, edges });

    if (res?.newEdges && res.newNodes) {
      setNodes([...res.newNodes]);
      setEdges([...res.newEdges]);
    }
  };

  const value = {
    isGuest,
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
    onConnect,
    nodeTypes,
    addPhase,
    addTask,
    handleUpdatePhase,
    handleUpdateTask,
    project,
    projectLoading: loading,
    error,
    generateProjectPlan,
  };

  return (
    <MindMapContext.Provider value={value}>{children}</MindMapContext.Provider>
  );
};
