'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useForm, useFormFields } from '@payloadcms/ui'
import {
  clampHfov,
  clampInteractionPitch,
  horizontalFovToVerticalFov,
  normaliseYaw,
  pitchYawToVector3,
  projectPitchYawToScreen,
  screenPointToPitchYaw,
} from '@/components/tour/three/threePanoramaMath'
import { useAdminPanoramaMedia } from './useAdminPanoramaMedia'

type Props = {
  path?: string
  [key: string]: any
}

type ScreenPos = { x: number; y: number; visible: boolean }

type HotspotRow = {
  type?: 'scene' | 'info'
  pitch?: number
  yaw?: number
  text?: string
  targetScene?: number | string | null | { id: number | string }
  targetFloor?: number | string | null | { id: number | string }
  iconColor?: string | null
  iconSize?: 'sm' | 'md' | 'lg' | null
}

type SceneSummary = {
  id: number | string
  title: string
  slug?: string
  panoramaUrl: string | null
}

const SEED_HFOV = 100
const DRAG_DEGREES_PER_SCREEN = 1
const WHEEL_HFOV_SENSITIVITY = 0.05

const sizePx = (s?: string | null) => (s === 'sm' ? 16 : s === 'lg' ? 28 : 22)
const defaultColorFor = (type?: string) => (type === 'scene' ? '#1a6ef5' : '#ff4444')
const idOf = (v: unknown): string | null => {
  if (v == null) return null
  if (typeof v === 'object') return (v as any).id != null ? String((v as any).id) : null
  return String(v)
}

export default function ThreeSceneHotspotEditor(_props: Props) {
  const { dispatchFields } = useForm()

  // ─── Read panorama URL via existing admin media hook ────────────────
  const panoramaFieldValue = useFormFields(([fields]) => fields['panorama']?.value as any)
  const panorama = useAdminPanoramaMedia(panoramaFieldValue)
  const panoramaUrl = panorama.panoramaUrl

  // Initial camera state read from form (the hidden initialPitch/Yaw/Hfov fields)
  const initialFromForm = useFormFields(([fields]) => ({
    pitch: Number(fields['initialPitch']?.value ?? 0) || 0,
    yaw: Number(fields['initialYaw']?.value ?? 0) || 0,
    hfov: Number(fields['initialHfov']?.value ?? SEED_HFOV) || SEED_HFOV,
  })) as { pitch: number; yaw: number; hfov: number }

  // ─── Read hotspots array from form state ────────────────────────────
  const hotspotsState: HotspotRow[] = useFormFields(([fields]) => {
    const arr = (fields as any)['hotspots']
    const rows = arr?.rows
    const count = Array.isArray(rows) ? rows.length : 0
    const list: HotspotRow[] = []
    for (let i = 0; i < count; i++) {
      list.push({
        type: fields[`hotspots.${i}.type`]?.value as any,
        pitch: fields[`hotspots.${i}.pitch`]?.value as number,
        yaw: fields[`hotspots.${i}.yaw`]?.value as number,
        text: fields[`hotspots.${i}.text`]?.value as string,
        targetScene: fields[`hotspots.${i}.targetScene`]?.value as any,
        targetFloor: fields[`hotspots.${i}.targetFloor`]?.value as any,
        iconColor: fields[`hotspots.${i}.iconColor`]?.value as any,
        iconSize: fields[`hotspots.${i}.iconSize`]?.value as any,
      })
    }
    return list
  }) as HotspotRow[]

  // ─── Scenes list (for Target Scene picker) ──────────────────────────
  const [scenes, setScenes] = useState<SceneSummary[]>([])
  useEffect(() => {
    fetch('/api/scenes?limit=200&depth=1')
      .then((r) => r.json())
      .then((data) => {
        const docs = data?.docs || []
        setScenes(docs.map((s: any) => ({
          id: s.id,
          title: s.title || s.slug,
          slug: s.slug,
          panoramaUrl: s.panorama?.url || null,
        })))
      })
      .catch(() => {})
  }, [])

  // ─── Local state ────────────────────────────────────────────────────
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [markerPositions, setMarkerPositions] = useState<Map<number, ScreenPos>>(new Map())

  const viewerRef = useRef<HTMLDivElement>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const sphereRef = useRef<THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> | null>(null)
  const cameraStateRef = useRef({
    pitch: initialFromForm.pitch,
    yaw: initialFromForm.yaw,
    hfov: clampHfov(initialFromForm.hfov),
  })
  const draggingIndexRef = useRef<number | null>(null)
  const suppressClickRef = useRef(false)
  const hotspotsRef = useRef<HotspotRow[]>(hotspotsState)
  useEffect(() => { hotspotsRef.current = hotspotsState }, [hotspotsState])

  // ─── Init Three.js (panorama only — sphere + camera + drag/wheel) ───
  useEffect(() => {
    const container = viewerRef.current
    if (!container || !panoramaUrl) return

    let cancelled = false

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
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.touchAction = 'none'
    container.appendChild(renderer.domElement)

    cameraRef.current = camera
    sphereRef.current = sphere

    // Reset camera state to form initial values whenever the panorama changes
    cameraStateRef.current = {
      pitch: initialFromForm.pitch,
      yaw: initialFromForm.yaw,
      hfov: clampHfov(initialFromForm.hfov),
    }

    const applyCameraState = () => {
      const state = cameraStateRef.current
      const w = Math.max(container.clientWidth, 1)
      const h = Math.max(container.clientHeight, 1)
      camera.aspect = w / h
      camera.fov = horizontalFovToVerticalFov(state.hfov, camera.aspect)
      camera.position.set(0, 0, 0)
      camera.lookAt(pitchYawToVector3(state.pitch, state.yaw))
      camera.updateProjectionMatrix()
    }
    applyCameraState()

    const resize = () => {
      const w = Math.max(container.clientWidth, 1)
      const h = Math.max(container.clientHeight, 1)
      renderer.setSize(w, h, false)
      applyCameraState()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(container)
    window.addEventListener('resize', resize)

    // Load texture
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    loader.load(panoramaUrl, (texture) => {
      if (cancelled) {
        texture.dispose()
        return
      }
      texture.colorSpace = THREE.SRGBColorSpace
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      const mat = sphereRef.current?.material
      if (mat) {
        mat.map = texture
        mat.needsUpdate = true
      }
    })

    // Panorama drag — pointer events on the viewer container.
    // Skip when the pointer started on a marker (data attribute).
    let isPanning = false
    let panPointerId: number | null = null
    let lastX = 0
    let lastY = 0

    const isMarkerTarget = (target: EventTarget | null) =>
      target instanceof Element && Boolean(target.closest('[data-tour-hotspot-interactive="true"]'))

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      if (isMarkerTarget(e.target)) return
      isPanning = true
      panPointerId = e.pointerId
      lastX = e.clientX
      lastY = e.clientY
      try { container.setPointerCapture?.(e.pointerId) } catch {}
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!isPanning || e.pointerId !== panPointerId) return
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      lastX = e.clientX
      lastY = e.clientY
      const w = Math.max(container.clientWidth, 1)
      const sens = (cameraStateRef.current.hfov / w) * DRAG_DEGREES_PER_SCREEN
      cameraStateRef.current.yaw = normaliseYaw(cameraStateRef.current.yaw - dx * sens)
      cameraStateRef.current.pitch = clampInteractionPitch(cameraStateRef.current.pitch + dy * sens)
      applyCameraState()
    }

    const endPan = (e: PointerEvent) => {
      if (e.pointerId !== panPointerId) return
      isPanning = false
      panPointerId = null
      try { container.releasePointerCapture?.(e.pointerId) } catch {}
    }

    const onWheel = (e: WheelEvent) => {
      if (isMarkerTarget(e.target)) return
      cameraStateRef.current.hfov = clampHfov(
        cameraStateRef.current.hfov + e.deltaY * WHEEL_HFOV_SENSITIVITY,
      )
      applyCameraState()
      e.preventDefault()
    }

    container.addEventListener('pointerdown', onPointerDown)
    container.addEventListener('pointermove', onPointerMove)
    container.addEventListener('pointerup', endPan)
    container.addEventListener('pointercancel', endPan)
    container.addEventListener('wheel', onWheel, { passive: false })

    // RAF: project all hotspots each frame + render
    let raf = 0
    const tick = () => {
      const cam = cameraRef.current
      if (cam) {
        const list = hotspotsRef.current
        setMarkerPositions((prev) => {
          const next = new Map<number, ScreenPos>()
          let changed = prev.size !== list.length
          for (let i = 0; i < list.length; i++) {
            const hs = list[i]
            // While dragging this marker, keep prev (mousemove writes into it)
            if (draggingIndexRef.current === i) {
              const p = prev.get(i)
              if (p) next.set(i, p)
              continue
            }
            if (hs.pitch == null || hs.yaw == null) continue
            const p = projectPitchYawToScreen(Number(hs.pitch), Number(hs.yaw), cam, container)
            next.set(i, p)
            if (!changed) {
              const old = prev.get(i)
              if (
                !old ||
                old.visible !== p.visible ||
                Math.abs(old.x - p.x) > 0.5 ||
                Math.abs(old.y - p.y) > 0.5
              ) {
                changed = true
              }
            }
          }
          return changed ? next : prev
        })
      }
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('resize', resize)
      container.removeEventListener('pointerdown', onPointerDown)
      container.removeEventListener('pointermove', onPointerMove)
      container.removeEventListener('pointerup', endPan)
      container.removeEventListener('pointercancel', endPan)
      container.removeEventListener('wheel', onWheel)

      scene.remove(sphere)
      const oldMap = material.map
      material.map = null
      oldMap?.dispose?.()
      material.dispose()
      geometry.dispose()
      renderer.dispose()
      try { renderer.forceContextLoss() } catch {}
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement)
      }
      cameraRef.current = null
      sphereRef.current = null
    }
    // We intentionally only re-run when panoramaUrl changes — initial camera
    // values seed cameraStateRef on init and shouldn't tear down the renderer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panoramaUrl])

  // ─── Click panorama to add new hotspot ──────────────────────────────
  useEffect(() => {
    if (!isAdding) return
    const container = viewerRef.current
    if (!container) return

    const onClick = (e: MouseEvent) => {
      if (suppressClickRef.current) {
        suppressClickRef.current = false
        return
      }
      if (e.target instanceof Element && e.target.closest('[data-tour-hotspot-interactive="true"]')) return

      const cam = cameraRef.current
      const sphere = sphereRef.current
      if (!cam || !sphere) return
      const rect = container.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) return
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1
      const coords = screenPointToPitchYaw(ndcX, ndcY, cam, sphere)
      if (!coords) return

      const np = Math.round(clampInteractionPitch(coords.pitch) * 100) / 100
      const ny = Math.round(normaliseYaw(coords.yaw) * 100) / 100
      const newIndex = hotspotsRef.current.length

      try {
        dispatchFields({
          type: 'ADD_ROW',
          path: 'hotspots',
          rowIndex: newIndex,
        } as any)
        setTimeout(() => {
          try {
            dispatchFields({ type: 'UPDATE', path: `hotspots.${newIndex}.type`, value: 'info' } as any)
            dispatchFields({ type: 'UPDATE', path: `hotspots.${newIndex}.pitch`, value: np } as any)
            dispatchFields({ type: 'UPDATE', path: `hotspots.${newIndex}.yaw`, value: ny } as any)
            dispatchFields({ type: 'UPDATE', path: `hotspots.${newIndex}.text`, value: 'New Hotspot' } as any)
            dispatchFields({ type: 'UPDATE', path: `hotspots.${newIndex}.iconSize`, value: 'md' } as any)
            setSelectedIndex(newIndex)
          } catch {}
        }, 30)
      } catch {}

      setIsAdding(false)
    }

    container.addEventListener('click', onClick)
    return () => { container.removeEventListener('click', onClick) }
  }, [isAdding, dispatchFields])

  // ─── Drag a marker ──────────────────────────────────────────────────
  const onMarkerMouseDown = useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setSelectedIndex(index)

    const container = viewerRef.current
    if (!container) return

    draggingIndexRef.current = index
    let lastClientX = e.clientX
    let lastClientY = e.clientY
    let hasMoved = false
    let lastValid: { pitch: number; yaw: number } | null = null

    const onMove = (m: MouseEvent) => {
      lastClientX = m.clientX
      lastClientY = m.clientY
      hasMoved = true
      const rect = container.getBoundingClientRect()
      setMarkerPositions((prev) => {
        const next = new Map(prev)
        next.set(index, {
          x: m.clientX - rect.left,
          y: m.clientY - rect.top,
          visible: true,
        })
        return next
      })
      const cam = cameraRef.current
      const sphere = sphereRef.current
      if (cam && sphere && rect.width > 0 && rect.height > 0) {
        const ndcX = ((m.clientX - rect.left) / rect.width) * 2 - 1
        const ndcY = -((m.clientY - rect.top) / rect.height) * 2 + 1
        const coords = screenPointToPitchYaw(ndcX, ndcY, cam, sphere)
        if (coords) lastValid = coords
      }
    }

    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      draggingIndexRef.current = null

      if (!hasMoved) return

      let np: number | null = null
      let ny: number | null = null
      const cam = cameraRef.current
      const sphere = sphereRef.current
      if (cam && sphere) {
        const rect = container.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) {
          const ndcX = ((lastClientX - rect.left) / rect.width) * 2 - 1
          const ndcY = -((lastClientY - rect.top) / rect.height) * 2 + 1
          const coords = screenPointToPitchYaw(ndcX, ndcY, cam, sphere)
          if (coords) { np = coords.pitch; ny = coords.yaw }
          else if (lastValid) { np = lastValid.pitch; ny = lastValid.yaw }
        }
      }
      if (np === null || ny === null) return

      np = Math.round(clampInteractionPitch(np) * 100) / 100
      ny = Math.round(normaliseYaw(ny) * 100) / 100

      suppressClickRef.current = true
      try {
        dispatchFields({ type: 'UPDATE', path: `hotspots.${index}.pitch`, value: np } as any)
        dispatchFields({ type: 'UPDATE', path: `hotspots.${index}.yaw`, value: ny } as any)
      } catch {}
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [dispatchFields])

  // ─── Field updates from side panel ──────────────────────────────────
  const updateField = useCallback((index: number, field: string, value: any) => {
    try {
      dispatchFields({ type: 'UPDATE', path: `hotspots.${index}.${field}`, value } as any)
    } catch {}
  }, [dispatchFields])

  const handleDelete = useCallback((index: number) => {
    try {
      dispatchFields({ type: 'REMOVE_ROW', path: 'hotspots', rowIndex: index } as any)
    } catch {}
    setSelectedIndex(null)
  }, [dispatchFields])

  const selected = selectedIndex !== null ? hotspotsState[selectedIndex] : null

  // ─── Render ─────────────────────────────────────────────────────────
  if (!panoramaUrl) {
    return (
      <div style={{ margin: '16px 0' }}>
        <strong style={{ fontSize: 14, color: '#fff', display: 'block', marginBottom: 8 }}>
          Hotspot Visual Editor
        </strong>
        <div style={{
          padding: 16, background: '#1a1a1a',
          color: '#888', borderRadius: 6, fontSize: 13,
          border: '1px solid #333',
        }}>
          ⚠ Upload a panorama image first to use the visual editor. You can still edit hotspot rows manually below.
        </div>
      </div>
    )
  }

  return (
    <div style={{ margin: '16px 0' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', gap: 10, marginBottom: 8,
        flexWrap: 'wrap', alignItems: 'center',
      }}>
        <strong style={{ fontSize: 14, color: '#fff' }}>Hotspot Visual Editor</strong>
        <button
          type="button"
          onClick={() => {
            setIsAdding((v) => !v)
            if (!isAdding) setSelectedIndex(null)
          }}
          style={{
            padding: '6px 14px',
            background: isAdding ? '#f90' : '#1a6ef5',
            color: isAdding ? '#000' : '#fff',
            border: 'none', borderRadius: 4,
            cursor: 'pointer', fontSize: 13, fontWeight: 600,
          }}
        >
          {isAdding ? '× Cancel · Click panorama to place' : '+ Add Hotspot'}
        </button>
        <span style={{ fontSize: 12, color: '#888' }}>
          {hotspotsState.length} hotspot{hotspotsState.length === 1 ? '' : 's'}
        </span>
        <span style={{ fontSize: 11, color: '#999', marginLeft: 'auto', display: 'flex', gap: 12 }}>
          <span><span style={{ color: '#1a6ef5' }}>●</span> Portal</span>
          <span><span style={{ color: '#ff4444' }}>●</span> Info</span>
        </span>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {/* Panorama viewer + overlay markers */}
        <div style={{
          flex: 1, position: 'relative',
          border: '1px solid #333', borderRadius: 6, overflow: 'hidden',
          minWidth: 0,
        }}>
          <div ref={viewerRef} style={{ width: '100%', height: 480, background: '#000', touchAction: 'none' }} />

          {hotspotsState.map((hs, i) => {
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
                onMouseDown={(e) => onMarkerMouseDown(i, e)}
                onClick={(e) => { e.stopPropagation(); setSelectedIndex(i) }}
                title={hs.text || (isPortal ? 'Portal' : 'Info')}
                style={{
                  position: 'absolute',
                  left: pos.x, top: pos.y,
                  width: size, height: size,
                  transform: 'translate(-50%, -50%)',
                  background: isPortal
                    ? `radial-gradient(circle at 35% 35%, #80b0ff, ${color})`
                    : `radial-gradient(circle at 35% 35%, #ffb080, ${color})`,
                  border: isSelected ? '3px solid #fff' : '2px solid #fff',
                  borderRadius: '50%',
                  boxShadow: isSelected
                    ? `0 0 0 3px ${color}, 0 2px 12px rgba(0,0,0,0.7)`
                    : `0 0 0 2px ${color}88, 0 2px 6px rgba(0,0,0,0.5)`,
                  cursor: draggingIndexRef.current === i ? 'grabbing' : 'grab',
                  zIndex: isSelected ? 101 : 100,
                  userSelect: 'none', touchAction: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff',
                  fontSize: size > 20 ? 12 : 10, fontWeight: 700,
                  textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                }}
              >
                {isPortal ? '→' : 'i'}
              </div>
            )
          })}

          {isAdding && (
            <div style={{
              position: 'absolute', top: 8, left: 8, zIndex: 200,
              background: 'rgba(255,153,0,0.95)', color: '#000',
              padding: '5px 12px', borderRadius: 4, fontSize: 12, fontWeight: 700,
              pointerEvents: 'none',
            }}>
              ✛ Click on the panorama to place a new hotspot
            </div>
          )}
        </div>

        {/* Side panel */}
        <div style={{
          width: 320, flexShrink: 0,
          border: '1px solid #333', borderRadius: 6,
          background: '#0e0e0e', padding: 14,
          maxHeight: 480, overflowY: 'auto',
        }}>
          {selectedIndex === null || !selected ? (
            <div style={{
              color: '#888', fontSize: 13, textAlign: 'center', padding: '60px 8px',
              whiteSpace: 'pre-line',
            }}>
              {hotspotsState.length === 0
                ? 'No hotspots yet.\nClick "+ Add Hotspot" to start.'
                : 'Click a marker on the panorama\nto edit it.'}
            </div>
          ) : (
            <SidePanel
              key={selectedIndex}
              index={selectedIndex}
              hotspot={selected}
              scenes={scenes}
              onChange={(field, value) => updateField(selectedIndex, field, value)}
              onDelete={() => handleDelete(selectedIndex)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Side panel editor ──────────────────────────────────────────────
function SidePanel({
  index, hotspot, scenes, onChange, onDelete,
}: {
  index: number
  hotspot: HotspotRow
  scenes: SceneSummary[]
  onChange: (field: string, value: any) => void
  onDelete: () => void
}) {
  const targetSceneId = idOf(hotspot.targetScene)
  const targetScene = useMemo(
    () => (targetSceneId ? scenes.find((s) => String(s.id) === targetSceneId) : null) ?? null,
    [targetSceneId, scenes],
  )

  const [sceneSearch, setSceneSearch] = useState('')
  const filteredScenes = useMemo(() => {
    const q = sceneSearch.trim().toLowerCase()
    if (!q) return scenes
    return scenes.filter((s) =>
      s.title.toLowerCase().includes(q) ||
      (s.slug || '').toLowerCase().includes(q),
    )
  }, [scenes, sceneSearch])

  const labelStyle: React.CSSProperties = {
    fontSize: 11, color: '#999',
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginBottom: 4, display: 'block',
  }
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '6px 8px', background: '#1a1a1a',
    border: '1px solid #333', borderRadius: 4, color: '#fff', fontSize: 13,
    boxSizing: 'border-box',
  }
  const fieldRow: React.CSSProperties = { marginBottom: 12 }

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #222',
      }}>
        <strong style={{ fontSize: 13, color: '#fff' }}>Hotspot #{index + 1}</strong>
        <button
          type="button"
          onClick={() => { if (window.confirm('Delete this hotspot?')) onDelete() }}
          style={{
            padding: '4px 10px', background: '#7a1a1a', color: '#fff',
            border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12,
          }}
        >
          Delete
        </button>
      </div>

      <div style={fieldRow}>
        <label style={labelStyle}>Type</label>
        <select
          value={hotspot.type || 'info'}
          onChange={(e) => onChange('type', e.target.value)}
          style={inputStyle}
        >
          <option value="info">Info Item</option>
          <option value="scene">Portal (Scene Navigation)</option>
        </select>
      </div>

      <div style={fieldRow}>
        <label style={labelStyle}>Label</label>
        <input
          type="text"
          value={hotspot.text || ''}
          onChange={(e) => onChange('text', e.target.value)}
          placeholder="Hotspot label"
          style={inputStyle}
        />
      </div>

      <div style={{ ...fieldRow, display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Pitch</label>
          <input
            type="number" step="0.1"
            value={hotspot.pitch ?? ''}
            onChange={(e) => onChange('pitch', e.target.value === '' ? null : parseFloat(e.target.value))}
            style={inputStyle}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Yaw</label>
          <input
            type="number" step="0.1"
            value={hotspot.yaw ?? ''}
            onChange={(e) => onChange('yaw', e.target.value === '' ? null : parseFloat(e.target.value))}
            style={inputStyle}
          />
        </div>
      </div>

      {hotspot.type === 'scene' ? (
        <div style={fieldRow}>
          <label style={labelStyle}>Target Scene</label>

          {/* Currently selected — prominent confirmation card */}
          <div style={{
            marginBottom: 8,
            border: targetScene ? '1px solid #1a6ef5' : '1px dashed #444',
            borderRadius: 4, overflow: 'hidden',
            background: targetScene ? '#0f1a2e' : '#181818',
          }}>
            {targetScene ? (
              <>
                {targetScene.panoramaUrl ? (
                  <img
                    src={targetScene.panoramaUrl}
                    alt={targetScene.title}
                    style={{
                      width: '100%', height: 90, objectFit: 'cover',
                      display: 'block', background: '#000',
                    }}
                  />
                ) : (
                  <div style={{
                    height: 90, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: '#555', fontSize: 12,
                  }}>No preview</div>
                )}
                <div style={{
                  padding: '6px 10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 8,
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      fontSize: 11, color: '#5a9bff',
                      textTransform: 'uppercase', letterSpacing: 0.4,
                    }}>
                      Selected
                    </div>
                    <div style={{
                      fontSize: 13, color: '#fff', fontWeight: 600,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {targetScene.title}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onChange('targetScene', null)}
                    style={{
                      padding: '4px 8px', background: 'transparent',
                      border: '1px solid #444', color: '#aaa',
                      borderRadius: 3, cursor: 'pointer', fontSize: 11,
                      flexShrink: 0,
                    }}
                  >
                    Clear
                  </button>
                </div>
              </>
            ) : (
              <div style={{
                padding: '14px 10px', textAlign: 'center',
                color: '#777', fontSize: 12,
              }}>
                No scene selected — pick one below
              </div>
            )}
          </div>

          {/* Search */}
          <input
            type="text"
            value={sceneSearch}
            onChange={(e) => setSceneSearch(e.target.value)}
            placeholder={`Search ${scenes.length} scene${scenes.length === 1 ? '' : 's'}…`}
            style={{ ...inputStyle, marginBottom: 8 }}
          />

          {/* Thumbnail grid picker — visual selection */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 6,
            maxHeight: 260, overflowY: 'auto',
            padding: 4, background: '#080808',
            border: '1px solid #222', borderRadius: 4,
          }}>
            {filteredScenes.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                padding: '20px 8px', textAlign: 'center',
                color: '#666', fontSize: 12,
              }}>
                No scenes match &quot;{sceneSearch}&quot;
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
                    display: 'block', textAlign: 'left',
                    padding: 0, background: '#161616',
                    border: isSelected ? '2px solid #1a6ef5' : '1px solid #2a2a2a',
                    borderRadius: 3, overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 0 0 2px rgba(26,110,245,0.3)' : 'none',
                    transition: 'transform 0.05s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none' }}
                >
                  <div style={{
                    width: '100%', height: 60,
                    background: '#000',
                    position: 'relative',
                  }}>
                    {s.panoramaUrl ? (
                      <img
                        src={s.panoramaUrl}
                        alt={s.title}
                        style={{
                          width: '100%', height: '100%',
                          objectFit: 'cover', display: 'block',
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#444', fontSize: 10,
                      }}>
                        No image
                      </div>
                    )}
                    {isSelected && (
                      <div style={{
                        position: 'absolute', top: 3, right: 3,
                        background: '#1a6ef5', color: '#fff',
                        width: 16, height: 16, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
                      }}>✓</div>
                    )}
                  </div>
                  <div style={{
                    padding: '4px 6px',
                    fontSize: 11, color: isSelected ? '#fff' : '#bbb',
                    fontWeight: isSelected ? 600 : 400,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {s.title}
                  </div>
                </button>
              )
            })}
          </div>
          <div style={{ fontSize: 10, color: '#666', marginTop: 4, textAlign: 'right' }}>
            Click a thumbnail to set as portal target
          </div>
        </div>
      ) : (
        <div style={{
          marginBottom: 12, padding: 8, background: '#181818',
          border: '1px dashed #333', borderRadius: 4,
          fontSize: 11, color: '#999', lineHeight: 1.5,
        }}>
          ℹ Rich text content for this Info hotspot is edited in the
          collapsed Hotspots form below — expand it and open row #{index + 1}.
        </div>
      )}

      <div style={{ ...fieldRow, display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Icon Color</label>
          <input
            type="text"
            value={hotspot.iconColor || ''}
            onChange={(e) => onChange('iconColor', e.target.value || null)}
            placeholder="#cc0000"
            style={inputStyle}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Size</label>
          <select
            value={hotspot.iconSize || 'md'}
            onChange={(e) => onChange('iconSize', e.target.value)}
            style={inputStyle}
          >
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </select>
        </div>
      </div>
    </div>
  )
}
