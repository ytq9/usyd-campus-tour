# Three.js Hotspot Alignment Note

## Issue

Admin hotspot placement uses `HotspotPicker`, which saves raw Pannellum-compatible `pitch` and `yaw` values into Payload. The Pannellum public fallback renders those stored values directly.

The Three.js public viewer was applying `scene.rotation` when rendering and focusing hotspots. That changed hotspot yaw from:

```txt
storedYaw
```

to:

```txt
storedYaw + scene.rotation
```

For scenes with non-zero `rotation`, this could shift Three.js hotspots horizontally away from the positions chosen in the admin picker and away from the Pannellum fallback.

## What Changed

Three.js hotspot display now uses the stored raw hotspot coordinates directly:

- `ThreeHotspotLayer` projects raw hotspot `pitch` and `yaw`.
- Info hotspot focus uses raw hotspot `pitch` and `yaw`.
- Portal transition direction uses raw hotspot `pitch` and `yaw`.

`scene.rotation` still exists and is not removed from Payload data or route data. It is intentionally ignored for hotspot display, info focus, and portal transition direction until a confirmed rotation strategy is chosen.

## How To Test

Open the same scene in both public viewers:

```txt
/tour/<tourSlug>/<floorSlug>/<sceneSlug>
/tour/<tourSlug>/<floorSlug>/<sceneSlug>?viewer=pannellum
```

Compare portal and info hotspot positions. The Three.js viewer should place hotspots at the same panorama positions as the Pannellum fallback.

For info hotspots, click the hotspot in both viewers and confirm the camera focuses on the same stored point. For portal hotspots, click the hotspot and confirm the transition turns toward the same hotspot direction before navigation.

## If Old CMS Data Still Looks Wrong

If a hotspot is still visibly wrong in both Three.js and Pannellum, the stored CMS `pitch` or `yaw` is probably wrong and should be repicked in the admin hotspot picker.

If a hotspot is correct in Pannellum but still wrong in Three.js, the remaining issue is likely in Three.js projection/orientation math rather than Payload data or the admin picker.

Do not compensate by changing Payload schema or mass-editing database hotspot values until the viewer coordinate strategy is confirmed.
