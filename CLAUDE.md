# Claude Code Instructions

This file contains instructions and preferences for Claude Code sessions.

## Project Setup
- **Language/Framework**: React 18 with TypeScript, Vite build tool
- **Package Manager**: npm
- **Build Command**: `npm run build`
- **Test Command**: No test command configured
- **Lint Command**: `npm run lint`
- **Type Check Command**: TypeScript checking via `tsc` (available in node_modules)

## Code Style Preferences
- **Indentation**: 2 spaces (inferred from package.json structure)
- **Quote Style**: Double quotes (following TypeScript/React conventions)
- **Semicolons**: Required (following TypeScript conventions)
- **Framework**: Uses shadcn/ui components with Radix UI primitives
- **Styling**: TailwindCSS with clean, minimalist design

## Development Workflow
- **Testing Requirements**: No tests configured yet - focus on development
- **Code Review Process**: Run lint before any commits
- **UI Components**: Use existing shadcn/ui components when possible
- **State Management**: TanStack Query for server state, React hooks for local state

## Project Context
This is an n8n lead sync application for managing leads from marketing campaigns with the following key features:
- Lead management with history tracking
- n8n workflow integration and monitoring
- Call statistics and analytics dashboard
- Error monitoring panel for workflows

Key dependencies:
- React Router for navigation
- TanStack React Query for data fetching
- Radix UI + shadcn/ui for components
- Tailwind CSS for styling
- React Hook Form + Zod for forms
- Recharts for analytics visualization

## Custom Instructions
- **Database**: PostgreSQL with tables for leads, workflows, calls, messages
- **API Integration**: n8n API integration for workflow management
- **Design**: Clean, minimalist design with spacious layout and neutral colors
- **Error Handling**: Comprehensive error monitoring for workflow failures
- **Analytics**: Detailed call statistics with filtering capabilities

## Useful Commands
- `npm run dev` - Start development server (http://localhost:8080)
- `npm run build` - Production build
- `npm run build:dev` - Development build
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Architecture Notes
- Frontend-only React app currently
- Uses Vite for fast development and building
- Component library: shadcn/ui with Radix primitives
- Modern React patterns with hooks and functional components

---
*This file helps Claude understand your project structure and preferences.*