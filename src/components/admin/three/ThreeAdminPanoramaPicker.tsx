'use client'

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import * as THREE from 'three'
import {
  clampHfov,
  clampInteractionPitch,
  normaliseYaw,
  projectPitchYawToScreen,
  screenPointToPitchYaw,
} from '@/components/tour/three/threePanoramaMath'
import { useThreePanoramaControls } from '@/components/tour/three/useThreePanoramaControls'
import { useThreeSceneTexture } from '@/components/tour/three/useThreeSceneTexture'
import type { CameraState, PitchYaw } from '@/components/tour/three/types'

type MarkerTone = 'hotspot' | 'initial'

type Props = {
  panoramaUrl: string | null | undefined
  initialCamera?: Partial<CameraState>
  resetKey?: string
  selectedPitch?: number | string | null
  selectedYaw?: number | string | null
  markerTone?: MarkerTone
  markerLabel?: string
  markerDraggable?: boolean
  enableClickPick?: boolean
  showCenterReticle?: boolean
  showHud?: boolean
  height?: number | string
  emptyMessage?: string
  onCameraChange?: (camera: CameraState) => void
  onCursorChange?: (coords: PitchYaw | null) => void
  onPick?: (coords: PitchYaw, camera: CameraState) => void
  onMarkerDrag?: (coords: PitchYaw, camera: CameraState) => void
  onMarkerDragEnd?: (coords: PitchYaw, camera: CameraState) => void
}

export type ThreeAdminPanoramaPickerHandle = {
  getCameraState: () => CameraState
  setCameraState: (state: Partial<CameraState>) => void
}

type ProjectedMarker = {
  x: number
  y: number
  visible: boolean
}

const DEFAULT_CAMERA: CameraState = {
  pitch: 0,
  yaw: 0,
  hfov: 120,
}

const CLICK_DRAG_THRESHOLD_PX = 6

function ThreeAdminPanoramaPicker(
  {
    panoramaUrl,
    initialCamera,
    resetKey,
    selectedPitch,
    selectedYaw,
    markerTone = 'hotspot',
    markerLabel = 'Selected point',
    markerDraggable = false,
    enableClickPick = false,
    showCenterReticle = false,
    showHud = true,
    height = 380,
    emptyMessage = 'Select a panorama image before opening the Three.js picker.',
    onCameraChange,
    onCursorChange,
    onPick,
    onMarkerDrag,
    onMarkerDragEnd,
  }: Props,
  ref: React.ForwardedRef<ThreeAdminPanoramaPickerHandle>,
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const sphereRef = useRef<THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> | null>(null)
  const frameRef = useRef<number | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const pointerStartRef = useRef<{ x: number; y: number; pointerId: number } | null>(null)
  const markerDragRef = useRef<{ active: boolean; pointerId: number | null }>({ active: false, pointerId: null })
  const markerPointRef = useRef<PitchYaw | null>(null)
  const cursorRef = useRef<PitchYaw | null>(null)
  const lastCameraRef = useRef<CameraState | null>(null)
  const callbacksRef = useRef({
    onCameraChange,
    onCursorChange,
    onPick,
    onMarkerDrag,
    onMarkerDragEnd,
  })

  const initialPitch = clampInteractionPitch(numberOrFallback(initialCamera?.pitch, DEFAULT_CAMERA.pitch))
  const initialYaw = normaliseYaw(numberOrFallback(initialCamera?.yaw, DEFAULT_CAMERA.yaw))
  const initialHfov = clampHfov(numberOrFallback(initialCamera?.hfov, DEFAULT_CAMERA.hfov))

  const { applyCameraState, getCameraState, setCameraState } = useThreePanoramaControls({
    cameraRef,
    containerRef,
    initialPitch,
    initialYaw,
    initialHfov,
    resetKey,
  })

  const { texture, isLoading, error } = useThreeSceneTexture(panoramaUrl)

  const selectedPoint = useMemo(() => {
    const pitch = Number(selectedPitch)
    const yaw = Number(selectedYaw)

    if (!Number.isFinite(pitch) || !Number.isFinite(yaw)) return null

    return {
      pitch: clampInteractionPitch(pitch),
      yaw: normaliseYaw(yaw),
    }
  }, [selectedPitch, selectedYaw])

  const [dragPoint, setDragPoint] = useState<PitchYaw | null>(null)
  const [projectedMarker, setProjectedMarker] = useState<ProjectedMarker | null>(null)
  const [cursor, setCursor] = useState<PitchYaw | null>(null)
  const [cameraDisplay, setCameraDisplay] = useState<CameraState>({
    pitch: initialPitch,
    yaw: initialYaw,
    hfov: initialHfov,
  })

  const activeMarkerPoint = dragPoint || selectedPoint

  useEffect(() => {
    callbacksRef.current = {
      onCameraChange,
      onCursorChange,
      onPick,
      onMarkerDrag,
      onMarkerDragEnd,
    }
  }, [onCameraChange, onCursorChange, onPick, onMarkerDrag, onMarkerDragEnd])

  useEffect(() => {
    markerPointRef.current = activeMarkerPoint
  }, [activeMarkerPoint])

  useImperativeHandle(ref, () => ({
    getCameraState,
    setCameraState,
  }), [getCameraState, setCameraState])

  const getPitchYawAtClientPoint = useCallback((clientX: number, clientY: number) => {
    const container = containerRef.current
    const camera = cameraRef.current
    const sphere = sphereRef.current

    if (!container || !camera || !sphere) return null

    const rect = container.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return null

    const localX = clientX - rect.left
    const localY = clientY - rect.top

    if (localX < 0 || localX > rect.width || localY < 0 || localY > rect.height) {
      return null
    }

    const x = (localX / rect.width) * 2 - 1
    const y = -((localY / rect.height) * 2 - 1)

    return screenPointToPitchYaw(x, y, camera, sphere)
  }, [])

  const updateCursorFromPointer = useCallback((clientX: number, clientY: number) => {
    const coords = getPitchYawAtClientPoint(clientX, clientY)
    cursorRef.current = coords
    setCursor((current) => {
      if (samePitchYaw(current, coords)) return current
      return coords
    })
    callbacksRef.current.onCursorChange?.(coords)
    return coords
  }, [getPitchYawAtClientPoint])

  useEffect(() => {
    const container = containerRef.current
    if (!container || cameraRef.current) return

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
      const currentCamera = getCameraState()

      if (!sameCameraState(lastCameraRef.current, currentCamera)) {
        lastCameraRef.current = { ...currentCamera }
        setCameraDisplay(currentCamera)
        callbacksRef.current.onCameraChange?.(currentCamera)
      }

      const markerPoint = markerPointRef.current
      if (markerPoint) {
        const projected = projectPitchYawToScreen(markerPoint.pitch, markerPoint.yaw, camera, container)
        setProjectedMarker((current) => {
          if (
            current &&
            Math.abs(current.x - projected.x) < 0.5 &&
            Math.abs(current.y - projected.y) < 0.5 &&
            current.visible === projected.visible
          ) {
            return current
          }

          return projected
        })
      } else {
        setProjectedMarker((current) => (current === null ? current : null))
      }

      renderer.render(scene, camera)
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
  }, [applyCameraState, getCameraState])

  useEffect(() => {
    const sphere = sphereRef.current
    if (!sphere) return

    sphere.material.map = texture
    sphere.material.needsUpdate = true
  }, [texture])

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!enableClickPick || event.button !== 0 || isInteractiveTarget(event.target)) return

    pointerStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
    }
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    updateCursorFromPointer(event.clientX, event.clientY)
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current
    pointerStartRef.current = null

    if (!enableClickPick || !start || start.pointerId !== event.pointerId || isInteractiveTarget(event.target)) return

    const distance = Math.hypot(event.clientX - start.x, event.clientY - start.y)
    if (distance > CLICK_DRAG_THRESHOLD_PX) return

    const coords = updateCursorFromPointer(event.clientX, event.clientY)
    if (!coords) return

    callbacksRef.current.onPick?.(coords, getCameraState())
  }

  const handlePointerLeave = () => {
    if (markerDragRef.current.active) return

    cursorRef.current = null
    setCursor(null)
    callbacksRef.current.onCursorChange?.(null)
  }

  const handleMarkerPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!markerDraggable || event.button !== 0) return

    event.preventDefault()
    event.stopPropagation()
    ;(event.nativeEvent as Event & { stopImmediatePropagation?: () => void }).stopImmediatePropagation?.()

    markerDragRef.current = { active: true, pointerId: event.pointerId }
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handleMarkerPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!markerDragRef.current.active || markerDragRef.current.pointerId !== event.pointerId) return

    event.preventDefault()
    event.stopPropagation()

    const coords = updateCursorFromPointer(event.clientX, event.clientY)
    if (!coords) return

    setDragPoint(coords)
    callbacksRef.current.onMarkerDrag?.(coords, getCameraState())
  }

  const handleMarkerPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!markerDragRef.current.active || markerDragRef.current.pointerId !== event.pointerId) return

    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.releasePointerCapture?.(event.pointerId)

    markerDragRef.current = { active: false, pointerId: null }

    const coords = updateCursorFromPointer(event.clientX, event.clientY) || dragPoint
    setDragPoint(null)

    if (!coords) return

    callbacksRef.current.onMarkerDragEnd?.(coords, getCameraState())
  }

  const handleMarkerPointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    if (markerDragRef.current.pointerId !== event.pointerId) return

    markerDragRef.current = { active: false, pointerId: null }
    setDragPoint(null)
  }

  const shellStyle = useMemo<React.CSSProperties>(() => ({
    ...styles.shell,
    height,
  }), [height])

  if (!panoramaUrl) {
    return (
      <div style={shellStyle}>
        <div style={styles.emptyMessage}>{emptyMessage}</div>
      </div>
    )
  }

  return (
    <div
      style={shellStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      <div ref={containerRef} style={styles.viewer} />

      {isLoading && !texture && (
        <div style={styles.centerMessage}>Loading panorama...</div>
      )}

      {error && (
        <div style={styles.centerMessage}>Unable to load this panorama.</div>
      )}

      {showCenterReticle && (
        <div style={styles.reticle} aria-hidden="true">
          <span style={styles.reticleRing} />
          <span style={styles.reticleLineHorizontal} />
          <span style={styles.reticleLineVertical} />
        </div>
      )}

      {activeMarkerPoint && projectedMarker && (
        <div
          data-tour-hotspot-interactive="true"
          onPointerDown={handleMarkerPointerDown}
          onPointerMove={handleMarkerPointerMove}
          onPointerUp={handleMarkerPointerUp}
          onPointerCancel={handleMarkerPointerCancel}
          style={{
            ...styles.marker,
            ...markerToneStyles[markerTone],
            cursor: markerDraggable ? 'grab' : 'default',
            display: projectedMarker.visible ? 'block' : 'none',
            left: projectedMarker.x,
            top: projectedMarker.y,
          }}
          title={`${markerLabel}: pitch ${formatNumber(activeMarkerPoint.pitch)}, yaw ${formatNumber(activeMarkerPoint.yaw)}`}
        />
      )}

      {showHud && (
        <div style={styles.hud}>
          <span>Camera {formatNumber(cameraDisplay.pitch)} pitch / {formatNumber(cameraDisplay.yaw)} yaw / {formatNumber(cameraDisplay.hfov)} hfov</span>
          <span>Cursor {cursor ? `${formatNumber(cursor.pitch)} pitch / ${formatNumber(cursor.yaw)} yaw` : 'outside'}</span>
          <span>Selected {activeMarkerPoint ? `${formatNumber(activeMarkerPoint.pitch)} pitch / ${formatNumber(activeMarkerPoint.yaw)} yaw` : 'none'}</span>
        </div>
      )}
    </div>
  )
}

export default forwardRef(ThreeAdminPanoramaPicker)

function numberOrFallback(value: number | string | null | undefined, fallback: number) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : fallback
}

function formatNumber(value: number) {
  return value.toFixed(2)
}

function samePitchYaw(left: PitchYaw | null, right: PitchYaw | null) {
  if (!left || !right) return left === right

  return Math.abs(left.pitch - right.pitch) < 0.01 && Math.abs(left.yaw - right.yaw) < 0.01
}

function sameCameraState(left: CameraState | null, right: CameraState) {
  if (!left) return false

  return (
    Math.abs(left.pitch - right.pitch) < 0.01 &&
    Math.abs(left.yaw - right.yaw) < 0.01 &&
    Math.abs(left.hfov - right.hfov) < 0.01
  )
}

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest('[data-tour-hotspot-interactive="true"]'))
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    background: '#05070a',
    border: '1px solid #263241',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    touchAction: 'none',
  },
  viewer: {
    height: '100%',
    inset: 0,
    position: 'absolute',
    width: '100%',
  },
  emptyMessage: {
    alignItems: 'center',
    color: '#9aa4b2',
    display: 'flex',
    fontSize: 13,
    height: '100%',
    justifyContent: 'center',
    padding: 16,
    textAlign: 'center',
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
    border: '3px solid #ffffff',
    borderRadius: '50%',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.46)',
    height: 24,
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    width: 24,
    zIndex: 12,
  },
  hud: {
    alignItems: 'center',
    background: 'rgba(12, 17, 29, 0.78)',
    bottom: 8,
    color: '#f8fafc',
    display: 'flex',
    flexWrap: 'wrap',
    fontSize: 12,
    gap: '6px 12px',
    left: 8,
    lineHeight: 1.4,
    maxWidth: 'calc(100% - 16px)',
    padding: '6px 8px',
    pointerEvents: 'none',
    position: 'absolute',
    zIndex: 11,
  },
  reticle: {
    height: 34,
    left: '50%',
    pointerEvents: 'none',
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: 34,
    zIndex: 10,
  },
  reticleRing: {
    border: '2px solid rgba(255, 255, 255, 0.86)',
    borderRadius: '50%',
    boxShadow: '0 0 0 1px rgba(37, 99, 235, 0.8), 0 2px 10px rgba(0, 0, 0, 0.45)',
    display: 'block',
    height: 22,
    left: 6,
    position: 'absolute',
    top: 6,
    width: 22,
  },
  reticleLineHorizontal: {
    background: 'rgba(255, 255, 255, 0.9)',
    height: 2,
    left: 0,
    position: 'absolute',
    top: 16,
    width: 34,
  },
  reticleLineVertical: {
    background: 'rgba(255, 255, 255, 0.9)',
    height: 34,
    left: 16,
    position: 'absolute',
    top: 0,
    width: 2,
  },
}

const markerToneStyles: Record<MarkerTone, React.CSSProperties> = {
  hotspot: {
    background: 'radial-gradient(circle at 35% 35%, #ff9b9b, #d92d20)',
    boxShadow: '0 0 0 2px #f04438, 0 2px 10px rgba(0, 0, 0, 0.46)',
  },
  initial: {
    background: 'radial-gradient(circle at 35% 35%, #93c5fd, #2563eb)',
    boxShadow: '0 0 0 2px #2563eb, 0 2px 10px rgba(0, 0, 0, 0.46)',
  },
}
