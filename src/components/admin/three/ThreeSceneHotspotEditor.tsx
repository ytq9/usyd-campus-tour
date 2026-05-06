'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useForm, useFormFields } from '@payloadcms/ui'
import {
  clampInteractionPitch,
  normaliseYaw,
  projectPitchYawToScreen,
  screenPointToPitchYaw,
} from '@/components/tour/three/threePanoramaMath'
import { useThreePanoramaControls } from '@/components/tour/three/useThreePanoramaControls'
import { useThreeSceneTexture } from '@/components/tour/three/useThreeSceneTexture'
import { useAdminPanoramaMedia } from './useAdminPanoramaMedia'

type HotspotType = 'scene' | 'info'
type IconSize = 'sm' | 'md' | 'lg'

type HotspotRow = {
  type?: HotspotType
  pitch?: number | string | null
  yaw?: number | string | null
  text?: string
  targetScene?: number | string | { id: number | string } | null
  targetFloor?: number | string | { id: number | string } | null
  iconColor?: string | null
  iconSize?: IconSize | null
}

type SceneSummary = {
  id: number | string
  title: string
  slug?: string
  panoramaUrl: string | null
}

type ProjectedMarker = { x: number; y: number; visible: boolean }

const CLICK_DRAG_THRESHOLD_PX = 6
const SEED_HFOV = 100

const sizePx = (s?: IconSize | null) => (s === 'sm' ? 18 : s === 'lg' ? 30 : 24)
const defaultColorFor = (type?: HotspotType) => (type === 'scene' ? '#1a6ef5' : '#d92d20')
const idOf = (v: unknown): string | null => {
  if (v == null) return null
  if (typeof v === 'object') {
    const obj = v as { id?: number | string }
    return obj.id != null ? String(obj.id) : null
  }
  return String(v)
}

const roundCoord = (n: number) => Math.round(n * 100) / 100

export default function ThreeSceneHotspotEditor() {
  const { dispatchFields } = useForm()

  const panoramaFieldValue = useFormFields(([fields]) => fields.panorama?.value as any)
  const panorama = useAdminPanoramaMedia(panoramaFieldValue)

  const initialFromForm = useFormFields(([fields]) => ({
    pitch: Number(fields['initialPitch']?.value ?? 0) || 0,
    yaw: Number(fields['initialYaw']?.value ?? 0) || 0,
    hfov: Number(fields['initialHfov']?.value ?? SEED_HFOV) || SEED_HFOV,
  })) as { pitch: number; yaw: number; hfov: number }

  const hotspots = useFormFields(([fields]) => {
    const arr = (fields as { hotspots?: { rows?: unknown[] } }).hotspots
    const rows = Array.isArray(arr?.rows) ? arr!.rows! : []
    const list: HotspotRow[] = []
    for (let i = 0; i < rows.length; i++) {
      list.push({
        type: fields[`hotspots.${i}.type`]?.value as HotspotType | undefined,
        pitch: fields[`hotspots.${i}.pitch`]?.value as number | string | null | undefined,
        yaw: fields[`hotspots.${i}.yaw`]?.value as number | string | null | undefined,
        text: fields[`hotspots.${i}.text`]?.value as string | undefined,
        targetScene: fields[`hotspots.${i}.targetScene`]?.value as HotspotRow['targetScene'],
        targetFloor: fields[`hotspots.${i}.targetFloor`]?.value as HotspotRow['targetFloor'],
        iconColor: fields[`hotspots.${i}.iconColor`]?.value as string | null | undefined,
        iconSize: fields[`hotspots.${i}.iconSize`]?.value as IconSize | null | undefined,
      })
    }
    return list
  }) as HotspotRow[]

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [markerPositions, setMarkerPositions] = useState<Map<number, ProjectedMarker>>(new Map())
  const [scenes, setScenes] = useState<SceneSummary[]>([])
  const [scenesError, setScenesError] = useState<string | null>(null)
  const [sceneSearch, setSceneSearch] = useState('')
  const [cameraDisplay, setCameraDisplay] = useState({
    pitch: initialFromForm.pitch,
    yaw: initialFromForm.yaw,
    hfov: initialFromForm.hfov,
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const sphereRef = useRef<THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> | null>(null)
  const frameRef = useRef<number | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const hotspotsRef = useRef<HotspotRow[]>(hotspots)
  const draggingIndexRef = useRef<number | null>(null)
  const draggingPositionRef = useRef<ProjectedMarker | null>(null)
  const pointerStartRef = useRef<{ x: number; y: number; pointerId: number } | null>(null)
  const suppressClickRef = useRef(false)
  const isAddingRef = useRef(false)
  const lastCameraRef = useRef<{ pitch: number; yaw: number; hfov: number } | null>(null)

  useEffect(() => { hotspotsRef.current = hotspots }, [hotspots])
  useEffect(() => { isAddingRef.current = isAdding }, [isAdding])

  const { applyCameraState, getCameraState } = useThreePanoramaControls({
    cameraRef,
    containerRef,
    initialPitch: initialFromForm.pitch,
    initialYaw: initialFromForm.yaw,
    initialHfov: initialFromForm.hfov,
    resetKey: panorama.panoramaUrl || 'empty',
  })

  const { texture, isLoading, error: textureError } = useThreeSceneTexture(panorama.panoramaUrl)

  // Initialize THREE renderer + sphere
  useEffect(() => {
    const container = containerRef.current
    if (!container || cameraRef.current || !panorama.panoramaUrl) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1100)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    })
    const geometry = new THREE.SphereGeometry(500, 64, 40)
    geometry.scale(-1, 1, 1)
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const sphere = new THREE.Mesh(geometry, material)

    scene.add(sphere)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(Math.max(container.clientWidth, 1), Math.max(container.clientHeight, 1))
    renderer.domElement.style.display = 'block'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.touchAction = 'none'
    renderer.domElement.style.width = '100%'
    container.appendChild(renderer.domElement)

    sceneRef.current = scene
    cameraRef.current = camera
    rendererRef.current = renderer
    sphereRef.current = sphere
    applyCameraState()

    const resize = () => {
      const width = Math.max(container.clientWidth, 1)
      const height = Math.max(container.clientHeight, 1)
      renderer.setSize(width, height, false)
      applyCameraState()
    }

    resizeObserverRef.current = new ResizeObserver(resize)
    resizeObserverRef.current.observe(container)
    window.addEventListener('resize', resize)
    resize()

    const render = () => {
      const cam = cameraRef.current
      if (cam) {
        const state = getCameraState()
        if (
          !lastCameraRef.current ||
          Math.abs(lastCameraRef.current.pitch - state.pitch) > 0.01 ||
          Math.abs(lastCameraRef.current.yaw - state.yaw) > 0.01 ||
          Math.abs(lastCameraRef.current.hfov - state.hfov) > 0.01
        ) {
          lastCameraRef.current = { ...state }
          setCameraDisplay(state)
        }

        // Project all markers
        const list = hotspotsRef.current
        setMarkerPositions((prev) => {
          const next = new Map<number, ProjectedMarker>()
          let changed = prev.size !== list.length
          for (let i = 0; i < list.length; i++) {
            // Hold the last live drag position so the marker tracks the cursor
            if (draggingIndexRef.current === i && draggingPositionRef.current) {
              next.set(i, draggingPositionRef.current)
              continue
            }
            const hp = Number(list[i].pitch)
            const hy = Number(list[i].yaw)
            if (!Number.isFinite(hp) || !Number.isFinite(hy)) continue
            const projected = projectPitchYawToScreen(hp, hy, cam, container)
            next.set(i, projected)
            if (!changed) {
              const old = prev.get(i)
              if (
                !old ||
                old.visible !== projected.visible ||
                Math.abs(old.x - projected.x) > 0.5 ||
                Math.abs(old.y - projected.y) > 0.5
              ) {
                changed = true
              }
            }
          }
          return changed ? next : prev
        })
      }

      const renderer = rendererRef.current
      const scene = sceneRef.current
      const cameraNow = cameraRef.current
      if (renderer && scene && cameraNow) {
        renderer.render(scene, cameraNow)
      }
      frameRef.current = requestAnimationFrame(render)
    }

    frameRef.current = requestAnimationFrame(render)

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
      resizeObserverRef.current?.disconnect()
      resizeObserverRef.current = null
      window.removeEventListener('resize', resize)

      scene.remove(sphere)
      material.map = null
      material.dispose()
      geometry.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement)
      }
      sphereRef.current = null
      rendererRef.current = null
      sceneRef.current = null
      cameraRef.current = null
    }
  }, [panorama.panoramaUrl, applyCameraState, getCameraState])

  // Bind texture
  useEffect(() => {
    const sphere = sphereRef.current
    if (!sphere) return
    sphere.material.map = texture
    sphere.material.needsUpdate = true
  }, [texture])

  // Fetch scenes for the target picker
  useEffect(() => {
    let cancelled = false
    fetch('/api/scenes?limit=200&depth=1')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        const docs = Array.isArray(data?.docs) ? data.docs : []
        setScenes(docs.map((s: any) => ({
          id: s.id,
          title: s.title || s.slug || `Scene ${s.id}`,
          slug: s.slug,
          panoramaUrl: s.panorama?.url || null,
        })))
        setScenesError(null)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setScenesError(err instanceof Error ? err.message : 'Failed to load scenes')
      })
    return () => { cancelled = true }
  }, [])

  // Helpers — dispatch
  const updateRow = useCallback((index: number, field: string, value: unknown) => {
    try {
      dispatchFields({ type: 'UPDATE', path: `hotspots.${index}.${field}`, value } as any)
    } catch {}
  }, [dispatchFields])

  const addRowAt = useCallback((coords: { pitch: number; yaw: number }) => {
    const newIndex = hotspotsRef.current.length
    try {
      dispatchFields({ type: 'ADD_ROW', path: 'hotspots', rowIndex: newIndex } as any)
      setTimeout(() => {
        try {
          dispatchFields({ type: 'UPDATE', path: `hotspots.${newIndex}.type`, value: 'info' } as any)
          dispatchFields({ type: 'UPDATE', path: `hotspots.${newIndex}.pitch`, value: roundCoord(coords.pitch) } as any)
          dispatchFields({ type: 'UPDATE', path: `hotspots.${newIndex}.yaw`, value: roundCoord(coords.yaw) } as any)
          dispatchFields({ type: 'UPDATE', path: `hotspots.${newIndex}.text`, value: 'New Hotspot' } as any)
          dispatchFields({ type: 'UPDATE', path: `hotspots.${newIndex}.iconSize`, value: 'md' } as any)
          setSelectedIndex(newIndex)
        } catch {}
      }, 30)
    } catch {}
    setIsAdding(false)
  }, [dispatchFields])

  const removeRow = useCallback((index: number) => {
    try {
      dispatchFields({ type: 'REMOVE_ROW', path: 'hotspots', rowIndex: index } as any)
    } catch {}
    setSelectedIndex(null)
  }, [dispatchFields])

  // Pointer raycasting helper
  const raycastClient = useCallback((clientX: number, clientY: number) => {
    const container = containerRef.current
    const cam = cameraRef.current
    const sphere = sphereRef.current
    if (!container || !cam || !sphere) return null
    const rect = container.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return null
    const localX = clientX - rect.left
    const localY = clientY - rect.top
    if (localX < 0 || localX > rect.width || localY < 0 || localY > rect.height) return null
    const x = (localX / rect.width) * 2 - 1
    const y = -((localY / rect.height) * 2 - 1)
    return screenPointToPitchYaw(x, y, cam, sphere)
  }, [])

  // Outer shell click handlers — click-to-add or click-to-deselect
  const handleShellPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    if (isInteractiveTarget(event.target)) return
    pointerStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
    }
  }

  const handleShellPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current
    pointerStartRef.current = null
    if (!start || start.pointerId !== event.pointerId) return
    if (isInteractiveTarget(event.target)) return
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    const distance = Math.hypot(event.clientX - start.x, event.clientY - start.y)
    if (distance > CLICK_DRAG_THRESHOLD_PX) return

    const coords = raycastClient(event.clientX, event.clientY)
    if (!coords) return

    if (isAddingRef.current) {
      addRowAt({
        pitch: clampInteractionPitch(coords.pitch),
        yaw: normaliseYaw(coords.yaw),
      })
    } else {
      // Click on empty panorama deselects
      setSelectedIndex(null)
    }
  }

  // Marker drag handlers (per-marker)
  const beginMarkerDrag = useCallback((index: number, event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()
    ;(event.nativeEvent as Event & { stopImmediatePropagation?: () => void }).stopImmediatePropagation?.()

    setSelectedIndex(index)
    draggingIndexRef.current = index

    const targetEl = event.currentTarget
    targetEl.setPointerCapture?.(event.pointerId)

    let lastValid: { pitch: number; yaw: number } | null = null
    let moved = false

    const updateFromClient = (clientX: number, clientY: number) => {
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      draggingPositionRef.current = {
        x: clientX - rect.left,
        y: clientY - rect.top,
        visible: true,
      }
      const coords = raycastClient(clientX, clientY)
      if (coords) lastValid = coords
    }

    const onMove = (m: PointerEvent) => {
      if (m.pointerId !== event.pointerId) return
      moved = true
      updateFromClient(m.clientX, m.clientY)
    }

    const onUp = (m: PointerEvent) => {
      if (m.pointerId !== event.pointerId) return
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
      try { targetEl.releasePointerCapture?.(event.pointerId) } catch {}
      draggingIndexRef.current = null
      draggingPositionRef.current = null

      if (!moved) return

      // Suppress the click that browsers fire after pointerup (would deselect)
      suppressClickRef.current = true

      const finalCoords = raycastClient(m.clientX, m.clientY) || lastValid
      if (!finalCoords) return
      const np = roundCoord(clampInteractionPitch(finalCoords.pitch))
      const ny = roundCoord(normaliseYaw(finalCoords.yaw))
      updateRow(index, 'pitch', np)
      updateRow(index, 'yaw', ny)
    }

    const onCancel = (m: PointerEvent) => {
      if (m.pointerId !== event.pointerId) return
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
      draggingIndexRef.current = null
      draggingPositionRef.current = null
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)
  }, [raycastClient, updateRow])

  const handleMarkerClick = useCallback((index: number, event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
    setSelectedIndex(index)
  }, [])

  // Selected hotspot (for side panel)
  const selected = selectedIndex !== null ? hotspots[selectedIndex] : null

  if (!panorama.panoramaUrl) {
    return (
      <div style={styles.emptyShell}>
        <p style={styles.emptyText}>
          Upload a panorama image first — the visual hotspot editor will appear here.
        </p>
      </div>
    )
  }

  return (
    <div style={styles.root}>
      <div style={styles.toolbar}>
        <strong style={styles.title}>Hotspot Visual Editor</strong>
        <button
          type="button"
          onClick={() => {
            setIsAdding((v) => !v)
            if (!isAdding) setSelectedIndex(null)
          }}
          style={{
            ...styles.addButton,
            background: isAdding ? '#f59f0a' : '#1a6ef5',
            color: isAdding ? '#0c1322' : '#ffffff',
          }}
        >
          {isAdding ? 'Cancel · click panorama to place' : '+ Add Hotspot'}
        </button>
        <span style={styles.count}>
          {hotspots.length} hotspot{hotspots.length === 1 ? '' : 's'}
        </span>
        <span style={styles.legend}>
          <span><span style={{ color: '#1a6ef5' }}>●</span> Portal</span>
          <span><span style={{ color: '#d92d20' }}>●</span> Info</span>
        </span>
      </div>

      <div style={styles.layout}>
        <div
          style={styles.viewerShell}
          onPointerDown={handleShellPointerDown}
          onPointerUp={handleShellPointerUp}
        >
          <div ref={containerRef} style={styles.viewer} />

          {isLoading && !texture && (
            <div style={styles.centerMessage}>Loading panorama...</div>
          )}
          {textureError && (
            <div style={styles.centerMessage}>Unable to load this panorama.</div>
          )}

          {hotspots.map((hs, i) => {
            const pos = markerPositions.get(i)
            if (!pos || !pos.visible) return null
            const color = hs.iconColor || defaultColorFor(hs.type)
            const size = sizePx(hs.iconSize)
            const isSelected = selectedIndex === i
            const isPortal = hs.type === 'scene'
            return (
              <div
                key={i}
                data-tour-hotspot-interactive="true"
                onPointerDown={(e) => beginMarkerDrag(i, e)}
                onClick={(e) => handleMarkerClick(i, e)}
                title={hs.text || (isPortal ? 'Portal' : 'Info')}
                style={{
                  ...styles.marker,
                  width: size,
                  height: size,
                  left: pos.x,
                  top: pos.y,
                  background: isPortal
                    ? `radial-gradient(circle at 35% 35%, #80b0ff, ${color})`
                    : `radial-gradient(circle at 35% 35%, #ffb080, ${color})`,
                  border: isSelected ? '3px solid #ffffff' : '2px solid #ffffff',
                  boxShadow: isSelected
                    ? `0 0 0 3px ${color}, 0 2px 12px rgba(0,0,0,0.6)`
                    : `0 0 0 2px ${color}88, 0 2px 6px rgba(0,0,0,0.4)`,
                  cursor: draggingIndexRef.current === i ? 'grabbing' : 'grab',
                  zIndex: isSelected ? 101 : 100,
                  fontSize: size > 22 ? 12 : 10,
                }}
              >
                {isPortal ? '→' : 'i'}
              </div>
            )
          })}

          {isAdding && (
            <div style={styles.addingHint}>
              Click on the panorama to place a new hotspot
            </div>
          )}

          <div style={styles.hud}>
            <span>Camera {cameraDisplay.pitch.toFixed(1)} pitch / {cameraDisplay.yaw.toFixed(1)} yaw / {cameraDisplay.hfov.toFixed(0)} hfov</span>
          </div>
        </div>

        <div style={styles.sidePanel}>
          {selectedIndex === null || !selected ? (
            <div style={styles.sideEmpty}>
              {hotspots.length === 0
                ? 'No hotspots yet. Click "+ Add Hotspot" to start.'
                : 'Click a marker to edit, or drag to reposition.'}
            </div>
          ) : (
            <SidePanel
              key={selectedIndex}
              index={selectedIndex}
              hotspot={selected}
              scenes={scenes}
              scenesError={scenesError}
              sceneSearch={sceneSearch}
              onSceneSearchChange={setSceneSearch}
              onChange={(field, value) => updateRow(selectedIndex, field, value)}
              onDelete={() => removeRow(selectedIndex)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest('[data-tour-hotspot-interactive="true"]'))
}

function SidePanel({
  index,
  hotspot,
  scenes,
  scenesError,
  sceneSearch,
  onSceneSearchChange,
  onChange,
  onDelete,
}: {
  index: number
  hotspot: HotspotRow
  scenes: SceneSummary[]
  scenesError: string | null
  sceneSearch: string
  onSceneSearchChange: (next: string) => void
  onChange: (field: string, value: unknown) => void
  onDelete: () => void
}) {
  const targetSceneId = idOf(hotspot.targetScene)
  const targetScene = useMemo(
    () => (targetSceneId ? scenes.find((s) => String(s.id) === targetSceneId) ?? null : null),
    [targetSceneId, scenes],
  )

  const filteredScenes = useMemo(() => {
    const q = sceneSearch.trim().toLowerCase()
    if (!q) return scenes
    return scenes.filter((s) =>
      s.title.toLowerCase().includes(q) || (s.slug || '').toLowerCase().includes(q),
    )
  }, [scenes, sceneSearch])

  return (
    <div>
      <div style={styles.sideHeader}>
        <strong style={styles.sideTitle}>Hotspot #{index + 1}</strong>
        <button
          type="button"
          onClick={() => { if (window.confirm('Delete this hotspot?')) onDelete() }}
          style={styles.deleteButton}
        >
          Delete
        </button>
      </div>

      <div style={styles.fieldRow}>
        <label style={styles.fieldCell}>
          <span style={styles.fieldLabel}>Type</span>
          <select
            value={hotspot.type || 'info'}
            onChange={(e) => onChange('type', e.target.value)}
            style={styles.input}
          >
            <option value="info">Info Item</option>
            <option value="scene">Portal (Scene Navigation)</option>
          </select>
        </label>
      </div>

      <div style={styles.fieldRow}>
        <label style={styles.fieldCell}>
          <span style={styles.fieldLabel}>Label</span>
          <input
            type="text"
            value={hotspot.text || ''}
            onChange={(e) => onChange('text', e.target.value)}
            placeholder="Hotspot label"
            style={styles.input}
          />
        </label>
      </div>

      <div style={styles.fieldRow}>
        <label style={{ ...styles.fieldCell, flex: 1 }}>
          <span style={styles.fieldLabel}>Pitch</span>
          <input
            type="number"
            step="0.1"
            value={hotspot.pitch ?? ''}
            onChange={(e) => onChange('pitch', e.target.value === '' ? null : parseFloat(e.target.value))}
            style={styles.input}
          />
        </label>
        <label style={{ ...styles.fieldCell, flex: 1 }}>
          <span style={styles.fieldLabel}>Yaw</span>
          <input
            type="number"
            step="0.1"
            value={hotspot.yaw ?? ''}
            onChange={(e) => onChange('yaw', e.target.value === '' ? null : parseFloat(e.target.value))}
            style={styles.input}
          />
        </label>
      </div>

      {hotspot.type === 'scene' ? (
        <div style={styles.fieldRow}>
          <span style={styles.fieldLabel}>Target scene</span>

          {scenesError ? <p style={styles.errorText}>Could not load scenes: {scenesError}</p> : null}

          <div
            style={{
              ...styles.targetCard,
              borderColor: targetScene ? '#1a6ef5' : '#d0d5dd',
              background: targetScene ? '#eff4ff' : '#f9fafb',
            }}
          >
            {targetScene ? (
              <>
                {targetScene.panoramaUrl ? (
                  <img src={targetScene.panoramaUrl} alt={targetScene.title} style={styles.targetPreview} />
                ) : (
                  <div style={styles.targetPreviewEmpty}>No preview</div>
                )}
                <div style={styles.targetMeta}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={styles.targetSelectedLabel}>Selected</div>
                    <div style={styles.targetSelectedTitle}>{targetScene.title}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onChange('targetScene', null)}
                    style={styles.clearButton}
                  >
                    Clear
                  </button>
                </div>
              </>
            ) : (
              <div style={styles.targetEmpty}>
                {targetSceneId ? `Selected scene #${targetSceneId} not in list` : 'No scene selected — pick one below'}
              </div>
            )}
          </div>

          <input
            type="text"
            value={sceneSearch}
            onChange={(e) => onSceneSearchChange(e.target.value)}
            placeholder={`Search ${scenes.length} scene${scenes.length === 1 ? '' : 's'}...`}
            style={styles.input}
          />

          <div style={styles.thumbGrid}>
            {filteredScenes.length === 0 ? (
              <div style={styles.thumbEmpty}>
                {scenes.length === 0 ? 'Loading scenes...' : `No scenes match "${sceneSearch}"`}
              </div>
            ) : filteredScenes.map((s) => {
              const isSelected = String(s.id) === targetSceneId
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    const num = Number(s.id)
                    onChange('targetScene', Number.isNaN(num) ? s.id : num)
                  }}
                  title={s.title}
                  style={{
                    ...styles.thumbButton,
                    borderColor: isSelected ? '#1a6ef5' : '#e4e7ec',
                    boxShadow: isSelected ? '0 0 0 2px rgba(26,110,245,0.25)' : 'none',
                  }}
                >
                  <div style={styles.thumbImageWrap}>
                    {s.panoramaUrl ? (
                      <img src={s.panoramaUrl} alt={s.title} style={styles.thumbImage} />
                    ) : (
                      <div style={styles.thumbImageEmpty}>No image</div>
                    )}
                    {isSelected && <div style={styles.thumbCheck}>OK</div>}
                  </div>
                  <div
                    style={{
                      ...styles.thumbCaption,
                      color: isSelected ? '#1d2939' : '#475467',
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    {s.title}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <div style={styles.infoNote}>
          Info hotspots: edit the rich text body in the collapsed Hotspots array below
          (row #{index + 1}).
        </div>
      )}

      <div style={styles.fieldRow}>
        <label style={{ ...styles.fieldCell, flex: 1 }}>
          <span style={styles.fieldLabel}>Icon color</span>
          <input
            type="text"
            value={hotspot.iconColor || ''}
            onChange={(e) => onChange('iconColor', e.target.value || null)}
            placeholder="#cc0000"
            style={styles.input}
          />
        </label>
        <label style={{ ...styles.fieldCell, flex: 1 }}>
          <span style={styles.fieldLabel}>Icon size</span>
          <select
            value={hotspot.iconSize || 'md'}
            onChange={(e) => onChange('iconSize', e.target.value)}
            style={styles.input}
          >
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </select>
        </label>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    margin: '12px 0',
  },
  emptyShell: {
    background: '#f9fafb',
    border: '1px dashed #d0d5dd',
    borderRadius: 8,
    margin: '12px 0',
    padding: 24,
    textAlign: 'center',
  },
  emptyText: {
    color: '#667085',
    fontSize: 13,
    margin: 0,
  },
  toolbar: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  title: {
    color: '#1d2939',
    fontSize: 14,
  },
  addButton: {
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    padding: '6px 14px',
  },
  count: {
    color: '#667085',
    fontSize: 12,
  },
  legend: {
    color: '#475467',
    display: 'flex',
    fontSize: 11,
    gap: 12,
    marginLeft: 'auto',
  },
  layout: {
    alignItems: 'flex-start',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
  },
  viewerShell: {
    background: '#05070a',
    border: '1px solid #263241',
    borderRadius: 8,
    flex: '1 1 480px',
    height: 520,
    minWidth: 320,
    overflow: 'hidden',
    position: 'relative',
    touchAction: 'none',
  },
  viewer: {
    height: '100%',
    inset: 0,
    position: 'absolute',
    width: '100%',
  },
  centerMessage: {
    background: 'rgba(5, 7, 10, 0.72)',
    borderRadius: 6,
    color: '#f2f4f7',
    fontSize: 13,
    left: '50%',
    padding: '8px 12px',
    pointerEvents: 'none',
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
  },
  marker: {
    alignItems: 'center',
    borderRadius: '50%',
    color: '#ffffff',
    display: 'flex',
    fontWeight: 700,
    justifyContent: 'center',
    position: 'absolute',
    textShadow: '0 1px 2px rgba(0,0,0,0.6)',
    transform: 'translate(-50%, -50%)',
    userSelect: 'none',
  },
  addingHint: {
    background: 'rgba(245,159,10,0.95)',
    borderRadius: 4,
    color: '#0c1322',
    fontSize: 12,
    fontWeight: 700,
    left: 8,
    padding: '5px 12px',
    pointerEvents: 'none',
    position: 'absolute',
    top: 8,
    zIndex: 200,
  },
  hud: {
    background: 'rgba(12, 17, 29, 0.78)',
    borderRadius: 4,
    bottom: 8,
    color: '#f8fafc',
    fontSize: 12,
    left: 8,
    padding: '4px 8px',
    pointerEvents: 'none',
    position: 'absolute',
  },
  sidePanel: {
    background: '#ffffff',
    border: '1px solid #d0d5dd',
    borderRadius: 8,
    flex: '0 0 340px',
    maxHeight: 520,
    overflowY: 'auto',
    padding: 14,
  },
  sideEmpty: {
    color: '#667085',
    fontSize: 13,
    padding: '60px 8px',
    textAlign: 'center',
  },
  sideHeader: {
    alignItems: 'center',
    borderBottom: '1px solid #e4e7ec',
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
  },
  sideTitle: {
    color: '#1d2939',
    fontSize: 14,
  },
  deleteButton: {
    background: '#fee4e2',
    border: '1px solid #fda29b',
    borderRadius: 4,
    color: '#b42318',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    padding: '4px 10px',
  },
  fieldRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  fieldCell: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    gap: 4,
    minWidth: 0,
  },
  fieldLabel: {
    color: '#475467',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  input: {
    border: '1px solid #d0d5dd',
    borderRadius: 4,
    boxSizing: 'border-box',
    color: '#1d2939',
    fontSize: 13,
    padding: '6px 8px',
    width: '100%',
  },
  errorText: {
    color: '#b42318',
    fontSize: 12,
    margin: '0 0 6px',
  },
  targetCard: {
    border: '1px solid #d0d5dd',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  targetPreview: {
    background: '#000',
    display: 'block',
    height: 90,
    objectFit: 'cover',
    width: '100%',
  },
  targetPreviewEmpty: {
    alignItems: 'center',
    color: '#98a2b3',
    display: 'flex',
    fontSize: 12,
    height: 90,
    justifyContent: 'center',
  },
  targetMeta: {
    alignItems: 'center',
    display: 'flex',
    gap: 8,
    padding: '6px 10px',
  },
  targetSelectedLabel: {
    color: '#1a6ef5',
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  targetSelectedTitle: {
    color: '#1d2939',
    fontSize: 13,
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  clearButton: {
    background: '#ffffff',
    border: '1px solid #d0d5dd',
    borderRadius: 4,
    color: '#475467',
    cursor: 'pointer',
    flexShrink: 0,
    fontSize: 11,
    padding: '4px 8px',
  },
  targetEmpty: {
    color: '#667085',
    fontSize: 12,
    padding: '14px 10px',
    textAlign: 'center',
  },
  thumbGrid: {
    background: '#f9fafb',
    border: '1px solid #e4e7ec',
    borderRadius: 4,
    display: 'grid',
    gap: 6,
    gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
    marginTop: 8,
    maxHeight: 240,
    overflowY: 'auto',
    padding: 6,
  },
  thumbEmpty: {
    color: '#98a2b3',
    fontSize: 12,
    gridColumn: '1 / -1',
    padding: '20px 8px',
    textAlign: 'center',
  },
  thumbButton: {
    background: '#ffffff',
    border: '1px solid #e4e7ec',
    borderRadius: 4,
    cursor: 'pointer',
    overflow: 'hidden',
    padding: 0,
    textAlign: 'left',
  },
  thumbImageWrap: {
    background: '#000',
    height: 60,
    position: 'relative',
    width: '100%',
  },
  thumbImage: {
    display: 'block',
    height: '100%',
    objectFit: 'cover',
    width: '100%',
  },
  thumbImageEmpty: {
    alignItems: 'center',
    color: '#475467',
    display: 'flex',
    fontSize: 10,
    height: '100%',
    justifyContent: 'center',
  },
  thumbCheck: {
    alignItems: 'center',
    background: '#1a6ef5',
    borderRadius: '50%',
    boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
    color: '#ffffff',
    display: 'flex',
    fontSize: 9,
    fontWeight: 700,
    height: 18,
    justifyContent: 'center',
    position: 'absolute',
    right: 4,
    top: 4,
    width: 18,
  },
  thumbCaption: {
    fontSize: 11,
    overflow: 'hidden',
    padding: '4px 6px',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  infoNote: {
    background: '#eef4ff',
    border: '1px solid #b6d4fe',
    borderRadius: 4,
    color: '#1f4ea1',
    fontSize: 12,
    margin: '0 0 12px',
    padding: '8px 10px',
  },
}
