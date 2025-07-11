import {
  convertDatabaseProject,
  getProject,
  getProjectData,
} from '@/lib/database';
import { createLocalProject, getLocalProject } from '@/lib/localStorage';
import type { Project } from '@/types';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const useProject = ({ isGuest }: { isGuest: boolean }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const projectId = params.projectId || '';

  const fetchProject = async () => {
    setLoading(true);
    setError(null);
    try {
      const dbProject = await getProject(projectId);
      if (!dbProject) {
        throw new Error('Project not found');
      }

      // Fetch project data (nodes and edges)
      const dbProjectData = await getProjectData(projectId);
      if (!dbProjectData) {
        throw new Error('Project data not found');
      }

      // Convert database project to Project type

      const phases = dbProjectData.nodes.filter(
        (node) => node.type === 'phaseNode'
      ).length;

      const tasks = dbProjectData.nodes.filter(
        (node) => node.type === 'taskNode'
      ).length;

      const completedTasks = dbProjectData.nodes.filter(
        (node) => node.type === 'taskNode' && node.data.status === 'completed'
      ).length;

      const project: Project = {
        ...convertDatabaseProject(dbProject),
        nodes: dbProjectData.nodes,
        edges: dbProjectData.edges,
        status: 'planning', // We'll calculate this based on tasks later
        phases,
        tasks,
        completedTasks,
        // collaborators: dbProject.collaborators || [],
        // isGuest: dbProject.is_guest || false,
        // isPublic: dbProject.is_public || false,
        // isArchived: dbProject.is_archived || false,
        // isTemplate: dbProject.is_template || false,
        // templateId: dbProject.template_id || null,
      };
      if (!getLocalProject({ isGuest: false }))
        createLocalProject(project, { isGuest: false });
      setProject(project);
    } catch (err) {
      console.error('Error fetching project:', err);
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isGuest) {
      // For guest users, load the project from local storage
      const guestProject = getLocalProject({ isGuest });
      if (guestProject) {
        setProject(guestProject);
        setLoading(false);
      } else {
        setError('No guest project found');
        setLoading(false);
      }
    } else {
      // For registered users, fetch the project from the database
      fetchProject();
    }
  }, [isGuest, projectId]);

  //if (!project) throw new Error('Project not found');
  return { refetch: fetchProject, project, loading, error };
};

export default useProject;
