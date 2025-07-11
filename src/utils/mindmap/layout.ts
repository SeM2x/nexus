import dagre from '@dagrejs/dagre';
import type { CustomNode, LayoutConfig, NodeDimensions } from '@/types';
import type { Edge } from '@xyflow/react';

// Create a new directed graph
const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

// Node dimensions for different node types
const NODE_DIMENSIONS: Record<string, NodeDimensions> = {
  default: { width: 200, height: 80 },    // Main project node
  phaseNode: { width: 180, height: 70 },  // Phase nodes
  taskNode: { width: 140, height: 60 }    // Task nodes
};

// Layout configuration for horizontal layout
const LAYOUT_CONFIG: LayoutConfig = {
    rankdir: 'LR',
    align: 'UL',
    nodesep: 30,     // Reduced horizontal spacing between nodes
    ranksep: 180,    // Vertical spacing between ranks
    marginx: 120,    // Larger horizontal margins
    marginy: 80      // Vertical margins
};
/**
 * Calculate optimal layout positions for nodes using Dagre
 * @param {Array} nodes - Array of React Flow nodes
 * @param {Array} edges - Array of React Flow edges
 * @param {Object} options - Additional layout options (optional)
 * @returns {Array} Array of nodes with updated positions
 */
export const getLayoutedElements = (
  nodes: CustomNode[],
  edges: Edge[],
  options: LayoutConfig = {}
): CustomNode[] => {
  dagreGraph.setGraph({
    ...LAYOUT_CONFIG,
    ...options,
  });

  // Add nodes to the graph with their dimensions
  nodes.forEach((node) => {
    // Determine node dimensions based on type
    let dimensions = NODE_DIMENSIONS.default;

    if (node.type === 'phaseNode') {
      dimensions = NODE_DIMENSIONS.phaseNode;
    } else if (node.type === 'taskNode') {
      dimensions = NODE_DIMENSIONS.taskNode;
    }

    // Add node to Dagre graph
    dagreGraph.setNode(node.id, {
      width: dimensions.width,
      height: dimensions.height,
    });
  });

  // Add edges to the graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Run the layout algorithm
  dagre.layout(dagreGraph);

  // Update node positions with calculated layout
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    return {
      ...node,
      position: {
        // Dagre gives us the center position, but React Flow expects top-left
        // So we need to adjust by half the width/height
        x: nodeWithPosition.x - nodeWithPosition.width / 2,
        y: nodeWithPosition.y - nodeWithPosition.height / 2,
      },
      // Store the calculated dimensions for reference
      data: {
        ...node.data,
        width: nodeWithPosition.width,
        height: nodeWithPosition.height,
      },
    };
  });

  return layoutedNodes;
};

/**
 * Center parent nodes with their children
 * @param {Array} nodes - Array of layouted nodes
 * @param {Array} edges - Array of edges
 * @returns {Array} Array of nodes with centered positions
 */
export const centerParentNodes = (nodes: CustomNode[], edges: Edge[]): CustomNode[] => {
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const adjustedNodes = [...nodes];

  // Group children by their parent
  const parentChildMap = new Map<string, string[]>();
  
  edges.forEach(edge => {
    if (!parentChildMap.has(edge.source)) {
      parentChildMap.set(edge.source, []);
    }
    parentChildMap.get(edge.source)!.push(edge.target);
  });

  // For each parent, center it with its children
  parentChildMap.forEach((childIds, parentId) => {
    const parent = nodeMap.get(parentId);
    const children = childIds.map(id => nodeMap.get(id)).filter(Boolean) as CustomNode[];
    
    if (!parent || children.length === 0) return;

    // Calculate the vertical center of all children
    const childYPositions = children.map(child => child.position.y);
    const minY = Math.min(...childYPositions);
    const maxY = Math.max(...childYPositions);
    const centerY = (minY + maxY) / 2;

    // Update parent's Y position to be centered with children
    const parentIndex = adjustedNodes.findIndex(node => node.id === parentId);
    if (parentIndex !== -1) {
      adjustedNodes[parentIndex] = {
        ...adjustedNodes[parentIndex],
        position: {
          ...adjustedNodes[parentIndex].position,
          y: centerY - (NODE_DIMENSIONS[parent.type === 'phaseNode' ? 'phaseNode' : 'default'].height / 2)
        }
      };
    }
  });

  return adjustedNodes;
};