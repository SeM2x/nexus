import { Node, Edge } from 'reactflow';

// Task status types
export type TaskStatus = 'To Do' | 'In Progress' | 'Blocked' | 'Done';
export type NodeStatus = 'todo' | 'in-progress' | 'blocked' | 'completed';

// Project types
export interface Project {
  id: string;
  name: string;
  description: string;
  lastModified: string;
  status: 'Planning' | 'In Progress' | 'Completed';
  phases: number;
  tasks: number;
  completedTasks: number;
  color: string;
  createdAt: string;
  updatedAt: string;
}

// Task details
export interface TaskDetailsEntry {
  title: string;
  description: string;
  status: TaskStatus;
}

export interface TaskDetails {
  [taskId: string]: TaskDetailsEntry;
}

// Node data types
export interface RootNodeData {
  label: string;
}

export interface PhaseNodeData {
  label: string;
  description?: string;
  isExpanded?: boolean; // Add expand/collapse state for phase nodes
}

export interface TaskNodeData {
  label: string;
  status: NodeStatus;
}

export type NodeData = RootNodeData | PhaseNodeData | TaskNodeData;

// Custom node types
export type CustomNode = Node<RootNodeData> | Node<PhaseNodeData> | Node<TaskNodeData>;

// Project data structure
export interface ProjectData {
  nodes: CustomNode[];
  edges: Edge[];
  taskDetails: TaskDetails;
}

// Context menu types
export interface ContextMenuState {
  isVisible: boolean;
  position: { x: number; y: number };
  nodeId: string | null;
  nodeType: 'phase' | 'task' | null;
}

// Form data types - Updated to include AI prompt
export interface ProjectFormData {
  name: string;
  description: string;
  color: string;
  aiPrompt?: string; // Add optional AI prompt field
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

// Edit position for inline editing
export interface EditPosition {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

// Status configuration for task nodes
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

// Color option for project creation
export interface ColorOption {
  value: string;
  label: string;
  preview: string;
}

// Menu item for context menu
export interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  color: string;
  bgColor: string;
}

// Status option for inspector panel
export interface StatusOption {
  value: TaskStatus;
  label: string;
  color: string;
  hoverColor: string;
  icon: React.ComponentType<{ className?: string }>;
  dotColor: string;
  description: string;
}