# USYD Campus Tour — Test Report

**Branch:** `develop`
**Test Date:** 2026-04-20
**Tester:** sanmu
**Environment:** Local (`http://localhost:3000/admin`)

---

## Summary

| Module | Status |
|--------|--------|
| Bulk Image Upload (yaxuan/bulk-upload) | ⚠️ Partial — functional issue found |
| Tour Publish Validation (Abigail/publish-validation-check) | ❌ Fail — all validation errors not surfaced |
| Hotspot Drag Fix (yyx-hotspot-fix) | ❌ Fail — hotspot position not persisted |
| Scene Transition Animation (Scene_Transition_Animation) | ⚠️ Partial — transition only applies to first hotspot; settings panel not functional |

---

## Bug Reports

---

### BUG-01 — Duplicate Upload Entry Point in Media Collection

**Severity:** Low  
**Module:** Bulk Image Upload  
**Steps to Reproduce:**
1. Navigate to Admin → Media
2. Observe the top of the list page

**Expected:** A single upload method is available (bulk upload replaces the original single-file "Create New" flow, or they are clearly differentiated).

**Actual:** Both the new **Bulk Upload Images** component and the original **Create New** button are present simultaneously, creating a redundant and potentially confusing UI.

**Suggested Fix:** Either hide the default "Create New" button when the bulk upload component is active, or add clear labels to distinguish the two entry points.

---

### BUG-02 — Tour Publish Validation Errors Not Displayed to User

**Severity:** High  
**Module:** Tour Publish Validation  
**Affected Test Cases:** TC-06, TC-07, TC-08, TC-09, TC-10, TC-11, TC-12  
**Steps to Reproduce:**
1. Create a Tour that fails one or more publish conditions (e.g. no floors, no defaultFloor, unpublished scenes, missing panorama, etc.)
2. Set status to **Published** and save

**Expected:** A descriptive error message is shown indicating exactly which condition failed (e.g. "Tour has no floors linked.", "Floor X has no initial scene set.", etc.)

**Actual:** A generic **"Something went wrong"** message is displayed. No specific validation feedback is surfaced to the user regardless of which condition is violated.

**Impact:** Content editors cannot determine why publishing failed or how to resolve it, making the validation feature effectively non-functional from a UX perspective.

**Suggested Fix:** Ensure the error thrown in the `beforeChange` hook is caught and its message is returned to the client in a user-readable format. Verify that Payload CMS is configured to surface hook-thrown errors to the admin UI rather than swallowing them as generic 500 responses.

---

### BUG-03 — Hotspot Position Resets to Top-Left After Drag

**Severity:** High  
**Module:** Hotspot Drag Fix (HotspotPicker)  
**Steps to Reproduce:**
1. Open a Scene with a panorama image set
2. Expand a Hotspot field and open the **Visual Picker**
3. Observe that a hotspot marker appears in the top-left corner of the panorama viewer on load
4. Drag the marker to a new position and release

**Expected:**
- On load, the marker should appear at the hotspot's previously saved pitch/yaw coordinates (or no marker if none are set)
- After dragging and releasing, the marker stays at the new position and the `pitch` / `yaw` fields update to the new coordinates

**Actual:**
- On load, the marker always appears in the top-left corner regardless of saved coordinates
- After dragging, the marker snaps back to the top-left corner on mouse release; coordinates are not updated

**Impact:** Hotspot positions cannot be set or edited visually. The drag fix from `yyx-hotspot-fix` does not resolve the issue.

**Suggested Fix:**
1. On viewer initialisation, read the current `pitch` and `yaw` field values and render the marker at those coordinates.
2. On drag end, write the final coordinates back to the `pitch` and `yaw` fields and prevent the marker from re-rendering to its default position.

---

### BUG-04 — Scene Transition Only Triggers on First Hotspot

**Severity:** High
**Module:** Scene Transition Animation
**Affected Test Cases:** TC-24, TC-25
**Steps to Reproduce:**
1. Navigate to a published Tour on the frontend
2. Click the first Portal hotspot in a Scene — the portal transition animation plays
3. Click any subsequent Portal hotspot in the same or another Scene

**Expected:** The portal transition animation plays on every hotspot click throughout the tour session.

**Actual:** The transition animation only plays when clicking the first hotspot. All subsequent hotspot clicks navigate without any transition effect.

**Suggested Fix:** Investigate whether the transition state is not being reset after the first animation completes, preventing subsequent transitions from triggering. Check `useSceneTransition` for state cleanup after `startTransition` resolves.

---

### BUG-05 — Transition Effect Cannot Be Changed via Settings Panel

**Severity:** Medium
**Module:** Scene Transition Animation
**Affected Test Cases:** TC-26, TC-27, TC-28
**Steps to Reproduce:**
1. Open the Tour frontend page
2. Click the gear icon (bottom-right corner) to open the transition settings panel
3. Change the same-floor or cross-floor preset to a different effect (e.g. blur, flash)
4. Click a Portal hotspot to trigger a scene transition

**Expected:** The selected transition effect is applied on the next hotspot click.

**Actual:** The transition effect does not change regardless of the preset selected. The settings panel appears non-functional — changing presets has no observable effect on the transition behaviour.

**Suggested Fix:** Verify that `updateSettings` in `TransitionProvider` is correctly updating the context state, and that `getConfig` in `PannellumViewer` is reading the latest context value rather than a stale closure.

---

### BUG-06 — Transition Settings Panel UI Displayed in Chinese

**Severity:** Low
**Module:** Scene Transition Animation
**Affected Test Cases:** TC-22
**Steps to Reproduce:**
1. Open the Tour frontend page
2. Click the gear icon (bottom-right corner)

**Expected:** All UI text in the settings panel is in English, consistent with the rest of the application.

**Actual:** The settings panel displays in Chinese — including the panel title, toggle label, dropdown labels, preview buttons, and all preset option names.

**Suggested Fix:** Replace all Chinese strings in `TransitionProvider.tsx` (`TransitionSelector` component and `getPresetLabel` function) with English equivalents.

---

## Passed Tests

| Test Case | Result |
|-----------|--------|
| TC-01 Button click bulk upload | ✅ Pass |
| TC-02 Drag & drop bulk upload | ✅ Pass |
| TC-03 Non-image file filtered | ✅ Pass |
| TC-04 Duplicate file detection modal | ✅ Pass |
| TC-05 Retry failed uploads | ✅ Pass |
| TC-13 Tour publish succeeds when all conditions met | ⬜ Blocked by BUG-02 |
| TC-14 Visual Picker opens correctly | ✅ Pass |
| TC-16 UI text is in English | ✅ Pass |
| TC-22 Transition settings panel opens | ✅ Pass |
| TC-23 Disable transition — no animation | ⬜ Blocked by BUG-05 |
| TC-24 Same-floor transition (portal) | ⚠️ Partial — first hotspot only (BUG-04) |
| TC-25 Cross-floor transition (zoomIn) | ⚠️ Partial — first hotspot only (BUG-04) |
| TC-28 Changing preset takes effect | ❌ Fail — BUG-05 |
