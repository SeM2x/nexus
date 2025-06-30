# Nexus - AI-Powered Project Management Platform

## Project Overview

**Nexus** is a modern, AI-powered project management platform that transforms ideas into structured project plans through visual mind maps and kanban boards. The application allows users to describe their projects in natural language, and AI automatically generates comprehensive project structures with phases and tasks.

### Core Value Proposition
- **AI-First Approach**: Users describe projects in plain English, AI generates complete project structures
- **Visual Project Management**: Mind maps for planning, Kanban boards for execution
- **Dual Mode Operation**: Full-featured authenticated experience + guest mode for immediate access
- **Real-time Collaboration**: Live updates and synchronization across team members

## Technology Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for utility-first styling with custom design system
- **React Flow** for interactive mind map visualization
- **React Router DOM** for client-side routing
- **@dnd-kit** for drag-and-drop functionality in Kanban boards

### Backend & Services
- **Supabase** for authentication, database, and real-time features
- **PostgreSQL** (via Supabase) for data persistence
- **Supabase Edge Functions** for serverless AI integration
- **Google Gemini API** for AI project plan generation

### State Management & Data Flow
- **React Hooks** (useState, useEffect, useCallback) for local state
- **Custom Hooks** for data fetching and management
- **Real-time subscriptions** via Supabase for live collaboration
- **Local Storage** for guest mode persistence

## Key Features

### 1. AI Project Generation
- **Natural Language Input**: Users describe projects in plain English
- **Intelligent Parsing**: AI extracts project structure, phases, and tasks
- **Automatic Visualization**: Generated plans appear as interactive mind maps
- **Smart Task Creation**: AI creates realistic, actionable tasks for each phase

### 2. Mind Map Interface
- **Interactive Visualization**: Drag-and-drop nodes with real-time positioning
- **Hierarchical Structure**: Root project → Phases → Tasks
- **Visual Feedback**: Color-coded status indicators and progress tracking
- **Auto-Layout**: Intelligent node positioning with manual override capability

### 3. Kanban Board View
- **Seamless Transition**: Switch between mind map and kanban views
- **Drag-and-Drop**: Move tasks between phases/columns
- **Status Management**: Visual task status with color coding
- **Progress Tracking**: Real-time completion percentages

### 4. Dual Mode Architecture
- **Authenticated Mode**: Full features with cloud sync and collaboration
- **Guest Mode**: Immediate access with local storage persistence
- **Migration Path**: Seamless upgrade from guest to authenticated user

### 5. Real-time Collaboration
- **Live Updates**: Changes sync instantly across all connected users
- **Conflict Resolution**: Intelligent handling of simultaneous edits
- **User Presence**: Visual indicators of active collaborators

## Database Schema

### Core Tables

#### `projects`
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `name` (text) - Project title
- `description` (text) - Project description
- `color` (text) - UI color scheme
- `created_at`, `updated_at` (timestamps)

#### `nodes`
- `id` (text, primary key) - Unique node identifier
- `project_id` (uuid, foreign key)
- `data` (jsonb) - Node-specific data (label, description, etc.)
- `position` (jsonb) - X,Y coordinates for mind map
- `type` (text) - Node type: 'rootNode', 'phaseNode', 'taskNode'

#### `edges`
- `id` (text, primary key)
- `project_id` (uuid, foreign key)
- `source` (text) - Source node ID
- `target` (text) - Target node ID
- `data` (jsonb) - Edge styling and metadata

#### `task_details`
- `id` (uuid, primary key)
- `node_id` (text, foreign key to nodes)
- `project_id` (uuid, foreign key)
- `title` (text) - Task title
- `description` (text) - Detailed task description
- `status` (text) - 'To Do', 'In Progress', 'Blocked', 'Done'

### Security Model
- **Row Level Security (RLS)** enabled on all tables
- **User Isolation**: Users can only access their own projects
- **Cascade Deletion**: Deleting projects removes all related data

## Architecture Patterns

### Data Flow
1. **User Input** → AI Processing → Database Storage → Real-time Sync
2. **Local State** ↔ **Database** ↔ **Real-time Subscriptions**
3. **Guest Mode**: Local Storage ↔ Migration Service → Database

### Component Architecture
- **Page Components**: Route-level components (Dashboard, Workspace, Login)
- **Feature Components**: Complex UI components (MindMap, KanbanView, InspectorPanel)
- **UI Components**: Reusable elements (Modals, Cards, Buttons)
- **Custom Hooks**: Data management and business logic

### State Management Strategy
- **Local Component State**: UI state and temporary data
- **Custom Hooks**: Data fetching, caching, and synchronization
- **Real-time Subscriptions**: Live updates and collaboration
- **Optimistic Updates**: Immediate UI feedback with background sync

## Critical Files & Components

### Core Application Files
- `src/App.tsx` - Main application router and auth provider
- `src/components/Workspace.tsx` - Main workspace container
- `src/components/MindMap.tsx` - Interactive mind map interface
- `src/components/KanbanView.tsx` - Kanban board implementation
- `src/components/InspectorPanel.tsx` - Task/phase editing sidebar

### Data Management
- `src/hooks/useProjectData.ts` - Main data hook for authenticated users
- `src/hooks/useGuestProjectData.ts` - Guest mode data management
- `src/lib/database.ts` - Supabase database operations
- `src/lib/guestStorage.ts` - Local storage management
- `src/lib/aiProjectGenerator.ts` - AI integration and processing

### Authentication & Migration
- `src/contexts/AuthContext.tsx` - Authentication state management
- `src/lib/guestMigration.ts` - Guest-to-authenticated migration
- `src/components/SaveProjectModal.tsx` - Guest upgrade flow

### AI Integration
- `supabase/functions/generate-plan/index.ts` - Edge function for AI processing
- Environment: `GEMINI_API_KEY` for Google AI integration

## Data Handling Strategy

### Authenticated Users
- **Primary Storage**: Supabase PostgreSQL database
- **Real-time Sync**: Automatic updates via Supabase subscriptions
- **Conflict Resolution**: Last-write-wins with optimistic updates
- **Backup Strategy**: Automatic database backups via Supabase

### Guest Users
- **Primary Storage**: Browser localStorage
- **Data Structure**: JSON serialization of project data
- **Persistence**: Survives browser sessions, cleared on migration
- **Limitations**: Single-device, no collaboration, no cloud backup

### Migration Process
1. **Trigger**: User signs up/logs in while in guest mode
2. **Data Extraction**: Read guest project from localStorage
3. **Database Creation**: Create new project in Supabase
4. **Data Transfer**: Migrate nodes, edges, and task details
5. **Cleanup**: Clear localStorage after successful migration
6. **Redirect**: Navigate to new authenticated project

## Performance Optimizations

### Frontend
- **Code Splitting**: Route-based lazy loading
- **Memoization**: React.memo and useMemo for expensive operations
- **Debounced Saves**: Prevent excessive database writes
- **Optimistic Updates**: Immediate UI feedback

### Backend
- **Database Indexing**: Optimized queries on project_id and user_id
- **Real-time Filtering**: Server-side filtering for subscriptions
- **Edge Functions**: Serverless AI processing for scalability

### User Experience
- **Progressive Loading**: Skeleton states and loading indicators
- **Error Boundaries**: Graceful error handling and recovery
- **Responsive Design**: Mobile-first approach with breakpoints

## Deployment & Infrastructure

### Frontend Deployment
- **Platform**: Netlify (configured for deployment)
- **Build Process**: Vite production build
- **Environment Variables**: Supabase connection details

### Backend Services
- **Database**: Supabase managed PostgreSQL
- **Authentication**: Supabase Auth with email/password
- **Real-time**: Supabase Realtime for live updates
- **Edge Functions**: Supabase Edge Runtime for AI processing

### Environment Configuration
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key (server-side only)
```

## Known Limitations & Technical Debt

### Current Limitations
1. **Single Project AI Generation**: AI can only generate one project at a time
2. **Limited Collaboration**: Real-time updates work but no user presence indicators
3. **Mobile UX**: Some complex interactions need mobile optimization
4. **AI Rate Limiting**: No rate limiting on AI generation requests

### Technical Debt
1. **Error Handling**: Some edge cases in AI generation need better handling
2. **Type Safety**: Some any types in React Flow integration
3. **Testing**: Limited test coverage, especially for AI integration
4. **Performance**: Large projects (100+ nodes) may have rendering issues

## Future Roadmap

### Short Term (Next Sprint)
- [ ] Enhanced mobile responsiveness
- [ ] Better error handling for AI failures
- [ ] User presence indicators in collaboration
- [ ] Project templates and examples

### Medium Term (Next Quarter)
- [ ] Team workspaces and permissions
- [ ] Advanced AI features (task estimation, dependencies)
- [ ] Export functionality (PDF, PNG, etc.)
- [ ] Integration with external tools (Slack, GitHub, etc.)

### Long Term (Next Year)
- [ ] Advanced analytics and reporting
- [ ] Custom AI models for specific industries
- [ ] White-label solutions for enterprises
- [ ] Mobile native applications

## Development Guidelines

### Code Style
- **TypeScript**: Strict mode enabled, prefer explicit types
- **Components**: Functional components with hooks
- **Styling**: Tailwind utility classes with custom design system
- **File Organization**: Feature-based folder structure

### Best Practices
- **Error Boundaries**: Wrap major components in error boundaries
- **Loading States**: Always provide loading feedback for async operations
- **Accessibility**: ARIA labels and keyboard navigation support
- **Performance**: Use React.memo for expensive components

### Testing Strategy
- **Unit Tests**: Critical business logic and utilities
- **Integration Tests**: API endpoints and data flows
- **E2E Tests**: Core user journeys (project creation, AI generation)
- **Manual Testing**: Cross-browser compatibility and mobile testing

## Troubleshooting Common Issues

### AI Generation Failures
- **Symptom**: AI doesn't generate project structure
- **Causes**: API key issues, rate limiting, malformed prompts
- **Solutions**: Check environment variables, implement retry logic, validate input

### Real-time Sync Issues
- **Symptom**: Changes don't appear for other users
- **Causes**: Subscription failures, network issues, RLS policy problems
- **Solutions**: Check Supabase connection, verify RLS policies, implement reconnection logic

### Guest Mode Data Loss
- **Symptom**: Guest projects disappear
- **Causes**: localStorage cleared, browser issues, migration failures
- **Solutions**: Implement data validation, add backup mechanisms, improve migration flow

### Performance Issues
- **Symptom**: Slow rendering with large projects
- **Causes**: Too many React Flow nodes, inefficient re-renders
- **Solutions**: Implement virtualization, optimize component memoization, consider pagination

## Security Considerations

### Data Protection
- **Encryption**: All data encrypted in transit and at rest via Supabase
- **Authentication**: Secure email/password with optional 2FA
- **Authorization**: Row-level security ensures data isolation
- **API Security**: Rate limiting and input validation on edge functions

### Privacy
- **Guest Mode**: No personal data collected in guest mode
- **Data Retention**: User controls data deletion
- **GDPR Compliance**: Right to export and delete personal data
- **Analytics**: No tracking without explicit consent

## Monitoring & Analytics

### Application Monitoring
- **Error Tracking**: Console errors and API failures
- **Performance Metrics**: Page load times and interaction latency
- **User Analytics**: Feature usage and conversion funnels
- **Infrastructure**: Database performance and edge function metrics

### Business Metrics
- **User Engagement**: Project creation and completion rates
- **AI Usage**: Generation success rates and user satisfaction
- **Conversion**: Guest-to-authenticated user conversion
- **Retention**: Daily/weekly/monthly active users

---

## Quick Start for New Developers

1. **Clone Repository**: `git clone [repository-url]`
2. **Install Dependencies**: `npm install`
3. **Environment Setup**: Copy `.env.example` to `.env` and configure
4. **Database Setup**: Run Supabase migrations
5. **Start Development**: `npm run dev`
6. **Test AI Integration**: Ensure GEMINI_API_KEY is configured
7. **Verify Features**: Test both authenticated and guest modes

## Support & Documentation

- **Technical Documentation**: This file and inline code comments
- **API Documentation**: Supabase auto-generated docs
- **Design System**: Tailwind configuration and custom components
- **Deployment Guide**: Netlify deployment configuration

---

*Last Updated: December 2024*
*Version: 1.0.0*
*Maintainer: Development Team*