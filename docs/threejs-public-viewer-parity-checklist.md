# Three.js Public Viewer Parity Checklist

Use this checklist when testing the optional public viewer at:

```text
/tour/[tourSlug]/[floorSlug]/[sceneSlug]?viewer=three
```

Compare against the default Pannellum viewer at the same route without `viewer=three`.

## Initial Camera

- [ ] The same scene opens facing the same horizontal direction as Pannellum.
- [ ] The same scene opens with the same vertical pitch as Pannellum.
- [ ] The apparent field of view matches Pannellum's `initialHfov`.
- [ ] Scenes with non-zero `initialYaw` match Pannellum.
- [ ] Scenes with non-zero `initialPitch` match Pannellum.

## Hotspot Projection

- [ ] Scene portal hotspots appear at the same visual positions as Pannellum.
- [ ] Info hotspots appear at the same visual positions as Pannellum.
- [ ] Hotspots near the horizontal wrap boundary appear on the correct side.
- [ ] Hotspots near the top and bottom of the panorama remain stable.
- [ ] Hotspots hide when they are behind the camera.
- [ ] Hotspots hide or stay clipped cleanly when outside the visible viewport.
- [ ] Hotspot clicks do not start a drag gesture.

## Drag Controls

- [ ] Mouse drag direction feels the same as Pannellum.
- [ ] Dragging left/right changes yaw at a comparable speed.
- [ ] Dragging up/down changes pitch at a comparable speed.
- [ ] Pitch clamps before the view flips at the poles.
- [ ] Releasing the mouse stops the drag cleanly.

## Zoom Controls

- [ ] Wheel zoom direction matches Pannellum.
- [ ] Minimum zoom feels close to Pannellum.
- [ ] Maximum zoom feels close to Pannellum.
- [ ] Zooming does not change the current pitch/yaw unexpectedly.

## Scene Navigation

- [ ] Same-floor portal navigation switches scene without a full route reload.
- [ ] Same-floor portal navigation updates the overlay title and hotspot list.
- [ ] Same-floor portal navigation resets to the target scene's initial pitch/yaw/hfov.
- [ ] Cross-floor portal navigation goes to the existing scene route.
- [ ] Cross-floor portal navigation preserves `viewer=three`.
- [ ] Floor map navigation still works.
- [ ] Floor map navigation preserves `viewer=three`.
- [ ] The default route without `viewer=three` still renders Pannellum.

## Draft and Preview Mode

- [ ] `?draft=true&viewer=three` loads draft scene data.
- [ ] Same-floor navigation keeps draft data active.
- [ ] Cross-floor navigation preserves `draft=true`.
- [ ] Floor map navigation preserves `draft=true`.
- [ ] The Payload preview route still defaults to the existing behavior unless `viewer=three` is added manually to the scene route.

## Mobile and Touch

- [ ] Single-finger touch drag rotates the panorama.
- [ ] Touch drag direction feels the same as Pannellum.
- [ ] Touching a hotspot opens or navigates without dragging the scene.
- [ ] Viewport resize or orientation change keeps the camera projection correct.
- [ ] Hotspot positions update after orientation change.

## Resource Cleanup

- [ ] Texture memory is disposed when switching scenes.
- [ ] Geometry is disposed when unmounting the viewer.
- [ ] Material is disposed when unmounting the viewer.
- [ ] WebGL renderer is disposed when unmounting the viewer.
- [ ] Event listeners are removed when unmounting the viewer.
- [ ] Repeated scene switches do not continuously increase GPU memory.
- [ ] Navigating away and back creates a fresh working viewer.
