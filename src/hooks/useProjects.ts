import { useState, useEffect } from 'react';
import { Project } from '../types';
import { 
  getProjects, 
  createProject as dbCreateProject, 
  deleteProject as dbDeleteProject,
  convertDatabaseProject,
  getProjectNodes,
  getProjectTaskDetails
} from '../lib/database';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const dbProjects = await getProjects();
      
      // Convert database projects and calculate stats
      const projectsWithStats = await Promise.all(
        dbProjects.map(async (dbProject) => {
          const project = convertDatabaseProject(dbProject);
          
          try {
            // Get nodes and task details to calculate stats
            const [nodes, taskDetails] = await Promise.all([
              getProjectNodes(dbProject.id),
              getProjectTaskDetails(dbProject.id)
            ]);
            
            // Calculate phases (non-task nodes, excluding root)
            const phases = nodes.filter(node => 
              node.type === 'phaseNode' || 
              (node.type !== 'taskNode' && node.id !== '1')
            ).length;
            
            // Calculate tasks
            const taskNodes = nodes.filter(node => node.type === 'taskNode');
            const tasks = taskNodes.length;
            
            // Calculate completed tasks
            const completedTasks = taskDetails.filter(detail => 
              detail.status === 'Done'
            ).length;
            
            // Determine project status
            let status: Project['status'] = 'Planning';
            if (tasks > 0) {
              if (completedTasks === tasks) {
                status = 'Completed';
              } else if (completedTasks > 0) {
                status = 'In Progress';
              } else {
                status = 'In Progress';
              }
            }
            
            return {
              ...project,
              phases,
              tasks,
              completedTasks,
              status
            };
          } catch (statsError) {
            console.error('Error calculating project stats:', statsError);
            return project;
          }
        })
      );
      
      setProjects(projectsWithStats);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: {
    name: string;
    description?: string;
    color?: string;
  }): Promise<Project> => {
    try {
      const dbProject = await dbCreateProject(projectData);
      const newProject = convertDatabaseProject(dbProject);
      
      // Add to local state
      setProjects(prev => [newProject, ...prev]);
      
      return newProject;
    } catch (err) {
      console.error('Error creating project:', err);
      throw new Error('Failed to create project');
    }
  };

  const deleteProject = async (projectId: string): Promise<void> => {
    try {
      await dbDeleteProject(projectId);
      
      // Remove from local state
      setProjects(prev => prev.filter(project => project.id !== projectId));
    } catch (err) {
      console.error('Error deleting project:', err);
      throw new Error('Failed to delete project');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    createProject,
    deleteProject,
    refetch: fetchProjects
  };
};