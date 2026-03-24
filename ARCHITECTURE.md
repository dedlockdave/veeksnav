# VeeksNav - Architecture Guide

> **For AI agents**: Read this file first when spinning up on this repo. It gives you everything you need to navigate, understand, and modify the codebase effectively.

## What Is This Project?

A content review dashboard for analyzing bodycam footage and police interaction videos. Reviewers watch clips, score officer conduct across multiple dimensions, manage clip edits (trim/adjust), write post drafts for publication, and track review status. Built for law enforcement training professionals.

## Tech Stack at a Glance

| Layer | Technology |
|---|---|
| Framework | SvelteKit 2.50 (Svelte 5.54 with runes) |
| Language | TypeScript 5.9 (strict) |
| Build | Vite 7.3 |
| Styling | Tailwind CSS 4.2 (dark theme, zinc/indigo) |
| State | localStorage + file-based server sync |
| Deploy | Vercel (adapter-vercel) |
| Database | None - hybrid localStorage + .data/ JSON files |

## Directory Map

```
veeksnav/
├── ARCHITECTURE.md             # THIS FILE
├── package.json                # Dependencies + scripts
├── svelte.config.js            # SvelteKit + Vercel adapter
├── vite.config.ts              # Vite + Tailwind + SvelteKit
├── tsconfig.json               # Strict TypeScript
│
├── src/
│   ├── app.html                # HTML shell
│   ├── app.css                 # Global styles (Tailwind import)
│   ├── app.d.ts                # App-level type declarations
│   │
│   ├── routes/
│   │   ├── +page.svelte        # Landing page (/)
│   │   ├── +layout.svelte      # Root layout (Nav + main container)
│   │   ├── videos/
│   │   │   ├── +page.svelte    # Video grid/list (/videos)
│   │   │   └── [id]/
│   │   │       ├── +page.svelte  # Video review interface (/videos/:id)
│   │   │       └── +page.ts      # Page loader (finds video by ID)
│   │   └── api/
│   │       └── reviews/
│   │           └── [videoId]/
│   │               └── +server.ts  # GET/PUT review state
│   │
│   └── lib/
│       ├── types.ts            # All TypeScript interfaces
│       ├── index.ts            # Lib exports
│       │
│       ├── components/
│       │   ├── Nav.svelte          # Top navigation bar
│       │   ├── VideoCard.svelte    # Video thumbnail card (grid view)
│       │   ├── ScoreBar.svelte     # 0-10 score visualization bar
│       │   ├── ClipCard.svelte     # Clip display with controls
│       │   ├── ClipEditor.svelte   # In-video clip editor (trim timeline)
│       │   └── PostDraftCard.svelte # Post draft preview + copy-to-clipboard
│       │
│       ├── data/
│       │   └── videos.ts          # HARDCODED video/clip data array
│       │
│       └── stores/
│           └── reviewStore.ts     # Review state management
│
├── static/
│   ├── robots.txt
│   └── videos/                 # Video files (static or external URLs)
│
└── .data/                      # Server-side review persistence
    └── reviews/
        └── [videoId].json      # Per-video review snapshots
```

## Data Architecture

### No Traditional Database

Video content is **hardcoded** in `src/lib/data/videos.ts` as a typed array. Each Video object includes all clips, analysis scores, teachable moments, and post drafts inline.

### Hybrid Persistence for Review State

Review progress uses a two-tier storage approach:

```
User interaction → reviewStore.saveReview()
  ├──→ localStorage (instant, key: 'veeksnav-reviews')
  └──→ PUT /api/reviews/[videoId] (async server sync → .data/reviews/[videoId].json)

Page load → reviewStore.loadReview()
  ├──→ Try localStorage first
  └──→ Fallback: GET /api/reviews/[videoId] (from .data/ files)
```

### Core Data Types (lib/types.ts)

```
Video
  ├── id, title, description, sourceUrl, thumbnail, duration, tags
  ├── status: 'review' | 'approved' | 'rejected' | 'posted'
  ├── analysis: VideoAnalysis
  │     ├── summary
  │     ├── scorecard (6 scored dimensions, 0-10 each)
  │     ├── teachableMoments[]
  │     └── postDrafts[]
  └── clips: Clip[]
        ├── id, title, description, assessment
        ├── startSeconds, endSeconds, url
        ├── rating, status
        └── (editable via ClipEditor)

VideoReviewState
  ├── videoId, videoStatus
  ├── clipStatuses: Record<clipId, status>
  ├── clipEdits: Record<clipId, ClipEdit>
  └── updatedAt
```

## Routes & Views

| Route | Component | Purpose |
|---|---|---|
| `/` | Landing | Hero section with link to start reviewing |
| `/videos` | Video grid | Browse all videos, see status badges and scores |
| `/videos/[id]` | Review interface | Main workspace: video player, clip list, scorecard, post drafts, clip editor |

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/reviews/[videoId]` | Retrieve saved review state (fallback for localStorage) |
| `PUT` | `/api/reviews/[videoId]` | Persist review state to .data/ directory |

The PUT handler sanitizes filenames to prevent path traversal and validates videoId matches.

## Key Components

- **VideoCard**: Thumbnail grid card showing title, description, overall score, tags, status
- **ScoreBar**: Color-coded progress bar for 0-10 scores (red→yellow→green)
- **ClipCard**: Individual clip with video preview, metadata, action buttons
- **ClipEditor**: Frame-level trim editor with timeline visualization and preview
- **PostDraftCard**: Social media draft with copy-to-clipboard functionality

## Commands

```bash
npm install
npm run dev      # Dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run check    # TypeScript + svelte-check
```

## Key Patterns

1. **Hardcoded content**: All video data is in `data/videos.ts` - no CMS or external source
2. **localStorage-first**: Review state saves instantly client-side, syncs to server async
3. **File-based server storage**: `.data/reviews/` contains JSON snapshots (gitignored)
4. **SvelteKit conventions**: `+page.svelte` for UI, `+page.ts` for data loading, `+server.ts` for API
5. **Svelte 5 runes**: Uses `$state`, `$derived`, `$effect` - not legacy reactive syntax
6. **Dark theme**: Zinc/indigo color scheme via Tailwind

## Key Gotchas

1. **Video data is hardcoded** - adding new videos means editing `data/videos.ts`
2. **No auth** - anyone with access can review. Single-user/small-team assumption.
3. **`.data/` directory** must be writable on the server for persistence to work
4. **No tests** - no test framework configured
5. **Svelte 5** - uses runes, not Svelte 4 reactive declarations (`$:`)
6. **localStorage key** is `'veeksnav-reviews'` - collision risk if multiple apps share domain

## If You're Adding Features

- **New video content**: Add to the array in `data/videos.ts` following the Video type
- **New review dimensions**: Extend the scorecard in VideoAnalysis type + update ScoreBar usage
- **Database migration**: Replace `data/videos.ts` with KV/DB reads in `+page.server.ts` loaders
- **Auth**: Would need SvelteKit hooks + session management, touches all server routes
- **New components**: Add to `lib/components/`, import in route pages
