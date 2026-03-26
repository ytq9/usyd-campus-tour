# USYD Campus Tour

A virtual 360° campus tour platform built with Next.js 15, Payload CMS 3, and PostgreSQL.

---

## Prerequisites

Install the following tools before getting started:

### Docker Desktop
Downloads and runs everything automatically (database + app) in isolated containers.

- **Mac**: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) → Download for Mac (Apple Chip or Intel)
- **Windows**: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) → Download for Windows

After installing, open Docker Desktop and make sure it is running (whale icon in the menu bar / system tray).

### Git
Used to download the source code.

- **Mac**: Open Terminal and run `git --version`. If not installed, macOS will prompt you to install it automatically.
- **Windows**: Download from [https://git-scm.com/download/win](https://git-scm.com/download/win) and install with default settings.

---

## Quick Start

### 1. Open a terminal

- **Mac**: Press `Cmd + Space`, type `Terminal`, press Enter.
- **Windows**: Press `Win + R`, type `cmd`, press Enter. (Or use Git Bash installed with Git.)

### 2. Navigate to where you want to store the project

```bash
cd ~/Desktop
```

> You can replace `~/Desktop` with any folder path you prefer.

### 3. Clone the repository

```bash
git clone -b develop https://github.com/ytq9/usyd-campus-tour.git
cd usyd-campus-tour
```

### 4. Start the application

```bash
docker compose up --build
```

This command will:
1. Pull the PostgreSQL 16 image
2. Build the Next.js + Payload CMS application image
3. Start both containers and run database migrations automatically

> First build takes **5–10 minutes** depending on your internet speed. Subsequent starts (without `--build`) are much faster.

You will see the app is ready when the logs show something like:
```
app | ▲ Next.js ready on http://0.0.0.0:3000
```

### 5. Open the application

| Page | URL |
|------|-----|
| Frontend | [http://localhost:3000](http://localhost:3000) |
| Admin panel | [http://localhost:3000/admin](http://localhost:3000/admin) |

---

## First-Time Admin Setup

The first time you open the admin panel, Payload CMS will ask you to create the first admin account:

1. Go to [http://localhost:3000/admin](http://localhost:3000/admin)
2. You will be redirected to the **Create First User** page
3. Enter your email and a password
4. Click **Create**
5. You are now logged in as the administrator

---

## Admin Panel Usage Guide

The admin panel at `/admin` is where you manage all content for the campus tour.

### Collections overview

| Collection | Purpose |
|------------|---------|
| **Tours** | Top-level virtual tours (e.g. "Main Campus Tour") |
| **Floors** | Floors or areas within a tour (e.g. "Ground Floor", "Level 2") |
| **Scenes** | Individual 360° panoramic viewpoints within a floor |
| **Media** | Uploaded images (panoramas, floor plans, thumbnails) |
| **Users** | Admin user accounts |

---

### Creating a Tour

1. In the left sidebar, click **Tours**
2. Click **Create New** (top right)
3. Fill in:
   - **Title** — display name of the tour
   - **Slug** — URL-friendly identifier (auto-generated from title)
   - **Description** — rich text description shown to visitors
   - **Cover Image** — select or upload a thumbnail from Media
4. Click **Save** (or **Save & Publish** to make it visible on the frontend)

---

### Adding Floors to a Tour

1. Click **Floors** in the sidebar
2. Click **Create New**
3. Fill in:
   - **Name** — e.g. "Ground Floor"
   - **Tour** — select the parent tour
   - **Order** — controls the display order (lower number = first)
   - **Floor Plan** *(optional)* — upload a map image for the interactive floor plan
4. Save

---

### Adding Scenes (360° Panoramas)

1. Click **Scenes** in the sidebar
2. Click **Create New**
3. Fill in:
   - **Title** — name of this viewpoint
   - **Floor** — select which floor this scene belongs to
   - **Panorama Image** — upload an equirectangular 360° photo (JPG recommended, min 4000×2000px)
   - **Camera Settings** *(optional)* — adjust initial yaw/pitch/field-of-view
4. **Hotspots** — add navigation points within the panorama:
   - **Scene hotspot** — links to another scene (portal navigation)
   - **Info hotspot** — shows a popup with text/image content
   - Set the pitch and yaw to position the hotspot in the 360° view
5. Save & Publish

---

### Publishing Content

Content with a **Status** field (Tours, Scenes) supports drafts:

- **Draft** — saved but not visible to public visitors
- **Published** — visible on the frontend

Use **Save & Publish** or change the Status field and save to make content live.

---

### Uploading Media

1. Click **Media** in the sidebar
2. Click **Create New**
3. Drag and drop or click to select an image file
4. Click **Save**

Uploaded files are stored in the `media` Docker volume and persist between container restarts.

---

## Stopping and Restarting

**Stop** (keeps data):
```bash
# Press Ctrl+C in the terminal running docker compose, or run:
docker compose down
```

**Restart** (without rebuilding):
```bash
docker compose up
```

**Full reset** (deletes all data including the database):
```bash
docker compose down -v
docker compose up --build
```

---

## Troubleshooting

| Problem | Solution |
|---------|---------|
| Port 3000 already in use | Stop other services using port 3000, or change `"3000:3000"` to `"3001:3000"` in `docker-compose.yml` |
| Port 5433 already in use | Change `"5433:5432"` to another port in `docker-compose.yml` |
| Docker not found | Make sure Docker Desktop is running (check the taskbar/menu bar icon) |
| `git clone` fails | Check your internet connection; or download the ZIP from GitHub directly |
| Admin page shows error after first start | Wait ~30 seconds for the database migrations to complete, then refresh |

---

## Tech Stack

- **Frontend / Backend**: [Next.js 15](https://nextjs.org) (App Router)
- **CMS**: [Payload CMS 3](https://payloadcms.com)
- **Database**: PostgreSQL 16
- **360° Viewer**: [Pannellum](https://pannellum.org)
- **Deployment**: Docker + Docker Compose
