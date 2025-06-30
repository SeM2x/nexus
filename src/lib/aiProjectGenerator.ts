import { supabase } from './supabase';
import { CustomNode, Edge, TaskDetails } from '../types';

interface AIPhase {
  name: string;
  tasks: string[];
}

interface AIProjectPlan {
  phases: AIPhase[];
}

/**
 * Process AI-generated project plan and save to database
 * @param projectPlan - The AI-generated project plan JSON
 * @param projectId - The current project ID
 * @param rootNodeId - The ID of the root node to connect phases to
 * @returns Promise<{ nodes: CustomNode[], edges: Edge[], taskDetails: TaskDetails }>
 */
export const processAndSaveAIProjectPlan = async (
  projectPlan: AIProjectPlan,
  projectId: string,
  rootNodeId: string
): Promise<{ nodes: CustomNode[], edges: Edge[], taskDetails: TaskDetails }> => {
  try {
    console.log('Processing AI project plan:', projectPlan);

    const nodes: CustomNode[] = [];
    const edges: Edge[] = [];
    const taskDetails: TaskDetails = {};

    // Process each phase from the AI response
    projectPlan.phases.forEach((phase, phaseIndex) => {
      // Generate unique phase ID
      const phaseId = crypto.randomUUID();
      
      // Calculate position for phase node (vertical layout from root)
      const phasePosition = {
        x: 400, // Fixed horizontal position for phases
        y: 100 + (phaseIndex * 150) // Vertical spacing between phases
      };

      // Create phase node with isExpanded: false by default
      const phaseNode: CustomNode = {
        id: phaseId,
        type: 'phaseNode',
        position: phasePosition,
        data: {
          label: phase.name,
          description: `AI-generated phase with ${phase.tasks.length} tasks`,
          isExpanded: false // Initialize AI-generated phases as collapsed
        },
        selected: false
      };

      nodes.push(phaseNode);

      // Create edge from root to phase
      const rootToPhaseEdge: Edge = {
        id: crypto.randomUUID(),
        source: rootNodeId,
        target: phaseId,
        type: 'simplebezier',
        style: {
          stroke: '#64748b',
          strokeWidth: 2.5
        },
        markerEnd: {
          type: 'arrowclosed',
          color: '#64748b'
        }
      };

      edges.push(rootToPhaseEdge);

      // Process tasks for this phase
      phase.tasks.forEach((taskName, taskIndex) => {
        // Generate unique task ID with phase prefix for easy identification
        const taskId = `task-${phaseId}-${crypto.randomUUID()}`;
        
        // Calculate position for task node (to the right of phase)
        const taskPosition = {
          x: 650, // Fixed horizontal position for tasks
          y: phasePosition.y - 50 + (taskIndex * 40) // Spread tasks vertically around phase
        };

        // Create task node
        const taskNode: CustomNode = {
          id: taskId,
          type: 'taskNode',
          position: taskPosition,
          data: {
            label: taskName,
            status: 'todo' // Default status for AI-generated tasks
          },
          selected: false
        };

        nodes.push(taskNode);

        // Create edge from phase to task
        const phaseToTaskEdge: Edge = {
          id: crypto.randomUUID(),
          source: phaseId,
          target: taskId,
          type: 'simplebezier',
          style: {
            stroke: '#9ca3af',
            strokeWidth: 2
          },
          markerEnd: {
            type: 'arrowclosed',
            color: '#9ca3af'
          }
        };

        edges.push(phaseToTaskEdge);

        // Create task details entry
        taskDetails[taskId] = {
          title: taskName,
          description: `AI-generated task for ${phase.name} phase`,
          status: 'To Do'
        };
      });
    });

    console.log(`Generated ${nodes.length} nodes and ${edges.length} edges`);

    // Bulk insert nodes into database
    if (nodes.length > 0) {
      const nodesToInsert = nodes.map(node => ({
        id: node.id,
        project_id: projectId,
        data: node.data,
        position: node.position,
        type: node.type || 'default'
      }));

      const { error: nodesError } = await supabase
        .from('nodes')
        .insert(nodesToInsert);

      if (nodesError) {
        console.error('Error inserting nodes:', nodesError);
        throw new Error('Failed to save project phases to database');
      }

      console.log(`Successfully inserted ${nodes.length} nodes`);
    }

    // Bulk insert edges into database
    if (edges.length > 0) {
      const edgesToInsert = edges.map(edge => ({
        id: edge.id,
        project_id: projectId,
        source: edge.source,
        target: edge.target,
        data: {
          type: edge.type,
          style: edge.style,
          markerEnd: edge.markerEnd
        }
      }));

      const { error: edgesError } = await supabase
        .from('edges')
        .insert(edgesToInsert);

      if (edgesError) {
        console.error('Error inserting edges:', edgesError);
        throw new Error('Failed to save project connections to database');
      }

      console.log(`Successfully inserted ${edges.length} edges`);
    }

    // Bulk insert task details into database
    const taskDetailsArray = Object.entries(taskDetails);
    if (taskDetailsArray.length > 0) {
      const taskDetailsToInsert = taskDetailsArray.map(([nodeId, details]) => ({
        node_id: nodeId,
        project_id: projectId,
        title: details.title,
        description: details.description,
        status: details.status
      }));

      const { error: taskDetailsError } = await supabase
        .from('task_details')
        .insert(taskDetailsToInsert);

      if (taskDetailsError) {
        console.error('Error inserting task details:', taskDetailsError);
        throw new Error('Failed to save task details to database');
      }

      console.log(`Successfully inserted ${taskDetailsArray.length} task details`);
    }

    console.log('✅ AI project plan successfully saved to database');

    return {
      nodes,
      edges,
      taskDetails
    };

  } catch (error) {
    console.error('Error processing AI project plan:', error);
    throw error;
  }
};

/**
 * Get the root node ID for a project
 * @param projectId - The project ID
 * @returns Promise<string | null> - The root node ID or null if not found
 */
export const getRootNodeId = async (projectId: string): Promise<string | null> => {
  try {
    const { data: nodes, error } = await supabase
      .from('nodes')
      .select('id')
      .eq('project_id', projectId)
      .eq('type', 'rootNode')
      .limit(1);

    if (error) {
      console.error('Error fetching root node:', error);
      return null;
    }

    return nodes && nodes.length > 0 ? nodes[0].id : null;
  } catch (error) {
    console.error('Error getting root node ID:', error);
    return null;
  }
};

/**
 * Clear existing project data (except root node) before generating new AI plan
 * @param projectId - The project ID
 * @param rootNodeId - The root node ID to preserve
 */
export const clearExistingProjectData = async (
  projectId: string,
  rootNodeId: string
): Promise<void> => {
  try {
    console.log('Clearing existing project data...');

    // Delete task details for non-root nodes
    const { error: taskDetailsError } = await supabase
      .from('task_details')
      .delete()
      .eq('project_id', projectId);

    if (taskDetailsError) {
      console.error('Error clearing task details:', taskDetailsError);
      throw new Error('Failed to clear existing task details');
    }

    // Delete edges (all edges since root node typically doesn't have incoming edges)
    const { error: edgesError } = await supabase
      .from('edges')
      .delete()
      .eq('project_id', projectId);

    if (edgesError) {
      console.error('Error clearing edges:', edgesError);
      throw new Error('Failed to clear existing connections');
    }

    // Delete all nodes except the root node
    const { error: nodesError } = await supabase
      .from('nodes')
      .delete()
      .eq('project_id', projectId)
      .neq('id', rootNodeId);

    if (nodesError) {
      console.error('Error clearing nodes:', nodesError);
      throw new Error('Failed to clear existing project structure');
    }

    console.log('✅ Existing project data cleared successfully');
  } catch (error) {
    console.error('Error clearing existing project data:', error);
    throw error;
  }
};