import { useState, useEffect, useCallback, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { CustomNode, Edge, TaskDetails, TaskDetailsEntry } from '../types';
import { 
  getProjectData, 
  saveProjectData, 
  updateTaskDetail,
  getProject
} from '../lib/database';
import { supabase } from '../lib/supabase';

export const useProjectData = (projectId: string) => {
  const [nodes, setNodes] = useState<CustomNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [taskDetails, setTaskDetails] = useState<TaskDetails>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track if we're currently saving to prevent infinite loops
  const isSavingRef = useRef(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const hasCreatedDefaultNodeRef = useRef(false);

  // Load project data
  const loadProjectData = useCallback(async (forceReload = false) => {
    if (!projectId) return;
    
    try {
      if (forceReload) {
        setLoading(true);
      }
      setError(null);
      
      // Get both project info and project data
      const [projectInfo, projectData] = await Promise.all([
        getProject(projectId),
        getProjectData(projectId)
      ]);
      
      // If no nodes exist and we haven't created a default node yet, create one
      if (projectData.nodes.length === 0 && !hasCreatedDefaultNodeRef.current) {
        hasCreatedDefaultNodeRef.current = true;
        
        const projectName = projectInfo?.name || 'New Project';
        const defaultRootNode: CustomNode = {
          id: crypto.randomUUID(),
          type: 'rootNode',
          position: { x: 100, y: 300 },
          data: { label: projectName },
          selected: false
        };
        
        setNodes([defaultRootNode]);
        setEdges([]);
        setTaskDetails({});
        
        // Save the default node to the database
        isSavingRef.current = true;
        await saveProjectData(projectId, [defaultRootNode], [], {});
        isSavingRef.current = false;
      } else {
        // Update root node with correct project name if it exists
        const updatedNodes = projectData.nodes.map(node => {
          if (node.type === 'rootNode') {
            return {
              ...node,
              data: {
                ...node.data,
                label: projectInfo?.name || node.data.label || 'New Project'
              }
            };
          }
          return node;
        });
        
        setNodes(updatedNodes);
        setEdges(projectData.edges);
        setTaskDetails(projectData.taskDetails);
        
        // If we updated the root node name, save it
        const rootNodeUpdated = updatedNodes.some((node, index) => 
          node.type === 'rootNode' && 
          projectData.nodes[index] && 
          node.data.label !== projectData.nodes[index].data.label
        );
        
        if (rootNodeUpdated && projectInfo?.name) {
          isSavingRef.current = true;
          await saveProjectData(projectId, updatedNodes, projectData.edges, projectData.taskDetails);
          isSavingRef.current = false;
        }
      }
      
      lastUpdateRef.current = Date.now();
      console.log('Project data loaded successfully:', { 
        nodes: projectData.nodes.length, 
        edges: projectData.edges.length, 
        taskDetails: Object.keys(projectData.taskDetails).length 
      });
    } catch (err) {
      console.error('Error loading project data:', err);
      setError('Failed to load project data');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Save project data to database with debouncing
  const saveData = useCallback(async (
    nodesToSave: CustomNode[], 
    edgesToSave: Edge[], 
    taskDetailsToSave: TaskDetails
  ) => {
    if (!projectId || isSavingRef.current) return;
    
    try {
      isSavingRef.current = true;
      lastUpdateRef.current = Date.now();
      await saveProjectData(projectId, nodesToSave, edgesToSave, taskDetailsToSave);
      console.log('Data saved successfully');
    } catch (err) {
      console.error('Error saving project data:', err);
      throw new Error('Failed to save project data');
    } finally {
      isSavingRef.current = false;
    }
  }, [projectId]);

  // Update task detail
  const updateTaskDetailInDb = useCallback(async (
    nodeId: string, 
    updates: Partial<TaskDetailsEntry>
  ) => {
    if (!projectId || isSavingRef.current) return;
    
    try {
      isSavingRef.current = true;
      lastUpdateRef.current = Date.now();
      await updateTaskDetail(nodeId, projectId, updates);
      console.log('Task detail updated successfully');
    } catch (err) {
      console.error('Error updating task detail:', err);
      throw new Error('Failed to update task detail');
    } finally {
      isSavingRef.current = false;
    }
  }, [projectId]);

  // Force refresh data (for AI generation completion) - NO PAGE RELOAD
  const forceRefresh = useCallback(async () => {
    console.log('🔄 Force refreshing project data from database...');
    
    // Reset the flag to allow fresh data loading
    hasCreatedDefaultNodeRef.current = false;
    
    // Load fresh data from database
    await loadProjectData(true);
    
    console.log('✅ Project data refreshed successfully');
  }, [loadProjectData]);

  // Handle real-time updates with debouncing
  const handleRealtimeUpdate = useCallback(async (payload: any) => {
    // Ignore updates that happened very recently (likely from this client)
    const timeSinceLastUpdate = Date.now() - lastUpdateRef.current;
    if (timeSinceLastUpdate < 1000 || isSavingRef.current) {
      console.log('Ignoring real-time update (too recent or currently saving)');
      return;
    }
    
    console.log('Processing real-time update:', payload);
    
    try {
      const [projectInfo, projectData] = await Promise.all([
        getProject(projectId),
        getProjectData(projectId)
      ]);
      
      console.log('Received real-time data:', projectData);
      
      // Update root node with correct project name
      const updatedNodes = projectData.nodes.map(node => {
        if (node.type === 'rootNode') {
          return {
            ...node,
            data: {
              ...node.data,
              label: projectInfo?.name || node.data.label || 'New Project'
            }
          };
        }
        return node;
      });
      
      setNodes(updatedNodes);
      setEdges(projectData.edges);
      setTaskDetails(projectData.taskDetails);
      
      // DO NOT update lastUpdateRef here - only update it when this client saves
    } catch (err) {
      console.error('Error handling real-time update:', err);
    }
  }, [projectId]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!projectId) return;

    console.log('Setting up real-time subscriptions for project:', projectId);

    // Create a channel for this project
    const channel = supabase
      .channel(`project-${projectId}`, {
        config: {
          broadcast: { self: false },
          presence: { key: projectId }
        }
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'nodes',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          console.log('Nodes change received:', payload);
          handleRealtimeUpdate(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'edges',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          console.log('Edges change received:', payload);
          handleRealtimeUpdate(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_details',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          console.log('Task details change received:', payload);
          handleRealtimeUpdate(payload);
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to real-time updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.warn('Real-time subscription encountered an error, but will continue to retry');
        } else if (status === 'TIMED_OUT') {
          console.warn('Real-time subscription timed out, will retry');
        } else if (status === 'CLOSED') {
          console.log('Real-time subscription closed');
        }
      });

    channelRef.current = channel;

    // Cleanup function
    return () => {
      console.log('Cleaning up real-time subscriptions');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [projectId, handleRealtimeUpdate]);

  // Load data when projectId changes
  useEffect(() => {
    // Reset the flag when projectId changes
    hasCreatedDefaultNodeRef.current = false;
    loadProjectData();
  }, [loadProjectData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        console.log('Unmounting: cleaning up real-time channel');
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  return {
    nodes,
    edges,
    taskDetails,
    loading,
    error,
    setNodes,
    setEdges,
    setTaskDetails,
    saveData,
    updateTaskDetailInDb,
    refetch: loadProjectData,
    forceRefresh // This now properly refetches data without page reload
  };
};