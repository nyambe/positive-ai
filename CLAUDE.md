# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a real-time chat application called "Chato" that uses AI to transform potentially negative messages into positive ones before displaying them to other users. The goal is to create a conflict-free chat environment while preserving authentic human interaction.

## Tech Stack

- **Nuxt 3** with Nuxt UI v3 for the frontend
- **NuxtHub** for deployment on Cloudflare Edge with built-in AI capabilities
- **Cloudflare Workers AI** for message transformation
- **pnpm** as the package manager
- **TypeScript** with ESLint for code quality

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server (http://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Run linting
pnpm lint

# Preview production build locally
pnpm preview

# Deploy to NuxtHub/Cloudflare
pnpm deploy
```

## Architecture

### Directory Structure
- `app/` - Nuxt 3 application directory
  - `app.vue` - Root layout component
  - `pages/` - File-based routing pages
- `server/` - Nitro server directory
  - `api/` - API routes
- `public/` - Static assets
- `docs/` - Project documentation and planning

### Key Configuration
- Uses Nuxt 4 compatibility mode (`future.compatibilityVersion: 4`)
- ESLint configured with single quotes and no trailing commas
- Runtime config supports `NUXT_PUBLIC_HELLO_TEXT` environment variable
- NuxtHub integration for Cloudflare deployment

### Planned Features
Based on the project documentation, the app will include:
- Real-time WebSocket chat functionality
- AI message transformation using Cloudflare Workers AI
- Simple localStorage-based user name persistence
- Single shared chat room

## Nuxt UI v3 Notes

This project uses Nuxt UI v3 which has breaking changes from v2. Always check the migration guide when working with UI components: https://ui.nuxt.com/getting-started/migration

## TypeScript Configuration

The project uses Nuxt's auto-generated TypeScript configuration. Server-side code extends from `.nuxt/tsconfig.server.json`.

## Deployment

The application is designed to deploy on Cloudflare Edge using NuxtHub. Use `pnpm deploy` to deploy to production.