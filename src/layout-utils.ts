import dagre from 'dagre';
import { Node, Edge } from 'reactflow';
import { CustomNode, LayoutConfig, NodeDimensions } from './types';

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
  // Create a new directed graph
  const dagreGraph = new dagre.graphlib.Graph();
  
  // Set graph configuration for horizontal layout
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    ...LAYOUT_CONFIG,
    ...options
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
      height: dimensions.height
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
        height: nodeWithPosition.height
      }
    };
  });

  return layoutedNodes;
};

/**
 * Apply hierarchical layout specifically for mind maps with centered parent nodes
 * This creates a more structured layout with the root node at the center
 * @param {Array} nodes - Array of React Flow nodes
 * @param {Array} edges - Array of React Flow edges
 * @returns {Array} Array of nodes with updated positions
 */
export const getMindMapLayout = (nodes: CustomNode[], edges: Edge[]): CustomNode[] => {
  // Find the root node by type instead of hardcoded ID
  const rootNode = nodes.find(node => node.type === 'rootNode');
  
  if (!rootNode) {
    // Fallback to regular layout if no root node found
    return getLayoutedElements(nodes, edges);
  }

  // Separate nodes by type for better organization
  const phaseNodes = nodes.filter(node => node.type === 'phaseNode');
  const taskNodes = nodes.filter(node => node.type === 'taskNode');
  
  // Use a custom layout approach for better parent-child centering
  const mindMapConfig: LayoutConfig = {
    rankdir: 'LR',   // Left to Right layout
    align: 'UL',     // Align to upper left
    nodesep: 0,      // Very tight horizontal spacing between nodes (especially tasks)
    ranksep: 300,    // Moderate vertical spacing between ranks (root -> phases -> tasks)
    marginx: 80,     // Smaller horizontal margins
    marginy: 60      // Smaller vertical margins
  };

  // First, get the basic layout from Dagre
  const basicLayout = getLayoutedElements(nodes, edges, mindMapConfig);
  
  // Now apply custom centering logic for parent-child relationships
  return centerParentNodes(basicLayout, edges);
};

/**
 * Center parent nodes with their children
 * @param {Array} nodes - Array of layouted nodes
 * @param {Array} edges - Array of edges
 * @returns {Array} Array of nodes with centered positions
 */
const centerParentNodes = (nodes: CustomNode[], edges: Edge[]): CustomNode[] => {
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

/**
 * Apply layout and center the view on the main node
 * @param {Array} nodes - Array of React Flow nodes
 * @param {Array} edges - Array of React Flow edges
 * @param {Function} fitView - React Flow fitView function
 * @returns {Array} Array of nodes with updated positions
 */
export const applyLayoutAndCenter = (
  nodes: CustomNode[], 
  edges: Edge[], 
  fitView: (options?: any) => void
): CustomNode[] => {
  const layoutedNodes = getMindMapLayout(nodes, edges);
  
  // Center the view after a short delay to ensure nodes are rendered
  setTimeout(() => {
    if (fitView) {
      fitView({ 
        padding: 0.2,           // 20% padding around the content
        includeHiddenNodes: false,
        duration: 800           // Smooth animation
      });
    }
  }, 100);
  
  return layoutedNodes;
};

/**
 * Calculate layout for a specific branch (phase and its tasks) with centering
 * Useful when adding new tasks to maintain local organization
 * @param {Array} nodes - All nodes
 * @param {Array} edges - All edges  
 * @param {string} phaseId - ID of the phase to layout
 * @returns {Array} Updated nodes array
 */
export const layoutPhaseBranch = (
  nodes: CustomNode[], 
  edges: Edge[], 
  phaseId: string
): CustomNode[] => {
  // Find the phase node and its connected tasks
  const phaseNode = nodes.find(node => node.id === phaseId);
  const taskNodes = nodes.filter(node => 
    node.id.startsWith(`task-${phaseId}-`)
  );
  
  if (!phaseNode || taskNodes.length === 0) {
    return nodes;
  }

  // Create a mini-layout for just this branch
  const branchNodes = [phaseNode, ...taskNodes];
  const branchEdges = edges.filter(edge => 
    edge.source === phaseId || edge.target === phaseId ||
    (edge.source.startsWith(`task-${phaseId}-`) || edge.target.startsWith(`task-${phaseId}-`))
  );

  // Apply layout to the branch with very tight spacing for tasks
  const branchConfig: LayoutConfig = {
    rankdir: 'LR',
    align: 'UL',
    nodesep: 15,     // Very tight spacing for tasks within a phase
    ranksep: 80      // Moderate spacing between phase and tasks
  };

  const layoutedBranch = getLayoutedElements(branchNodes, branchEdges, branchConfig);
  
  // Apply centering to this branch
  const centeredBranch = centerParentNodes(layoutedBranch, branchEdges);

  // Merge back with the original nodes
  return nodes.map(node => {
    const layoutedNode = centeredBranch.find(ln => ln.id === node.id);
    return layoutedNode || node;
  });
};

export default {
  getLayoutedElements,
  getMindMapLayout,
  applyLayoutAndCenter,
  layoutPhaseBranch
};