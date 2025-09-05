# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` (uses Turbopack for faster builds)
- **Build for production**: `npm run build --turbopack`
- **Start production server**: `npm start`
- **Lint code**: `npm run lint` (ESLint with Next.js and TypeScript rules)
- **Database operations**: Use `npx prisma` commands for schema changes and migrations

## Architecture Overview

This is a Next.js 15 application that replicates GitHub's interface and functionality. The app uses the App Router architecture with TypeScript and Tailwind CSS.

### Key Technologies
- **Next.js 15**: React framework with App Router
- **NextAuth.js**: Authentication system with credentials provider
- **Prisma**: Database ORM with PostgreSQL (Neon)
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type safety throughout the application

### Authentication System
The app uses NextAuth.js v4 with a custom credentials provider:
- Database adapter via Prisma
- JWT session strategy
- User model includes optional password hashing with bcryptjs
- Custom sign-in page at `/login`
- Session provider wraps the entire app

### Database Schema
Prisma schema includes standard NextAuth models:
- **User**: Core user data with optional password hash for credentials auth
- **Account**: OAuth account linking
- **Session**: User sessions
- **VerificationToken**: Email verification

### Component Structure
- **Layout**: Root layout with session provider and Geist fonts
- **Pages**: 
  - Home (`/`): Landing page for logged-out users, dashboard for authenticated users
  - Login (`/login`): Authentication form
  - Signup (`/signup`): User registration
- **Components**:
  - `dashboard/navbar.tsx`: Top navigation bar
  - `dashboard/sidebar.tsx`: Left sidebar with user info
  - `repo-card.tsx`: Reusable repository card component
  - `session-provider.tsx`: NextAuth session wrapper

### Styling System
- Dark theme with GitHub-inspired color scheme (`#010409`, `#0d1117`)
- Responsive design with mobile-first approach
- Custom gradients and hover states
- Font system using Geist Sans and Geist Mono

### Key Files
- `src/lib/auth.ts`: NextAuth configuration
- `src/lib/prisma.ts`: Database client setup
- `src/lib/languageColors.ts`: Programming language color mappings
- `colors.json`: Extended color definitions
- `prisma/schema.prisma`: Database schema

## Project Structure Notes
- Uses `@/` path alias for `src/` directory
- API routes in `src/app/api/`
- Components organized by feature (dashboard, shared)
- Turbopack enabled for faster development builds