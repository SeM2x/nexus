import type { Project, CustomNode } from '@/types';
import type { Edge } from '@xyflow/react';

// Type guard to check if an object has the required Project structure
function isValidProject(data: unknown): data is Project {
  if (!data || typeof data !== 'object') return false;

  const obj = data as Record<string, unknown>;

  // Check required fields
  if (typeof obj.id !== 'string') return false;
  if (typeof obj.name !== 'string') return false;
  if (typeof obj.description !== 'string') return false;
  if (typeof obj.color !== 'string') return false;
  if (!Array.isArray(obj.nodes)) return false;
  if (!Array.isArray(obj.edges)) return false;

  return true;
}

// Type guard to check if a node has valid CustomNode structure
function isValidNode(node: unknown): node is CustomNode {
  if (!node || typeof node !== 'object') return false;

  const obj = node as Record<string, unknown>;

  // Check required fields
  if (typeof obj.id !== 'string') return false;
  if (typeof obj.type !== 'string') return false;
  if (!obj.position || typeof obj.position !== 'object') return false;
  if (!obj.data || typeof obj.data !== 'object') return false;

  const position = obj.position as Record<string, unknown>;
  if (typeof position.x !== 'number' || typeof position.y !== 'number')
    return false;

  const data = obj.data as Record<string, unknown>;
  if (typeof data.label !== 'string') return false;

  // Validate node type specific data
  if (obj.type === 'taskNode') {
    if (typeof data.status !== 'string') return false;
    if (typeof data.description !== 'string') return false;
  } else if (obj.type === 'phaseNode') {
    // Optional fields for phase nodes
    if (data.description !== undefined && typeof data.description !== 'string')
      return false;
    if (data.isExpanded !== undefined && typeof data.isExpanded !== 'boolean')
      return false;
  }

  return true;
}

// Type guard to check if an edge has valid Edge structure
function isValidEdge(edge: unknown): edge is Edge {
  if (!edge || typeof edge !== 'object') return false;

  const obj = edge as Record<string, unknown>;

  // Check required fields
  if (typeof obj.id !== 'string') return false;
  if (typeof obj.source !== 'string') return false;
  if (typeof obj.target !== 'string') return false;

  return true;
}

const importProject = async (projectData: unknown): Promise<Project> => {
  // Validate that projectData is an object
  if (!projectData || typeof projectData !== 'object') {
    throw new Error('Invalid project data: must be an object');
  }

  const data = projectData as Record<string, unknown>;

  // Basic project structure validation
  if (!isValidProject(data)) {
    throw new Error(
      'Invalid project structure: missing required fields (id, name, description, color, nodes, edges)'
    );
  }

  // Validate nodes array
  const nodes = data.nodes as unknown[];
  const validNodes: CustomNode[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (!isValidNode(node)) {
      throw new Error(
        `Invalid node at index ${i}: missing required fields or invalid structure`
      );
    }
    validNodes.push(node);
  }

  // Validate edges array
  const edges = data.edges as unknown[];
  const validEdges: Edge[] = [];

  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    if (!isValidEdge(edge)) {
      throw new Error(`Invalid edge at index ${i}: missing required fields`);
    }
    validEdges.push(edge);
  }

  // Validate node references in edges
  const nodeIds = new Set(validNodes.map((node) => node.id));
  for (const edge of validEdges) {
    if (!nodeIds.has(edge.source)) {
      throw new Error(
        `Edge references non-existent source node: ${edge.source}`
      );
    }
    if (!nodeIds.has(edge.target)) {
      throw new Error(
        `Edge references non-existent target node: ${edge.target}`
      );
    }
  }

  // Ensure there's at least one root node
  const rootNodes = validNodes.filter((node) => node.type === 'rootNode');
  if (rootNodes.length === 0) {
    throw new Error('Project must contain at least one root node');
  }

  // Create the validated project
  const project: Project = {
    id: data.id as string,
    name: data.name as string,
    description: data.description as string,
    color: data.color as string,
    nodes: validNodes,
    edges: validEdges,
  };

  await new Promise((res) => setTimeout(res, 700));
  return project;
};

export default importProject;
