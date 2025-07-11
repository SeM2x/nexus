import React, { useState } from 'react';
import {
  MousePointer2,
  Square,
  Move,
  Trash2,
  Copy,
  Undo,
  Redo,
  Hand,
} from 'lucide-react';
const Toolbar = () => {
  const [selectedTool, setSelectedTool] = useState<
    'select' | 'multiselect' | 'move' | 'pan'
  >('select');
  return (
    <div className='flex items-center gap-2 px-4 py-2 bg-background-800/95 backdrop-blur-xl border border-background-700/50 rounded-xl shadow-2xl'>
      {/* Selection Tool */}
      <button
        onClick={() => setSelectedTool('select')}
        className={`p-2 rounded-lg transition-all duration-200 ${
          selectedTool === 'select'
            ? 'bg-accent-600 text-white shadow-md'
            : 'text-secondary-400 hover:text-white hover:bg-background-700/50'
        }`}
        title='Selection Tool'
      >
        <MousePointer2 className='w-4 h-4' />
      </button>

      {/* Multi-Select Tool */}
      <button
        onClick={() => setSelectedTool('multiselect')}
        className={`p-2 rounded-lg transition-all duration-200 ${
          selectedTool === 'multiselect'
            ? 'bg-accent-600 text-white shadow-md'
            : 'text-secondary-400 hover:text-white hover:bg-background-700/50'
        }`}
        title='Multi-Select Tool'
      >
        <Square className='w-4 h-4' />
      </button>

      {/* Move Tool */}
      <button
        onClick={() => setSelectedTool('move')}
        className={`p-2 rounded-lg transition-all duration-200 ${
          selectedTool === 'move'
            ? 'bg-accent-600 text-white shadow-md'
            : 'text-secondary-400 hover:text-white hover:bg-background-700/50'
        }`}
        title='Move Tool'
      >
        <Move className='w-4 h-4' />
      </button>

      {/* Pan Tool */}
      <button
        onClick={() => setSelectedTool('pan')}
        className={`p-2 rounded-lg transition-all duration-200 ${
          selectedTool === 'pan'
            ? 'bg-accent-600 text-white shadow-md'
            : 'text-secondary-400 hover:text-white hover:bg-background-700/50'
        }`}
        title='Pan Tool'
      >
        <Hand className='w-4 h-4' />
      </button>

      {/* Separator */}
      <div className='w-px h-6 bg-background-600' />

      {/* Delete */}
      <button
        className='p-2 rounded-lg text-secondary-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200'
        title='Delete Selected'
      >
        <Trash2 className='w-4 h-4' />
      </button>

      {/* Copy */}
      <button
        className='p-2 rounded-lg text-secondary-400 hover:text-white hover:bg-background-700/50 transition-all duration-200'
        title='Copy Selected'
      >
        <Copy className='w-4 h-4' />
      </button>

      {/* Separator */}
      <div className='w-px h-6 bg-background-600' />

      {/* Undo */}
      <button
        className='p-2 rounded-lg text-secondary-400 hover:text-white hover:bg-background-700/50 transition-all duration-200'
        title='Undo'
      >
        <Undo className='w-4 h-4' />
      </button>

      {/* Redo */}
      <button
        className='p-2 rounded-lg text-secondary-400 hover:text-white hover:bg-background-700/50 transition-all duration-200'
        title='Redo'
      >
        <Redo className='w-4 h-4' />
      </button>
    </div>
  );
};

export default Toolbar;
