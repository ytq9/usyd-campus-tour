# Hotspot Debugging Guide

## How Admin Hotspot Coordinates Are Saved

`src/components/admin/three/ThreeHotspotPicker.tsx` lets an admin choose hotspot coordinates in the Payload form. The picker uses the same pitch/yaw coordinate fields rendered by the public Three.js viewer and writes those values into the current Payload form row with `setPitch` and `setYaw`.

Those form updates are not the same thing as publishing public data. After moving a hotspot, the scene document still needs to be saved. If the project is using drafts, public visitors will keep seeing the published values until the draft is published.

## Live Drag Values vs Saved Field Values

While dragging a hotspot, the picker can show a live coordinate under the cursor and a separate saved/form coordinate nearby. The live drag label is temporary pointer feedback. The Payload pitch/yaw fields are the values that matter for persistence and public rendering.

After mouseup, record the actual Payload `Pitch` and `Yaw` field values, then save or publish the scene before comparing against the public viewer.

## Save Draft vs Publish

Scenes and tours use Payload drafts. Floors do not use drafts.

- `?draft=true` asks the public scene route to read draft tour and scene data.
- Without `?draft=true`, the public route shows published data.
- If the admin values look correct but the normal public route looks old, the scene may be saved as a draft but not published.

## Using Public Hotspot Debug Mode

Open a public scene with:

```text
/tour/<tourSlug>/<floorSlug>/<sceneSlug>?debugHotspots=true
```

To inspect draft data:

```text
/tour/<tourSlug>/<floorSlug>/<sceneSlug>?draft=true&debugHotspots=true
```

The debug panel shows route slugs, draft state, current scene slug, active scene slug, all `floorScenes`, and each hotspot's raw `pitch`, `yaw`, `type`, `text`, `targetScene`, and `targetFloor`.

Use it to compare the public data received by the viewer against the exact Payload admin field values.

## Confirming Data vs Projection

1. Edit one hotspot in admin.
2. Record the exact `Pitch` and `Yaw` field values after mouseup.
3. Click `Save Draft`.
4. Open `/tour/<tourSlug>/<floorSlug>/<sceneSlug>?draft=true&debugHotspots=true`.
5. Compare debug panel `pitch` and `yaw` with the admin field values.
6. Click `Publish` in admin.
7. Open `/tour/<tourSlug>/<floorSlug>/<sceneSlug>?debugHotspots=true`.
8. Compare debug panel `pitch` and `yaw` again.

If draft debug values match admin but published debug values do not, publish workflow is the issue. If neither debug route matches admin, verify that the correct scene and hotspot row were edited and saved.

## Query Preservation

Viewer navigation preserves active debug parameters:

- `draft=true` remains active in draft preview flows.
- `debugHotspots=true` remains active across floor map and hotspot navigation.
