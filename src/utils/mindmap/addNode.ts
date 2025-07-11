import type { CustomNode } from '@/types';
import { MarkerType, type Edge } from '@xyflow/react';

export const addNode = ({
  nodes,
  label,
  phaseId,
}: {
  nodes: CustomNode[];
  label: string;
  phaseId?: string;
}) => {
  // Calculate position for new phase (don't auto-layout, just place it reasonably)
  const newNodeId = phaseId
    ? `task-${phaseId}-${crypto.randomUUID()}`
    : crypto.randomUUID();

  let sourceNode;
  let yOffset;

  if (phaseId) {
    const phaseNode = nodes.find((node) => node.id === phaseId);
    if (!phaseNode) {
      console.error('No phase node found');
      return;
    }
    sourceNode = phaseNode;
    const existingTasks = nodes.filter((node) =>
      node.id.startsWith(`task-${phaseId}-`)
    );
    yOffset = sourceNode.position.y + existingTasks.length * 60;
  } else {
    const rootNode = nodes.find((node) => node.type === 'rootNode');
    if (!rootNode) {
      console.error('No root node found');
      return;
    }
    sourceNode = rootNode;
    const existingPhases = nodes.filter((node) => node.type === 'phaseNode');
    console.log('Existing nodes:', nodes);

    yOffset = 100 + existingPhases.length * 120;
  }

  const xOffset = phaseId ? sourceNode.position.x + 250 : 400;

  const defaultStatus = 'todo';

  const newNode = {
    id: newNodeId,
    type: phaseId ? 'taskNode' : 'phaseNode',
    position: { x: xOffset, y: yOffset }, // Place it manually without auto-layout
    data: {
      label: label,
      description: '',
      isExpanded: false, // Initialize with collapsed state
      createdAt: Date.now().toString(),
      updatedAt: Date.now().toString(),
      status: defaultStatus,
    },
    selected: false,
    //parentId: rootNode.id,
  };

  // Add edge connecting to the root node
  const newEdge: Edge = {
    id: crypto.randomUUID(),
    source: sourceNode.id,
    target: newNodeId,
    type: 'simplebezier',
    style: {
      stroke: '#64748b',
      strokeWidth: 2.5,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#64748b',
    },
  };

  return { newNode, newEdge };
};
