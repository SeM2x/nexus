import { supabase } from './supabase';
import { getGuestProjectData, clearAllGuestData } from './guestStorage';
import { CustomNode, Edge, TaskDetails } from '../types';

export interface MigrationResult {
  success: boolean;
  newProjectId?: string;
  error?: string;
}

/**
 * Migrate guest project data to Supabase after successful authentication
 * @param guestProjectId - The guest project ID to migrate
 * @returns Promise<MigrationResult> - Result of the migration
 */
export const migrateGuestProjectToSupabase = async (guestProjectId: string): Promise<MigrationResult> => {
  try {
    console.log('🔄 Starting guest project migration for:', guestProjectId);

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    console.log('👤 Migrating for user:', user.email);

    // Read the guest project data from localStorage
    const guestData = getGuestProjectData(guestProjectId);
    
    if (!guestData) {
      throw new Error('Guest project data not found');
    }

    console.log('📦 Found guest project data:', {
      nodes: guestData.nodes.length,
      edges: guestData.edges.length,
      taskDetails: Object.keys(guestData.taskDetails).length,
      projectName: guestData.project.name
    });

    // Create the new project in Supabase
    const { data: newProject, error: projectError } = await supabase
      .from('projects')
      .insert([{
        user_id: user.id,
        name: guestData.project.name,
        description: guestData.project.description || 'Migrated from guest session',
        color: guestData.project.color || 'from-blue-500 to-blue-600'
      }])
      .select()
      .single();

    if (projectError) {
      console.error('❌ Error creating project:', projectError);
      throw new Error('Failed to create project in database');
    }

    console.log('✅ Created new project:', newProject.id);

    // Migrate nodes if they exist
    if (guestData.nodes.length > 0) {
      const nodesToInsert = guestData.nodes.map(node => ({
        id: node.id,
        project_id: newProject.id,
        data: node.data,
        position: node.position,
        type: node.type || 'default'
      }));

      const { error: nodesError } = await supabase
        .from('nodes')
        .insert(nodesToInsert);

      if (nodesError) {
        console.error('❌ Error inserting nodes:', nodesError);
        throw new Error('Failed to migrate project nodes');
      }

      console.log('✅ Migrated nodes:', nodesToInsert.length);
    }

    // Migrate edges if they exist
    if (guestData.edges.length > 0) {
      const edgesToInsert = guestData.edges.map(edge => ({
        id: edge.id,
        project_id: newProject.id,
        source: edge.source,
        target: edge.target,
        data: {
          type: edge.type,
          style: edge.style,
          markerEnd: edge.markerEnd,
          ...edge.data
        }
      }));

      const { error: edgesError } = await supabase
        .from('edges')
        .insert(edgesToInsert);

      if (edgesError) {
        console.error('❌ Error inserting edges:', edgesError);
        throw new Error('Failed to migrate project connections');
      }

      console.log('✅ Migrated edges:', edgesToInsert.length);
    }

    // Migrate task details if they exist
    const taskDetailsArray = Object.entries(guestData.taskDetails);
    if (taskDetailsArray.length > 0) {
      const taskDetailsToInsert = taskDetailsArray.map(([nodeId, details]) => ({
        node_id: nodeId,
        project_id: newProject.id,
        title: details.title,
        description: details.description,
        status: details.status
      }));

      const { error: taskDetailsError } = await supabase
        .from('task_details')
        .insert(taskDetailsToInsert);

      if (taskDetailsError) {
        console.error('❌ Error inserting task details:', taskDetailsError);
        throw new Error('Failed to migrate task details');
      }

      console.log('✅ Migrated task details:', taskDetailsToInsert.length);
    }

    // Clear the guest project from localStorage after successful migration
    try {
      clearAllGuestData();
      console.log('🧹 Cleared guest data from localStorage');
    } catch (clearError) {
      console.warn('⚠️ Failed to clear guest data, but migration was successful:', clearError);
    }

    console.log('🎉 Migration completed successfully!');

    return {
      success: true,
      newProjectId: newProject.id
    };

  } catch (error) {
    console.error('💥 Migration failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown migration error'
    };
  }
};

/**
 * Check if there's guest data that needs migration
 * @returns boolean - True if guest data exists
 */
export const hasGuestDataToMigrate = (): boolean => {
  try {
    const guestProjectsJson = localStorage.getItem('nexus-guest-projects');
    if (!guestProjectsJson) return false;
    
    const projects = JSON.parse(guestProjectsJson);
    return Array.isArray(projects) && projects.length > 0;
  } catch (error) {
    console.error('Error checking for guest data:', error);
    return false;
  }
};

/**
 * Get the most recent guest project ID for migration
 * @returns string | null - The guest project ID or null if none exists
 */
export const getMostRecentGuestProjectId = (): string | null => {
  try {
    const guestProjectsJson = localStorage.getItem('nexus-guest-projects');
    if (!guestProjectsJson) return null;
    
    const projects = JSON.parse(guestProjectsJson);
    if (!Array.isArray(projects) || projects.length === 0) return null;
    
    // Return the most recently updated project
    const sortedProjects = projects.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    
    return sortedProjects[0].id;
  } catch (error) {
    console.error('Error getting most recent guest project:', error);
    return null;
  }
};