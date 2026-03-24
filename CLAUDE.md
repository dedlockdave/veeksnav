# VeeksNav - Development Guide

> **New here?** Start with [ARCHITECTURE.md](./ARCHITECTURE.md) for the full system overview, data model, and directory map.

## Quick Start

```bash
npm install
npm run dev    # Dev server
```

No environment variables needed. Video data is hardcoded in `src/lib/data/videos.ts`.

## Key Details

- **SvelteKit 2** with Svelte 5 runes (`$state`, `$derived`, `$effect`) - not legacy `$:` syntax
- **No database** - localStorage for review state, `.data/` directory for server-side backup
- **Dark theme** (zinc/indigo) - maintain this when adding components
- **TypeScript strict** - run `npm run check` before committing
- Video content is hardcoded in `src/lib/data/videos.ts` (no CMS)

## Adding New Videos

Edit `src/lib/data/videos.ts` and add a new entry to the videos array following the `Video` type interface defined in `src/lib/types.ts`.

## Deploy

```bash
npm run build
# Deployed via Vercel (auto-detected SvelteKit)
```
