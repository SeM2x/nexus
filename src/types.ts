import type { Edge, Node } from '@xyflow/react';

export type NodeStatus = 'todo' | 'in-progress' | 'blocked' | 'completed';

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  nodes: CustomNode[];
  edges: Edge[];
  status: 'planning' | 'in-progress' | 'completed';
  phases: number;
  tasks: number;
  completedTasks: number;
  createdAt: string;
  updatedAt: string;
}

export interface RootNodeData {
  label: string;
  [key: string]: unknown;
}
export interface PhaseNodeData {
  label: string;
  description?: string;
  isExpanded?: boolean; // Add expand/collapse state for phase nodes
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface TaskNodeData {
  label: string;
  status: NodeStatus;
  description: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface StatusConfig {
  borderColor: string;
  bgColor: string;
  iconColor: string;
  icon: React.ComponentType<{ className?: string }>;
  hoverBorder: string;
  hoverBg: string;
  ringColor: string;
  dotColor: string;
  textColor: string;
}

// Status option for inspector panel
export interface StatusOption {
  value: NodeStatus;
  label: string;
  color: string;
  hoverColor: string;
  icon: React.ComponentType<{ className?: string }>;
  dotColor: string;
  description: string;
}

// Task details
export interface TaskDetailsEntry {
  title: string;
  description: string;
  status: NodeStatus;
}

export interface TaskDetails {
  [taskId: string]: TaskDetailsEntry;
}

// Layout configuration
export interface LayoutConfig {
  rankdir?: string;
  align?: string;
  nodesep?: number;
  ranksep?: number;
  marginx?: number;
  marginy?: number;
}

// Node dimensions
export interface NodeDimensions {
  width: number;
  height: number;
}

// Form data types - Updated to include AI prompt
export interface ProjectFormData {
  name: string;
  description: string;
  color: string;
  aiPrompt?: string; // Add optional AI prompt field
}

// Color option for project creation
export interface ColorOption {
  value: string;
  label: string;
  preview: string;
}

interface AIPhase {
  name: string;
  tasks: string[];
}

export interface AIProjectPlan {
  phases: AIPhase[];
}

export type RootNode = Node<RootNodeData>;
export type PhaseNode = Node<PhaseNodeData>;
export type TaskNode = Node<TaskNodeData>;
export type CustomNode = RootNode | PhaseNode | TaskNode;
