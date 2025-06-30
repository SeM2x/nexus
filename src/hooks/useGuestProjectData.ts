import { useState, useEffect, useCallback, useRef } from 'react';
import { CustomNode, Edge, TaskDetails, TaskDetailsEntry } from '../types';
import { 
  getGuestProjectData, 
  saveGuestProjectData, 
  initializeGuestProject,
  createGuestProject,
  GuestProjectData 
} from '../lib/guestStorage';

export const useGuestProjectData = (projectId: string, projectName?: string) => {
  const [nodes, setNodes] = useState<CustomNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [taskDetails, setTaskDetails] = useState<TaskDetails>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track if we're currently saving to prevent infinite loops
  const isSavingRef = useRef(false);
  const hasInitializedRef = useRef(false);

  // Load project data
  const loadProjectData = useCallback(async (forceReload = false) => {
    if (!projectId) return;
    
    try {
      if (forceReload) {
        setLoading(true);
      }
      setError(null);
      
      let projectData = getGuestProjectData(projectId);
      
      // If no data exists and we haven't initialized yet, create it
      if (!projectData && !hasInitializedRef.current) {
        hasInitializedRef.current = true;
        
        console.log('Creating new guest project data for:', projectId);
        
        // Create a new guest project with proper initialization
        const newProject = createGuestProject({
          name: projectName || 'My Guest Project',
          description: 'A project created in guest mode',
          color: 'from-purple-500 to-purple-600'
        });
        
        // Create the root node
        const defaultRootNode: CustomNode = {
          id: crypto.randomUUID(),
          type: 'rootNode',
          position: { x: 100, y: 300 },
          data: { label: newProject.name },
          selected: false
        };
        
        // Initialize the project data with root node
        const initialData: GuestProjectData = {
          nodes: [defaultRootNode],
          edges: [],
          taskDetails: {},
          project: newProject
        };
        
        // Save the initial data
        saveGuestProjectData(projectId, initialData);
        
        // Set the data
        projectData = initialData;
        
        console.log('✅ Guest project initialized with root node:', defaultRootNode);
      }
      
      if (projectData) {
        setNodes(projectData.nodes);
        setEdges(projectData.edges);
        setTaskDetails(projectData.taskDetails);
        
        console.log('Guest project data loaded:', { 
          nodes: projectData.nodes.length, 
          edges: projectData.edges.length, 
          taskDetails: Object.keys(projectData.taskDetails).length 
        });
      } else {
        // This should not happen, but provide fallback
        console.warn('No project data found, creating minimal fallback');
        const fallbackRootNode: CustomNode = {
          id: crypto.randomUUID(),
          type: 'rootNode',
          position: { x: 100, y: 300 },
          data: { label: projectName || 'My Guest Project' },
          selected: false
        };
        
        setNodes([fallbackRootNode]);
        setEdges([]);
        setTaskDetails({});
      }
      
    } catch (err) {
      console.error('Error loading guest project data:', err);
      setError('Failed to load project data');
    } finally {
      setLoading(false);
    }
  }, [projectId, projectName]);

  // Save project data to localStorage
  const saveData = useCallback(async (
    nodesToSave: CustomNode[], 
    edgesToSave: Edge[], 
    taskDetailsToSave: TaskDetails
  ) => {
    if (!projectId || isSavingRef.current) return;
    
    try {
      isSavingRef.current = true;
      
      let currentData = getGuestProjectData(projectId);
      
      // If no current data exists, create a basic project structure
      if (!currentData) {
        console.log('Creating project data structure for save operation');
        const newProject = createGuestProject({
          name: 'My Guest Project',
          description: 'A project created in guest mode',
          color: 'from-purple-500 to-purple-600'
        });
        
        currentData = {
          nodes: [],
          edges: [],
          taskDetails: {},
          project: newProject
        };
      }
      
      const updatedData: GuestProjectData = {
        ...currentData,
        nodes: nodesToSave,
        edges: edgesToSave,
        taskDetails: taskDetailsToSave
      };
      
      saveGuestProjectData(projectId, updatedData);
      console.log('Guest data saved successfully');
    } catch (err) {
      console.error('Error saving guest project data:', err);
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
      
      const updatedTaskDetails = {
        ...taskDetails,
        [nodeId]: {
          ...taskDetails[nodeId],
          ...updates
        }
      };
      
      setTaskDetails(updatedTaskDetails);
      await saveData(nodes, edges, updatedTaskDetails);
      
      console.log('Guest task detail updated successfully');
    } catch (err) {
      console.error('Error updating guest task detail:', err);
      throw new Error('Failed to update task detail');
    } finally {
      isSavingRef.current = false;
    }
  }, [projectId, taskDetails, nodes, edges, saveData]);

  // Force refresh data
  const forceRefresh = useCallback(async () => {
    console.log('🔄 Force refreshing guest project data...');
    await loadProjectData(true);
    console.log('✅ Guest project data refreshed successfully');
  }, [loadProjectData]);

  // Load data when projectId changes
  useEffect(() => {
    hasInitializedRef.current = false;
    loadProjectData();
  }, [loadProjectData]);

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
    forceRefresh
  };
};