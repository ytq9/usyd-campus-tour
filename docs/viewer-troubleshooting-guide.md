# Viewer Troubleshooting Guide

This is the primary developer guide for debugging the public panorama viewer, hotspot placement, draft/published data, floor map navigation, and CMS picker behavior.

## Quick Overview

The public scene route defaults to the Three.js viewer:

```text
/tour/<tourSlug>/<floorSlug>/<sceneSlug>
```

The Pannellum public viewer remains available as a fallback:

```text
/tour/<tourSlug>/<floorSlug>/<sceneSlug>?viewer=pannellum
```

Payload `Scenes` still store the same fields: panorama upload, initial camera values, rotation, and hotspot pitch/yaw. Viewer debugging should start by checking what data the route sends to the client before changing projection math or CMS data.

The CMS/admin picker is currently a Three.js prototype:

- Hotspot placement uses `src/components/admin/three/ThreeHotspotPicker.tsx`.
- Initial camera placement uses `src/components/admin/three/ThreeInitialViewPicker.tsx`.
- The old Pannellum admin picker files remain in the repo as rollback options.

For this prototype, the CMS picker saves raw pitch/yaw/HFOV values and ignores `scene.rotation`. Public hotspot rendering also ignores `scene.rotation`. Public initial camera display currently still applies `scene.rotation`, so non-zero rotation scenes need extra care when comparing initial view behavior.

## Key Files Map

| Area | Files |
| --- | --- |
| Public scene route and route data | `src/app/(frontend)/tour/[tourSlug]/[floorSlug]/[sceneSlug]/page.tsx` |
| Public viewer selection | `src/components/tour/TourViewer.tsx` |
| Three.js public viewer | `src/components/tour/three/ThreePanoramaViewer.tsx` |
| Three.js hotspot projection | `src/components/tour/three/ThreeHotspotLayer.tsx` |
| Three.js coordinate math | `src/components/tour/three/threePanoramaMath.ts` |
| Three.js camera controls | `src/components/tour/three/useThreePanoramaControls.ts` |
| Three.js texture loading | `src/components/tour/three/useThreeSceneTexture.ts` |
| Pannellum fallback viewer | `src/components/tour/PannellumViewer.tsx` |
| Portal and info hotspot button shell | `src/components/tour/HotspotButton.tsx` |
| Info hotspot modal | `src/components/tour/InfoHotspot.tsx` |
| Info content extraction helpers | `src/components/tour/infoContentText.ts` |
| Hotspot sidebar | `src/components/tour/HotspotSidebar.tsx` |
| Debug panel | `src/components/tour/HotspotDebugPanel.tsx` |
| Overlay and floor map button | `src/components/tour/TourOverlay.tsx` |
| Floor map modal | `src/components/tour/FloorMapModal.tsx` |
| CMS hotspot picker | `src/components/admin/three/ThreeHotspotPicker.tsx` |
| CMS initial camera picker | `src/components/admin/three/ThreeInitialViewPicker.tsx` |
| Shared CMS Three.js picker foundation | `src/components/admin/three/ThreeAdminPanoramaPicker.tsx` |
| CMS panorama media helper | `src/components/admin/three/useAdminPanoramaMedia.ts` |
| Old CMS hotspot picker fallback | `src/components/HotspotPicker.tsx` |
| Old CMS initial camera fallback | `src/components/admin/PanoramaValidationPreview.tsx` |
| Payload Scene schema and admin component wiring | `src/collections/Scenes.ts` |

## Debug Query Parameters

Use these route patterns while testing:

```text
/tour/<tourSlug>/<floorSlug>/<sceneSlug>
/tour/<tourSlug>/<floorSlug>/<sceneSlug>?debugHotspots=true
/tour/<tourSlug>/<floorSlug>/<sceneSlug>?draft=true
/tour/<tourSlug>/<floorSlug>/<sceneSlug>?draft=true&debugHotspots=true
/tour/<tourSlug>/<floorSlug>/<sceneSlug>?viewer=pannellum
/tour/<tourSlug>/<floorSlug>/<sceneSlug>?viewer=pannellum&debugHotspots=true
/tour/<tourSlug>/<floorSlug>/<sceneSlug>?draft=true&viewer=pannellum&debugHotspots=true
```

Parameter behavior:

| Parameter | Meaning |
| --- | --- |
| `debugHotspots=true` | Shows the public debug panel with route slugs, draft state, viewer mode, floor scenes, and raw hotspot data. |
| `draft=true` | Asks the scene route to fetch draft tour and scene data from Payload. |
| `viewer=pannellum` | Uses the old public Pannellum fallback viewer. |
| `viewer=three` | Optional but no longer needed. Three.js is already the default when `viewer=pannellum` is absent. |

Query preservation rules:

- Draft mode should remain active across floor map and portal navigation.
- `debugHotspots=true` should remain active across floor map and portal navigation.
- `viewer=pannellum` should be preserved only while testing the fallback.
- Public links do not add `viewer=three` because Three.js is the default.

## Three.js vs Pannellum Comparison Workflow

Use this when deciding whether a bug is data, draft/publish, image mismatch, or projection.

1. Open the default Three.js route:

```text
/tour/<tourSlug>/<floorSlug>/<sceneSlug>?debugHotspots=true
```

2. Open the Pannellum fallback route:

```text
/tour/<tourSlug>/<floorSlug>/<sceneSlug>?viewer=pannellum&debugHotspots=true
```

3. For draft data, compare:

```text
/tour/<tourSlug>/<floorSlug>/<sceneSlug>?draft=true&debugHotspots=true
/tour/<tourSlug>/<floorSlug>/<sceneSlug>?draft=true&viewer=pannellum&debugHotspots=true
```

4. Compare the debug panel values:

- `viewer mode`
- `draft mode`
- route tour/floor/scene slugs
- active scene slug
- each `floorScenes` item
- each hotspot `pitch`, `yaw`, `type`, `text`, `targetScene`, and `targetFloor`

5. Compare the visible panorama image. The Three.js viewer receives `floorScenes` and displays the active scene from that list, so image mismatches can come from `floorScenes`, not only `currentScene`.

6. Decide:

- Wrong in both viewers with same debug data: likely CMS data or draft/publish state.
- Correct in Pannellum but wrong in Three.js with same debug data and same image: likely Three.js projection/orientation.
- Correct in draft but wrong in published: publish workflow.
- Same pitch/yaw but different visible panorama: image mismatch.

## Hotspot Debugging Workflow

Use one scene and one hotspot first.

1. Open Payload admin.
2. Open a Scene with a valid panorama.
3. Add or edit one hotspot.
4. Use the Three.js CMS hotspot picker to place it.
5. Record the visible Payload field values for `pitch` and `yaw`.
6. Click Save Draft.
7. Open:

```text
/tour/<tourSlug>/<floorSlug>/<sceneSlug>?draft=true&debugHotspots=true
```

8. Compare the public debug panel hotspot `pitch` and `yaw` with the admin field values.
9. Confirm the hotspot visually appears where it was placed in admin.
10. Publish the scene.
11. Open:

```text
/tour/<tourSlug>/<floorSlug>/<sceneSlug>?debugHotspots=true
```

12. Compare the published debug values and visual placement again.

Interpretation:

- Admin fields match draft debug values, but public normal route is old: publish the scene.
- Admin fields do not match draft debug values: check that the right scene and hotspot row were edited and saved.
- Debug values match but visual position is wrong only in Three.js: inspect `threePanoramaMath.ts` and `ThreeHotspotLayer.tsx`.
- Debug values match but both viewers look wrong: repick the hotspot; do not patch projection math first.

## Image Mismatch Debugging

Pitch/yaw can be correct while the visible image is wrong.

Check these cases:

| Case | Meaning | What to inspect |
| --- | --- | --- |
| Pitch/yaw match but image differs | The same coordinates are being projected onto a different panorama. | Debug panel scene slugs, route data in `page.tsx`, Payload `panorama` field. |
| Admin picker image differs from public image | The admin form may be using an unsaved draft upload, while public route is using published data. | Save Draft, then test `?draft=true&debugHotspots=true`. |
| Draft image differs from published image | Expected if the panorama was changed in a draft but not published. | Compare draft URL vs normal public URL. |
| Public Three.js image differs from expected current scene | Three.js viewer displays the active scene from `floorScenes`. | Inspect the `floorScenes` entry for the active slug in the debug panel. |
| Pannellum and Three.js show different image for same route | Viewer selection or route data may be inconsistent. | Compare `viewer mode`, `active scene slug`, and `floorScenes` in debug mode. |

Useful source locations:

- Route panorama data: `src/app/(frontend)/tour/[tourSlug]/[floorSlug]/[sceneSlug]/page.tsx`
- Three.js active scene selection: `src/components/tour/three/ThreePanoramaViewer.tsx`
- Admin panorama resolver: `src/components/admin/three/useAdminPanoramaMedia.ts`

## Info Hotspot Debugging

Data path:

1. Payload `Scenes.hotspots[].infoContent`
2. Public route maps `infoContent` into `currentScene.hotspots` and `floorScenes[].hotspots`
3. `ThreeHotspotLayer` passes hotspot data into `HotspotButton`
4. `HotspotButton` delegates info hotspots to `InfoHotspot`
5. `InfoHotspot` renders extracted text blocks through `getInfoContentTextBlocks`

Check these files:

- Route data: `src/app/(frontend)/tour/[tourSlug]/[floorSlug]/[sceneSlug]/page.tsx`
- Modal renderer: `src/components/tour/InfoHotspot.tsx`
- Text extraction: `src/components/tour/infoContentText.ts`
- Debug panel preview: `src/components/tour/HotspotDebugPanel.tsx`
- Sidebar fallback modal: `src/components/tour/HotspotSidebar.tsx`

If the in-panorama info modal falls back to the hotspot title, then `getInfoContentTextBlocks(infoContent)` returned no text. Check whether `infoContent` is empty in Payload or whether the Lexical structure changed.

If the sidebar modal says `Information available`, that is the sidebar's separate fallback path for non-string `infoContent`. Check `HotspotSidebar.tsx` before changing `InfoHotspot.tsx`.

Use `?debugHotspots=true` to confirm:

- `infoContent` exists in route data.
- The debug panel's `info type`, `info empty`, and `info preview` match expectations.

## CMS Picker Debugging

Current admin setup:

- Hotspot visual picker: `src/components/admin/three/ThreeHotspotPicker.tsx`
- Initial camera picker: `src/components/admin/three/ThreeInitialViewPicker.tsx`
- Shared Three.js picker: `src/components/admin/three/ThreeAdminPanoramaPicker.tsx`
- Scene admin wiring: `src/collections/Scenes.ts`

Old Pannellum fallback files:

- `src/components/HotspotPicker.tsx`
- `src/components/admin/PanoramaValidationPreview.tsx`

Rollback path:

1. In `src/collections/Scenes.ts`, change panorama `afterInput` back to:

```text
/components/admin/PanoramaValidationPreview
```

2. Change hotspot `visualPicker.Field` back to:

```text
@/components/HotspotPicker
```

3. Regenerate the Payload admin import map by running the normal build or Payload import-map command.

Do not change field names, migrations, or saved hotspot data for picker rollback.

Testing one scene:

1. Pick one scene with a panorama.
2. Add one info hotspot.
3. Place it with the Three.js CMS picker.
4. Save Draft.
5. Compare `/tour/<tourSlug>/<floorSlug>/<sceneSlug>?draft=true&debugHotspots=true`.
6. Publish only after draft placement is confirmed.

CMS picker rotation note:

- The CMS picker saves raw pitch/yaw/HFOV.
- It ignores `scene.rotation`.
- Public hotspot rendering also ignores `scene.rotation`.
- Public initial camera display currently still applies `scene.rotation`, so initial camera tests on non-zero rotation scenes may need separate verification.

## Common Symptoms

| Symptom | Likely Cause | File To Inspect | Suggested Fix/Test |
| --- | --- | --- | --- |
| Hotspot wrong in both Three.js and Pannellum | Stored CMS pitch/yaw is wrong, or wrong scene/hotspot was edited. | `HotspotDebugPanel.tsx`, Payload Scene admin | Record admin fields, Save Draft, compare draft debug URL. |
| Hotspot correct in Pannellum but wrong in Three.js | Three.js projection/orientation mismatch. | `threePanoramaMath.ts`, `ThreeHotspotLayer.tsx` | Compare same route with `?viewer=pannellum&debugHotspots=true` before changing math. |
| Debug pitch/yaw differs from admin | Draft not saved, wrong hotspot row, or route reading different scene data. | `page.tsx`, `HotspotDebugPanel.tsx`, Payload admin | Save Draft, verify scene slug and hotspot index. |
| Draft correct but public wrong | Scene draft was not published. | Payload admin status, debug URLs | Publish, then retest normal public URL. |
| Info modal only shows hotspot title | `infoContent` is empty or text extraction returned no blocks. | `InfoHotspot.tsx`, `infoContentText.ts` | Check debug panel `info empty` and `info preview`. |
| Sidebar info modal says `Information available` | Sidebar has a separate non-string fallback path. | `HotspotSidebar.tsx` | Test by clicking the in-panorama info hotspot too. |
| Admin picker image different from public viewer image | Unsaved draft image, unpublished image, or different active scene data. | `useAdminPanoramaMedia.ts`, `page.tsx` | Compare admin URL with draft debug public URL first. |
| Pitch/yaw match but image is different | Same coordinates are projected onto different panorama media. | `page.tsx`, debug panel `floorScenes` | Compare draft vs published panorama for the active scene. |
| Floor map button missing | Overlay or `tourFloors` data issue. | `TourOverlay.tsx`, `FloorMapModal.tsx`, `page.tsx` | Check route data includes `tourFloors` and `floorplan/mapPoints`. |
| Floor map navigation drops debug mode | Query preservation issue. | `FloorMapModal.tsx` | Confirm destination keeps `debugHotspots=true`. |
| Cross-floor portal not working | Missing `targetScene.slug`, wrong `targetFloor.slug`, or target scene absent. | `ThreePanoramaViewer.tsx`, `PannellumViewer.tsx`, debug panel | Check hotspot target fields and compare debug panel warnings. |
| Same-floor portal changes scene but overlay data is stale | Active scene state not synced. | `TourViewer.tsx`, `ThreePanoramaViewer.tsx`, `PannellumViewer.tsx` | Confirm `onSceneChange` fires and active scene slug updates. |
| Initial camera differs between admin and public | `scene.rotation` or draft/publish mismatch. | `ThreeInitialViewPicker.tsx`, `ThreePanoramaViewer.tsx`, `threePanoramaMath.ts` | Test a scene with `rotation = 0` first, then compare draft/published routes. |
| Pannellum fallback does not match Three.js transition | Different transition systems and camera animation paths. | `PannellumViewer.tsx`, `threeCameraTransition.ts` | First compare static hotspot placement, then navigation behavior. |

## Safe Rules

- Do not change database values directly as the first fix.
- Do not change projection math before checking debug values.
- Do not change Payload schema for display bugs.
- Do not create migrations for viewer display issues.
- Always compare draft and published data.
- Always compare the image URL as well as pitch/yaw.
- Start with one scene and one hotspot.
- Keep Pannellum fallback until Three.js public viewer and CMS picker behavior are fully verified.
- Preserve old Pannellum admin picker files until the Three.js CMS picker is proven across real scenes.
- Treat `scene.rotation` changes as a separate coordinate strategy decision.

## Documentation Audit Recommendation

Primary docs:

- `docs/viewer-troubleshooting-guide.md`: main operational troubleshooting guide.
- `docs/threejs-cms-picker-experiment.md`: current details for the Three.js admin picker prototype and rollback path.

Useful focused docs to keep for now:

- `docs/public-viewer-floor-map.md`: focused floor map reference; much of it is now summarized here.
- `docs/threejs-hotspot-alignment-note.md`: useful history for why hotspots ignore `scene.rotation`, but some admin-picker wording is now stale.

Historical or archive candidates:

- `docs/pannellum-to-threejs-migration-plan.md`: original migration plan. Keep as background, not current truth.
- `docs/threejs-public-viewer-code-explanation.md`: explains the old optional Three.js prototype where Pannellum was default. Archive or rewrite later.
- `docs/threejs-public-viewer-parity-checklist.md`: old checklist assumes `?viewer=three` is the prototype and Pannellum is default. Archive or update later.
- `docs/threejs-public-viewer-final-migration.md`: useful migration record, but parts are stale around admin pickers and rotation behavior. Merge current pieces into this guide or archive as history later.
- `docs/hotspot-debugging-guide.md`: mostly merged into this guide. Keep temporarily, then archive after links are updated.

Do not delete old docs automatically. Archive or merge them in a separate documentation cleanup pass after the team agrees on the new primary docs.
