# Pannellum to Three.js Migration Plan

## Executive Summary

The current frontend viewer is a Next.js App Router experience backed by Payload CMS. Pannellum is isolated mostly to the public panorama renderer and two admin editor tools:

- Public tour viewer: `src/components/tour/PannellumViewer.tsx`
- Admin initial camera preview: `src/components/admin/PanoramaValidationPreview.tsx`
- Admin hotspot coordinate picker: `src/components/HotspotPicker.tsx`

Most routing, Payload data fetching, scene metadata, hotspot content, floor maps, and overlay UI can stay intact during a Three.js migration. The risky part is the rendering contract currently provided by Pannellum: equirectangular projection, pointer controls, converting screen clicks to pitch/yaw, projecting pitch/yaw hotspots back to screen coordinates, scene switching, and viewer lifecycle cleanup.

Recommended safe approach: build a viewer-only Three.js prototype first using the existing `sceneData` shape and one panorama at a time. After that is stable, migrate hotspot rendering and navigation. Admin tools should be migrated later, after the public viewer math is proven.

## Current Pannellum Frontend Structure

### Public Routes

The frontend route group lives under `src/app/(frontend)`.

| Route | File | Responsibility |
| --- | --- | --- |
| `/` | `src/app/(frontend)/page.tsx` | Lists published tours. |
| `/tour/[tourSlug]` | `src/app/(frontend)/tour/[tourSlug]/page.tsx` | Published tour landing page. Finds the default floor and initial scene, then links to the scene route. |
| `/tour/[tourSlug]/preview` | `src/app/(frontend)/tour/[tourSlug]/preview/page.tsx` | Payload live preview route. Loads draft tour data and redirects to the default scene route with `?draft=true`. |
| `/tour/[tourSlug]/[floorSlug]/[sceneSlug]` | `src/app/(frontend)/tour/[tourSlug]/[floorSlug]/[sceneSlug]/page.tsx` | Main panorama viewer route. Fetches CMS data, flattens it, and renders `TourViewer`. |

The viewer route is marked `dynamic = 'force-dynamic'`, so it fetches current Payload data per request.

### Public Viewer Component Tree

```text
SceneViewerPage
  -> TourViewer
    -> TransitionProvider
      -> PannellumViewer
        -> Pannellum runtime
        -> HotspotButton
          -> InfoHotspot
        -> SceneTransition
      -> TourOverlay
        -> HotspotSidebar
        -> FloorMapModal
      -> WelcomeModal
      -> TransitionSelector
```

`PannellumViewer` owns the 360 renderer. `TourViewer` owns current-scene state and keeps the overlay in sync. `TourOverlay`, `HotspotSidebar`, and `FloorMapModal` are ordinary React UI layered above the viewer.

### CMS Collections That Feed the Viewer

| Collection | File | Viewer-relevant fields |
| --- | --- | --- |
| `tours` | `src/collections/Tours.ts` | `title`, `slug`, `coverImage`, `welcomeTitle`, `welcomeText`, `defaultFloor`, `floors`, draft/published status. |
| `floors` | `src/collections/Floors.ts` | `name`, `slug`, `tour`, `floorplan`, `initialScene`, `order`, `mapPoints`. |
| `scenes` | `src/collections/Scenes.ts` | `title`, `slug`, `floor`, `description`, `panorama`, `initialYaw`, `initialPitch`, `initialHfov`, `rotation`, `hotspots`, draft/published status. |
| `media` | `src/collections/Media.ts` | Upload URL, dimensions, preview and thumbnail image sizes. |

`tours` and `scenes` use the `publishedOrAdmin` access helper. Anonymous users see published documents. Authenticated admin users can read drafts. The scene route also passes Payload's `draft` flag when `?draft=true` is present.

## Important Files and Responsibilities

### Public Viewer

`src/app/(frontend)/tour/[tourSlug]/[floorSlug]/[sceneSlug]/page.tsx`

- Reads `tourSlug`, `floorSlug`, `sceneSlug`, and optional `draft=true`.
- Fetches the tour, current floor, current scene, all scenes on the current floor, and all floors attached to the tour.
- Converts Payload relationship/upload fields into a serializable `sceneData` object.
- Provides `panoramaUrl`, `previewUrl`, initial camera values, hotspots, floor map points, and draft state to `TourViewer`.

`src/components/tour/TourViewer.tsx`

- Client-side shell for the tour experience.
- Stores `currentSceneSlug`.
- Derives `currentScene` from `data.floorScenes`.
- Passes all same-floor scenes to `PannellumViewer`.
- Passes current scene metadata and hotspots to `TourOverlay`.
- Wraps the viewer in `TransitionProvider`.

`src/components/tour/PannellumViewer.tsx`

- Dynamically imports `pannellum/build/pannellum.css` and `pannellum/build/pannellum.js` in the browser.
- Builds a Pannellum multi-scene config from `scenes`.
- Loads panorama images with `type: 'equirectangular'` and `panorama: scene.panoramaUrl`.
- Applies initial camera values through `yaw`, `pitch`, and `hfov`.
- Converts CMS hotspots into Pannellum `hotSpots`.
- Uses `createTooltipFunc` and `createRoot` to render React hotspot UI inside Pannellum hotspot DOM nodes.
- Handles same-floor scene changes with `pannellumRef.current.loadScene(targetSlug)`.
- Handles cross-floor scene changes with `window.location.assign(...)`.
- Disables Pannellum's built-in scene fade and uses the custom `SceneTransition` overlay.
- Destroys the Pannellum instance on unmount.

`src/components/tour/HotspotButton.tsx`

- Renders scene portal hotspots and delegates info hotspots to `InfoHotspot`.
- Stops event propagation so Pannellum drag/click handling does not swallow hotspot actions.
- Reads `hotspot.targetScene.slug` and `hotspot.targetFloor.slug`.
- Calls the viewer navigation callback with click coordinates for transition effects.

`src/components/tour/InfoHotspot.tsx`

- Renders an info marker.
- Opens a DaisyUI dialog with the hotspot label and `infoContent`.

`src/components/tour/TourOverlay.tsx`

- Renders the title/description top overlay.
- Renders `HotspotSidebar`.
- Renders home and floor-map controls.

`src/components/tour/HotspotSidebar.tsx`

- Lists hotspots for the current scene.
- Scene hotspots navigate to a target scene or floor.
- Info hotspots attempt to call `window.pannellumViewer.lookAt(...)` if a global viewer exists.
- Note: `PannellumViewer` currently keeps its instance in a React ref and does not visibly assign `window.pannellumViewer` in this code path. That means sidebar same-floor scene navigation may fall back to full route navigation unless something else assigns the global at runtime.

`src/components/tour/FloorMapModal.tsx`

- Shows floor tabs, floorplan images, and SVG map points.
- Navigates to `/tour/[tourSlug]/[floorSlug]/[sceneSlug]`.
- Preserves `?draft=true`.

`src/components/tour/transition/*`

- Provides renderer-independent transition state and overlay effects.
- `PannellumViewer` calls `startTransition` and performs the actual scene switch at the transition midpoint.
- This can likely be reused with Three.js.

`src/styles/globals.css`

- Contains Pannellum-specific style overrides for `.pnlm-*` classes.
- Contains renderer-independent transition and hotspot styles.

`src/types/pannellum.d.ts`

- Declares Pannellum CSS/JS modules and `window.pannellum`.
- Also declares `window.pannellumViewer`.

### Admin Pannellum Tools

`src/components/admin/PanoramaValidationPreview.tsx`

- Attached after the `panorama` upload field in `Scenes.ts`.
- Fetches selected media from `/api/media/[id]`.
- Validates that the image is 2:1 equirectangular.
- Creates a Pannellum preview for valid images.
- Lets editors click or drag a marker to set `initialPitch`, `initialYaw`, and `initialHfov`.
- Uses Pannellum APIs such as `mouseEventToCoords`, `addHotSpot`, `removeHotSpot`, and `getHfov`.

`src/components/HotspotPicker.tsx`

- Attached as a UI field inside each scene hotspot row.
- Reads the current scene `panorama` field from the Payload form.
- Fetches `/api/media/[id]` when needed to resolve a panorama URL.
- Opens an embedded Pannellum viewer.
- Lets editors click the panorama to set hotspot `pitch` and `yaw`.
- Lets editors drag a marker by using an overlay element and Pannellum's `mouseEventToCoords`.

## How the Current Viewer Works

### Route Structure

The public viewer starts at `/tour/[tourSlug]`, which loads only published tour data and computes the initial scene from `tour.defaultFloor.initialScene`.

The actual 360 experience lives at:

```text
/tour/[tourSlug]/[floorSlug]/[sceneSlug]
```

Draft preview uses:

```text
/tour/[tourSlug]/preview
  -> /tour/[tourSlug]/[defaultFloorSlug]/[initialSceneSlug]?draft=true
```

Cross-floor navigation also uses full route changes to this same scene route. Same-floor portal navigation stays inside the mounted Pannellum instance.

### Data Flow From CMS/API to Viewer

1. Payload collections define the content model:
   - Tour owns floors and the default starting floor.
   - Floor owns its floorplan, initial scene, and floor map points.
   - Scene owns its panorama media, initial camera, and hotspots.
   - Media owns image URL, dimensions, and generated preview/thumbnail sizes.

2. The scene route calls Payload's local API on the server:
   - `payload.find({ collection: 'tours', where: { slug }, depth: 2, draft: isDraft })`
   - `payload.find({ collection: 'floors', where: { slug }, depth: 1 })`
   - `payload.find({ collection: 'scenes', where: { slug }, depth: 2, draft: isDraft })`
   - `payload.find({ collection: 'scenes', where: { floor: floor.id }, depth: 2, draft: isDraft })`
   - `payload.findByID({ collection: 'floors', id, depth: 1 })` for each tour floor

3. The route flattens Payload documents into `sceneData`:
   - Upload relationships become direct media URLs.
   - Scene relationships become `{ slug, title }` objects.
   - Floor relationships become `{ slug }` objects.
   - Hotspots retain `type`, `pitch`, `yaw`, `text`, target scene/floor, info content, and icon fields.

4. `TourViewer` receives `sceneData` and manages current-scene UI state.

5. `PannellumViewer` receives `data.floorScenes`, converts them into Pannellum scene definitions, and mounts the viewer.

### Panorama Image Loading

Public panorama URLs come from the Payload `scene.panorama` upload relationship:

```ts
panoramaUrl: scene.panorama && typeof scene.panorama === 'object'
  ? (scene.panorama.url ?? '')
  : ''
```

`PannellumViewer` passes each URL directly to Pannellum:

```ts
{
  type: 'equirectangular',
  panorama: scene.panoramaUrl,
  yaw: scene.initialYaw,
  pitch: scene.initialPitch,
  hfov: scene.initialHfov,
}
```

The current public viewer uses the original media URL, not the generated `preview` image size. The `previewUrl` is prepared in route data but is not currently used by `PannellumViewer`.

Validation happens before content reaches the public viewer:

- `Scenes.ts` rejects non-2:1 images in a `beforeChange` hook.
- `PanoramaValidationPreview.tsx` also validates selected media in the admin UI.

### Hotspot Rendering

Hotspots are stored in `Scenes.ts` as an array with:

- `type`: `scene` or `info`
- `pitch`
- `yaw`
- `text`
- `targetScene`
- `targetFloor`
- `infoContent`
- `cssClass`
- `iconColor`
- `iconSize`

`PannellumViewer` filters out hotspots missing pitch/yaw and maps the rest to Pannellum `hotSpots`. Each hotspot gets:

- `type`: Pannellum `scene` for scene hotspots, `info` for info hotspots
- `pitch`
- `yaw`
- `text`
- `sceneId`: target scene slug
- `createTooltipFunc`: React tooltip renderer
- `createTooltipArgs`: original hotspot data plus current floor slug

The tooltip renderer clears Pannellum's default click handling, disables pointer events on the Pannellum hotspot wrapper, then mounts a React `HotspotButton` inside the hotspot element.

This gives the app React-controlled hotspot visuals while Pannellum still owns pitch/yaw projection and hotspot DOM placement.

### Scene, Floor, and Tour Navigation

Scene navigation has two paths:

1. Same-floor portal
   - `HotspotButton` calls the `onNavigate` callback.
   - `PannellumViewer` starts the custom transition.
   - At transition midpoint, it calls `pannellumRef.current.loadScene(targetSlug)`.
   - It updates `TourViewer` through `onSceneChange(targetSlug)`.
   - The browser URL does not change for same-floor Pannellum scene changes.

2. Cross-floor portal
   - `HotspotButton` calls the `onNavigate` callback with a `targetFloorSlug`.
   - `PannellumViewer` starts the custom transition.
   - At transition midpoint, it navigates to:

```text
/tour/[tourSlug]/[targetFloorSlug]/[targetSceneSlug]
```

   - If draft mode is active, it appends `?draft=true`.

The floor map always navigates by URL. It does not use the internal Pannellum scene switch.

The tour landing page links to the default floor's initial scene. The home button inside the overlay links back to `/tour/[tourSlug]`.

### Preview and Draft Mode

Payload live preview is configured in `src/payload.config.ts` for the `tours` collection:

```text
/tour/[tourSlug]/preview
```

The preview route:

- Fetches the tour with `draft: true`.
- Finds the default floor and initial scene.
- Redirects to the scene route with `?draft=true`.

The scene route reads `draft=true` and passes `draft: isDraft` into tour and scene queries. The `isDraft` flag is also passed to client components so same-floor/cross-floor/floor-map navigation can preserve draft mode.

## What Can Stay the Same With Three.js

The migration can preserve these parts:

- Public route structure, including `/tour/[tourSlug]/[floorSlug]/[sceneSlug]`.
- Payload collections and field names.
- Server-side data fetching in the scene route.
- The flattened `sceneData` contract, at least for the first prototype.
- `TourViewer` as the client shell.
- `TourOverlay`, `InfoHotspot`, `FloorMapModal`, and most of `HotspotSidebar`.
- Draft preview routing and `?draft=true` propagation.
- Scene transition provider and transition overlay.
- CMS validation that panorama images are 2:1.
- Hotspot data model: `pitch`, `yaw`, `type`, `text`, target scene/floor, info content.
- Floor map data model and navigation.

These are app concerns rather than renderer concerns.

## What Needs to Be Replaced

These parts are Pannellum-specific and need a Three.js equivalent:

- Dynamic imports of `pannellum/build/pannellum.css` and `pannellum/build/pannellum.js`.
- Calls to `window.pannellum.viewer(...)`.
- Pannellum scene config format.
- Pannellum multi-scene `loadScene`.
- Pannellum hotspot config and `createTooltipFunc`.
- Pannellum's pitch/yaw to DOM placement.
- Pannellum's `mouseEventToCoords`.
- Pannellum controls for drag, touch, wheel zoom, and field-of-view limits.
- Pannellum lifecycle methods such as `destroy`, `addHotSpot`, and `removeHotSpot`.
- `.pnlm-*` CSS overrides in `globals.css`.
- `src/types/pannellum.d.ts`.
- Admin preview/picker implementations that rely on Pannellum coordinate math.

Three.js must provide or support:

- A WebGL scene with an inverted sphere or cube mesh.
- Equirectangular texture loading.
- Camera orientation initialized from `initialYaw`, `initialPitch`, and `initialHfov`.
- Pointer drag/touch controls.
- Wheel/pinch zoom mapped to camera FOV.
- Conversion from CMS pitch/yaw to 3D direction vectors.
- Projection from 3D vectors to 2D overlay positions for React hotspots.
- Raycasting or equivalent math to convert a screen click back to pitch/yaw.
- Explicit texture/material disposal on scene changes and unmount.

## Step-by-Step Migration Plan

### Phase 0: Baseline and Boundaries

1. Keep production Pannellum viewer unchanged.
2. Document current public and admin behavior.
3. Decide whether the first Three.js prototype uses raw `three` directly or a React wrapper later.
4. Do not change Payload schemas during the prototype.
5. Do not migrate admin tools until the public viewer math is proven.

### Phase 1: Viewer-Only Prototype

Create a separate prototype component, for example:

```text
src/components/tour/three/ThreePanoramaPrototype.tsx
```

Prototype goals:

- Accept one scene with the existing `panoramaUrl`, `initialYaw`, `initialPitch`, and `initialHfov`.
- Render the equirectangular image on the inside of a sphere.
- Support drag-to-look and wheel zoom.
- Match Pannellum's coordinate conventions as closely as possible.
- Dispose renderer, geometry, material, and texture on unmount.
- Hide all hotspots initially.

Success criteria:

- Same panorama loads in the same route context.
- Initial camera faces the same direction as Pannellum for several sample scenes.
- Drag and zoom feel acceptable on desktop and touch.
- No production route switches to the prototype yet.

### Phase 2: Scene Switching Prototype

Add same-floor scene switching to the prototype:

- Reuse `data.floorScenes`.
- Keep `TourViewer` current scene state.
- Replace Pannellum `loadScene` with a Three.js texture swap or scene reload function.
- Integrate with `useSceneTransition` by changing texture at the transition midpoint.
- Preserve cross-floor URL navigation.

Success criteria:

- Same-floor scene changes work without route reload.
- Cross-floor scene changes keep using existing URLs.
- Draft mode remains preserved.
- Old textures are disposed when switching scenes.

### Phase 3: Hotspot Projection Prototype

Render hotspots as React overlays above the Three.js canvas:

- Convert pitch/yaw to a normalized 3D direction vector.
- Project that vector through the Three.js camera to screen coordinates.
- Hide hotspots behind the camera or outside the viewport.
- Reuse `HotspotButton` and `InfoHotspot` where possible.
- Keep hotspot click handling in React.

Success criteria:

- Existing CMS hotspot coordinates appear at the same visual locations.
- Hotspot buttons remain clickable while dragging the viewer remains smooth.
- Info modals and portal navigation still work.

### Phase 4: Hotspot Interaction and Sidebar Parity

Add viewer control methods needed by the sidebar and any future UI:

- `lookAt(pitch, yaw, hfov?, duration?)`
- `loadScene(sceneSlug)`
- `getCameraState()`
- Optional global or context-based viewer API to replace `window.pannellumViewer`.

Prefer a React ref/context API over a window global for new code, but keep an adapter during migration if the sidebar needs compatibility.

Success criteria:

- Sidebar scene navigation works.
- Sidebar info hotspots can rotate the camera to the target.
- Existing overlay controls do not need renderer-specific branches.

### Phase 5: Route-Level Opt-In

Introduce a controlled opt-in path before replacing production Pannellum:

- Feature flag, query param, or separate preview route.
- Example: `?viewer=three` for internal testing.
- Compare Pannellum and Three.js behavior on the same CMS scenes.

Success criteria:

- Pannellum remains the default.
- Three.js can be tested safely with real CMS content.
- QA can compare image orientation, hotspots, navigation, and mobile controls.

### Phase 6: Admin Tool Migration

After public viewer parity is strong, migrate admin tools:

- Replace `PanoramaValidationPreview` Pannellum preview with a shared Three.js preview component.
- Replace `HotspotPicker` coordinate picking with shared screen-to-pitch/yaw math.
- Keep existing Payload field writes unchanged.
- Keep server-side 2:1 validation unchanged.

Success criteria:

- Editors can still set initial camera values.
- Editors can still place and drag hotspot markers.
- Saved pitch/yaw values remain compatible with the public viewer.

### Phase 7: Remove Pannellum

Only after production parity:

- Remove Pannellum imports.
- Remove Pannellum dependency and type dependency.
- Remove `src/types/pannellum.d.ts`.
- Remove or replace `.pnlm-*` CSS.
- Remove any Pannellum global usage.
- Update docs and README references.

## Risks and Complexity

### Coordinate Compatibility

This is the highest-risk area. Existing CMS content depends on Pannellum's interpretation of pitch and yaw. Three.js must match that convention or include a compatibility transform. The `rotation` scene field currently exists in route data but is not applied in `PannellumViewer`; decide whether Three.js should continue ignoring it initially for parity.

### Hotspot Projection

Pannellum currently handles DOM hotspot placement. Three.js will need explicit math to convert pitch/yaw to screen coordinates every frame or whenever the camera changes. This affects performance, correctness, and clickability.

### Pointer and Touch Controls

Pannellum provides mature panorama interactions. A custom Three.js viewer must handle:

- Mouse drag
- Touch drag
- Wheel zoom
- Mobile viewport changes
- FOV limits
- Preventing hotspots and overlays from fighting with drag gestures

### Texture Loading and Memory

Large 360 images can be expensive in WebGL. The Three.js version must dispose old textures/materials and handle load errors. Consider later improvements such as preview-first loading, downscaled mobile textures, or tiled panoramas if needed.

### Admin Parity

The admin tools rely heavily on `mouseEventToCoords`, `addHotSpot`, and marker DOM behavior. Rebuilding these with Three.js is doable but should not be mixed into the first public viewer prototype.

### URL State

Same-floor scene changes currently update React state but not the browser URL. A migration should preserve that behavior at first for parity. Any decision to sync same-floor changes to the URL should be treated as a separate product change.

### Existing Sidebar Global

`HotspotSidebar` references `window.pannellumViewer`, but the current public viewer code stores the Pannellum instance in `pannellumRef`. A Three.js migration is a good time to replace this with a deliberate viewer API, but the first prototype should avoid broad overlay refactors.

## Recommended Safe Approach

Use a two-stage migration:

1. Viewer-only prototype first.
2. Hotspot migration second.

The first milestone should prove only:

- The current panorama image URL loads into Three.js.
- Initial pitch/yaw/hfov are interpreted correctly.
- Drag and zoom controls work.
- Scene switching can swap panoramas without leaking WebGL resources.

The second milestone should add:

- Hotspot projection from existing CMS pitch/yaw.
- Reuse of `HotspotButton` and `InfoHotspot`.
- Same-floor and cross-floor navigation parity.
- Sidebar camera APIs.

This keeps the riskiest renderer math isolated before touching the user-facing hotspot workflow.

## Example Three.js Component Structure

This is a suggested structure only. Do not implement it until the prototype phase starts.

```text
src/components/tour/three/
  ThreePanoramaViewer.tsx
  ThreeHotspotLayer.tsx
  threePanoramaMath.ts
  useThreePanoramaControls.ts
  useThreeSceneTexture.ts
  types.ts
```

Possible responsibilities:

`ThreePanoramaViewer.tsx`

- Own canvas container and Three.js renderer lifecycle.
- Create scene, camera, inverted sphere geometry, and material.
- Load the active scene texture.
- Expose a small viewer API: `loadScene`, `lookAt`, `getCameraState`.
- Integrate `SceneTransition`.

`ThreeHotspotLayer.tsx`

- Render React hotspot components above the canvas.
- Receive projected screen positions from viewer math.
- Hide hotspots that are behind the camera.
- Reuse `HotspotButton` and `InfoHotspot`.

`threePanoramaMath.ts`

- Convert pitch/yaw to direction vectors.
- Convert direction vectors to pitch/yaw.
- Convert screen coordinates to pitch/yaw via camera raycasting.
- Convert camera FOV to and from the current CMS `initialHfov` values.
- Centralize any Pannellum compatibility offsets.

`useThreePanoramaControls.ts`

- Handle mouse/touch drag.
- Handle wheel/pinch zoom.
- Clamp pitch and FOV.
- Emit camera updates so hotspots can re-project.

`useThreeSceneTexture.ts`

- Load panorama textures.
- Track loading/error state.
- Dispose previous textures safely.
- Optionally support preview-first loading later.

`types.ts`

- Define renderer-independent scene and hotspot types.
- Keep these aligned with the existing `sceneData` shape.

Example high-level component API:

```tsx
type ThreePanoramaViewerProps = {
  scenes: Scene[]
  initialSceneSlug: string
  tourSlug: string
  floorSlug: string
  isDraft: boolean
  onSceneChange: (sceneSlug: string) => void
}
```

This intentionally mirrors `PannellumViewer` so the first swap can be small and reversible.

## Initial Migration Checklist

- Keep `PannellumViewer` as the production default.
- Add Three.js prototype in a separate folder.
- Use existing `sceneData` without schema changes.
- Start with no hotspots.
- Match initial camera orientation against Pannellum.
- Add scene switching.
- Add hotspot projection.
- Add sidebar/viewer API parity.
- Migrate admin preview and picker later.
- Remove Pannellum only after public and admin parity are verified.
