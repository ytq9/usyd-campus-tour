# USYD Campus Tour

USYD Campus Tour is a Next.js 15 and Payload CMS 3 application for building and publishing interactive campus tours. Editors manage media, scenes, floors, tours, hotspots, and floor map points in Payload. Visitors view a React Three Fiber panorama viewer with scene navigation, info hotspots, draft preview support, and floor-map navigation.

## Tech Stack

- Next.js 15 App Router
- React 19
- Payload CMS 3
- PostgreSQL 16
- Three.js and React Three Fiber
- Tailwind CSS 4 and DaisyUI
- Docker and Docker Compose

## Quick Start With Docker

Install Docker Desktop, then run:

```bash
docker compose up --build
```

Open:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

The first Docker build can take several minutes. Later starts can usually use:

```bash
docker compose up
```

Stop containers while keeping data:

```bash
docker compose down
```

Reset containers and delete database/media volumes:

```bash
docker compose down -v
```

## Local Development

Copy the example environment file and adjust values if needed:

```bash
cp .env.example .env
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

```env
DATABASE_URI=postgresql://localhost:5432/usyd_campus_tour
PAYLOAD_SECRET=your-secret-key-here-change-in-production
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

- `DATABASE_URI` connects Payload to PostgreSQL.
- `PAYLOAD_SECRET` signs Payload auth data.
- `NEXT_PUBLIC_SERVER_URL` is used for Payload live preview URLs.

Do not rename these variables without updating deployment configuration and documentation.

## Commands

```bash
npm run dev
npm run build
npm run start
npm run generate:types
npm run seed
```

Useful direct checks:

```bash
npx tsc --noEmit --pretty false
npx eslint .
```

There is currently no dedicated `lint` or `typecheck` npm script. `npx eslint .` requires an ESLint config to be present.

## First Admin User

On a new database, open [http://localhost:3000/admin](http://localhost:3000/admin). Payload will prompt you to create the first admin account.

The seed script can also create local sample data:

```bash
npm run seed
```

## Folder Structure

```text
src/app/(frontend)        Public Next.js routes
src/app/(payload)         Payload admin and API routes
src/collections           Payload CMS collections
src/components/tour       Public tour UI
src/components/tour/three React Three Fiber panorama viewer
src/components/admin      Custom admin components
src/components/payload    Custom Payload field components
src/seed                  Local seed and reset scripts
docs                      Developer and submission documentation
media                     Local uploaded media folder
```

## Content Model

The main publishing relationship is:

```text
Media -> Scenes -> Floors -> Tours
```

- Media stores panorama, floorplan, and cover images.
- Scenes belong to floors and use a panorama image.
- Floors group scenes, hold floor map points, and point to an initial scene.
- Tours group floors, choose a default floor, and provide the public entry point.

Tours and Scenes support Payload drafts. Floors and Media do not.

## Important Routes

| Purpose | URL |
| --- | --- |
| Tour list | `/` |
| Tour landing page | `/tour/<tourSlug>` |
| Public viewer | `/tour/<tourSlug>/<floorSlug>/<sceneSlug>` |
| Draft preview | `/tour/<tourSlug>/preview` |
| Hotspot debug mode | `/tour/<tourSlug>/<floorSlug>/<sceneSlug>?debugHotspots=true` |
| Draft hotspot debug mode | `/tour/<tourSlug>/<floorSlug>/<sceneSlug>?draft=true&debugHotspots=true` |
| Payload admin | `/admin` |

## Documentation

Start here:

- [Viewer architecture](docs/viewer-architecture.md)
- [Developer guide](docs/developer-guide.md)

Focused debugging notes:

- [Hotspot debugging guide](docs/hotspot-debugging-guide.md)
- [Public viewer floor map](docs/public-viewer-floor-map.md)

## Final Submission Notes

This codebase should preserve the existing application behavior, database schema, Payload collection fields, routes, API contracts, environment variable names, and viewer data model. The final cleanup work is limited to style, readability, comments, and documentation.

Before submission, run:

```bash
npm install
npx tsc --noEmit --pretty false
npm run build
```

Report any remaining errors rather than hiding them.
