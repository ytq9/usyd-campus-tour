# Viewer Architecture

The public viewer is assembled from a server route, a client wrapper, the React Three Fiber panorama renderer, and DOM overlay controls.

## Data Flow

1. `src/app/(frontend)/tour/[tourSlug]/[floorSlug]/[sceneSlug]/page.tsx` fetches Payload data.
2. The route maps Payload documents into the viewer data model.
3. `TourViewer` receives that model and tracks the active scene slug on the client.
4. `ThreePanoramaViewer` renders the panorama and manages camera movement.
5. `ThreeHotspotLayer` receives projected hotspot screen positions and renders the existing hotspot UI.
6. `TourOverlay`, `HotspotSidebar`, and `FloorMapModal` render visitor controls around the viewer.

The server route deliberately maps Payload data before passing it to the client. This keeps the viewer insulated from Payload document shapes and draft internals.

## Viewer Data Model

The client receives:

- `tour`: title, slug, welcome text.
- `currentFloor`: floor identity, floorplan URL, and map points.
- `currentScene`: current scene identity, panorama URLs, camera values, rotation, and hotspots.
- `floorScenes`: all scenes on the active floor, used for same-floor navigation.
- `tourFloors`: all floors on the tour, used by the floor map.
- `tourSlug`, `floorSlug`, and route slugs.
- `isDraft` and `debugHotspots`.

Do not change this model casually. It is the contract between the route and the viewer components.

## React Three Fiber Boundary

`ThreePanoramaViewer` owns the public R3F `<Canvas>`.

Inside the canvas:

- `PanoramaCameraBridge` connects the R3F camera to the imperative camera state helpers.
- `HotspotProjectionBridge` projects stored pitch/yaw hotspot coordinates each frame.
- `PanoramaSphere` renders the equirectangular texture on an inward-facing sphere.

Outside the canvas:

- Loading and error messages are DOM overlays.
- `ThreeHotspotLayer` renders positioned DOM hotspots.
- The sidebar and floor map remain regular React/DOM UI.

This split keeps the existing button, modal, and rich text behavior while letting R3F own the panorama render loop.

## Camera Controls

`useThreePanoramaControls` stores the camera state as:

- `pitch`
- `yaw`
- `hfov`

Pointer drag changes pitch and yaw. Wheel input changes horizontal field of view. The hook clamps values before applying them to the Three.js camera.

Same-floor scene changes animate through `threeCameraTransition.ts`. Cross-floor scene changes animate the current camera out and then navigate to the new URL.

## Coordinate Convention

The stored CMS values use pitch/yaw degrees:

- `pitch` is vertical. Positive values look up.
- `yaw` is horizontal.
- `yaw = 0` looks along the Three.js negative Z axis.

`threePanoramaMath.ts` centralizes conversions between pitch/yaw, Three.js vectors, screen projection, and raycasted admin clicks.

Scene `rotation` is applied to initial camera display values, but hotspot placement and hotspot focus currently use stored raw pitch/yaw values. Keep this behavior unless the stored hotspot rotation strategy is intentionally changed and migrated.

## Hotspots

Scene hotspots:

- Use `targetScene.slug` and optionally `targetFloor.slug`.
- Navigate within the current floor when the target floor is missing or matches the current floor.
- Navigate by URL when the target floor differs.

Info hotspots:

- Focus the camera before opening the info modal.
- Display `infoContent` rich text text blocks when available.
- Fall back to the hotspot label.

`debugHotspots=true` enables the debug panel for comparing route data, active scene data, and raw hotspot values.

## Admin Hotspot Editor

`ThreeSceneHotspotEditor` uses the same math helpers as the public viewer:

- It loads the selected scene panorama.
- It projects existing hotspot rows into screen positions.
- It raycasts panorama clicks and marker drags back into stored `pitch` and `yaw`.
- It writes values through Payload form dispatch calls.

Payload draft data stores form rows in the admin state before the document is saved. That is why the editor reads live form fields instead of waiting for a saved document.

## Query Preservation

Navigation preserves:

- `draft=true`
- `debugHotspots=true`

This keeps draft preview and hotspot debugging active while moving through portals or the floor map.
