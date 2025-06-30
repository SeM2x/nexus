import { CustomNode, Edge, TaskDetails, Project } from '../types';

// Guest storage keys
const GUEST_PROJECTS_KEY = 'nexus-guest-projects';
const GUEST_PROJECT_PREFIX = 'nexus-guest-project-';

// Guest project data structure
export interface GuestProjectData {
  nodes: CustomNode[];
  edges: Edge[];
  taskDetails: TaskDetails;
  project: Project;
}

// Generate a unique guest project ID
export const generateGuestProjectId = (): string => {
  return crypto.randomUUID();
};

// Get all guest projects
export const getGuestProjects = (): Project[] => {
  try {
    const projectsJson = localStorage.getItem(GUEST_PROJECTS_KEY);
    if (!projectsJson) return [];
    
    const projects = JSON.parse(projectsJson);
    return Array.isArray(projects) ? projects : [];
  } catch (error) {
    console.error('Error loading guest projects:', error);
    return [];
  }
};

// Save guest projects list
export const saveGuestProjects = (projects: Project[]): void => {
  try {
    localStorage.setItem(GUEST_PROJECTS_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Error saving guest projects:', error);
  }
};

// Create a new guest project
export const createGuestProject = (projectData: {
  name: string;
  description?: string;
  color?: string;
}): Project => {
  const newProject: Project = {
    id: generateGuestProjectId(),
    name: projectData.name,
    description: projectData.description || '',
    color: projectData.color || 'from-blue-500 to-blue-600',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastModified: 'Just now',
    status: 'Planning',
    phases: 0,
    tasks: 0,
    completedTasks: 0
  };

  // Add to projects list
  const projects = getGuestProjects();
  projects.unshift(newProject); // Add to beginning
  saveGuestProjects(projects);

  // Create the root node for this project
  const defaultRootNode: CustomNode = {
    id: crypto.randomUUID(),
    type: 'rootNode',
    position: { x: 100, y: 300 },
    data: { label: newProject.name },
    selected: false
  };

  // Initialize project data with root node
  const initialData: GuestProjectData = {
    nodes: [defaultRootNode],
    edges: [],
    taskDetails: {},
    project: newProject
  };
  
  saveGuestProjectData(newProject.id, initialData);
  
  console.log('✅ Created guest project with root node:', newProject.id);
  
  return newProject;
};

// Get guest project data
export const getGuestProjectData = (projectId: string): GuestProjectData | null => {
  try {
    const dataJson = localStorage.getItem(`${GUEST_PROJECT_PREFIX}${projectId}`);
    if (!dataJson) {
      console.log('No guest project data found for:', projectId);
      return null;
    }
    
    const data = JSON.parse(dataJson);
    console.log('Loaded guest project data:', projectId, {
      nodes: data.nodes?.length || 0,
      edges: data.edges?.length || 0,
      taskDetails: Object.keys(data.taskDetails || {}).length
    });
    
    return data;
  } catch (error) {
    console.error('Error loading guest project data:', error);
    return null;
  }
};

// Save guest project data
export const saveGuestProjectData = (projectId: string, data: GuestProjectData): void => {
  try {
    // Update the project's updatedAt timestamp
    data.project.updatedAt = new Date().toISOString();
    data.project.lastModified = getRelativeTime(data.project.updatedAt);
    
    // Calculate project stats
    const phaseNodes = data.nodes.filter(node => 
      node.type === 'phaseNode' || 
      (node.type !== 'taskNode' && node.type !== 'rootNode')
    );
    const taskNodes = data.nodes.filter(node => node.type === 'taskNode');
    const completedTasks = Object.values(data.taskDetails).filter(detail => 
      detail.status === 'Done'
    ).length;
    
    data.project.phases = phaseNodes.length;
    data.project.tasks = taskNodes.length;
    data.project.completedTasks = completedTasks;
    
    // Determine project status
    if (taskNodes.length > 0) {
      if (completedTasks === taskNodes.length) {
        data.project.status = 'Completed';
      } else if (completedTasks > 0) {
        data.project.status = 'In Progress';
      } else {
        data.project.status = 'In Progress';
      }
    } else {
      data.project.status = 'Planning';
    }
    
    // Save project data
    localStorage.setItem(`${GUEST_PROJECT_PREFIX}${projectId}`, JSON.stringify(data));
    
    // Update projects list
    const projects = getGuestProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex !== -1) {
      projects[projectIndex] = data.project;
      saveGuestProjects(projects);
    }
    
    console.log('✅ Saved guest project data:', projectId, {
      nodes: data.nodes.length,
      edges: data.edges.length,
      taskDetails: Object.keys(data.taskDetails).length
    });
  } catch (error) {
    console.error('Error saving guest project data:', error);
  }
};

// Delete guest project
export const deleteGuestProject = (projectId: string): void => {
  try {
    // Remove project data
    localStorage.removeItem(`${GUEST_PROJECT_PREFIX}${projectId}`);
    
    // Remove from projects list
    const projects = getGuestProjects();
    const filteredProjects = projects.filter(p => p.id !== projectId);
    saveGuestProjects(filteredProjects);
  } catch (error) {
    console.error('Error deleting guest project:', error);
  }
};

// Clear all guest data
export const clearAllGuestData = (): void => {
  try {
    // Get all guest projects
    const projects = getGuestProjects();
    
    // Remove all project data
    projects.forEach(project => {
      localStorage.removeItem(`${GUEST_PROJECT_PREFIX}${project.id}`);
    });
    
    // Clear projects list
    localStorage.removeItem(GUEST_PROJECTS_KEY);
  } catch (error) {
    console.error('Error clearing guest data:', error);
  }
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

// Initialize guest project with default root node (legacy function, now handled in createGuestProject)
export const initializeGuestProject = (projectId: string, projectName: string): GuestProjectData => {
  // Check if project already exists
  let existingData = getGuestProjectData(projectId);
  if (existingData) {
    return existingData;
  }

  // Find the project in the projects list
  const projects = getGuestProjects();
  let project = projects.find(p => p.id === projectId);
  
  // If project doesn't exist in list, create it
  if (!project) {
    project = {
      id: projectId,
      name: projectName,
      description: 'A project created in guest mode',
      color: 'from-purple-500 to-purple-600',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastModified: 'Just now',
      status: 'Planning',
      phases: 0,
      tasks: 0,
      completedTasks: 0
    };
    
    projects.unshift(project);
    saveGuestProjects(projects);
  }

  const defaultRootNode: CustomNode = {
    id: crypto.randomUUID(),
    type: 'rootNode',
    position: { x: 100, y: 300 },
    data: { label: projectName },
    selected: false
  };

  const initialData: GuestProjectData = {
    nodes: [defaultRootNode],
    edges: [],
    taskDetails: {},
    project
  };

  saveGuestProjectData(projectId, initialData);
  return initialData;
};