import { supabase } from './supabase';
import type {
  CustomNode,
  TaskDetails,
  TaskDetailsEntry,
  Project,
} from '../types';
import type { Edge } from '@xyflow/react';

// Database types
export interface DatabaseProject {
  id: string;
  user_id: string;
  name: string;
  description: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseNode {
  id: string;
  project_id: string;
  data: any;
  position: { x: number; y: number };
  type: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseEdge {
  id: string;
  project_id: string;
  source: string;
  target: string;
  data: any;
  created_at: string;
  updated_at: string;
}

export interface DatabaseTaskDetail {
  id: string;
  node_id: string;
  project_id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Project operations
export const createProject = async (projectData: {
  name: string;
  description?: string;
  color?: string;
}): Promise<DatabaseProject> => {
  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('projects')
    .insert([
      {
        user_id: user.id, // Set the user_id to the current authenticated user
        name: projectData.name,
        description: projectData.description || '',
        color: projectData.color || 'from-blue-500 to-blue-600',
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating project:', error);
    throw error;
  }

  return data;
};

export const getProjects = async (): Promise<DatabaseProject[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }

  return data || [];
};

export const getProject = async (
  projectId: string
): Promise<DatabaseProject | null> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Project not found
    }
    console.error('Error fetching project:', error);
    throw error;
  }

  return data;
};

export const updateProject = async (
  projectId: string,
  updates: Partial<Pick<DatabaseProject, 'name' | 'description' | 'color'>>
): Promise<DatabaseProject> => {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    console.error('Error updating project:', error);
    throw error;
  }

  return data;
};

export const deleteProject = async (projectId: string): Promise<void> => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

// Node operations
export const getProjectNodes = async (
  projectId: string
): Promise<DatabaseNode[]> => {
  const { data, error } = await supabase
    .from('nodes')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching nodes:', error);
    throw error;
  }

  return data || [];
};

export const saveNodes = async (
  projectId: string,
  nodes: CustomNode[]
): Promise<void> => {
  // First, delete existing nodes for this project
  const { error: deleteError } = await supabase
    .from('nodes')
    .delete()
    .eq('project_id', projectId);

  if (deleteError) {
    console.error('Error deleting existing nodes:', deleteError);
    throw deleteError;
  }

  // Then insert the new nodes
  if (nodes.length > 0) {
    const nodesToInsert = nodes.map((node) => ({
      id: node.id,
      project_id: projectId,
      data: node.data,
      position: node.position,
      type: node.type || 'default',
    }));

    const { error: insertError } = await supabase
      .from('nodes')
      .insert(nodesToInsert);

    if (insertError) {
      console.error('Error inserting nodes:', insertError);
      throw insertError;
    }
  }
};

// Edge operations
export const getProjectEdges = async (
  projectId: string
): Promise<DatabaseEdge[]> => {
  const { data, error } = await supabase
    .from('edges')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching edges:', error);
    throw error;
  }

  return data || [];
};

export const saveEdges = async (
  projectId: string,
  edges: Edge[]
): Promise<void> => {
  // First, delete existing edges for this project
  const { error: deleteError } = await supabase
    .from('edges')
    .delete()
    .eq('project_id', projectId);

  if (deleteError) {
    console.error('Error deleting existing edges:', deleteError);
    throw deleteError;
  }

  // Then insert the new edges
  if (edges.length > 0) {
    const edgesToInsert = edges.map((edge) => ({
      id: edge.id,
      project_id: projectId,
      source: edge.source,
      target: edge.target,
      data: {
        type: edge.type,
        style: edge.style,
        markerEnd: edge.markerEnd,
        ...edge.data,
      },
    }));

    const { error: insertError } = await supabase
      .from('edges')
      .insert(edgesToInsert);

    if (insertError) {
      console.error('Error inserting edges:', insertError);
      throw insertError;
    }
  }
};

// Task details operations
export const getProjectTaskDetails = async (
  projectId: string
): Promise<DatabaseTaskDetail[]> => {
  const { data, error } = await supabase
    .from('task_details')
    .select('*')
    .eq('project_id', projectId);

  if (error) {
    console.error('Error fetching task details:', error);
    throw error;
  }

  return data || [];
};

export const saveTaskDetails = async (
  projectId: string,
  taskDetails: TaskDetails
): Promise<void> => {
  // First, delete existing task details for this project
  const { error: deleteError } = await supabase
    .from('task_details')
    .delete()
    .eq('project_id', projectId);

  if (deleteError) {
    console.error('Error deleting existing task details:', deleteError);
    throw deleteError;
  }

  // Then insert the new task details
  const taskDetailsArray = Object.entries(taskDetails);
  if (taskDetailsArray.length > 0) {
    const taskDetailsToInsert = taskDetailsArray.map(([nodeId, details]) => ({
      node_id: nodeId,
      project_id: projectId,
      title: details.title,
      description: details.description,
      status: details.status,
    }));

    const { error: insertError } = await supabase
      .from('task_details')
      .insert(taskDetailsToInsert);

    if (insertError) {
      console.error('Error inserting task details:', insertError);
      throw insertError;
    }
  }
};

export const updateTaskDetail = async (
  nodeId: string,
  projectId: string,
  updates: Partial<TaskDetailsEntry>
): Promise<void> => {
  const { error } = await supabase.from('task_details').upsert(
    {
      node_id: nodeId,
      project_id: projectId,
      title: updates.title || '',
      description: updates.description || '',
      status: updates.status || 'To Do',
    },
    {
      onConflict: 'node_id,project_id',
    }
  );

  if (error) {
    console.error('Error updating task detail:', error);
    throw error;
  }
};

// Combined operations for saving complete project state
export const saveProjectData = async (
  projectId: string,
  nodes: CustomNode[],
  edges: Edge[],
): Promise<void> => {
  try {
    console.log('saving');
    
    // Save all data in parallel for better performance
    await Promise.all([
      saveNodes(projectId, nodes),
      saveEdges(projectId, edges),
    ]);
  } catch (error) {
    console.error('Error saving project data:', error);
    throw error;
  }
};

export const getProjectData = async (
  projectId: string
): Promise<{
  nodes: CustomNode[];
  edges: Edge[];
}> => {
  try {
    // Fetch all data in parallel
    const [dbNodes, dbEdges] = await Promise.all([
      getProjectNodes(projectId),
      getProjectEdges(projectId),
    ]);

    // Convert database nodes to CustomNode format
    const nodes: CustomNode[] = dbNodes.map((dbNode) => ({
      id: dbNode.id,
      type: dbNode.type as any,
      position: dbNode.position,
      data: dbNode.data,
      selected: false,
    }));

    // Convert database edges to Edge format
    const edges: Edge[] = dbEdges.map((dbEdge) => ({
      id: dbEdge.id,
      source: dbEdge.source,
      target: dbEdge.target,
      type: dbEdge.data?.type || 'simplebezier',
      style: dbEdge.data?.style,
      markerEnd: dbEdge.data?.markerEnd,
      ...dbEdge.data,
    }));

    return { nodes, edges };
  } catch (error) {
    console.error('Error fetching project data:', error);
    throw error;
  }
};

// Helper function to convert database project to frontend Project type
export const convertDatabaseProject = (
  dbProject: DatabaseProject
): Omit<Project, 'nodes' | 'edges'> => {
  return {
    id: dbProject.id,
    name: dbProject.name,
    description: dbProject.description,
    color: dbProject.color,
    createdAt: dbProject.created_at,
    updatedAt: dbProject.updated_at,
    status: 'planning', // We'll calculate this based on tasks later
    phases: 0, // We'll calculate this based on nodes
    tasks: 0, // We'll calculate this based on task nodes
    completedTasks: 0, // We'll calculate this based on completed tasks
  };
};

// Helper function to get relative time
const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};
