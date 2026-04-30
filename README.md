# Taskly

Taskly is a project and task management web app built with Next.js (App Router), TypeScript, React Query, and Supabase.

## Features

- Auth flows (login, signup, forgot/reset password)
- Projects management (create, edit, list)
- Task board and list views
- Drag-and-drop task status updates
- Epics and members management
- Invitation flow for joining projects

## Tech Stack

- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- React Query
- NextAuth
- Supabase (REST/RPC)
- dnd-kit (drag & drop)
- shadcn/ui + Radix UI + Sonner

## Project Structure

```txt
src/
  app/                    # Routes and page-level components
  components/             # Shared UI and providers
  lib/
    actions/              # Server actions
    types/                # Shared types
    schemes/              # Zod schemas
```

## Prerequisites

- Node.js 18+ (recommended latest LTS)
- Yarn 1.x

## Environment Variables

Create `.env.local` for local development and `.env.production` for production:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

For production, use:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_nextauth_secret
```

You can start from `.env.production.example`.

## Getting Started

Install dependencies:

```bash
yarn install
```

Run development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `yarn dev` - Start dev server
- `yarn build` - Production build
- `yarn start` - Run production server
- `yarn lint` - Run ESLint

## Quality Checks

Before pushing changes:

```bash
yarn lint
yarn build
```

## Notes

- Type files are organized under feature-level `types` folders and `src/lib/types`.
- The app uses server actions for most data operations against Supabase.
