# Taskly

![Taskly Cover](file:///C:/Users/Number%20One/.cursor/projects/d-Taskly-taskly/assets/c__Users_Number_One_AppData_Roaming_Cursor_User_workspaceStorage_0dc5665260062a0dd1dbb2cfa865e83b_images_a21cc8d5-8e86-43c3-812d-8ab63438072f-ed846694-da43-489b-94d9-646dda9e0061.png)

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
