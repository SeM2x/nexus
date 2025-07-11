import { supabase } from '@/lib/supabase';
import type { AIProjectPlan, CustomNode } from '@/types';
import type { Edge } from '@xyflow/react';
import { addNode } from './mindmap/addNode';

const generateProject = async ({
  prompt,
  nodes,
  edges,
}: {
  prompt: string;
  nodes: CustomNode[];
  edges: Edge[];
}) => {
  const { data, error } = await supabase.functions.invoke<AIProjectPlan>(
    'generate-plan',
    {
      body: {
        projectDescription: prompt.trim(),
      },
    }
  );

  if (error) {
    console.error('Error calling generate-plan function:', error);
    return;
  }

  if (!data || !data.phases) {
    console.error('Invalid response from generate-plan function:', data);
    return;
  }

  console.log('✅ AI generation successful:', data);

  // Create temporary arrays to hold the new items
  const newNodes: CustomNode[] = nodes;
  const newEdges: Edge[] = edges;

  data.phases.forEach((phase) => {
    const phaseResult = addNode({ nodes: newNodes, label: phase.name });
    if (phaseResult) {
      newNodes.push(phaseResult.newNode);
      newEdges.push(phaseResult.newEdge);
      phase.tasks.forEach((task) => {
        const taskResult = addNode({
          nodes: newNodes,
          label: task,
          phaseId: phaseResult.newNode.id,
        });

        if (taskResult) {
          newNodes.push(taskResult.newNode);
          newEdges.push(taskResult.newEdge);
        }
      });
    }
  });

  return { newNodes, newEdges };
};

export default generateProject;
