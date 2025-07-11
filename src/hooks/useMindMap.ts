import type { CustomNode, Project, TaskDetailsEntry } from '@/types';
import type {
  Connection,
  Edge,
  NodeTypes,
  OnEdgesChange,
  OnNodesChange,
} from '@xyflow/react';
import { createContext, useContext } from 'react';

interface MindMapContextType {
  nodes: CustomNode[];
  setNodes: React.Dispatch<React.SetStateAction<CustomNode[]>>;
  onNodesChange: OnNodesChange<CustomNode>;
  edges: Edge[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onEdgesChange: OnEdgesChange<Edge>;
  onConnect: (params: Connection) => void;
  nodeTypes: NodeTypes;
  addPhase: (phaseName?: string) => CustomNode | undefined;
  addTask: (phaseId: string, taskName?: string) => CustomNode | undefined;
  handleUpdatePhase: (
    phaseId: string,
    updates: {
      title?: string;
      description?: string;
    }
  ) => void;
  handleUpdateTask: (
    taskId: string,
    updates: Partial<TaskDetailsEntry>
  ) => void;
  isGuest: boolean;
  project: Project | null;
  projectLoading: boolean;
  error: string | null;
  generateProjectPlan: (prompt: string) => Promise<void>;
}

export const MindMapContext = createContext<MindMapContextType | undefined>(
  undefined
);

export const useMindMap = () => {
  const context = useContext(MindMapContext);
  if (context === undefined) {
    throw new Error('useMindMap must be used within an MindMApProvider');
  }
  return context;
};
