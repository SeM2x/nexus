import UserMenu from '@/components/common/UserMenu';
import ProjectCreationModal from '@/components/dashboard/ProjectCreationModal';
import ProjectDeletionModal from '@/components/dashboard/ProjectDeletionModal';
import Logo from '@/components/Logo';
import { useProjects } from '@/hooks/useProjects';
import type { Project, ProjectFormData } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  FolderOpen,
  Home,
  Loader2,
  MoreVertical,
  Plus,
  Settings,
  Trash2,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeletionModalOpen, setIsDeletionModalOpen] =
    useState<boolean>(false);
  const [projectToDelete, setProjectToDelete] = useState<Omit<
    Project,
    'nodes' | 'edges'
  > | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { projects, loading, error, createProject, deleteProject } =
    useProjects();

  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openDropdown) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openDropdown]);

  const handleCreateProject = async (
    projectData: ProjectFormData
  ): Promise<void> => {
    try {
      const newProjectData = {
        name: projectData.name,
        description:
          projectData.description ||
          'A new project ready for planning and organization',
        color: projectData.color,
      };

      const newProject = await createProject(newProjectData);

      // Navigate to the project workspace with AI prompt in URL params if provided
      const searchParams = new URLSearchParams();
      if (projectData.aiPrompt?.trim()) {
        searchParams.set('aiPrompt', projectData.aiPrompt.trim());
      }

      const url = `/project/${newProject.id}${
        searchParams.toString() ? `?${searchParams.toString()}` : ''
      }`;
      navigate(url);
    } catch (err) {
      console.error('Error creating project:', err);
      throw err;
    }
  };

  const handleDeleteProject = async (projectId: string): Promise<void> => {
    try {
      await deleteProject(projectId);
      setIsDeletionModalOpen(false);
      setProjectToDelete(null);
    } catch (err) {
      console.error('Error deleting project:', err);
      throw err;
    }
  };

  const handleOpenProject = (projectId: string): void => {
    navigate(`/project/${projectId}`);
  };
  const handleOpenDeleteModal = (
    project: Omit<Project, 'nodes' | 'edges'>,
    event: React.MouseEvent
  ): void => {
    event.stopPropagation(); // Prevent opening the project
    setProjectToDelete(project);
    console.log(project);
    setIsDeletionModalOpen(true);
    setOpenDropdown(null);
  };

  const handleToggleDropdown = (
    projectId: string,
    event: React.MouseEvent
  ): void => {
    event.stopPropagation(); // Prevent opening the project
    setOpenDropdown(openDropdown === projectId ? null : projectId);
  };

  const getProgressPercentage = (completed: number, total: number): number => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const mappedStatus = (status: Project['status']) => {
    switch (status) {
      case 'planning':
        return 'Planning';
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
    }
  };
  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-background-900 via-background-800 to-background-900 flex items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <Loader2 className='w-8 h-8 text-accent-500 animate-spin' />
          <p className='text-secondary-400 font-medium'>
            Loading your projects...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-background-900 via-background-800 to-background-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='p-6 bg-status-blocked-500/20 rounded-2xl inline-block mb-6'>
            <AlertCircle className='w-16 h-16 text-status-blocked-400 mx-auto' />
          </div>
          <h3 className='text-2xl font-bold text-white mb-4'>
            Error Loading Projects
          </h3>
          <p className='text-secondary-400 mb-8 max-w-md mx-auto'>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='px-6 py-3 bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-semibold rounded-xl transition-all duration-300'
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className='min-h-screen bg-gradient-to-br from-background-900 via-background-800 to-background-900 flex flex-col'>
      {/* Responsive Header */}
      <div className='sticky top-0 z-50 h-14 bg-background-900/98 backdrop-blur-xl border-b border-background-700/30 shadow-lg'>
        <div className='h-full flex items-center justify-between max-w-8xl mx-auto px-4 sm:px-6'>
          {/* Left Section - Responsive Branding */}
          <div className='flex items-center gap-2 sm:gap-4 min-w-0'>
            <Logo />
            <div className='hidden h-5 w-px bg-background-600/50 lg:block' />
            <div className='hidden lg:flex items-center gap-2 text-xs text-secondary-500'>
              <Home className='w-3.5 h-3.5' />
              <span>Dashboard</span>
            </div>
          </div>

          {/* Center Section - Hidden on mobile, shown on larger screens */}
          <div className='hidden lg:flex items-center gap-2 text-xs text-secondary-500'></div>

          {/* Right Section - Responsive Controls */}
          <div className='flex items-center gap-2 sm:gap-4'>
            {/* Quick Actions - Responsive */}
            <div className='flex items-center gap-2 sm:gap-3'>
              {/* New Project Button - Responsive text */}
              <button
                onClick={() => setIsModalOpen(true)}
                className='flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-accent-600 hover:bg-accent-700 text-white font-medium text-xs rounded-lg transition-all duration-200 shadow-sm hover:shadow-md'
              >
                <Plus className='w-3.5 h-3.5' />
                <span className='hidden sm:inline'>New Project</span>
                <span className='sm:hidden'>New</span>
              </button>

              {/* Settings Button - Hidden on mobile */}
              <button
                disabled
                className='hidden sm:flex items-center justify-center w-8 h-8 text-secondary-500 hover:text-secondary-400 hover:bg-background-700/50 rounded-lg transition-all duration-200 cursor-not-allowed opacity-60'
                title='Settings coming soon'
              >
                <Settings className='w-4 h-4' />
              </button>
            </div>

            {/* Divider - Hidden on mobile */}
            <div className='hidden sm:block h-5 w-px bg-background-600/50' />

            {/* User Menu */}
            <UserMenu />
          </div>
        </div>
      </div>

      {/* Main Content with Background Pattern */}
      <div className='flex-1 relative'>
        {/* Background Pattern */}
        <div
          className='absolute inset-0 opacity-[0.015] pointer-events-none'
          style={{
            backgroundImage: `radial-gradient(circle, #64748b 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            backgroundPosition: '12px 12px',
          }}
        />

        <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8'>
          {/* Welcome Section - Responsive */}
          <div className='mb-6 sm:mb-8'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4'>
              <div>
                <h2 className='text-xl sm:text-2xl font-bold text-white tracking-tight mb-2'>
                  Welcome back
                </h2>
                <p className='text-sm sm:text-base text-secondary-400 font-medium'>
                  {projects.length === 0
                    ? "Let's create your first project to get started"
                    : `You have ${projects.length} project${
                        projects.length !== 1 ? 's' : ''
                      } in progress`}
                </p>
              </div>

              {projects.length > 0 && (
                <div className='text-left sm:text-right'>
                  <div className='text-sm text-secondary-400 font-medium'>
                    Total Progress
                  </div>
                  <div className='text-xl sm:text-2xl font-bold text-white'>
                    {/* {Math.round(
                      projects.reduce((sum, p) => sum + getProgressPercentage(p.completedTasks, p.tasks), 0) / 
                      Math.max(projects.length, 1)
                    )}% */}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Overview - Responsive Grid */}
          {projects.length > 0 && (
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8'>
              <div className='bg-background-800/40 backdrop-blur-xl border border-background-700/30 rounded-xl p-4 sm:p-6 shadow-lg relative overflow-hidden'>
                <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent' />
                <div className='relative flex items-center gap-3 sm:gap-4'>
                  <div className='p-2 sm:p-3 bg-blue-500/20 rounded-lg'>
                    <FolderOpen className='w-5 h-5 sm:w-6 sm:h-6 text-blue-400' />
                  </div>
                  <div>
                    <div className='text-xl sm:text-2xl font-bold text-white'>
                      {projects.length}
                    </div>
                    <div className='text-xs sm:text-sm text-secondary-400 font-medium'>
                      Total Projects
                    </div>
                  </div>
                </div>
              </div>

              <div className='bg-background-800/40 backdrop-blur-xl border border-background-700/30 rounded-xl p-4 sm:p-6 shadow-lg relative overflow-hidden'>
                <div className='absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent' />
                <div className='relative flex items-center gap-3 sm:gap-4'>
                  <div className='p-2 sm:p-3 bg-yellow-500/20 rounded-lg'>
                    <Clock className='w-5 h-5 sm:w-6 sm:h-6 text-yellow-400' />
                  </div>
                  <div>
                    <div className='text-xl sm:text-2xl font-bold text-white'>
                      {
                        projects.filter((p) => p.status === 'in-progress')
                          .length
                      }
                    </div>
                    <div className='text-xs sm:text-sm text-secondary-400 font-medium'>
                      Active Projects
                    </div>
                  </div>
                </div>
              </div>

              <div className='bg-background-800/40 backdrop-blur-xl border border-background-700/30 rounded-xl p-4 sm:p-6 shadow-lg relative overflow-hidden'>
                <div className='absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent' />
                <div className='relative flex items-center gap-3 sm:gap-4'>
                  <div className='p-2 sm:p-3 bg-green-500/20 rounded-lg'>
                    <CheckCircle className='w-5 h-5 sm:w-6 sm:h-6 text-green-400' />
                  </div>
                  <div>
                    <div className='text-xl sm:text-2xl font-bold text-white'>
                      {projects.filter((p) => p.status === 'completed').length}
                    </div>
                    <div className='text-xs sm:text-sm text-secondary-400 font-medium'>
                      Completed
                    </div>
                  </div>
                </div>
              </div>

              <div className='bg-background-800/40 backdrop-blur-xl border border-background-700/30 rounded-xl p-4 sm:p-6 shadow-lg relative overflow-hidden'>
                <div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent' />
                <div className='relative flex items-center gap-3 sm:gap-4'>
                  <div className='p-2 sm:p-3 bg-purple-500/20 rounded-lg'>
                    <Users className='w-5 h-5 sm:w-6 sm:h-6 text-purple-400' />
                  </div>
                  <div>
                    <div className='text-xl sm:text-2xl font-bold text-white'>
                      {projects.reduce((sum, p) => sum + p.tasks, 0)}
                    </div>
                    <div className='text-xs sm:text-sm text-secondary-400 font-medium'>
                      Total Tasks
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Database Seeder (only show when no projects) */}
          {projects.length === 0 && (
            <div className='mb-6 sm:mb-8'>{/* <DatabaseSeeder /> */}</div>
          )}

          {/* Projects Section */}
          <div className='space-y-4 sm:space-y-6'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
              <h3 className='text-lg sm:text-xl font-bold text-white tracking-tight'>
                Your Projects
              </h3>
              {projects.length > 0 && (
                <div className='text-sm text-secondary-400 font-medium'>
                  {projects.length} project{projects.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6'>
              {projects.map((project) => {
                const progressPercentage = getProgressPercentage(
                  project.completedTasks,
                  project.tasks
                );

                return (
                  <div
                    key={project.id}
                    onClick={() => handleOpenProject(project.id)}
                    className='group bg-background-800/40 backdrop-blur-xl border border-background-700/30 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-accent-500/30 relative overflow-hidden'
                  >
                    {/* Subtle gradient overlay */}
                    <div className='absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none' />

                    {/* Project Header */}
                    <div className='relative flex items-start justify-between mb-4'>
                      <div
                        className={`p-2 sm:p-3 bg-gradient-to-r ${project.color} rounded-lg shadow-lg`}
                      >
                        <FolderOpen className='w-5 h-5 sm:w-6 sm:h-6 text-white' />
                      </div>
                      <div className='flex items-center gap-2'>
                        <div className='flex items-center gap-2 text-sm'>
                          {/* {getStatusIcon(project.status)} */}
                          <span className='text-secondary-400 font-medium hidden sm:inline'>
                            {mappedStatus(project.status)}
                          </span>
                        </div>

                        {/* Project Actions Dropdown */}
                        <div className='relative'>
                          <button
                            onClick={(e) => handleToggleDropdown(project.id, e)}
                            className='p-1.5 text-secondary-400 hover:text-white hover:bg-background-700/50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100'
                          >
                            <MoreVertical className='w-4 h-4' />
                          </button>

                          {openDropdown === project.id && (
                            <div className='absolute right-0 top-full mt-2 w-48 bg-background-800/95 backdrop-blur-xl border border-background-700/50 rounded-xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200'>
                              <button
                                onClick={(e) =>
                                  handleOpenDeleteModal(project, e)
                                }
                                className='w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-status-blocked-400 hover:text-status-blocked-300 hover:bg-status-blocked-500/10 transition-all duration-200'
                              >
                                <Trash2 className='w-4 h-4' />
                                <span>Delete Project</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Project Info */}
                    <div className='relative space-y-3 mb-6'>
                      <h4 className='text-lg sm:text-xl font-bold text-white group-hover:text-accent-400 transition-colors duration-300'>
                        {project.name}
                      </h4>
                      <p className='text-secondary-400 text-sm leading-relaxed line-clamp-2'>
                        {project.description}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className='relative space-y-2 mb-6'>
                      <div className='flex items-center justify-between text-sm'>
                        <span className='text-secondary-400 font-medium'>
                          Progress
                        </span>
                        <span className='text-white font-bold'>
                          {progressPercentage}%
                        </span>
                      </div>
                      <div className='w-full bg-background-700/50 rounded-full h-2'>
                        <div
                          className={`bg-gradient-to-r ${project.color} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Project Stats */}
                    <div className='relative grid grid-cols-2 gap-4 mb-6'>
                      <div className='text-center p-3 bg-background-700/20 rounded-lg'>
                        <div className='text-base sm:text-lg font-bold text-white'>
                          {project.phases}
                        </div>
                        <div className='text-xs text-secondary-400 font-medium'>
                          Phases
                        </div>
                      </div>
                      <div className='text-center p-3 bg-background-700/20 rounded-lg'>
                        <div className='text-base sm:text-lg font-bold text-white'>
                          {project.completedTasks}/{project.tasks}
                        </div>
                        <div className='text-xs text-secondary-400 font-medium'>
                          Tasks
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className='relative flex items-center justify-between pt-4 border-t border-background-700/30'>
                      <div className='text-xs text-secondary-500'>
                        Updated{' '}
                        {formatDistanceToNow(project.updatedAt, {
                          addSuffix: true,
                        })}
                      </div>
                      <div className='flex items-center gap-2 text-accent-400 group-hover:text-accent-300 transition-colors duration-300'>
                        <span className='text-sm font-semibold'>Open</span>
                        <ArrowRight className='w-4 h-4 transition-transform duration-300 group-hover:translate-x-1' />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Empty State (if no projects) */}
          {projects.length === 0 && (
            <div className='text-center py-12 sm:py-16'>
              <div className='p-4 sm:p-6 bg-background-800/30 rounded-2xl inline-block mb-6'>
                <FolderOpen className='w-12 h-12 sm:w-16 sm:h-16 text-secondary-500 mx-auto' />
              </div>
              <h3 className='text-xl sm:text-2xl font-bold text-white mb-4'>
                No Projects Yet
              </h3>
              <p className='text-secondary-400 mb-6 sm:mb-8 max-w-md mx-auto px-4'>
                Get started by creating your first project or use the sample
                data above to explore the features.
              </p>
              <button
                //onClick={() => setIsModalOpen(true)}
                className='group flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-accent-600 via-accent-600 to-accent-700 hover:from-accent-700 hover:via-accent-700 hover:to-accent-800 text-white font-bold rounded-xl shadow-xl transition-all duration-300 hover:shadow-accent-lg hover:scale-105 border border-accent-500/20 mx-auto'
              >
                <Plus className='w-5 h-5 transition-transform duration-300 group-hover:rotate-90' />
                <span>Create Your First Project</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Project Creation Modal */}
      <ProjectCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateProject={handleCreateProject}
      />

      {/* Project Deletion Modal */}
      <ProjectDeletionModal
        isOpen={isDeletionModalOpen}
        onClose={() => {
          setIsDeletionModalOpen(false);
          setProjectToDelete(null);
        }}
        onDeleteProject={handleDeleteProject}
        project={projectToDelete}
      />
    </div>
  );
};

export default DashboardPage;
