# Public Viewer Floor Map

## Data Source

The public scene route builds floor map data in:

```text
src/app/(frontend)/tour/[tourSlug]/[floorSlug]/[sceneSlug]/page.tsx
```

It reads the tour, current floor, current scene, all scenes on the current floor, and all floors attached to the tour. The client receives:

- `currentFloor.floorplan`
- `currentFloor.mapPoints`
- `tourFloors[].floorplan`
- `tourFloors[].mapPoints`
- each map point's related `scene.slug`

No Payload schema changes are needed for the public floor map.

## Rendering Components

The floor map control is rendered by:

```text
src/components/tour/TourOverlay.tsx
src/components/tour/FloorMapModal.tsx
```

`TourViewer` passes `tourFloors`, `currentFloor`, the active scene slug, route slugs, draft mode, viewer mode, and debug mode into `TourOverlay`. `TourOverlay` renders the existing `FloorMapModal` button in the bottom control cluster.

## Map Point Navigation

`FloorMapModal` displays floor tabs from `tourFloors`. The active floor defaults to the current floor when IDs or slugs match, and falls back to the first floor if no match is found.

Each map point uses its related `scene.slug`. Clicking a non-current point navigates to:

```text
/tour/<tourSlug>/<floorSlug>/<sceneSlug>
```

The modal preserves active query parameters:

- `draft=true`
- `debugHotspots=true`
- `viewer=pannellum`

It does not add `viewer=three`, because Three.js is the default.

## Manual Check

1. Open a public scene with `?debugHotspots=true`.
2. Open the floor map modal.
3. Switch floor tabs if more than one floor exists.
4. Click a map point.
5. Confirm the destination route still includes `debugHotspots=true`.
6. Repeat in draft mode with `?draft=true&debugHotspots=true`.
7. Repeat in fallback mode with `?viewer=pannellum&debugHotspots=true`.
