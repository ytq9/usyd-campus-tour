# Developer Guide

This guide covers local setup, common commands, environment variables, and safe development boundaries.

## Requirements

- Node.js 22 or a compatible recent Node version.
- npm.
- Docker Desktop, if using Docker Compose.
- PostgreSQL, if running outside Docker.

## Environment Variables

Create a `.env` file from `.env.example` for non-Docker local development.

```env
DATABASE_URI=postgresql://localhost:5432/usyd_campus_tour
PAYLOAD_SECRET=your-secret-key-here-change-in-production
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

Variable notes:

- `DATABASE_URI` is used by Payload's PostgreSQL adapter.
- `PAYLOAD_SECRET` signs Payload auth and should be unique outside local development.
- `NEXT_PUBLIC_SERVER_URL` is used by Payload live preview links.

Do not rename these variables without updating deployment and documentation together.

## Install

```bash
npm install
```

For reproducible CI or Docker builds:

```bash
npm ci
```

## Run With Docker

```bash
docker compose up --build
```

Open:

- Frontend: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`

Docker Compose starts PostgreSQL and the Next.js/Payload app. Uploaded media is stored in the `media_uploads` Docker volume.

## Run Locally Without Docker

Start PostgreSQL and set `DATABASE_URI`, then run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Commands

```bash
npm run dev
npm run build
npm run start
npm run generate:types
npm run seed
```

There is no dedicated `lint` or `typecheck` npm script at the time of writing. Use:

```bash
npx tsc --noEmit --pretty false
npx eslint .
```

`npx eslint .` requires an ESLint config. If no config exists, ESLint will report that setup issue.

## Payload Types

Payload generated types live in `src/payload-types.ts`. Do not edit that file by hand.

After intentional Payload config or collection changes, run:

```bash
npm run generate:types
```

Final cleanup work should not change collection fields or database schema.

## Seeding

`npm run seed` runs `src/seed/index.ts`.

The seed script can import reference data when these files are present:

- `src/seed/data/tour.json`
- `src/seed/data/floorplans/*.json`
- `public/tour/panoramas/`
- `public/tour/floorplan/`

If the reference bundle is missing, it creates a minimal sample tour so local setup remains usable.

## Safe Change Boundaries

For maintenance work, avoid changing:

- Collection field names, field types, or relationship structure.
- Migrations and database schema.
- Public route names.
- API inputs or responses.
- Environment variable names.
- The viewer data model passed into `TourViewer`.

Low-risk cleanup usually includes:

- Removing unused imports or local variables.
- Improving formatting.
- Rewriting comments that explain why a workaround exists.
- Updating docs.
- Removing development-only `console.log` calls from app code.

## Manual Smoke Test

After changes, test:

1. Open `/`.
2. Open a published tour landing page.
3. Start the tour and confirm the panorama renders.
4. Click a scene hotspot.
5. Click an info hotspot.
6. Open the floor map and navigate by map point.
7. Open `/admin`, edit a scene, and confirm the visual hotspot editor loads.
8. Test draft preview with `/tour/<tourSlug>/preview`.
9. Test hotspot debug mode with `?debugHotspots=true`.
