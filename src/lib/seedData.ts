import { supabase } from './supabase';
import { CustomNode, Edge, TaskDetails } from '../types';

// Realistic project templates
const PROJECT_TEMPLATES = [
  {
    name: "E-commerce Website Redesign",
    description: "Complete redesign of our e-commerce platform to improve user experience and increase conversion rates",
    color: "from-blue-500 to-blue-600",
    phases: [
      {
        name: "Research & Analysis",
        description: "User research, competitor analysis, and current site audit",
        tasks: [
          { title: "Conduct user interviews", description: "Interview 20 existing customers about their shopping experience", status: "Done" },
          { title: "Analyze competitor websites", description: "Research top 5 competitors and document best practices", status: "Done" },
          { title: "Audit current website", description: "Identify pain points and areas for improvement", status: "In Progress" },
          { title: "Create user personas", description: "Develop detailed personas based on research findings", status: "To Do" }
        ]
      },
      {
        name: "Design & Prototyping",
        description: "Create wireframes, mockups, and interactive prototypes",
        tasks: [
          { title: "Create wireframes", description: "Design low-fidelity wireframes for key pages", status: "To Do" },
          { title: "Design high-fidelity mockups", description: "Create detailed visual designs for all pages", status: "To Do" },
          { title: "Build interactive prototype", description: "Create clickable prototype for user testing", status: "To Do" },
          { title: "Conduct usability testing", description: "Test prototype with target users", status: "To Do" }
        ]
      },
      {
        name: "Development",
        description: "Frontend and backend development of the new website",
        tasks: [
          { title: "Set up development environment", description: "Configure development tools and frameworks", status: "To Do" },
          { title: "Implement responsive design", description: "Build mobile-first responsive layouts", status: "To Do" },
          { title: "Integrate payment gateway", description: "Set up secure payment processing", status: "To Do" },
          { title: "Implement search functionality", description: "Build advanced product search and filtering", status: "To Do" }
        ]
      },
      {
        name: "Testing & Launch",
        description: "Quality assurance, performance testing, and deployment",
        tasks: [
          { title: "Cross-browser testing", description: "Test compatibility across all major browsers", status: "To Do" },
          { title: "Performance optimization", description: "Optimize loading times and Core Web Vitals", status: "To Do" },
          { title: "Security audit", description: "Conduct comprehensive security testing", status: "To Do" },
          { title: "Deploy to production", description: "Launch the new website to production", status: "To Do" }
        ]
      }
    ]
  },
  {
    name: "Mobile App Development",
    description: "Native iOS and Android app for our fitness tracking platform",
    color: "from-green-500 to-green-600",
    phases: [
      {
        name: "Planning & Strategy",
        description: "Define app requirements and technical architecture",
        tasks: [
          { title: "Define app requirements", description: "Document functional and non-functional requirements", status: "Done" },
          { title: "Choose technology stack", description: "Select frameworks and tools for development", status: "Done" },
          { title: "Create technical architecture", description: "Design system architecture and data flow", status: "In Progress" },
          { title: "Plan development sprints", description: "Break down work into manageable sprints", status: "To Do" }
        ]
      },
      {
        name: "UI/UX Design",
        description: "Design user interface and user experience",
        tasks: [
          { title: "Create user journey maps", description: "Map out user flows for key features", status: "In Progress" },
          { title: "Design app screens", description: "Create high-fidelity designs for all screens", status: "To Do" },
          { title: "Create design system", description: "Establish consistent design patterns and components", status: "To Do" },
          { title: "Prototype interactions", description: "Build interactive prototypes for complex features", status: "To Do" }
        ]
      },
      {
        name: "Core Development",
        description: "Implement core app functionality",
        tasks: [
          { title: "Set up project structure", description: "Initialize React Native project with proper structure", status: "To Do" },
          { title: "Implement authentication", description: "Build user registration and login system", status: "To Do" },
          { title: "Build workout tracking", description: "Implement exercise logging and progress tracking", status: "To Do" },
          { title: "Add social features", description: "Enable users to share workouts and connect with friends", status: "To Do" }
        ]
      },
      {
        name: "Testing & Deployment",
        description: "Quality assurance and app store submission",
        tasks: [
          { title: "Unit testing", description: "Write comprehensive unit tests for core functionality", status: "To Do" },
          { title: "Integration testing", description: "Test app integration with backend services", status: "To Do" },
          { title: "Beta testing", description: "Release beta version to select users for feedback", status: "To Do" },
          { title: "App store submission", description: "Submit app to iOS App Store and Google Play", status: "To Do" }
        ]
      }
    ]
  },
  {
    name: "Marketing Campaign Q1 2024",
    description: "Comprehensive marketing campaign to launch our new product line",
    color: "from-purple-500 to-purple-600",
    phases: [
      {
        name: "Campaign Strategy",
        description: "Develop overall campaign strategy and messaging",
        tasks: [
          { title: "Market research", description: "Analyze target market and customer segments", status: "Done" },
          { title: "Competitive analysis", description: "Study competitor marketing strategies", status: "Done" },
          { title: "Define campaign objectives", description: "Set clear, measurable campaign goals", status: "Done" },
          { title: "Develop key messaging", description: "Create compelling value propositions and messaging", status: "In Progress" }
        ]
      },
      {
        name: "Content Creation",
        description: "Create all marketing materials and content",
        tasks: [
          { title: "Write blog posts", description: "Create 10 SEO-optimized blog posts", status: "In Progress" },
          { title: "Design social media graphics", description: "Create visual content for all social platforms", status: "To Do" },
          { title: "Produce video content", description: "Create product demo and testimonial videos", status: "To Do" },
          { title: "Design print materials", description: "Create brochures, flyers, and trade show materials", status: "To Do" }
        ]
      },
      {
        name: "Digital Marketing",
        description: "Execute digital marketing initiatives",
        tasks: [
          { title: "Set up Google Ads campaigns", description: "Create and optimize PPC campaigns", status: "To Do" },
          { title: "Launch social media campaigns", description: "Execute campaigns across Facebook, Instagram, LinkedIn", status: "To Do" },
          { title: "Email marketing automation", description: "Set up drip campaigns and newsletters", status: "To Do" },
          { title: "Influencer partnerships", description: "Collaborate with industry influencers", status: "To Do" }
        ]
      },
      {
        name: "Analytics & Optimization",
        description: "Monitor performance and optimize campaigns",
        tasks: [
          { title: "Set up tracking", description: "Implement analytics and conversion tracking", status: "To Do" },
          { title: "Monitor campaign performance", description: "Daily monitoring and reporting", status: "To Do" },
          { title: "A/B test ad creatives", description: "Test different versions of ads and content", status: "To Do" },
          { title: "Optimize based on data", description: "Make data-driven improvements to campaigns", status: "To Do" }
        ]
      }
    ]
  },
  {
    name: "Data Migration Project",
    description: "Migrate legacy customer data to new CRM system",
    color: "from-orange-500 to-orange-600",
    phases: [
      {
        name: "Data Assessment",
        description: "Analyze current data structure and quality",
        tasks: [
          { title: "Inventory data sources", description: "Catalog all existing data sources and formats", status: "Done" },
          { title: "Data quality audit", description: "Assess data completeness, accuracy, and consistency", status: "Done" },
          { title: "Map data relationships", description: "Document how data relates across systems", status: "In Progress" },
          { title: "Identify data gaps", description: "Find missing or incomplete data that needs attention", status: "To Do" }
        ]
      },
      {
        name: "Migration Planning",
        description: "Plan the migration strategy and timeline",
        tasks: [
          { title: "Design migration strategy", description: "Plan phased approach to minimize downtime", status: "In Progress" },
          { title: "Create data mapping", description: "Map old data fields to new CRM structure", status: "To Do" },
          { title: "Plan rollback procedures", description: "Prepare contingency plans in case of issues", status: "To Do" },
          { title: "Schedule migration windows", description: "Coordinate with stakeholders on timing", status: "To Do" }
        ]
      },
      {
        name: "Data Preparation",
        description: "Clean and prepare data for migration",
        tasks: [
          { title: "Clean duplicate records", description: "Identify and merge duplicate customer records", status: "To Do" },
          { title: "Standardize data formats", description: "Ensure consistent formatting across all data", status: "To Do" },
          { title: "Validate data integrity", description: "Check for data corruption or inconsistencies", status: "To Do" },
          { title: "Create test datasets", description: "Prepare sample data for migration testing", status: "To Do" }
        ]
      },
      {
        name: "Migration Execution",
        description: "Execute the data migration and validation",
        tasks: [
          { title: "Run migration scripts", description: "Execute automated migration processes", status: "To Do" },
          { title: "Validate migrated data", description: "Verify data accuracy and completeness", status: "To Do" },
          { title: "User acceptance testing", description: "Have users test the new system with migrated data", status: "To Do" },
          { title: "Go-live and monitoring", description: "Launch new system and monitor for issues", status: "To Do" }
        ]
      }
    ]
  },
  {
    name: "Office Relocation Project",
    description: "Plan and execute move to new headquarters building",
    color: "from-teal-500 to-teal-600",
    phases: [
      {
        name: "Location Planning",
        description: "Find and secure new office space",
        tasks: [
          { title: "Define space requirements", description: "Calculate needed square footage and room types", status: "Done" },
          { title: "Research potential locations", description: "Identify suitable buildings in target areas", status: "Done" },
          { title: "Tour office spaces", description: "Visit and evaluate top location candidates", status: "Done" },
          { title: "Negotiate lease terms", description: "Finalize lease agreement for chosen location", status: "In Progress" }
        ]
      },
      {
        name: "Design & Build-out",
        description: "Design office layout and manage construction",
        tasks: [
          { title: "Create office floor plan", description: "Design optimal layout for teams and workflows", status: "In Progress" },
          { title: "Select furniture and equipment", description: "Choose desks, chairs, and office equipment", status: "To Do" },
          { title: "Coordinate construction", description: "Manage build-out contractors and timeline", status: "To Do" },
          { title: "Install IT infrastructure", description: "Set up network, phones, and technology systems", status: "To Do" }
        ]
      },
      {
        name: "Move Coordination",
        description: "Plan and execute the physical move",
        tasks: [
          { title: "Hire moving company", description: "Select and contract professional movers", status: "To Do" },
          { title: "Pack and label items", description: "Organize and prepare all office items for move", status: "To Do" },
          { title: "Coordinate move timeline", description: "Schedule move to minimize business disruption", status: "To Do" },
          { title: "Set up new office", description: "Unpack and arrange new office space", status: "To Do" }
        ]
      },
      {
        name: "Transition & Setup",
        description: "Complete setup and help team adjust",
        tasks: [
          { title: "Test all systems", description: "Verify IT, phones, and equipment are working", status: "To Do" },
          { title: "Update business addresses", description: "Change address with vendors, clients, and services", status: "To Do" },
          { title: "Orient team to new space", description: "Help employees get familiar with new office", status: "To Do" },
          { title: "Collect feedback", description: "Gather input on new space and make adjustments", status: "To Do" }
        ]
      }
    ]
  }
];

// Helper function to generate unique IDs
const generateId = () => crypto.randomUUID();

// Helper function to create nodes and edges for a project
const createProjectData = (projectTemplate: typeof PROJECT_TEMPLATES[0]) => {
  const nodes: CustomNode[] = [];
  const edges: Edge[] = [];
  const taskDetails: TaskDetails = {};

  // Create root node
  const rootNodeId = generateId();
  nodes.push({
    id: rootNodeId,
    type: 'rootNode',
    position: { x: 100, y: 300 },
    data: { label: projectTemplate.name },
    selected: false
  });

  // Create phase nodes and task nodes
  projectTemplate.phases.forEach((phase, phaseIndex) => {
    const phaseNodeId = generateId();
    
    // Create phase node with isExpanded: false by default
    nodes.push({
      id: phaseNodeId,
      type: 'phaseNode',
      position: { x: 350, y: 100 + (phaseIndex * 150) },
      data: { 
        label: phase.name,
        description: phase.description,
        isExpanded: false // Initialize seeded phases as collapsed
      },
      selected: false
    });

    // Create edge from root to phase
    edges.push({
      id: generateId(),
      source: rootNodeId,
      target: phaseNodeId,
      type: 'simplebezier',
      style: { stroke: '#64748b', strokeWidth: 2.5 },
      markerEnd: { type: 'arrowclosed', color: '#64748b' }
    });

    // Create task nodes for this phase
    phase.tasks.forEach((task, taskIndex) => {
      const taskNodeId = `task-${phaseNodeId}-${generateId()}`;
      
      // Create task node
      nodes.push({
        id: taskNodeId,
        type: 'taskNode',
        position: { x: 650, y: 50 + (phaseIndex * 150) + (taskIndex * 40) },
        data: { 
          label: task.title,
          status: task.status.toLowerCase().replace(' ', '-')
        },
        selected: false
      });

      // Create edge from phase to task
      edges.push({
        id: generateId(),
        source: phaseNodeId,
        target: taskNodeId,
        type: 'simplebezier',
        style: { stroke: '#9ca3af', strokeWidth: 2 },
        markerEnd: { type: 'arrowclosed', color: '#9ca3af' }
      });

      // Create task details
      taskDetails[taskNodeId] = {
        title: task.title,
        description: task.description,
        status: task.status as any
      };
    });
  });

  return { nodes, edges, taskDetails };
};

// Main seeding function
export const seedDatabase = async (): Promise<void> => {
  try {
    console.log('🌱 Starting database seeding...');

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not authenticated. Please log in first.');
    }

    console.log(`👤 Seeding data for user: ${user.email}`);

    // Check if user already has projects
    const { data: existingProjects, error: checkError } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', user.id);

    if (checkError) {
      throw checkError;
    }

    if (existingProjects && existingProjects.length > 0) {
      console.log('⚠️  User already has projects. Skipping seeding to avoid duplicates.');
      console.log(`Found ${existingProjects.length} existing projects.`);
      return;
    }

    // Create projects with their data
    for (const template of PROJECT_TEMPLATES) {
      console.log(`📁 Creating project: ${template.name}`);

      // Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert([{
          user_id: user.id,
          name: template.name,
          description: template.description,
          color: template.color
        }])
        .select()
        .single();

      if (projectError) {
        console.error(`❌ Error creating project ${template.name}:`, projectError);
        continue;
      }

      console.log(`✅ Created project: ${project.name} (${project.id})`);

      // Generate project data (nodes, edges, task details)
      const { nodes, edges, taskDetails } = createProjectData(template);

      // Insert nodes
      if (nodes.length > 0) {
        const nodesToInsert = nodes.map(node => ({
          id: node.id,
          project_id: project.id,
          data: node.data,
          position: node.position,
          type: node.type || 'default'
        }));

        const { error: nodesError } = await supabase
          .from('nodes')
          .insert(nodesToInsert);

        if (nodesError) {
          console.error(`❌ Error inserting nodes for ${template.name}:`, nodesError);
          continue;
        }

        console.log(`  📊 Inserted ${nodes.length} nodes`);
      }

      // Insert edges
      if (edges.length > 0) {
        const edgesToInsert = edges.map(edge => ({
          id: edge.id,
          project_id: project.id,
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
          console.error(`❌ Error inserting edges for ${template.name}:`, edgesError);
          continue;
        }

        console.log(`  🔗 Inserted ${edges.length} edges`);
      }

      // Insert task details
      const taskDetailsArray = Object.entries(taskDetails);
      if (taskDetailsArray.length > 0) {
        const taskDetailsToInsert = taskDetailsArray.map(([nodeId, details]) => ({
          node_id: nodeId,
          project_id: project.id,
          title: details.title,
          description: details.description,
          status: details.status
        }));

        const { error: taskDetailsError } = await supabase
          .from('task_details')
          .insert(taskDetailsToInsert);

        if (taskDetailsError) {
          console.error(`❌ Error inserting task details for ${template.name}:`, taskDetailsError);
          continue;
        }

        console.log(`  📝 Inserted ${taskDetailsArray.length} task details`);
      }

      console.log(`✨ Completed project: ${template.name}\n`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Created ${PROJECT_TEMPLATES.length} projects with realistic data`);
    
  } catch (error) {
    console.error('💥 Error seeding database:', error);
    throw error;
  }
};

// Function to clear all user data (for testing purposes)
export const clearUserData = async (): Promise<void> => {
  try {
    console.log('🧹 Clearing user data...');

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not authenticated. Please log in first.');
    }

    // Delete all projects (cascade will handle nodes, edges, task_details)
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      throw deleteError;
    }

    console.log('✅ User data cleared successfully');
    
  } catch (error) {
    console.error('❌ Error clearing user data:', error);
    throw error;
  }
};