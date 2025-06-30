import { Project, ProjectData, TaskDetails, CustomNode, Edge } from './types';

export const MOCK_PROJECTS: Project[] = [
  { 
    id: 'proj-1', 
    name: 'Nexus Development', 
    description: 'Complete planning and execution strategy for the upcoming Nexus project management platform',
    lastModified: '2 days ago',
    status: 'In Progress',
    phases: 4,
    tasks: 15,
    completedTasks: 8,
    color: 'from-blue-500 to-blue-600',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-17T14:22:00Z'
  },
  { 
    id: 'proj-2', 
    name: 'Q4 Marketing Campaign', 
    description: 'Strategic marketing initiative to boost Q4 sales and brand awareness across digital channels',
    lastModified: '5 days ago',
    status: 'Planning',
    phases: 5,
    tasks: 22,
    completedTasks: 3,
    color: 'from-purple-500 to-purple-600',
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-12T16:45:00Z'
  },
  { 
    id: 'proj-3', 
    name: 'My Novel Outline', 
    description: 'Comprehensive story structure and character development for upcoming science fiction novel',
    lastModified: '1 hour ago',
    status: 'In Progress',
    phases: 3,
    tasks: 12,
    completedTasks: 9,
    color: 'from-green-500 to-green-600',
    createdAt: '2024-01-16T08:00:00Z',
    updatedAt: '2024-01-17T15:30:00Z'
  },
];

// Project data with nodes, edges, and task details - Updated for horizontal layout
export const MOCK_PROJECT_DATA: Record<string, ProjectData> = {
  'proj-1': {
    nodes: [
      {
        id: '1',
        type: 'rootNode', // Changed to use custom rootNode type
        position: { x: 100, y: 300 }, // Positioned for horizontal layout (left side)
        data: { 
          label: 'Nexus Development'
        },
      },
      {
        id: '2',
        type: 'phaseNode',
        position: { x: 350, y: 100 },
        data: { 
          label: 'Planning Phase',
          description: 'Initial planning and preparation for the Nexus platform'
        },
        selected: false,
      },
      {
        id: '3',
        type: 'phaseNode',
        position: { x: 350, y: 200 },
        data: { 
          label: 'Marketing & Promotion',
          description: 'Promote the platform and attract users'
        },
        selected: false,
      },
      {
        id: '4',
        type: 'phaseNode',
        position: { x: 350, y: 400 },
        data: { 
          label: 'Development',
          description: 'Build the actual Nexus platform'
        },
        selected: false,
      },
      {
        id: '5',
        type: 'phaseNode',
        position: { x: 350, y: 500 },
        data: { 
          label: 'Launch',
          description: 'Launch activities and user onboarding'
        },
        selected: false,
      },
      {
        id: 'task-2-1',
        type: 'taskNode',
        position: { x: 600, y: 50 },
        data: { 
          label: 'Define Platform Goals',
          status: 'completed'
        },
        selected: false,
      },
      {
        id: 'task-2-2',
        type: 'taskNode',
        position: { x: 600, y: 100 },
        data: { 
          label: 'Set Budget',
          status: 'completed'
        },
        selected: false,
      },
      {
        id: 'task-2-3',
        type: 'taskNode',
        position: { x: 600, y: 150 },
        data: { 
          label: 'Choose Tech Stack',
          status: 'in-progress'
        },
        selected: false,
      },
      {
        id: 'task-3-1',
        type: 'taskNode',
        position: { x: 600, y: 200 },
        data: { 
          label: 'Create Landing Page',
          status: 'completed'
        },
        selected: false,
      },
      {
        id: 'task-3-2',
        type: 'taskNode',
        position: { x: 600, y: 250 },
        data: { 
          label: 'Social Media Campaign',
          status: 'in-progress'
        },
        selected: false,
      },
      {
        id: 'task-4-1',
        type: 'taskNode',
        position: { x: 600, y: 350 },
        data: { 
          label: 'Setup Development Environment',
          status: 'todo'
        },
        selected: false,
      },
      {
        id: 'task-4-2',
        type: 'taskNode',
        position: { x: 600, y: 400 },
        data: { 
          label: 'Build Core Features',
          status: 'todo'
        },
        selected: false,
      },
      {
        id: 'task-5-1',
        type: 'taskNode',
        position: { x: 600, y: 450 },
        data: { 
          label: 'Beta Testing',
          status: 'todo'
        },
        selected: false,
      },
      {
        id: 'task-5-2',
        type: 'taskNode',
        position: { x: 600, y: 500 },
        data: { 
          label: 'Public Launch',
          status: 'todo'
        },
        selected: false,
      }
    ] as CustomNode[],
    edges: [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        type: 'simplebezier',
        style: { stroke: '#64748b', strokeWidth: 2.5 },
        markerEnd: { type: 'arrowclosed', color: '#64748b' },
      },
      {
        id: 'e1-3',
        source: '1',
        target: '3',
        type: 'simplebezier',
        style: { stroke: '#64748b', strokeWidth: 2.5 },
        markerEnd: { type: 'arrowclosed', color: '#64748b' },
      },
      {
        id: 'e1-4',
        source: '1',
        target: '4',
        type: 'simplebezier',
        style: { stroke: '#64748b', strokeWidth: 2.5 },
        markerEnd: { type: 'arrowclosed', color: '#64748b' },
      },
      {
        id: 'e1-5',
        source: '1',
        target: '5',
        type: 'simplebezier',
        style: { stroke: '#64748b', strokeWidth: 2.5 },
        markerEnd: { type: 'arrowclosed', color: '#64748b' },
      },
      {
        id: 'e2-task-2-1',
        source: '2',
        target: 'task-2-1',
        type: 'simplebezier',
        style: { stroke: '#9ca3af', strokeWidth: 2 },
        markerEnd: { type: 'arrowclosed', color: '#9ca3af' },
      },
      {
        id: 'e2-task-2-2',
        source: '2',
        target: 'task-2-2',
        type: 'simplebezier',
        style: { stroke: '#9ca3af', strokeWidth: 2 },
        markerEnd: { type: 'arrowclosed', color: '#9ca3af' },
      },
      {
        id: 'e2-task-2-3',
        source: '2',
        target: 'task-2-3',
        type: 'simplebezier',
        style: { stroke: '#9ca3af', strokeWidth: 2 },
        markerEnd: { type: 'arrowclosed', color: '#9ca3af' },
      },
      {
        id: 'e3-task-3-1',
        source: '3',
        target: 'task-3-1',
        type: 'simplebezier',
        style: { stroke: '#9ca3af', strokeWidth: 2 },
        markerEnd: { type: 'arrowclosed', color: '#9ca3af' },
      },
      {
        id: 'e3-task-3-2',
        source: '3',
        target: 'task-3-2',
        type: 'simplebezier',
        style: { stroke: '#9ca3af', strokeWidth: 2 },
        markerEnd: { type: 'arrowclosed', color: '#9ca3af' },
      },
      {
        id: 'e4-task-4-1',
        source: '4',
        target: 'task-4-1',
        type: 'simplebezier',
        style: { stroke: '#9ca3af', strokeWidth: 2 },
        markerEnd: { type: 'arrowclosed', color: '#9ca3af' },
      },
      {
        id: 'e4-task-4-2',
        source: '4',
        target: 'task-4-2',
        type: 'simplebezier',
        style: { stroke: '#9ca3af', strokeWidth: 2 },
        markerEnd: { type: 'arrowclosed', color: '#9ca3af' },
      },
      {
        id: 'e5-task-5-1',
        source: '5',
        target: 'task-5-1',
        type: 'simplebezier',
        style: { stroke: '#9ca3af', strokeWidth: 2 },
        markerEnd: { type: 'arrowclosed', color: '#9ca3af' },
      },
      {
        id: 'e5-task-5-2',
        source: '5',
        target: 'task-5-2',
        type: 'simplebezier',
        style: { stroke: '#9ca3af', strokeWidth: 2 },
        markerEnd: { type: 'arrowclosed', color: '#9ca3af' },
      }
    ],
    taskDetails: {
      'task-2-1': {
        title: 'Define Platform Goals',
        description: 'Establish clear objectives for the Nexus platform including target audience, expected outcomes, and success metrics.',
        status: 'Done'
      },
      'task-2-2': {
        title: 'Set Budget',
        description: 'Determine the total budget allocation for development, marketing, and operational expenses.',
        status: 'Done'
      },
      'task-2-3': {
        title: 'Choose Tech Stack',
        description: 'Research and select appropriate technologies for building the Nexus platform.',
        status: 'In Progress'
      },
      'task-3-1': {
        title: 'Create Landing Page',
        description: 'Develop a landing page with platform information, features, and early access signup.',
        status: 'Done'
      },
      'task-3-2': {
        title: 'Social Media Campaign',
        description: 'Launch promotional campaign across Twitter, LinkedIn, and other relevant platforms.',
        status: 'In Progress'
      },
      'task-4-1': {
        title: 'Setup Development Environment',
        description: 'Configure development tools, CI/CD pipeline, and project structure.',
        status: 'To Do'
      },
      'task-4-2': {
        title: 'Build Core Features',
        description: 'Implement the main features of the Nexus project management platform.',
        status: 'To Do'
      },
      'task-5-1': {
        title: 'Beta Testing',
        description: 'Conduct beta testing with select users to gather feedback and identify issues.',
        status: 'To Do'
      },
      'task-5-2': {
        title: 'Public Launch',
        description: 'Launch the Nexus platform to the public with full marketing support.',
        status: 'To Do'
      }
    }
  },
  'proj-2': {
    nodes: [
      {
        id: '1',
        type: 'rootNode', // Changed to use custom rootNode type
        position: { x: 100, y: 300 }, // Positioned for horizontal layout
        data: { 
          label: 'Q4 Marketing Campaign'
        },
      },
      {
        id: '2',
        type: 'phaseNode',
        position: { x: 350, y: 300 },
        data: { 
          label: 'Strategy Development',
          description: 'Define campaign strategy and target audience'
        },
        selected: false,
      },
      {
        id: 'task-2-1',
        type: 'taskNode',
        position: { x: 600, y: 300 },
        data: { 
          label: 'Market Research',
          status: 'completed'
        },
        selected: false,
      }
    ] as CustomNode[],
    edges: [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        type: 'simplebezier',
        style: { stroke: '#64748b', strokeWidth: 2.5 },
        markerEnd: { type: 'arrowclosed', color: '#64748b' },
      },
      {
        id: 'e2-task-2-1',
        source: '2',
        target: 'task-2-1',
        type: 'simplebezier',
        style: { stroke: '#9ca3af', strokeWidth: 2 },
        markerEnd: { type: 'arrowclosed', color: '#9ca3af' },
      }
    ],
    taskDetails: {
      'task-2-1': {
        title: 'Market Research',
        description: 'Conduct comprehensive market analysis to identify target demographics and competitive landscape.',
        status: 'Done'
      }
    }
  },
  'proj-3': {
    nodes: [
      {
        id: '1',
        type: 'rootNode', // Changed to use custom rootNode type
        position: { x: 100, y: 300 }, // Positioned for horizontal layout
        data: { 
          label: 'My Novel Outline'
        },
      },
      {
        id: '2',
        type: 'phaseNode',
        position: { x: 350, y: 250 },
        data: { 
          label: 'Character Development',
          description: 'Create detailed character profiles and backstories'
        },
        selected: false,
      },
      {
        id: '3',
        type: 'phaseNode',
        position: { x: 350, y: 350 },
        data: { 
          label: 'Plot Structure',
          description: 'Outline the main story arc and key plot points'
        },
        selected: false,
      },
      {
        id: 'task-2-1',
        type: 'taskNode',
        position: { x: 600, y: 250 },
        data: { 
          label: 'Protagonist Profile',
          status: 'completed'
        },
        selected: false,
      },
      {
        id: 'task-3-1',
        type: 'taskNode',
        position: { x: 600, y: 350 },
        data: { 
          label: 'Three-Act Structure',
          status: 'in-progress'
        },
        selected: false,
      }
    ] as CustomNode[],
    edges: [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        type: 'simplebezier',
        style: { stroke: '#64748b', strokeWidth: 2.5 },
        markerEnd: { type: 'arrowclosed', color: '#64748b' },
      },
      {
        id: 'e1-3',
        source: '1',
        target: '3',
        type: 'simplebezier',
        style: { stroke: '#64748b', strokeWidth: 2.5 },
        markerEnd: { type: 'arrowclosed', color: '#64748b' },
      },
      {
        id: 'e2-task-2-1',
        source: '2',
        target: 'task-2-1',
        type: 'simplebezier',
        style: { stroke: '#9ca3af', strokeWidth: 2 },
        markerEnd: { type: 'arrowclosed', color: '#9ca3af' },
      },
      {
        id: 'e3-task-3-1',
        source: '3',
        target: 'task-3-1',
        type: 'simplebezier',
        style: { stroke: '#9ca3af', strokeWidth: 2 },
        markerEnd: { type: 'arrowclosed', color: '#9ca3af' },
      }
    ],
    taskDetails: {
      'task-2-1': {
        title: 'Protagonist Profile',
        description: 'Develop a comprehensive character profile for the main protagonist including background, motivations, and character arc.',
        status: 'Done'
      },
      'task-3-1': {
        title: 'Three-Act Structure',
        description: 'Outline the story using the classic three-act structure with clear beginning, middle, and end.',
        status: 'In Progress'
      }
    }
  }
};

// Helper function to get project by ID
export const getProjectById = (projectId: string): Project | undefined => {
  return MOCK_PROJECTS.find(project => project.id === projectId);
};

// Helper function to get project data by ID
export const getProjectDataById = (projectId: string): ProjectData => {
  return MOCK_PROJECT_DATA[projectId] || {
    nodes: [
      {
        id: '1',
        type: 'rootNode', // Use custom rootNode type for new projects too
        position: { x: 100, y: 300 }, // Default horizontal layout position
        data: { 
          label: 'New Project'
        },
      }
    ] as CustomNode[],
    edges: [],
    taskDetails: {}
  };
};

// Helper function to update project data (for future database integration)
export const updateProjectData = (projectId: string, data: ProjectData): Promise<ProjectData> => {
  // In a real application, this would make an API call to update the database
  // For now, we'll just update the mock data in memory
  MOCK_PROJECT_DATA[projectId] = data;
  return Promise.resolve(data);
};

// Helper function to create new project (for future database integration)
export const createProject = (projectData: Partial<Project>): Promise<Project> => {
  // In a real application, this would make an API call to create a new project
  // For now, we'll just add it to the mock data
  const newProject: Project = {
    id: `proj-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    name: '',
    description: '',
    lastModified: 'Just now',
    status: 'Planning',
    phases: 0,
    tasks: 0,
    completedTasks: 0,
    color: 'from-blue-500 to-blue-600',
    ...projectData
  };
  
  MOCK_PROJECTS.push(newProject);
  return Promise.resolve(newProject);
};