'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useField, useFormFields } from '@payloadcms/ui'

declare global {
  interface Window {
    pannellum: any
  }
}

type Props = {
  path: string
  [key: string]: any
}

type ScreenPos = { x: number; y: number; visible: boolean }

// Project a spherical (pitch, yaw) onto canvas pixel coords given the camera state.
// Mirrors Pannellum's internal renderHotSpot math so our overlay marker tracks the
// panorama exactly the way a real Pannellum hotspot would — without depending on
// Pannellum's hotspot DOM/lifecycle (which proved unreliable for drag-to-update).
function projectToScreen(
  hsPitch: number,
  hsYaw: number,
  viewPitch: number,
  viewYaw: number,
  hfov: number,
  canvasW: number,
  canvasH: number,
): ScreenPos {
  const hsP = (hsPitch * Math.PI) / 180
  const vP = (viewPitch * Math.PI) / 180
  const yawDelta = ((-hsYaw + viewYaw) * Math.PI) / 180

  const hsPS = Math.sin(hsP)
  const hsPC = Math.cos(hsP)
  const vPS = Math.sin(vP)
  const vPC = Math.cos(vP)
  const yawCos = Math.cos(yawDelta)
  const yawSin = Math.sin(yawDelta)

  const z = hsPS * vPS + hsPC * yawCos * vPC
  if (z <= 0) return { x: 0, y: 0, visible: false }

  const hfovTan = Math.tan((hfov * Math.PI) / 360)
  const offX = (-canvasW / hfovTan) * yawSin * hsPC / z / 2
  const offY = (-canvasW / hfovTan) * (hsPS * vPC - hsPC * yawCos * vPS) / z / 2

  return {
    x: offX + canvasW / 2,
    y: offY + canvasH / 2,
    visible: true,
  }
}

export default function HotspotPicker({ path }: Props) {
  const basePath = path.replace(/\.visualPicker$/, '')

  const { value: pitch, setValue: setPitch } = useField<number>({ path: `${basePath}.pitch` })
  const { value: yaw, setValue: setYaw } = useField<number>({ path: `${basePath}.yaw` })

  const panoramaFieldValue = useFormFields(([fields]) => fields['panorama']?.value as any)

  const [isOpen, setIsOpen] = useState(false)
  const [panoramaUrl, setPanoramaUrl] = useState<string | null>(null)

  // Pending values: local-only until Confirm
  const [pendingPitch, setPendingPitch] = useState<number | undefined>(undefined)
  const [pendingYaw, setPendingYaw] = useState<number | undefined>(undefined)

  // Marker's projected screen position (driven by RAF loop, or directly during drag)
  const [markerPos, setMarkerPos] = useState<ScreenPos | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Snapshots when modal opens, used by Reset
  const originalPitchRef = useRef<number | undefined>(undefined)
  const originalYawRef = useRef<number | undefined>(undefined)

  // Refs for values RAF needs to read without re-subscribing
  const pendingPitchRef = useRef<number | undefined>(undefined)
  const pendingYawRef = useRef<number | undefined>(undefined)
  const isDraggingRef = useRef(false)

  const viewerRef = useRef<HTMLDivElement>(null)
  const pannellumRef = useRef<any>(null)
  const suppressNextClickRef = useRef(false)
  const statusSpanRef = useRef<HTMLSpanElement>(null)

  // Keep refs in sync
  useEffect(() => { pendingPitchRef.current = pendingPitch }, [pendingPitch])
  useEffect(() => { pendingYawRef.current = pendingYaw }, [pendingYaw])

  // Resolve panorama URL (object with .url, or media ID to fetch)
  useEffect(() => {
    if (!panoramaFieldValue) { setPanoramaUrl(null); return }
    if (typeof panoramaFieldValue === 'object' && panoramaFieldValue?.url) {
      setPanoramaUrl(panoramaFieldValue.url); return
    }
    const id = typeof panoramaFieldValue === 'object' ? panoramaFieldValue?.id : panoramaFieldValue
    if (id) {
      fetch(`/api/media/${id}`)
        .then(r => r.json())
        .then(doc => { if (doc?.url) setPanoramaUrl(doc.url) })
        .catch(() => {})
    }
  }, [panoramaFieldValue])

  // When modal opens: snapshot original values and seed pending state
  useEffect(() => {
    if (isOpen) {
      const p = pitch !== undefined ? Number(pitch) : undefined
      const y = yaw !== undefined ? Number(yaw) : undefined
      originalPitchRef.current = p
      originalYawRef.current = y
      setPendingPitch(p)
      setPendingYaw(y)
    } else {
      setMarkerPos(null)
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize Pannellum (panorama only — NO hotspots; we render our own)
  useEffect(() => {
    if (!isOpen || !viewerRef.current || !panoramaUrl) return

    let cancelled = false

    const init = async () => {
      await import('pannellum/build/pannellum.css')
      await import('pannellum/build/pannellum.js')
      if (cancelled || !window.pannellum || !viewerRef.current) return

      const initP = pitch !== undefined ? Number(pitch) : 0
      const initY = yaw !== undefined ? Number(yaw) : 0

      pannellumRef.current = window.pannellum.viewer(viewerRef.current, {
        type: 'equirectangular',
        panorama: panoramaUrl,
        autoLoad: true,
        showControls: false,
        // Aim camera at the saved position so the marker is in view on open
        pitch: initP,
        yaw: initY,
      })
    }

    init()

    return () => {
      cancelled = true
      if (pannellumRef.current) {
        try { pannellumRef.current.destroy() } catch {}
        pannellumRef.current = null
      }
    }
  }, [isOpen, panoramaUrl]) // eslint-disable-line react-hooks/exhaustive-deps

  // RAF loop: project pending pitch/yaw onto screen each frame so the marker
  // follows the panorama as the user pans. Skipped while dragging (drag writes
  // marker position directly from mouse coords).
  useEffect(() => {
    if (!isOpen) return

    let raf = 0
    const tick = () => {
      const viewer = pannellumRef.current
      const viewerEl = viewerRef.current

      if (viewer && viewerEl && !isDraggingRef.current) {
        const pp = pendingPitchRef.current
        const py = pendingYawRef.current
        if (pp === undefined || py === undefined) {
          setMarkerPos(prev => (prev === null ? prev : null))
        } else {
          try {
            const cp = viewer.getPitch()
            const cy = viewer.getYaw()
            const fov = viewer.getHfov()
            const w = viewerEl.clientWidth
            const h = viewerEl.clientHeight
            const next = projectToScreen(pp, py, cp, cy, fov, w, h)
            setMarkerPos(prev => {
              if (
                prev &&
                prev.visible === next.visible &&
                Math.abs(prev.x - next.x) < 0.5 &&
                Math.abs(prev.y - next.y) < 0.5
              ) {
                return prev
              }
              return next
            })
          } catch {}
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isOpen])

  // Click on the panorama (not the marker) → place marker at that spherical point
  useEffect(() => {
    if (!isOpen) return
    const viewerEl = viewerRef.current
    if (!viewerEl) return

    const onClick = (e: MouseEvent) => {
      if (suppressNextClickRef.current) {
        suppressNextClickRef.current = false
        return
      }
      const viewer = pannellumRef.current
      if (!viewer) return
      const coords = viewer.mouseEventToCoords(e)
      if (!coords || isNaN(coords[0]) || isNaN(coords[1])) return
      const np = Math.round(Math.max(-85, Math.min(85, coords[0])) * 100) / 100
      const ny = Math.round(Math.max(-180, Math.min(180, coords[1])) * 100) / 100
      // eslint-disable-next-line no-console
      console.log('[HotspotPicker] click-place →', { pitch: np, yaw: ny })
      setPendingPitch(np)
      setPendingYaw(ny)
    }

    viewerEl.addEventListener('click', onClick)
    return () => { viewerEl.removeEventListener('click', onClick) }
  }, [isOpen, panoramaUrl])

  // Drag the React-controlled marker
  const onMarkerMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    const viewer = pannellumRef.current
    const viewerEl = viewerRef.current
    if (!viewer || !viewerEl) return

    isDraggingRef.current = true
    setIsDragging(true)

    let lastClientX = e.clientX
    let lastClientY = e.clientY
    let hasMoved = false
    let lastValidPitch: number | null = null
    let lastValidYaw: number | null = null

    const onMove = (m: MouseEvent) => {
      lastClientX = m.clientX
      lastClientY = m.clientY
      hasMoved = true

      // Position marker directly under the cursor (independent of projection)
      const rect = viewerEl.getBoundingClientRect()
      setMarkerPos({
        x: m.clientX - rect.left,
        y: m.clientY - rect.top,
        visible: true,
      })

      const coords = viewer.mouseEventToCoords(m)
      if (coords && !isNaN(coords[0]) && !isNaN(coords[1])) {
        lastValidPitch = coords[0]
        lastValidYaw = coords[1]
        if (statusSpanRef.current) {
          statusSpanRef.current.textContent =
            `Dragging → Pitch: ${coords[0].toFixed(1)}°  Yaw: ${coords[1].toFixed(1)}°`
        }
      }
    }

    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      isDraggingRef.current = false
      setIsDragging(false)
      if (statusSpanRef.current) statusSpanRef.current.textContent = ''

      if (!hasMoved) return

      let newPitch: number | null = null
      let newYaw: number | null = null

      const finalCoords = viewer.mouseEventToCoords({ clientX: lastClientX, clientY: lastClientY })
      if (finalCoords && !isNaN(finalCoords[0]) && !isNaN(finalCoords[1])) {
        newPitch = finalCoords[0]
        newYaw = finalCoords[1]
      } else if (lastValidPitch !== null && lastValidYaw !== null) {
        newPitch = lastValidPitch
        newYaw = lastValidYaw
      }

      if (newPitch === null || newYaw === null) return

      newPitch = Math.round(Math.max(-85, Math.min(85, newPitch)) * 100) / 100
      newYaw = Math.round(Math.max(-180, Math.min(180, newYaw)) * 100) / 100

      // eslint-disable-next-line no-console
      console.log('[HotspotPicker] drag-end →', { pitch: newPitch, yaw: newYaw })

      // Suppress the click that browsers fire after mouseup
      suppressNextClickRef.current = true
      // Commit to pending state — RAF loop will re-project on the next frame
      setPendingPitch(newPitch)
      setPendingYaw(newYaw)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [])

  const handleConfirm = () => {
    if (pendingPitch !== undefined) setPitch(pendingPitch)
    if (pendingYaw !== undefined) setYaw(pendingYaw)
    setIsOpen(false)
  }

  const handleReset = () => {
    setPendingPitch(originalPitchRef.current)
    setPendingYaw(originalYawRef.current)
  }

  const displayPitch = isOpen
    ? (pendingPitch !== undefined ? pendingPitch.toFixed(1) : '—')
    : (pitch !== undefined ? Number(pitch).toFixed(1) : '—')
  const displayYaw = isOpen
    ? (pendingYaw !== undefined ? pendingYaw.toFixed(1) : '—')
    : (yaw !== undefined ? Number(yaw).toFixed(1) : '—')

  const canConfirm = pendingPitch !== undefined && pendingYaw !== undefined

  return (
    <div style={{ margin: '8px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setIsOpen(v => !v)}
          style={{
            padding: '5px 14px',
            background: isOpen ? '#444' : '#1a6ef5',
            color: '#fff', border: 'none', borderRadius: 4,
            cursor: 'pointer', fontSize: 13, fontWeight: 500,
          }}
        >
          {isOpen ? '▲ Close Placement Tool' : '◎ Open Visual Placement Tool'}
        </button>
        <span ref={statusSpanRef} style={{ fontSize: 12, color: '#f90', fontWeight: 600 }} />
        <span style={{ fontSize: 12, color: '#999' }}>
          Pitch: <strong>{displayPitch}°</strong> · Yaw: <strong>{displayYaw}°</strong>
        </span>
      </div>

      {isOpen && (
        <div style={{ marginTop: 8, border: '1px solid #333', borderRadius: 6, overflow: 'hidden' }}>
          {!panoramaUrl ? (
            <div style={{ padding: 16, background: '#1a1a1a', color: '#888', fontSize: 13 }}>
              ⚠ Please upload a panorama image first, then reopen this tool.
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', top: 8, left: 8, zIndex: 10,
                background: 'rgba(0,0,0,0.65)', color: '#fff',
                padding: '4px 10px', borderRadius: 4, fontSize: 12,
                pointerEvents: 'none', userSelect: 'none',
              }}>
                Click to place · Drag the red marker to adjust · Confirm to save
              </div>

              <div ref={viewerRef} style={{ width: '100%', height: 380 }} />

              {/* React-controlled overlay marker (replaces Pannellum hotspot entirely) */}
              {markerPos && markerPos.visible && canConfirm && (
                <div
                  onMouseDown={onMarkerMouseDown}
                  style={{
                    position: 'absolute',
                    left: markerPos.x,
                    top: markerPos.y,
                    width: 22,
                    height: 22,
                    transform: 'translate(-50%, -50%)',
                    background: 'radial-gradient(circle at 35% 35%, #ff8080, #cc0000)',
                    border: '3px solid #fff',
                    borderRadius: '50%',
                    boxShadow: '0 0 0 2px #ff4444, 0 2px 8px rgba(0,0,0,0.5)',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    zIndex: 100,
                    userSelect: 'none',
                    touchAction: 'none',
                  }}
                />
              )}

              {/* Confirm / Reset toolbar */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 10px', background: '#111', borderTop: '1px solid #333',
              }}>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!canConfirm}
                  style={{
                    padding: '6px 18px',
                    background: canConfirm ? '#1a6ef5' : '#555',
                    color: '#fff', border: 'none', borderRadius: 4,
                    cursor: canConfirm ? 'pointer' : 'not-allowed',
                    fontSize: 13, fontWeight: 600,
                  }}
                >
                  ✓ Confirm Position
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    padding: '6px 14px',
                    background: '#333',
                    color: '#ccc', border: '1px solid #555', borderRadius: 4,
                    cursor: 'pointer', fontSize: 13,
                  }}
                >
                  ↺ Reset
                </button>
                <span style={{ fontSize: 11, color: '#666', marginLeft: 4 }}>
                  Pending: Pitch {pendingPitch !== undefined ? `${pendingPitch.toFixed(1)}°` : '—'} · Yaw {pendingYaw !== undefined ? `${pendingYaw.toFixed(1)}°` : '—'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
