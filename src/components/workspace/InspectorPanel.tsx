import React from 'react';
import DefaultView from './InspectorPanel/DefaultView';
import TaskView from './InspectorPanel/TaskView';
import PhaseView from './InspectorPanel/PhaseView';
import ExportProjectModal from '../modals/ExportProjectModal';
import ImportProjectModal from '../modals/ImportProjectModal';
import DeleteConfirmationModal from '../modals/DeleteConfirmationModal';
import { MoreVertical, Download, Upload, Trash2 } from 'lucide-react';
import type { CustomNode, PhaseNode, Project, TaskNode } from '@/types';
import { createLocalProject, deleteLocalProject } from '@/lib/localStorage';
import { useNavigate } from 'react-router-dom';
import importProject from '@/utils/importProject';
import { deleteProject } from '@/lib/database';

const InspectorPanel = ({
  selectedNode,
  project,
  isGuest,
}: {
  selectedNode: CustomNode | null;
  project: Project;
  isGuest: boolean;
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [dropdownPosition, setDropdownPosition] = React.useState({
    x: 0,
    y: 0,
  });
  const [showExportModal, setShowExportModal] = React.useState(false);
  const [showImportModal, setShowImportModal] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  const handleDropdownToggle = (event: React.MouseEvent) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setDropdownPosition({ x: rect.left - 150, y: rect.bottom + 4 });
    setIsDropdownOpen(!isDropdownOpen);
  };

  React.useEffect(() => {
    const handleClickOutside = () => setIsDropdownOpen(false);
    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen]);

  const navigate = useNavigate();

  const handleDeleteProject = () => {
    setIsDropdownOpen(false);
    setShowDeleteModal(true);
  };

  const confirmDeleteProject = async () => {
    try {
      await deleteProject(project.id);
      deleteLocalProject({ isGuest });
      navigate('/');
    } catch (err) {
      console.error('Error deleting project:', err);
      throw err;
    }
  };

  const handleImportProject = async (projectData: unknown) => {
    // TODO
    console.log('Importing project data:', projectData);
    try {
      const project = await importProject(projectData);
      createLocalProject(project, { isGuest });
    } catch (error) {
      console.error(error);
    }
  };

  const overviewStats = {
    phases: project.phases,
    tasks: project.tasks,
  };
  // Default View
  if (!selectedNode) {
    return (
      <div className='relative'>
        <DefaultView isGuest={isGuest} overviewStats={overviewStats} />

        {/* Dropdown Menu */}
        <div className='absolute top-3 right-3'>
          <button
            onClick={handleDropdownToggle}
            className='flex items-center justify-center w-8 h-8 text-secondary-400 hover:text-white hover:bg-background-700/50 rounded-md transition-colors duration-200'
            title='Project options'
          >
            <MoreVertical className='w-4 h-4' />
          </button>
        </div>

        {/* Dropdown Menu Content */}
        {isDropdownOpen && (
          <div
            className='fixed z-50 w-48 bg-background-800/95 backdrop-blur-xl border border-background-700/50 rounded-lg shadow-2xl py-2'
            style={{ left: dropdownPosition.x, top: dropdownPosition.y }}
          >
            <button
              className='w-full flex items-center gap-3 px-3 py-2 text-sm text-secondary-300 hover:text-white hover:bg-background-700/50 transition-colors duration-200'
              onClick={() => {
                setIsDropdownOpen(false);
                setShowExportModal(true);
              }}
            >
              <Upload className='w-4 h-4' />
              <span>Export Project</span>
            </button>

            <button
              className='w-full flex items-center gap-3 px-3 py-2 text-sm text-secondary-300 hover:text-white hover:bg-background-700/50 transition-colors duration-200'
              onClick={() => {
                setIsDropdownOpen(false);
                setShowImportModal(true);
              }}
            >
              <Download className='w-4 h-4' />
              <span>Import Project</span>
            </button>

            <div className='h-px bg-background-600 my-2' />

            <button
              className='w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-200'
              onClick={handleDeleteProject}
            >
              <Trash2 className='w-4 h-4' />
              <span>{isGuest ? 'Delete Guest Project' : 'Delete Project'}</span>
            </button>
          </div>
        )}

        {/* Export Project Modal */}
        <ExportProjectModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          projectData={project}
        />

        {/* Import Project Modal */}
        <ImportProjectModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImportProject}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDeleteProject}
          projectName='My Project' // TODO: Get actual project name
          isGuest={isGuest}
        />
      </div>
    );
  }

  // Task Details View
  if (selectedNode.type === 'taskNode') {
    return <TaskView task={selectedNode as TaskNode} />;
  }

  // Phase Details View
  if (selectedNode.type === 'phaseNode') {
    return <PhaseView phase={selectedNode as PhaseNode} />;
  }

  return (
    <div className='w-[320px] h-full bg-background-900/95 border-r border-background-700/50 flex flex-col relative'>
      {/* Compact Header */}
      <div className='flex-shrink-0 px-4 py-3 border-b border-background-700/30'>
        <div className='flex items-center gap-2'>
          <div className='w-6 h-6 bg-secondary-500 rounded-md flex items-center justify-center'>
            <span className='text-white text-xs font-bold'>?</span>
          </div>
          <div>
            <h2 className='text-sm font-semibold text-white'>Unknown Type</h2>
            <p className='text-xs text-secondary-500'>
              Node type not recognized
            </p>
          </div>
        </div>
      </div>

      <div className='flex-1 p-4'>
        <div className='text-center'>
          <p className='text-sm text-secondary-400'>
            Selected node type not recognized
          </p>
        </div>
      </div>
    </div>
  );
};

export default InspectorPanel;
