# Three.js Public Viewer Code Explanation

This document explains the optional Three.js public tour viewer prototype that was added alongside the existing Pannellum viewer.

It is written for someone learning the codebase and trying to understand how the public panorama viewer works, how the Three.js prototype was added safely, and how the pieces connect.

## 1. Summary of What Changed

### Why Three.js Was Added

The app originally used Pannellum for the public 360 panorama viewer. Pannellum handles many things for us:

- Loading equirectangular panorama images.
- Turning mouse/touch movement into camera rotation.
- Converting `pitch` and `yaw` coordinates into screen hotspot positions.
- Switching between same-floor scenes.

Three.js was added as an optional prototype so the team can test whether the public viewer can eventually move to a lower-level WebGL renderer. Three.js gives more direct control over rendering, camera movement, hotspot projection, transitions, and future visual effects.

The current Three.js implementation is intentionally limited to the public tour viewer. It does not touch admin tools or Payload schemas.

### Why Pannellum Is Still the Default

Pannellum remains the production default because it is the known working viewer. The Three.js viewer is a prototype that needs visual parity testing before it can replace anything.

Keeping Pannellum as default gives a safe migration path:

1. Existing public routes continue to behave normally.
2. Editors and users are not forced onto the new renderer.
3. The team can compare both viewers on the same CMS data.
4. Any Three.js issue can be isolated without breaking production behavior.

### How `?viewer=three` Enables the Prototype

The scene route reads the optional query parameter:

```text
?viewer=three
```

If this parameter is present, the route passes `viewerMode: 'three'` into `TourViewer`.

Inside `TourViewer`, the code chooses between:

```tsx
{useThreeViewer ? (
  <ThreePanoramaViewer ... />
) : (
  <PannellumViewer ... />
)}
```

Without `?viewer=three`, `viewerMode` is `'pannellum'`, so the original `PannellumViewer` is still rendered.

## 2. Files Changed or Added

### `package.json`

Purpose:

- Adds `three` as a runtime dependency.
- Adds `@types/three` as a development dependency.

Why it was needed:

- The new public viewer imports Three.js classes such as `Scene`, `PerspectiveCamera`, `WebGLRenderer`, `SphereGeometry`, `MeshBasicMaterial`, `TextureLoader`, and `Raycaster`.
- TypeScript needs `@types/three` so those APIs have proper types.

How it connects to the app:

- Only the optional Three.js prototype imports `three`.
- `PannellumViewer` still uses Pannellum.

### `package-lock.json`

Purpose:

- Records the exact installed dependency tree after adding `three` and `@types/three`.

Why it was needed:

- Keeps installs reproducible for everyone working on the project.

How it connects to the app:

- Ensures `npm install` installs the same versions used when the prototype was added.

### `src/app/(frontend)/tour/[tourSlug]/[floorSlug]/[sceneSlug]/page.tsx`

Purpose:

- Server route for the public scene viewer.
- Fetches tour, floor, scene, floor scenes, and floor map data from Payload.
- Builds the `sceneData` object used by the client viewer.

What changed:

- The route now reads a `viewer` query parameter:

```ts
type SearchParams = Promise<{ draft?: string; viewer?: string }>
```

```ts
const viewerMode: 'three' | 'pannellum' =
  viewerParam === 'three' ? 'three' : 'pannellum'
```

- The flattened `sceneData` now includes:

```ts
viewerMode,
```

Why it was needed:

- This is the safest place to detect the opt-in query parameter.
- It does not change the CMS data shape used by the viewer. It only adds a viewer selection flag.

How it connects to the app:

- The route still sends the same scene data: `panoramaUrl`, `initialYaw`, `initialPitch`, `initialHfov`, `hotspots`, and `floorScenes`.
- `TourViewer` receives `viewerMode` and decides which renderer to use.

### `src/components/tour/TourViewer.tsx`

Purpose:

- Main client-side wrapper for the public tour experience.
- Owns the current scene slug.
- Renders the panorama viewer and the overlay UI.

What changed:

- Added a dynamic import for the Three.js viewer:

```ts
const ThreePanoramaViewer = dynamic(() => import('./three/ThreePanoramaViewer'), {
  ssr: false,
})
```

- Added `viewerMode?: 'pannellum' | 'three'` to the `SceneData` type.
- Computes:

```ts
const useThreeViewer = data.viewerMode === 'three'
```

- Conditionally renders either `ThreePanoramaViewer` or `PannellumViewer`.

Why it was needed:

- `TourViewer` already sits at the exact point where the public renderer is chosen.
- It already passes the right props to `PannellumViewer`, so the Three.js viewer can mirror that API.
- Dynamic import keeps the Three.js code out of the default viewer path until `?viewer=three` is used.

How it connects to the existing app:

- `TourOverlay`, `WelcomeModal`, and transition settings stay in the same place.
- `PannellumViewer` remains the default branch.
- `ThreePanoramaViewer` receives the same data shape as `PannellumViewer`.

### `src/components/tour/TourOverlay.tsx`

Purpose:

- Renders title, description, hotspot sidebar, home button, and floor map controls over the panorama viewer.

What changed:

- Accepts optional `viewerMode`.
- Passes `viewerMode` into `HotspotSidebar` and `FloorMapModal`.

Why it was needed:

- When testing the Three.js viewer, navigation should keep `viewer=three` in the URL.
- Without this, clicking the floor map or sidebar could accidentally return the tester to the default Pannellum viewer.

How it connects to the existing app:

- The overlay itself is still shared by both renderers.
- No overlay behavior changes unless `viewerMode === 'three'`.

### `src/components/tour/FloorMapModal.tsx`

Purpose:

- Shows floor tabs, floorplan images, and map points.
- Clicking a map point navigates to a scene route.

What changed:

- Accepts optional `viewerMode`.
- Builds route query params with `URLSearchParams`:

```ts
const query = new URLSearchParams()
if (isDraft) query.set('draft', 'true')
if (viewerMode === 'three') query.set('viewer', 'three')
```

Why it was needed:

- The floor map uses full URL navigation.
- During Three.js prototype testing, floor map navigation should preserve `viewer=three`.

How it connects to the existing app:

- Pannellum default behavior is unchanged because `viewer=three` is only appended when explicitly active.

### `src/components/tour/HotspotSidebar.tsx`

Purpose:

- Shows a sidebar list of hotspots for the current scene.
- Scene hotspots navigate to a target scene.
- Info hotspots try to call the Pannellum global API if available.

What changed:

- Accepts optional `viewerMode`.
- Preserves `viewer=three` in URL fallback navigation.

Why it was needed:

- Same-floor sidebar navigation may use URL fallback if no global Pannellum viewer is available.
- For the Three.js prototype, that fallback needs to keep the user on the prototype.

How it connects to the existing app:

- Existing Pannellum sidebar behavior is kept.
- This change only affects query string preservation for the prototype.

### `src/components/tour/three/types.ts`

Purpose:

- Defines shared TypeScript types for the Three.js viewer files.

Why it was needed:

- Keeps the new viewer files consistent.
- Documents the expected shape of scene, hotspot, and camera data.

How it connects to the existing app:

- The types mirror the existing CMS-flattened scene shape from the public route.
- They do not introduce a new CMS schema.

### `src/components/tour/three/threePanoramaMath.ts`

Purpose:

- Central math layer for Pannellum-compatible panorama coordinates.
- Converts between pitch/yaw and Three.js vectors.
- Projects hotspots onto the screen.
- Converts screen points back to pitch/yaw.
- Clamps yaw, pitch, and horizontal field of view.

Why it was needed:

- Pannellum used to handle these conversions internally.
- Three.js gives raw camera and 3D math tools, so the app needs explicit helper functions.

How it connects to the existing app:

- Existing CMS hotspot coordinates are still stored as Pannellum-style `pitch` and `yaw`.
- This file interprets those values for Three.js.

### `src/components/tour/three/useThreePanoramaControls.ts`

Purpose:

- React hook that handles camera state and user controls.

It supports:

- Initial pitch/yaw/HFOV.
- Mouse drag.
- Touch drag through pointer events.
- Wheel zoom.
- Pitch and HFOV clamping.
- Event listener cleanup.

Why it was needed:

- Pannellum previously handled camera movement and zoom.
- Three.js needs custom input handling.

How it connects to the existing app:

- Receives `initialPitch`, `initialYaw`, and `initialHfov` from the same scene data already used by Pannellum.
- Exposes `setCameraState` so scene switching can reset the camera to the target scene's initial view.

### `src/components/tour/three/useThreeSceneTexture.ts`

Purpose:

- React hook that loads panorama images as Three.js textures.

Why it was needed:

- Three.js cannot use an image URL directly as a panorama. It needs a `THREE.Texture`.
- Texture loading is asynchronous and must clean up GPU memory.

How it connects to the existing app:

- Uses the existing `panoramaUrl` produced by the public route.
- Does not use a new image source or schema.

### `src/components/tour/three/ThreeHotspotLayer.tsx`

Purpose:

- Renders CMS hotspots as normal React DOM elements over the Three.js canvas.
- Reuses the existing `HotspotButton`.

Why it was needed:

- Pannellum placed hotspot DOM nodes automatically.
- In the Three.js viewer, hotspot positions must be calculated and rendered manually.

How it connects to the existing app:

- Uses the existing hotspot data model.
- Reuses existing portal and info hotspot UI through `HotspotButton`.

### `src/components/tour/three/ThreePanoramaViewer.tsx`

Purpose:

- Main optional Three.js public viewer.
- Creates the Three.js scene, camera, renderer, sphere, material, texture assignment, render loop, transitions, hotspot layer, and scene switching.

Why it was needed:

- This is the prototype replacement for only the public `PannellumViewer`.

How it connects to the existing app:

- Accepts props that mirror `PannellumViewer`.
- Uses the existing transition system.
- Uses the existing hotspot UI.
- Preserves cross-floor navigation behavior.

### `docs/threejs-public-viewer-parity-checklist.md`

Purpose:

- Provides a manual checklist for comparing Pannellum and Three.js behavior.

Why it was needed:

- Projection and control parity cannot be trusted from code alone.
- Testers need a repeatable list for camera angle, hotspot position, drag, zoom, scene switching, draft mode, mobile touch, and resource cleanup.

How it connects to the app:

- Used when testing routes with and without `?viewer=three`.

## 3. Detailed Code Explanation

## `types.ts`

### Important Imports

```ts
import type { PerspectiveCamera } from 'three'
```

Only a type is imported. This means it helps TypeScript understand the shape of a Three.js camera without adding runtime code.

### Main Types

#### `HotspotData`

```ts
export type HotspotData = {
  type: 'scene' | 'info'
  pitch?: number
  yaw?: number
  text?: string
  targetScene?: { slug?: string; title?: string } | null
  targetFloor?: { slug?: string } | null
  infoContent?: any
  cssClass?: string
  iconColor?: string
  iconSize?: 'sm' | 'md' | 'lg' | string
  [key: string]: any
}
```

This mirrors the existing hotspot objects coming from the public route. It supports both:

- Scene hotspots, which navigate to another panorama.
- Info hotspots, which open an info modal.

The index signature `[key: string]: any` keeps the prototype tolerant of extra CMS fields.

#### `ThreeSceneData`

```ts
export type ThreeSceneData = {
  id?: string | number
  slug: string
  title: string
  panoramaUrl: string
  previewUrl?: string
  initialYaw: number
  initialPitch: number
  initialHfov: number
  rotation?: number
  hotspots: HotspotData[]
}
```

This is the scene shape the Three.js viewer expects. It intentionally matches the existing `floorScenes` data passed to `PannellumViewer`.

#### `CameraState`

```ts
export type CameraState = {
  pitch: number
  yaw: number
  hfov: number
}
```

This stores the current camera direction and zoom level in Pannellum-style terms.

#### `ProjectedHotspot`

```ts
export type ProjectedHotspot = {
  hotspot: HotspotData
  x: number
  y: number
  visible: boolean
}
```

This is what the hotspot layer needs after converting 3D coordinates into 2D screen positions.

#### `ThreePanoramaViewerProps`

```ts
export type ThreePanoramaViewerProps = {
  scenes: ThreeSceneData[]
  initialSceneSlug: string
  tourSlug: string
  floorSlug: string
  isDraft: boolean
  onSceneChange: (sceneSlug: string) => void
}
```

These props intentionally mirror `PannellumViewer`. That keeps the integration small and reversible.

#### `ThreeViewerApi`

This type describes a possible future viewer API:

```ts
export type ThreeViewerApi = {
  camera: PerspectiveCamera | null
  getCameraState: () => CameraState
  loadScene: (sceneSlug: string) => void
  lookAt: (pitch: number, yaw: number, hfov?: number) => void
}
```

It is not currently wired into the app, but it documents the kind of API that could later replace `window.pannellumViewer`.

## `threePanoramaMath.ts`

This file is the math heart of the prototype.

### Important Imports

```ts
import * as THREE from 'three'
import type { PitchYaw } from './types'
```

`THREE` gives access to vector math, raycasting, and utility functions. `PitchYaw` is a local type that says a function returns `{ pitch, yaw }`.

### Constants

```ts
export const PANNELLUM_MIN_HFOV = 50
export const PANNELLUM_MAX_HFOV = 120
export const CONTROL_MIN_PITCH = -89.9
export const CONTROL_MAX_PITCH = 89.9
```

These define viewer limits:

- HFOV is clamped between 50 and 120 degrees.
- Interaction pitch is clamped just under `-90` and `+90` so the camera does not flip at the poles.

```ts
const DEG_TO_RAD = Math.PI / 180
const RAD_TO_DEG = 180 / Math.PI
```

Three.js trigonometry uses radians, while CMS data stores degrees. These constants convert between the two.

### Coordinate Convention

The file includes an important comment explaining the compatibility target:

- `pitch` is vertical angle.
- `yaw` is horizontal direction.
- `yaw = 0` looks along Three.js negative Z.
- Positive yaw rotates toward positive X.

This matters because existing CMS hotspot data was authored for Pannellum.

### `pitchYawToVector3(pitch, yaw)`

Responsibility:

- Converts CMS `pitch` and `yaw` degrees into a Three.js direction vector.

Important block:

```ts
return new THREE.Vector3(
  Math.sin(yawRad) * cosPitch,
  Math.sin(pitchRad),
  -Math.cos(yawRad) * cosPitch,
).normalize()
```

Beginner explanation:

- A vector is an arrow in 3D space.
- This function turns "look 30 degrees right and 10 degrees up" into a 3D arrow the camera can look at.
- The negative Z axis is treated as the forward direction for yaw `0`.

Used by:

- Camera orientation in `useThreePanoramaControls`.
- Hotspot projection in `projectPitchYawToScreen`.

### `vector3ToPitchYaw(vector)`

Responsibility:

- Converts a Three.js vector back into `{ pitch, yaw }`.

Important block:

```ts
const pitch = Math.asin(THREE.MathUtils.clamp(normalized.y, -1, 1)) * RAD_TO_DEG
const yaw = Math.atan2(normalized.x, -normalized.z) * RAD_TO_DEG
```

Beginner explanation:

- This is the reverse of `pitchYawToVector3`.
- It is useful when the user clicks somewhere in the 3D sphere and we want to know the matching CMS-style coordinates.

Used by:

- `screenPointToPitchYaw`.

### `projectPitchYawToScreen(pitch, yaw, camera, container)`

Responsibility:

- Converts a hotspot's `pitch` and `yaw` into an `{ x, y, visible }` screen position.

Important block:

```ts
const projected = direction.clone().project(camera)
const x = (projected.x + 1) * width * 0.5
const y = (-projected.y + 1) * height * 0.5
```

Beginner explanation:

- Three.js projection converts a 3D point into normalized screen space.
- The math then converts normalized coordinates into pixel coordinates inside the viewer container.
- `x` is the left-to-right pixel position.
- `y` is the top-to-bottom pixel position.

Visibility logic:

```ts
const isInFrontOfCamera = cameraForward.dot(direction) > 0
```

This checks whether the hotspot direction is in front of the camera. If it is behind the camera, the DOM hotspot should be hidden.

Used by:

- `ThreeHotspotLayer`.

### `screenPointToPitchYaw(x, y, camera, sphere)`

Responsibility:

- Converts a screen point into panorama `pitch` and `yaw`.

Important block:

```ts
const raycaster = new THREE.Raycaster()
raycaster.setFromCamera(new THREE.Vector2(x, y), camera)
const hit = raycaster.intersectObject(sphere, false)[0]
```

Beginner explanation:

- A raycaster shoots an invisible line from the camera through a point on the screen.
- If that line hits the panorama sphere, the hit point can be converted back to pitch/yaw.

Current use:

- This helper is available for parity and future admin/editor work.
- It is not currently used by the public viewer because public hotspots already come from CMS coordinates.

Important note:

- The function expects normalized device coordinates, not raw pixels:
  - `x = -1` means left side.
  - `x = 1` means right side.
  - `y = -1` means bottom.
  - `y = 1` means top.

### `normaliseYaw(yaw)`

Responsibility:

- Keeps yaw between `-180` and `180` degrees.

Why it matters:

- Yaw can grow forever while dragging.
- Normalizing makes values easier to reason about.

### `clampPitch(pitch)`

Responsibility:

- Limits pitch to the valid panorama range: `-90` to `90`.

### `clampInteractionPitch(pitch)`

Responsibility:

- Limits interactive camera pitch to `-89.9` to `89.9`.

Why it exists:

- Looking exactly straight up or down can create unstable camera behavior.
- This avoids flipping or gimbal-like weirdness at the poles.

### `clampHfov(hfov)`

Responsibility:

- Keeps horizontal field of view in the prototype range.

```ts
return THREE.MathUtils.clamp(hfov, PANNELLUM_MIN_HFOV, PANNELLUM_MAX_HFOV)
```

### `horizontalFovToVerticalFov(hfov, aspect)`

Responsibility:

- Converts Pannellum-style horizontal field of view into Three.js vertical field of view.

Why it matters:

- Pannellum uses HFOV.
- Three.js `PerspectiveCamera.fov` is vertical FOV.

Important block:

```ts
return 2 * Math.atan(Math.tan(hRadians * 0.5) / safeAspect) * RAD_TO_DEG
```

Beginner explanation:

- The visible horizontal angle depends on the screen's aspect ratio.
- A wide screen and a narrow phone screen need different vertical FOV values to preserve the same horizontal feel.

## `useThreePanoramaControls.ts`

This hook owns camera movement and input.

### Important Imports

```ts
import { useCallback, useEffect, useRef } from 'react'
import type { PerspectiveCamera } from 'three'
```

React hooks are used because the controls need to:

- Store mutable camera state.
- Attach browser event listeners.
- Clean up listeners later.

Math helpers come from `threePanoramaMath.ts`:

```ts
import {
  clampHfov,
  clampInteractionPitch,
  horizontalFovToVerticalFov,
  normaliseYaw,
  pitchYawToVector3,
} from './threePanoramaMath'
```

### Props

```ts
type Args = {
  cameraRef: RefObject<PerspectiveCamera | null>
  containerRef: RefObject<HTMLElement | null>
  initialPitch: number
  initialYaw: number
  initialHfov: number
}
```

The hook needs:

- A reference to the Three.js camera.
- A reference to the viewer container.
- Initial camera values from CMS scene data.

### Main Variables

```ts
const cameraStateRef = useRef<CameraState>({
  pitch: clampInteractionPitch(initialPitch),
  yaw: normaliseYaw(initialYaw),
  hfov: clampHfov(initialHfov),
})
```

This stores the current camera state without causing React re-renders on every drag movement.

Why `useRef` instead of `useState`?

- Dragging fires many pointer events.
- Re-rendering React for every tiny movement would be wasteful.
- The camera can be updated directly.

### `applyCameraState`

Responsibility:

- Applies the stored pitch/yaw/HFOV to the actual Three.js camera.

Important block:

```ts
camera.aspect = width / height
camera.fov = horizontalFovToVerticalFov(state.hfov, camera.aspect)
camera.position.set(0, 0, 0)
camera.lookAt(pitchYawToVector3(state.pitch, state.yaw))
camera.updateProjectionMatrix()
```

Beginner explanation:

- `camera.aspect` matches the canvas size.
- `camera.fov` controls zoom.
- `camera.lookAt(...)` points the camera toward the correct pitch/yaw direction.
- `updateProjectionMatrix()` tells Three.js the camera settings changed.

### `setCameraState`

Responsibility:

- Updates pitch, yaw, or HFOV.
- Clamps values.
- Calls `applyCameraState`.

Important block:

```ts
cameraStateRef.current = {
  pitch: clampInteractionPitch(nextState.pitch ?? cameraStateRef.current.pitch),
  yaw: normaliseYaw(nextState.yaw ?? cameraStateRef.current.yaw),
  hfov: clampHfov(nextState.hfov ?? cameraStateRef.current.hfov),
}
applyCameraState()
```

### `getCameraState`

Responsibility:

- Returns the current camera state.

Current use:

- Returned for future viewer API support.
- Not heavily used yet in the prototype.

### `lookAt`

Responsibility:

- Convenience function to point the camera at a specific pitch/yaw.

```ts
const lookAt = useCallback((pitch: number, yaw: number, hfov?: number) => {
  setCameraState({ pitch, yaw, hfov })
}, [setCameraState])
```

### Initial Scene Effect

```ts
useEffect(() => {
  setCameraState({
    pitch: initialPitch,
    yaw: initialYaw,
    hfov: initialHfov,
  })
}, [initialPitch, initialYaw, initialHfov, setCameraState])
```

Responsibility:

- When the active scene changes, reset the camera to that scene's CMS initial camera.

### Pointer Drag Logic

The hook attaches pointer event listeners:

```ts
container.addEventListener('pointerdown', handlePointerDown)
container.addEventListener('pointermove', handlePointerMove)
container.addEventListener('pointerup', endDrag)
container.addEventListener('pointercancel', endDrag)
```

Using pointer events means the same logic can support mouse and touch.

#### `handlePointerDown`

Responsibility:

- Starts dragging.
- Stores the pointer ID.
- Stores the first mouse/touch position.
- Captures the pointer so movement remains connected to this element.

#### `handlePointerMove`

Responsibility:

- If dragging, calculate how far the pointer moved.
- Convert movement into yaw/pitch changes.

Important block:

```ts
setCameraState({
  yaw: cameraStateRef.current.yaw - deltaX * sensitivity,
  pitch: cameraStateRef.current.pitch + deltaY * sensitivity,
})
```

Beginner explanation:

- Moving horizontally changes yaw.
- Moving vertically changes pitch.
- The signs are chosen to make drag direction feel like Pannellum.

#### `endDrag`

Responsibility:

- Stops dragging.
- Releases pointer capture.

#### `handleWheel`

Responsibility:

- Changes HFOV when the mouse wheel moves.

```ts
hfov: cameraStateRef.current.hfov + event.deltaY * WHEEL_HFOV_SENSITIVITY
```

Beginner explanation:

- Smaller FOV feels zoomed in.
- Larger FOV feels zoomed out.

### Cleanup Logic

The hook removes all event listeners in the effect cleanup:

```ts
return () => {
  container.removeEventListener('pointerdown', handlePointerDown)
  container.removeEventListener('pointermove', handlePointerMove)
  container.removeEventListener('pointerup', endDrag)
  container.removeEventListener('pointercancel', endDrag)
  container.removeEventListener('wheel', handleWheel)
}
```

This prevents old event handlers from staying active after the component unmounts.

## `useThreeSceneTexture.ts`

This hook loads panorama images into GPU-ready Three.js textures.

### Important Imports

```ts
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
```

It needs React state for loading/error state and Three.js for `TextureLoader`.

### Main State

```ts
type TextureState = {
  texture: THREE.Texture | null
  isLoading: boolean
  error: Error | null
}
```

The hook tells the viewer:

- Whether a texture is loaded.
- Whether loading is in progress.
- Whether loading failed.

### `textureRef`

```ts
const textureRef = useRef<THREE.Texture | null>(null)
```

This keeps track of the currently loaded texture so it can be disposed when replaced or unmounted.

### Loading a Panorama Image

Important block:

```ts
const loader = new THREE.TextureLoader()
loader.setCrossOrigin('anonymous')
loader.load(
  panoramaUrl,
  (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    textureRef.current?.dispose()
    textureRef.current = texture
    setState({ texture, isLoading: false, error: null })
  },
)
```

Beginner explanation:

- `TextureLoader` downloads the image.
- Three.js turns it into a texture.
- The texture is what gets painted onto the inside of the sphere.

### Why `colorSpace` Matters

```ts
texture.colorSpace = THREE.SRGBColorSpace
```

This helps image colors appear closer to normal browser image colors.

### Why Filters Are Set

```ts
texture.minFilter = THREE.LinearFilter
texture.magFilter = THREE.LinearFilter
```

These filters affect how the texture is sampled when zoomed or scaled.

### Handling Scene Changes

When `panoramaUrl` changes, the hook loads a new texture. Before storing the new one, it disposes the old texture:

```ts
textureRef.current?.dispose()
```

This is important because textures live in GPU memory.

### Cleanup Logic

On unmount:

```ts
return () => {
  textureRef.current?.dispose()
  textureRef.current = null
}
```

This frees the panorama texture when the viewer leaves the page.

## `ThreeHotspotLayer.tsx`

This file renders hotspots over the Three.js canvas.

### Important Imports

```ts
import HotspotButton from '../HotspotButton'
import { projectPitchYawToScreen } from './threePanoramaMath'
```

The key idea:

- Reuse existing hotspot UI.
- Replace Pannellum's hotspot placement with our own projection math.

### Props

```ts
type Props = {
  camera: PerspectiveCamera | null
  containerRef: RefObject<HTMLElement | null>
  floorSlug: string
  hotspots: HotspotData[]
  onNavigate: HotspotNavigationHandler
  tourSlug: string
}
```

The layer needs:

- The camera so it can project 3D directions into screen positions.
- The container so it knows the screen size.
- The current hotspots.
- The same navigation callback used by portal hotspots.

### Main State

```ts
const [projectedHotspots, setProjectedHotspots] = useState<ProjectedHotspot[]>([])
```

This stores the calculated screen position of each visible hotspot.

### Projection Loop

Important block:

```ts
const nextHotspots = hotspots
  .filter((hotspot) => hotspot.pitch !== undefined && hotspot.yaw !== undefined)
  .map((hotspot) => {
    const projected = projectPitchYawToScreen(
      Number(hotspot.pitch),
      Number(hotspot.yaw),
      camera,
      container,
    )
    ...
  })
```

Responsibility:

- Ignore hotspots without coordinates.
- Convert each hotspot from pitch/yaw to screen x/y.
- Mark hotspots as visible or hidden.

### Why It Updates Every Animation Frame

```ts
frameId = requestAnimationFrame(update)
```

The camera can move every frame during dragging. If the hotspot layer only calculated positions once, hotspots would float in the wrong place. Recalculating every animation frame keeps DOM hotspots aligned with the panorama.

### Viewport Padding

```ts
const HOTSPOT_EDGE_PADDING = 48
```

Hotspots can remain visible slightly outside the exact viewport edge. This avoids harsh popping right at the boundary.

### Stopping Drag From Hotspot Clicks

```ts
const stopViewerGesture = (event: React.SyntheticEvent) => {
  event.stopPropagation()
}
```

The wrapper listens for click and pointer events:

```tsx
onClick={stopViewerGesture}
onDoubleClick={stopViewerGesture}
onPointerDown={stopViewerGesture}
onTouchStart={stopViewerGesture}
```

Why it matters:

- Clicking a hotspot should activate the hotspot.
- It should not also start dragging the panorama.

### Reusing Existing Hotspot UI

```tsx
<HotspotButton
  hotspot={{ ...hotspot, floorSlug }}
  tourSlug={tourSlug}
  floorSlug={floorSlug}
  onNavigate={onNavigate}
/>
```

This keeps portal and info hotspot rendering consistent with the Pannellum viewer.

### Cleanup Logic

The projection loop is stopped on unmount:

```ts
return () => {
  cancelAnimationFrame(frameId)
}
```

## `ThreePanoramaViewer.tsx`

This is the main optional Three.js viewer component.

### Important Imports

```ts
import * as THREE from 'three'
```

This imports the Three.js library.

```ts
import { SceneTransition, useSceneTransition, useTransitionSettings } from '../transition'
```

The Three.js viewer reuses the existing transition system instead of inventing a new one.

```ts
import ThreeHotspotLayer from './ThreeHotspotLayer'
import { useThreePanoramaControls } from './useThreePanoramaControls'
import { useThreeSceneTexture } from './useThreeSceneTexture'
```

The component delegates:

- Hotspot rendering to `ThreeHotspotLayer`.
- Camera controls to `useThreePanoramaControls`.
- Texture loading to `useThreeSceneTexture`.

### Props

```ts
export default function ThreePanoramaViewer({
  scenes,
  initialSceneSlug,
  tourSlug,
  floorSlug,
  isDraft,
  onSceneChange,
}: ThreePanoramaViewerProps)
```

These mirror `PannellumViewer`, so `TourViewer` can swap between renderers with minimal code.

### Main Refs

```ts
const containerRef = useRef<HTMLDivElement>(null)
const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
const sceneRef = useRef<THREE.Scene | null>(null)
const sphereRef = useRef<THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> | null>(null)
const frameRef = useRef<number | null>(null)
const resizeObserverRef = useRef<ResizeObserver | null>(null)
```

Beginner explanation:

- `containerRef`: the DOM element where the canvas goes.
- `cameraRef`: the viewer's virtual camera.
- `rendererRef`: the WebGL renderer that draws the scene.
- `sceneRef`: the Three.js world.
- `sphereRef`: the inverted sphere mesh.
- `frameRef`: the current animation frame ID.
- `resizeObserverRef`: watches size changes.

### Main State

```ts
const [cameraForHotspots, setCameraForHotspots] = useState<THREE.PerspectiveCamera | null>(null)
const [activeSceneSlug, setActiveSceneSlug] = useState(initialSceneSlug)
```

`cameraForHotspots` lets the React hotspot layer receive the camera after it is created.

`activeSceneSlug` tracks which same-floor scene is currently being shown.

### Finding the Active Scene

```ts
const activeScene = useMemo<ThreeSceneData>(() => (
  scenes.find((scene) => scene.slug === activeSceneSlug) ||
  scenes.find((scene) => scene.slug === initialSceneSlug) ||
  scenes[0]
), [activeSceneSlug, initialSceneSlug, scenes])
```

Responsibility:

- Find the current scene object.
- Fall back safely if the slug is missing.

### Camera Controls Hook

```ts
const { applyCameraState, setCameraState } = useThreePanoramaControls({
  cameraRef,
  containerRef,
  initialPitch: activeScene?.initialPitch ?? 0,
  initialYaw: activeScene?.initialYaw ?? 0,
  initialHfov: activeScene?.initialHfov ?? 120,
})
```

Responsibility:

- Initialize camera values from CMS data.
- Enable drag and wheel controls.
- Provide a way to reset camera state during scene switches.

### Texture Loading Hook

```ts
const { texture, isLoading, error } = useThreeSceneTexture(activeScene?.panoramaUrl)
```

Responsibility:

- Load the current scene's `panoramaUrl` as a Three.js texture.
- Report loading and error states.
- Dispose old textures when replaced.

### `switchToScene(sceneSlug)`

Responsibility:

- Handles same-floor scene switching.

Important block:

```ts
setActiveSceneSlug(sceneSlug)
setCameraState({
  pitch: nextScene.initialPitch,
  yaw: nextScene.initialYaw,
  hfov: nextScene.initialHfov,
})
onSceneChange(sceneSlug)
```

What happens:

1. The active scene slug changes.
2. The texture hook receives the new `panoramaUrl`.
3. The camera resets to the target scene's initial view.
4. `TourViewer` is notified so the overlay title and hotspot sidebar update.

### `handleSceneNavigation`

Responsibility:

- Handles portal hotspot navigation.
- Matches the existing Pannellum behavior:
  - Same floor: switch scene inside the viewer.
  - Cross floor: use route navigation.

Important block:

```ts
const isSameFloor = !targetFloorSlug || targetFloorSlug === floorSlug
```

This decides whether the portal target is on the same floor.

Query preservation:

```ts
const query = new URLSearchParams()
if (isDraft) query.set('draft', 'true')
query.set('viewer', 'three')
```

This keeps both draft mode and the Three.js prototype active during navigation.

Transition midpoint:

```ts
onMidpoint: async () => {
  if (isSameFloor) {
    switchToScene(targetSlug)
  } else {
    window.location.assign(`/tour/${tourSlug}/${targetFloorSlug}/${targetSlug}${queryString}`)
  }
}
```

This reuses the existing transition pattern: start an animation, switch scene at the midpoint, then finish the animation.

### Creating the Three.js Scene

The main setup happens inside a `useEffect`.

Important block:

```ts
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1100)
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance',
})
```

What these mean:

- `Scene`: the 3D world.
- `PerspectiveCamera`: the virtual camera inside the panorama.
- `WebGLRenderer`: draws the 3D world into a canvas.

### Creating the Inverted Sphere

Important block:

```ts
const geometry = new THREE.SphereGeometry(500, 64, 40)
geometry.scale(-1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xffffff })
const sphere = new THREE.Mesh(geometry, material)
scene.add(sphere)
```

What this does:

- Creates a large sphere around the camera.
- Flips it inside-out with `geometry.scale(-1, 1, 1)`.
- Adds a simple material that will later receive the panorama texture.

Why an inverted sphere?

- Normally a sphere is visible from the outside.
- A panorama viewer places the camera inside the sphere.
- The sphere must be inverted so the image is visible from the inside.

### Adding the Renderer Canvas

```ts
container.appendChild(renderer.domElement)
```

The renderer creates a `<canvas>`. This line places that canvas inside the React container.

### Applying Camera State

```ts
setCameraForHotspots(camera)
applyCameraState()
```

The camera is:

- Stored for the hotspot layer.
- Immediately pointed using the active scene's initial pitch/yaw/HFOV.

### Handling Resize

Important block:

```ts
const resize = () => {
  const width = Math.max(container.clientWidth, 1)
  const height = Math.max(container.clientHeight, 1)
  renderer.setSize(width, height, false)
  applyCameraState()
}
```

When the container changes size:

- Resize the WebGL canvas.
- Recalculate the camera aspect ratio and FOV.

The code uses both:

```ts
resizeObserverRef.current = new ResizeObserver(resize)
window.addEventListener('resize', resize)
```

This handles container changes and browser window changes.

### Render Loop

```ts
const render = () => {
  renderer.render(scene, camera)
  frameRef.current = requestAnimationFrame(render)
}
frameRef.current = requestAnimationFrame(render)
```

Beginner explanation:

- WebGL needs to draw frames repeatedly.
- `requestAnimationFrame` runs before the browser paints the next frame.
- The loop keeps the panorama responsive while the camera changes.

### Assigning the Loaded Texture

```ts
useEffect(() => {
  const sphere = sphereRef.current
  if (!sphere) return

  sphere.material.map = texture
  sphere.material.needsUpdate = true
}, [texture])
```

Responsibility:

- When `useThreeSceneTexture` finishes loading an image, attach the texture to the sphere material.

What this means visually:

- The inside of the sphere becomes the panorama image.

### Loading and Error UI

```tsx
{isLoading && !texture && (
  <div>Loading scene...</div>
)}
{error && (
  <div>Unable to load this panorama.</div>
)}
```

These messages appear above the black background while a panorama is loading or if the image fails.

### Hotspot Layer

```tsx
<ThreeHotspotLayer
  camera={cameraForHotspots}
  containerRef={containerRef}
  floorSlug={floorSlug}
  hotspots={activeScene.hotspots || []}
  onNavigate={handleSceneNavigation}
  tourSlug={tourSlug}
/>
```

This sends the current scene's hotspots to the DOM overlay layer.

### Transition Overlay

```tsx
<SceneTransition state={transitionState} />
```

The Three.js viewer reuses the existing scene transition overlay used by Pannellum.

### Cleanup and Dispose Logic

Cleanup is one of the most important parts of WebGL code.

Important block:

```ts
if (frameRef.current !== null) {
  cancelAnimationFrame(frameRef.current)
  frameRef.current = null
}

resizeObserverRef.current?.disconnect()
window.removeEventListener('resize', resize)

scene.remove(sphere)
material.map = null
material.dispose()
geometry.dispose()
renderer.dispose()
renderer.forceContextLoss()
```

What gets cleaned up:

- Animation frame loop.
- Resize observer.
- Window resize listener.
- Sphere removed from scene.
- Material disposed.
- Geometry disposed.
- Renderer disposed.
- WebGL context released.

The canvas is also removed:

```ts
if (renderer.domElement.parentElement === container) {
  container.removeChild(renderer.domElement)
}
```

Why this matters:

- WebGL resources live partly in GPU memory.
- React unmounting a component does not automatically free all GPU resources.
- Without cleanup, repeated navigation can leak memory and eventually break rendering.

## 4. Integration Explanation

The renderer choice happens in two steps.

### Step 1: The Route Reads the Query Parameter

File:

```text
src/app/(frontend)/tour/[tourSlug]/[floorSlug]/[sceneSlug]/page.tsx
```

Code:

```ts
const viewerMode: 'three' | 'pannellum' =
  viewerParam === 'three' ? 'three' : 'pannellum'
```

This means:

- `?viewer=three` selects Three.js.
- Anything else selects Pannellum.
- No query parameter selects Pannellum.

Then `viewerMode` is included in `sceneData`.

### Step 2: `TourViewer` Chooses the Component

File:

```text
src/components/tour/TourViewer.tsx
```

Code:

```ts
const useThreeViewer = data.viewerMode === 'three'
```

Then:

```tsx
{useThreeViewer ? (
  <ThreePanoramaViewer ... />
) : (
  <PannellumViewer ... />
)}
```

This keeps the choice centralized and easy to remove or change later.

### Why Three.js Is Dynamically Imported

```ts
const ThreePanoramaViewer = dynamic(() => import('./three/ThreePanoramaViewer'), {
  ssr: false,
})
```

Reasons:

- Three.js needs browser APIs such as WebGL and canvas.
- It should not run during server-side rendering.
- The default Pannellum path should not eagerly load the prototype bundle.

## 5. Safe Testing Steps

### Install Dependencies

Run:

```bash
npm install
```

This installs `three`, `@types/three`, and the rest of the project dependencies from `package-lock.json`.

### Start the Development Server

Run:

```bash
npm run dev
```

The app should start on the configured Next.js development port, commonly:

```text
http://localhost:3000
```

### Open the Normal Pannellum Viewer

Use a normal public scene route without `viewer=three`:

```text
http://localhost:3000/tour/[tourSlug]/[floorSlug]/[sceneSlug]
```

Example shape:

```text
http://localhost:3000/tour/main-campus/level-1/entry
```

This should render the existing Pannellum viewer.

### Open the Three.js Viewer

Add `?viewer=three`:

```text
http://localhost:3000/tour/[tourSlug]/[floorSlug]/[sceneSlug]?viewer=three
```

If also testing draft mode:

```text
http://localhost:3000/tour/[tourSlug]/[floorSlug]/[sceneSlug]?draft=true&viewer=three
```

### Suggested Comparison Workflow

1. Open the Pannellum URL.
2. Note the initial camera direction.
3. Note hotspot positions.
4. Test drag and zoom.
5. Open the same URL with `?viewer=three`.
6. Compare the same behavior.
7. Use `docs/threejs-public-viewer-parity-checklist.md` to record parity gaps.

### Useful Validation Commands

Type-check the project:

```bash
npx tsc --noEmit
```

Build the project:

```bash
npm run build
```

## 6. Learning Notes

### What Is a Three.js Scene?

A Three.js scene is like a small 3D world. It contains objects, such as meshes, lights, and helpers.

In this viewer, the scene contains one important object:

- The panorama sphere.

### What Is a Camera?

A camera is the viewer's eye inside the 3D world.

In this project:

- The camera sits at the center of the sphere.
- It looks outward at different parts of the panorama image.
- Its direction is controlled by pitch and yaw.
- Its zoom is controlled by HFOV.

### What Is a Renderer?

The renderer draws the Three.js scene into an HTML canvas.

In this project:

```ts
const renderer = new THREE.WebGLRenderer(...)
```

The renderer creates a canvas, and the code appends that canvas to the viewer container.

### What Is Geometry?

Geometry describes the shape of a 3D object.

In this viewer:

```ts
const geometry = new THREE.SphereGeometry(500, 64, 40)
```

This creates a sphere shape.

### What Is a Material?

A material describes what the surface of a 3D object looks like.

In this viewer:

```ts
const material = new THREE.MeshBasicMaterial({ color: 0xffffff })
```

Later, the panorama texture is assigned to this material:

```ts
sphere.material.map = texture
```

### What Is a Texture?

A texture is an image used on a 3D surface.

In this viewer:

- The panorama JPG/PNG is loaded as a texture.
- That texture is placed on the inside of the sphere.
- The camera looks around inside it.

### What Is a Mesh?

A mesh combines geometry and material.

```ts
const sphere = new THREE.Mesh(geometry, material)
```

In plain language:

- Geometry says "this is a sphere."
- Material says "this sphere displays the panorama image."
- Mesh is the actual object added to the scene.

### What Is an Inverted Sphere?

A normal sphere is visible from the outside. But a panorama viewer puts the camera inside the sphere.

So the sphere is inverted:

```ts
geometry.scale(-1, 1, 1)
```

This flips the sphere so its inside surface is visible to the camera.

### What Is an Equirectangular Panorama?

An equirectangular panorama is a flat image that contains a full 360-degree view.

It usually has a 2:1 aspect ratio, for example:

```text
6000 x 3000
```

The left and right edges wrap around horizontally. The top represents straight up, and the bottom represents straight down.

Pannellum and Three.js both need to map this flat image onto a 3D shape to make it feel like a 360 viewer.

### What Is Pitch?

Pitch is the vertical look angle.

Examples:

- `0` means looking straight at the horizon.
- `45` means looking upward.
- `-45` means looking downward.
- `90` means straight up.
- `-90` means straight down.

### What Is Yaw?

Yaw is the horizontal look direction.

Examples:

- `0` means the panorama's forward/center direction.
- `90` means turned right according to the compatibility convention used here.
- `-90` means turned left.
- `180` or `-180` means looking behind.

### What Is HFOV?

HFOV means horizontal field of view.

Beginner-friendly meaning:

- It controls how wide the view is.
- A larger HFOV shows more of the panorama and feels zoomed out.
- A smaller HFOV shows less of the panorama and feels zoomed in.

Important difference:

- Pannellum uses horizontal field of view.
- Three.js `PerspectiveCamera` uses vertical field of view.

That is why the code has:

```ts
horizontalFovToVerticalFov(hfov, aspect)
```

### Why Is Cleanup Important in WebGL?

WebGL uses GPU resources. These are not always freed automatically when a React component disappears.

If cleanup is missing, repeated navigation can leave behind:

- Old textures.
- Old geometry.
- Old materials.
- Old renderers.
- Old animation loops.
- Old event listeners.

Over time this can cause:

- Higher memory usage.
- Slower performance.
- Browser warnings.
- Broken WebGL rendering.

That is why the Three.js viewer explicitly calls:

```ts
material.dispose()
geometry.dispose()
renderer.dispose()
renderer.forceContextLoss()
```

And why texture cleanup calls:

```ts
textureRef.current?.dispose()
```

### Mental Model for This Prototype

Think of the Three.js viewer like this:

1. Put the user inside a hollow sphere.
2. Paint the panorama image on the inside of the sphere.
3. Point a camera at the correct pitch/yaw.
4. Change the camera direction when the user drags.
5. Change the camera FOV when the user zooms.
6. Convert hotspot pitch/yaw into screen positions.
7. Draw normal React buttons at those positions.
8. When switching same-floor scenes, load a new texture and reset the camera.
9. When leaving the viewer, clean up everything created for WebGL.

This is the same experience Pannellum provides at a higher level, but now the app owns the rendering and projection details directly.
