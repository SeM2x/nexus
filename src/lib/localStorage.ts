import type { CustomNode, Project } from '@/types';
import type { Edge } from '@xyflow/react';

const StorageKeys = {
  Guest: 'guest-project',
  Local: 'local-project',
};

export function createLocalProject(
  projectData: Partial<Project>,
  { isGuest, reload = true }: { isGuest: boolean; reload?: boolean }
) {
  const project: Project = {
    id: projectData.id ?? crypto.randomUUID(),
    name: projectData.name ?? 'Untitled Project',
    description: projectData.description ?? '',
    color: projectData.color ?? '',
    nodes: projectData.nodes ?? [],
    edges: projectData.edges ?? [],
    status: projectData.status ?? 'planning',
    completedTasks: projectData.completedTasks ?? 0,
    phases: projectData.phases ?? 0,
    tasks: projectData.tasks ?? 0,
    createdAt: projectData.createdAt ?? new Date().toISOString(),
    updatedAt: projectData.updatedAt ?? new Date().toISOString(),
  };
  if (project.nodes.length === 0) {
    project.nodes.push({
      id: `root-${project.id}-${crypto.randomUUID()}`,
      position: { x: 0, y: 0 },
      data: { label: project.name },
      type: 'rootNode',
    });
  }
  localStorage.setItem(
    isGuest ? StorageKeys.Guest : StorageKeys.Local,
    JSON.stringify(project)
  );
  if (reload) {
    setTimeout(() => {
      window.location.reload();
    }, 0);
  }
  return project;
}

export function getLocalProject({ isGuest }: { isGuest: boolean }) {
  const jsonString = localStorage.getItem(
    isGuest ? StorageKeys.Guest : StorageKeys.Local
  );
  const project: Project = jsonString ? JSON.parse(jsonString) : null;

  return project;
}

export function saveLocalProject(
  {
    nodes,
    edges,
  }: {
    nodes: CustomNode[];
    edges: Edge[];
  },
  { isGuest }: { isGuest: boolean }
) {
  const project = getLocalProject({ isGuest });
  project.nodes = nodes;
  project.edges = edges;
  localStorage.setItem(
    isGuest ? StorageKeys.Guest : StorageKeys.Local,
    JSON.stringify(project)
  );
}

export function deleteLocalProject({ isGuest = false }: { isGuest: boolean }) {
  localStorage.removeItem(isGuest ? StorageKeys.Guest : StorageKeys.Local);
  setTimeout(() => {
    window.location.reload();
  }, 0);
}
