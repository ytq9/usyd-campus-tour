'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import type { ClientField } from 'payload'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { RenderFields, useForm, useFormFields } from '@payloadcms/ui'
import {
  clampHfov,
  clampInteractionPitch,
  horizontalFovToVerticalFov,
  normaliseYaw,
  pitchYawToVector3,
  projectPitchYawToScreen,
  screenPointToPitchYaw,
} from '@/components/tour/three/threePanoramaMath'
import { useThreeSceneTexture } from '@/components/tour/three/useThreeSceneTexture'
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
  infoContent?: unknown
  iconColor?: string | null
  iconSize?: 'sm' | 'md' | 'lg' | null
}

type SceneSummary = {
  id: number | string
  title: string
  slug?: string
  floorId: string | null
  floorName: string | null
  floorSlug?: string | null
  panoramaUrl: string | null
}

const SEED_HFOV = 100
const DRAG_DEGREES_PER_SCREEN = 1
const WHEEL_HFOV_SENSITIVITY = 0.05
const HOTSPOTS_PATH = 'hotspots'
const HOTSPOTS_SCHEMA_PATH = 'scenes.hotspots'
const INFO_CONTENT_FIELDS = [
  { name: 'infoContent', type: 'richText', label: 'Info Content' },
] as ClientField[]

const sizePx = (s?: string | null) => (s === 'sm' ? 16 : s === 'lg' ? 28 : 22)
const defaultColorFor = (type?: string) => (type === 'scene' ? '#1a6ef5' : '#ff4444')
const idOf = (v: unknown): string | null => {
  if (v == null) return null
  if (typeof v === 'object') return (v as any).id != null ? String((v as any).id) : null
  return String(v)
}
const toPayloadId = (id: string | number): string | number => {
  const numericId = Number(id)
  return Number.isNaN(numericId) ? id : numericId
}
const roundCameraValue = (value: number) => Math.round(value * 100) / 100

export default function ThreeSceneHotspotEditor(_props: Props) {
  const { addFieldRow, dispatchFields, removeFieldRow, setModified } = useForm()

  const panoramaFieldValue = useFormFields(([fields]) => fields['panorama']?.value as any)
  const currentFloorId = useFormFields(([fields]) => idOf(fields['floor']?.value)) as string | null
  const panorama = useAdminPanoramaMedia(panoramaFieldValue)
  const panoramaUrl = panorama.panoramaUrl
  const { texture, isLoading, error } = useThreeSceneTexture(panoramaUrl)

  // Hidden scene camera fields seed the admin preview.
  const initialFromForm = useFormFields(([fields]) => ({
    pitch: Number(fields['initialPitch']?.value ?? 0) || 0,
    yaw: Number(fields['initialYaw']?.value ?? 0) || 0,
    hfov: Number(fields['initialHfov']?.value ?? SEED_HFOV) || SEED_HFOV,
  })) as { pitch: number; yaw: number; hfov: number }

  const hotspotsState: HotspotRow[] = useFormFields(([fields]) => {
    const arr = (fields as any)[HOTSPOTS_PATH]
    const rows = arr?.rows
    const count = Array.isArray(rows) ? rows.length : 0
    const list: HotspotRow[] = []
    for (let i = 0; i < count; i++) {
      list.push({
        type: fields[`${HOTSPOTS_PATH}.${i}.type`]?.value as any,
        pitch: fields[`${HOTSPOTS_PATH}.${i}.pitch`]?.value as number,
        yaw: fields[`${HOTSPOTS_PATH}.${i}.yaw`]?.value as number,
        text: fields[`${HOTSPOTS_PATH}.${i}.text`]?.value as string,
        targetScene: fields[`${HOTSPOTS_PATH}.${i}.targetScene`]?.value as any,
        targetFloor: fields[`${HOTSPOTS_PATH}.${i}.targetFloor`]?.value as any,
        infoContent: fields[`${HOTSPOTS_PATH}.${i}.infoContent`]?.value,
        iconColor: fields[`${HOTSPOTS_PATH}.${i}.iconColor`]?.value as any,
        iconSize: fields[`${HOTSPOTS_PATH}.${i}.iconSize`]?.value as any,
      })
    }
    return list
  }) as HotspotRow[]

  // Payload form rows only store target IDs, so the side panel fetches scene summaries for the picker.
  const [scenes, setScenes] = useState<SceneSummary[]>([])
  useEffect(() => {
    fetch('/api/scenes?limit=200&depth=1&draft=true', {
      credentials: 'same-origin',
    })
      .then((r) => r.json())
      .then((data) => {
        const docs = data?.docs || []
        setScenes(docs.map((s: any) => {
          const floorId = idOf(s.floor)
          const floorName =
            s.floor && typeof s.floor === 'object'
              ? s.floor.name || s.floor.title || s.floor.slug || null
              : null

          return {
            id: s.id,
            title: s.title || s.slug || `Scene ${String(s.id)}`,
            slug: s.slug,
            floorId,
            floorName,
            floorSlug: s.floor && typeof s.floor === 'object' ? s.floor.slug : null,
            panoramaUrl: s.panorama?.url || null,
          }
        }))
      })
      .catch(() => {})
  }, [])

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

  const initialFromFormRef = useRef(initialFromForm)
  useEffect(() => { initialFromFormRef.current = initialFromForm }, [initialFromForm])

  const applyCameraState = useCallback(() => {
    const camera = cameraRef.current
    const container = viewerRef.current
    if (!camera || !container) return

    const state = cameraStateRef.current
    const width = Math.max(container.clientWidth, 1)
    const height = Math.max(container.clientHeight, 1)
    camera.aspect = width / height
    camera.fov = horizontalFovToVerticalFov(state.hfov, camera.aspect)
    camera.position.set(0, 0, 0)
    camera.lookAt(pitchYawToVector3(state.pitch, state.yaw))
    camera.updateProjectionMatrix()
  }, [])

  const handleSphereReady = useCallback((
    sphere: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> | null,
  ) => {
    sphereRef.current = sphere
  }, [])

  useEffect(() => {
    if (!panoramaUrl) return

    const initial = initialFromFormRef.current
    cameraStateRef.current = {
      pitch: initial.pitch,
      yaw: initial.yaw,
      hfov: clampHfov(initial.hfov),
    }
    applyCameraState()
  }, [applyCameraState, panoramaUrl])

  useEffect(() => {
    const container = viewerRef.current
    if (!container || !panoramaUrl) return

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

    return () => {
      container.removeEventListener('pointerdown', onPointerDown)
      container.removeEventListener('pointermove', onPointerMove)
      container.removeEventListener('pointerup', endPan)
      container.removeEventListener('pointercancel', endPan)
      container.removeEventListener('wheel', onWheel)
    }
  }, [applyCameraState, panoramaUrl])

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
        addFieldRow({
          path: HOTSPOTS_PATH,
          rowIndex: newIndex,
          schemaPath: HOTSPOTS_SCHEMA_PATH,
          subFieldState: {
            type: { value: 'info' },
            pitch: { value: np },
            yaw: { value: ny },
            text: { value: 'New Hotspot' },
            iconSize: { value: 'md' },
          },
        })
        setModified(true)
        setSelectedIndex(newIndex)
      } catch {}

      setIsAdding(false)
    }

    container.addEventListener('click', onClick)
    return () => { container.removeEventListener('click', onClick) }
  }, [addFieldRow, isAdding, setModified])

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
        dispatchFields({ type: 'UPDATE', path: `${HOTSPOTS_PATH}.${index}.pitch`, value: np } as any)
        dispatchFields({ type: 'UPDATE', path: `${HOTSPOTS_PATH}.${index}.yaw`, value: ny } as any)
        setModified(true)
      } catch {}
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [dispatchFields, setModified])

  const updateField = useCallback((index: number, field: string, value: any) => {
    try {
      dispatchFields({ type: 'UPDATE', path: `${HOTSPOTS_PATH}.${index}.${field}`, value } as any)
      setModified(true)
    } catch {}
  }, [dispatchFields, setModified])

  const handleTargetSceneChange = useCallback((index: number, scene: SceneSummary | null) => {
    try {
      dispatchFields({
        type: 'UPDATE',
        path: `${HOTSPOTS_PATH}.${index}.targetScene`,
        value: scene ? toPayloadId(scene.id) : null,
      } as any)

      const targetFloor =
        scene?.floorId && (!currentFloorId || scene.floorId !== currentFloorId)
          ? toPayloadId(scene.floorId)
          : null

      dispatchFields({
        type: 'UPDATE',
        path: `${HOTSPOTS_PATH}.${index}.targetFloor`,
        value: targetFloor,
      } as any)
      setModified(true)
    } catch {}
  }, [currentFloorId, dispatchFields, setModified])

  const handleSetInitialView = useCallback(() => {
    const state = cameraStateRef.current

    try {
      dispatchFields({
        type: 'UPDATE',
        path: 'initialPitch',
        value: roundCameraValue(state.pitch),
      } as any)
      dispatchFields({
        type: 'UPDATE',
        path: 'initialYaw',
        value: roundCameraValue(normaliseYaw(state.yaw)),
      } as any)
      dispatchFields({
        type: 'UPDATE',
        path: 'initialHfov',
        value: roundCameraValue(clampHfov(state.hfov)),
      } as any)
      setModified(true)
    } catch {}
  }, [dispatchFields, setModified])

  const handleDelete = useCallback((index: number) => {
    try {
      removeFieldRow({ path: HOTSPOTS_PATH, rowIndex: index })
      setModified(true)
    } catch {}
    setSelectedIndex(null)
  }, [removeFieldRow, setModified])

  useEffect(() => {
    if (selectedIndex !== null && selectedIndex >= hotspotsState.length) {
      setSelectedIndex(null)
    }
  }, [hotspotsState.length, selectedIndex])

  const selected = selectedIndex !== null ? hotspotsState[selectedIndex] : null

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
        <button
          type="button"
          onClick={handleSetInitialView}
          style={{
            padding: '6px 14px',
            background: '#262626',
            color: '#fff',
            border: '1px solid #444',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Set initial view
        </button>
        <span style={{ fontSize: 12, color: '#888' }}>
          {hotspotsState.length} hotspot{hotspotsState.length === 1 ? '' : 's'}
        </span>
        <span style={{ fontSize: 11, color: '#999' }}>
          Initial yaw {roundCameraValue(initialFromForm.yaw)}, pitch {roundCameraValue(initialFromForm.pitch)}, hfov {roundCameraValue(initialFromForm.hfov)}
        </span>
        <span style={{ fontSize: 11, color: '#999', marginLeft: 'auto', display: 'flex', gap: 12 }}>
          <span><span style={{ color: '#1a6ef5' }}>●</span> Portal</span>
          <span><span style={{ color: '#ff4444' }}>●</span> Info</span>
        </span>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{
          flex: 1, position: 'relative',
          border: '1px solid #333', borderRadius: 6, overflow: 'hidden',
          minWidth: 0,
        }}>
          <div ref={viewerRef} style={{ width: '100%', height: 480, background: '#000', touchAction: 'none' }}>
            <Canvas
              camera={{ fov: 75, near: 0.1, far: 1100, position: [0, 0, 0] }}
              dpr={[1, 2]}
              gl={{
                alpha: false,
                antialias: true,
                powerPreference: 'high-performance',
              }}
              style={{
                display: 'block',
                height: '100%',
                touchAction: 'none',
                width: '100%',
              }}
            >
              <AdminCameraBridge
                applyCameraState={applyCameraState}
                cameraRef={cameraRef}
              />
              <AdminHotspotProjectionBridge
                containerRef={viewerRef}
                draggingIndexRef={draggingIndexRef}
                hotspots={hotspotsState}
                onChange={setMarkerPositions}
              />
              <AdminPanoramaSphere
                onSphereReady={handleSphereReady}
                texture={texture}
              />
            </Canvas>
          </div>

          {isLoading && !texture && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.72)', fontSize: 13,
              pointerEvents: 'none',
            }}>
              Loading panorama...
            </div>
          )}

          {error && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.84)', fontSize: 13,
              background: 'rgba(0,0,0,0.36)', pointerEvents: 'none',
            }}>
              Unable to load panorama.
            </div>
          )}

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
              currentFloorId={currentFloorId}
              onChange={(field, value) => updateField(selectedIndex, field, value)}
              onDelete={() => handleDelete(selectedIndex)}
              onTargetSceneChange={(scene) => handleTargetSceneChange(selectedIndex, scene)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function AdminCameraBridge({
  applyCameraState,
  cameraRef,
}: {
  applyCameraState: () => void
  cameraRef: React.RefObject<THREE.PerspectiveCamera | null>
}) {
  const { camera, size } = useThree()

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return

    cameraRef.current = camera
    applyCameraState()

    return () => {
      if (cameraRef.current === camera) {
        cameraRef.current = null
      }
    }
  }, [applyCameraState, camera, cameraRef])

  useEffect(() => {
    applyCameraState()
  }, [applyCameraState, size.height, size.width])

      return null
    }

function AdminHotspotProjectionBridge({
  containerRef,
  draggingIndexRef,
  hotspots,
  onChange,
}: {
  containerRef: React.RefObject<HTMLElement | null>
  draggingIndexRef: React.RefObject<number | null>
  hotspots: HotspotRow[]
  onChange: React.Dispatch<React.SetStateAction<Map<number, ScreenPos>>>
}) {
  useFrame(({ camera }) => {
    const container = containerRef.current
    if (!(camera instanceof THREE.PerspectiveCamera) || !container) {
      onChange((prev) => (prev.size ? new Map() : prev))
      return
    }

    onChange((prev) => {
      const next = new Map<number, ScreenPos>()
      let changed = prev.size !== hotspots.length

      for (let i = 0; i < hotspots.length; i++) {
        const hs = hotspots[i]
        // Mousemove owns the live marker position while a drag is active.
        if (draggingIndexRef.current === i) {
          const p = prev.get(i)
          if (p) next.set(i, p)
          continue
        }
        if (hs.pitch == null || hs.yaw == null) continue

        const p = projectPitchYawToScreen(Number(hs.pitch), Number(hs.yaw), camera, container)
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
  })

  return null
}

function AdminPanoramaSphere({
  onSphereReady,
  texture,
}: {
  onSphereReady: (sphere: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> | null) => void
  texture: THREE.Texture | null
}) {
  const sphereRef = useRef<THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> | null>(null)
  const materialRef = useRef<THREE.MeshBasicMaterial | null>(null)
  const geometry = useMemo(() => {
    const sphereGeometry = new THREE.SphereGeometry(500, 64, 40)
    sphereGeometry.scale(-1, 1, 1)
    return sphereGeometry
  }, [])

  useEffect(() => {
    const material = materialRef.current
    if (!material) return

    if (texture) texture.needsUpdate = true
    material.map = texture
    material.needsUpdate = true
  }, [texture])

  useEffect(() => {
    onSphereReady(sphereRef.current)
    return () => onSphereReady(null)
  }, [onSphereReady])

  return (
    <mesh ref={sphereRef} geometry={geometry}>
      <meshBasicMaterial
        ref={materialRef}
        color={0xffffff}
        map={texture}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  )
}

function SidePanel({
  index, hotspot, scenes, currentFloorId, onChange, onDelete, onTargetSceneChange,
}: {
  index: number
  hotspot: HotspotRow
  scenes: SceneSummary[]
  currentFloorId: string | null
  onChange: (field: string, value: any) => void
  onDelete: () => void
  onTargetSceneChange: (scene: SceneSummary | null) => void
}) {
  const infoContentPath = `${HOTSPOTS_PATH}.${index}.infoContent`
  const infoContentEditorReady = useFormFields(([fields]) =>
    fields[infoContentPath]?.customComponents?.Field !== undefined,
  ) as boolean
  const targetSceneId = idOf(hotspot.targetScene)
  const targetScene = useMemo(
    () => (targetSceneId ? scenes.find((s) => String(s.id) === targetSceneId) : null) ?? null,
    [targetSceneId, scenes],
  )

  const [sceneSearch, setSceneSearch] = useState('')
  const targetFloorStatus = useMemo(() => {
    if (!targetScene) return null

    if (!targetScene.floorId) {
      return {
        color: '#ff9b73',
        text: 'Target scene has no floor. Choose another scene before saving.',
      }
    }

    if (currentFloorId && targetScene.floorId === currentFloorId) {
      return { color: '#87d68d', text: 'Same floor' }
    }

    return {
      color: '#79a8ff',
      text: `Cross-floor target: ${targetScene.floorName || `Floor ${targetScene.floorId}`}`,
    }
  }, [currentFloorId, targetScene])
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
                    onClick={() => onTargetSceneChange(null)}
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
                {targetFloorStatus && (
                  <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    color: targetFloorStatus.color,
                    fontSize: 11,
                    padding: '6px 10px 8px',
                  }}>
                    {targetFloorStatus.text}
                  </div>
                )}
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

          <input
            type="text"
            value={sceneSearch}
            onChange={(e) => setSceneSearch(e.target.value)}
            placeholder={`Search ${scenes.length} scene${scenes.length === 1 ? '' : 's'}…`}
            style={{ ...inputStyle, marginBottom: 8 }}
          />

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
              const disabled = !s.floorId
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onTargetSceneChange(s)}
                  title={disabled ? 'This scene has no floor and cannot be used as a portal target.' : s.title}
                  style={{
                    display: 'block', textAlign: 'left',
                    padding: 0, background: '#161616',
                    border: isSelected ? '2px solid #1a6ef5' : '1px solid #2a2a2a',
                    borderRadius: 3, overflow: 'hidden',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.5 : 1,
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
                  <div style={{
                    color: '#777',
                    fontSize: 10,
                    padding: '0 6px 5px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {s.floorName || (s.floorId ? `Floor ${s.floorId}` : 'No floor')}
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
        <div style={fieldRow}>
          {infoContentEditorReady ? (
            <div style={{
              background: '#141414',
              border: '1px solid #2a2a2a',
              borderRadius: 4,
              padding: 8,
            }}>
              <RenderFields
                fields={INFO_CONTENT_FIELDS}
                forceRender
                margins={false}
                parentIndexPath=""
                parentPath={`${HOTSPOTS_PATH}.${index}`}
                parentSchemaPath={HOTSPOTS_SCHEMA_PATH}
                permissions={true}
              />
            </div>
          ) : (
            <div style={{
              padding: 8, background: '#181818',
              border: '1px dashed #333', borderRadius: 4,
              fontSize: 11, color: '#999', lineHeight: 1.5,
            }}>
              Rich text editor is not ready for this row yet. Save the scene or use the fallback Hotspots row below.
            </div>
          )}
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
