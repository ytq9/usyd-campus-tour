# Three.js CMS Picker Experiment

## Why This Exists

The public panorama viewer now uses Three.js by default, while the CMS/admin hotspot and initial camera tools were still using Pannellum. That made admin-selected pitch/yaw values hard to trust visually because the admin preview and the public viewer were not using the same projection and camera math.

This branch adds a safe Three.js CMS picker prototype so admin placement uses the same coordinate helpers as the public Three.js viewer.

## Files Added

- `src/components/admin/three/ThreeAdminPanoramaPicker.tsx`
- `src/components/admin/three/ThreeHotspotPicker.tsx`
- `src/components/admin/three/ThreeInitialViewPicker.tsx`
- `src/components/admin/three/useAdminPanoramaMedia.ts`
- `docs/threejs-cms-picker-experiment.md`

## Files Modified

- `src/collections/Scenes.ts`

Only Payload admin component paths were changed. Field names, schema shape, migrations, and saved data were not changed.

## Shared Picker Foundation

`ThreeAdminPanoramaPicker` renders the selected panorama on an inverted Three.js sphere, matching the public viewer setup. It reuses public Three.js helpers for:

- `screenPointToPitchYaw`
- `projectPitchYawToScreen`
- `clampInteractionPitch`
- `clampHfov`
- `normaliseYaw`

It also reuses:

- `useThreePanoramaControls`
- `useThreeSceneTexture`

The picker supports drag/touch camera movement, wheel zoom, click-to-pick when enabled, marker projection, marker dragging when enabled, and a compact debug HUD. It disposes renderer, geometry, material, texture ownership via the texture hook, resize observers, animation frames, and DOM canvas on unmount.

## Hotspot Picking

`ThreeHotspotPicker` replaces the visual picker for `hotspots.N.visualPicker`.

It reads and writes:

- `hotspots.N.pitch`
- `hotspots.N.yaw`

It resolves the current scene `panorama` from the Payload form, opens the Three.js placement tool, and saves rounded raw pitch/yaw values when the admin clicks the panorama or finishes dragging the marker.

The debug display shows:

- panorama URL
- current Payload field pitch/yaw
- live cursor pitch/yaw
- picked pitch/yaw
- last picker-written pitch/yaw
- current camera pitch/yaw/HFOV

The picker displays the reminder that the scene still needs Save Draft or Publish before public viewer data changes.

## Initial Camera Picking

`ThreeInitialViewPicker` replaces the panorama after-input preview.

It reads and writes:

- `initialPitch`
- `initialYaw`
- `initialHfov`

The admin drags/zooms the Three.js panorama to the desired view, then clicks `Use Current View as Initial View`. The component writes the current camera pitch/yaw/HFOV into Payload form fields.

The existing 2:1 equirectangular validation behavior is preserved. Invalid panorama media is rejected from the scene field and a modal explains the expected dimensions.

## Coordinate Saving

For this first prototype, hotspot and initial camera picking save raw pitch/yaw/HFOV values. The picker intentionally ignores `scene.rotation`.

Hotspots match the current public Three.js hotspot behavior because the public Three.js hotspot layer also ignores `scene.rotation` and projects raw stored hotspot coordinates.

Important limitation: the public Three.js initial camera path currently still applies `scene.rotation` when it computes the displayed initial camera direction. This prototype does not compensate for that. For scenes where `rotation` is non-zero, initial camera comparison may need extra attention until the rotation strategy is finalized.

## Safe Rollback

The old Pannellum files remain in place:

- `src/components/HotspotPicker.tsx`
- `src/components/admin/PanoramaValidationPreview.tsx`

To roll back the admin UI, change the component paths in `src/collections/Scenes.ts` back to the fallback comments:

- panorama `afterInput`: `/components/admin/PanoramaValidationPreview`
- hotspot `visualPicker.Field`: `@/components/HotspotPicker`

No database changes are needed for rollback.

## How To Test With The Public Viewer

1. Open Payload admin.
2. Open one scene with a valid 2:1 panorama.
3. Add one info hotspot.
4. Use the Three.js hotspot picker to place it.
5. Record the saved pitch/yaw fields.
6. Click Save Draft.
7. Open `/tour/<tourSlug>/<floorSlug>/<sceneSlug>?draft=true&debugHotspots=true`.
8. Confirm the debug panel pitch/yaw matches the admin fields.
9. Confirm the hotspot visually appears at the same place selected in admin.
10. Publish.
11. Open `/tour/<tourSlug>/<floorSlug>/<sceneSlug>?debugHotspots=true`.
12. Confirm the published debug values and visual hotspot placement match.
13. Set the initial camera with `Use Current View as Initial View`.
14. Save Draft and open the draft public route again to compare the initial camera.

## Comparing Admin And Public

Use the admin picker debug display and the public `debugHotspots=true` panel together:

- Admin current field pitch/yaw should match public debug panel pitch/yaw after Save Draft in draft mode.
- Admin picked pitch/yaw should match the current Payload form fields after a picker update.
- Public normal route will not change until the scene is published.

## Known Limitations

- This is a one-scene CMS picker prototype.
- It does not remove Pannellum or the old admin picker files.
- It does not change existing saved hotspot data.
- It ignores `scene.rotation`.
- Public initial camera display still applies `scene.rotation`, so non-zero rotation scenes may not be perfectly comparable for initial view yet.
- The picker uses the public viewer HFOV clamp range from the Three.js controls.
