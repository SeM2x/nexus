import { useState, useEffect } from 'react';
import { Project } from '../types';
import { 
  getGuestProjects, 
  createGuestProject, 
  deleteGuestProject 
} from '../lib/guestStorage';

export const useGuestProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const guestProjects = getGuestProjects();
      setProjects(guestProjects);
    } catch (err) {
      console.error('Error fetching guest projects:', err);
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
      const newProject = createGuestProject(projectData);
      
      // Add to local state
      setProjects(prev => [newProject, ...prev]);
      
      return newProject;
    } catch (err) {
      console.error('Error creating guest project:', err);
      throw new Error('Failed to create project');
    }
  };

  const deleteProject = async (projectId: string): Promise<void> => {
    try {
      deleteGuestProject(projectId);
      
      // Remove from local state
      setProjects(prev => prev.filter(project => project.id !== projectId));
    } catch (err) {
      console.error('Error deleting guest project:', err);
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