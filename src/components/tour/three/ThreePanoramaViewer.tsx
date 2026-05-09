'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { getDefaultTransitionConfig } from '../transition'
import ThreeHotspotLayer from './ThreeHotspotLayer'
import {
  animateCameraExit,
  animateCameraFocus,
  animateCameraTransition,
} from './threeCameraTransition'
import { getStoredPitchYaw, projectPitchYawToScreen, toThreeDisplayPitchYaw } from './threePanoramaMath'
import { useThreePanoramaControls } from './useThreePanoramaControls'
import { useThreeSceneTexture } from './useThreeSceneTexture'
import type { CameraState, HotspotData, ProjectedHotspot, ThreePanoramaViewerProps, ThreeSceneData, ThreeViewerApi } from './types'

const HOTSPOT_EDGE_PADDING = 48
const EMPTY_HOTSPOTS: HotspotData[] = []

export default function ThreePanoramaViewer({
  scenes,
  initialSceneSlug,
  tourSlug,
  floorSlug,
  isDraft,
  debugHotspots,
  onSceneChange,
}: ThreePanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const animationAbortRef = useRef<AbortController | null>(null)
  const [cameraForApi, setCameraForApi] = useState<THREE.PerspectiveCamera | null>(null)
  const [activeSceneSlug, setActiveSceneSlug] = useState(initialSceneSlug)
  const [isCameraTransitioning, setIsCameraTransitioning] = useState(false)
  const [projectedHotspots, setProjectedHotspots] = useState<ProjectedHotspot[]>([])

  const activeScene = useMemo<ThreeSceneData>(() => (
    scenes.find((scene) => scene.slug === activeSceneSlug) ||
    scenes.find((scene) => scene.slug === initialSceneSlug) ||
    scenes[0]
  ), [activeSceneSlug, initialSceneSlug, scenes])
  const activeSceneCameraState = useMemo(() => (
    activeScene ? getSceneCameraState(activeScene) : { pitch: 0, yaw: 0, hfov: 120 }
  ), [activeScene])
  const activeSceneHotspots = activeScene?.hotspots ?? EMPTY_HOTSPOTS

  const { applyCameraState, getCameraState, setCameraState } = useThreePanoramaControls({
    cameraRef,
    containerRef,
    initialPitch: activeSceneCameraState.pitch,
    initialYaw: activeSceneCameraState.yaw,
    initialHfov: activeSceneCameraState.hfov,
    resetKey: initialSceneSlug,
  })

  const { texture, isLoading, error } = useThreeSceneTexture(activeScene?.panoramaUrl)

  const beginCameraAnimation = useCallback(() => {
    animationAbortRef.current?.abort()
    const controller = new AbortController()
    animationAbortRef.current = controller
    setIsCameraTransitioning(true)
    return controller
  }, [])

  const finishCameraAnimation = useCallback((controller: AbortController) => {
    if (animationAbortRef.current !== controller) return
    animationAbortRef.current = null
    setIsCameraTransitioning(false)
  }, [])

  const switchToScene = useCallback((sceneSlug: string, resetCamera = true) => {
    const nextScene = scenes.find((scene) => scene.slug === sceneSlug)
    if (!nextScene) return false

    setActiveSceneSlug(sceneSlug)
    if (resetCamera) {
      setCameraState(getSceneCameraState(nextScene))
    }
    onSceneChange(sceneSlug)
    return true
  }, [onSceneChange, scenes, setCameraState])

  const runSameFloorTransition = useCallback(async (
    targetScene: ThreeSceneData,
    hotspot?: HotspotData | null,
  ) => {
    const controller = beginCameraAnimation()
    const transitionConfig = getDefaultTransitionConfig(true)

    try {
      await animateCameraTransition({
        duration: transitionConfig.duration,
        getCameraState,
        onMidpoint: () => {
          switchToScene(targetScene.slug, false)
        },
        outgoingDirection: getHotspotDirection(hotspot, targetScene),
        setCameraState,
        signal: controller.signal,
        targetState: getSceneCameraState(targetScene),
      })
    } finally {
      finishCameraAnimation(controller)
    }
  }, [activeScene, beginCameraAnimation, finishCameraAnimation, getCameraState, setCameraState, switchToScene])

  const runCrossFloorTransition = useCallback(async (
    targetSlug: string,
    targetFloorSlug: string,
    hotspot?: HotspotData | null,
  ) => {
    const controller = beginCameraAnimation()
    const transitionConfig = getDefaultTransitionConfig(false)
    const targetUrl = buildSceneUrl(tourSlug, targetFloorSlug, targetSlug, isDraft, Boolean(debugHotspots))

    try {
      await animateCameraExit({
        duration: Math.max(450, transitionConfig.duration * 0.65),
        getCameraState,
        onComplete: () => {
          window.location.assign(targetUrl)
        },
        outgoingDirection: getHotspotDirection(hotspot),
        setCameraState,
        signal: controller.signal,
      })
    } finally {
      finishCameraAnimation(controller)
    }
  }, [activeScene, beginCameraAnimation, debugHotspots, finishCameraAnimation, getCameraState, isDraft, setCameraState, tourSlug])

  const navigateToHotspot = useCallback((hotspot: HotspotData) => {
    const targetSlug = hotspot.targetScene?.slug
    if (!targetSlug) {
      warnInDevelopment('Scene hotspot ignored because targetScene.slug is missing.', hotspot)
      return
    }

    const targetFloorSlug = hotspot.targetFloor?.slug
    const isSameFloor = !targetFloorSlug || targetFloorSlug === floorSlug

    if (isSameFloor) {
      const targetScene = scenes.find((scene) => scene.slug === targetSlug)
      if (!targetScene) {
        const reason = targetFloorSlug
          ? `Target scene "${targetSlug}" was not found in the current floor scene list.`
          : `Target scene "${targetSlug}" was not found in the current floor scene list. The hotspot may be missing targetFloor for a cross-floor portal.`
        warnInDevelopment(reason, hotspot)
        return
      }

      void runSameFloorTransition(targetScene, hotspot)
      return
    }

    void runCrossFloorTransition(targetSlug, targetFloorSlug, hotspot)
  }, [floorSlug, runCrossFloorTransition, runSameFloorTransition, scenes])

  const focusCameraAt = useCallback(async (pitch: number, yaw: number, hfov?: number) => {
    const controller = beginCameraAnimation()

    try {
      return await animateCameraFocus({
        getCameraState,
        setCameraState,
        signal: controller.signal,
        targetHfov: hfov,
        targetPitch: pitch,
        targetYaw: yaw,
      })
    } finally {
      finishCameraAnimation(controller)
    }
  }, [beginCameraAnimation, finishCameraAnimation, getCameraState, setCameraState])

  const focusScenePitchYaw = useCallback((pitch: number, yaw: number, hfov?: number) => {
    // Hotspots use stored raw coordinates. Ignore scene.rotation for hotspot
    // focus until the rotation strategy is finalized.
    const displayPosition = getStoredPitchYaw(pitch, yaw)
    return focusCameraAt(displayPosition.pitch, displayPosition.yaw, hfov)
  }, [focusCameraAt])

  const focusInfoHotspot = useCallback(async (hotspot: HotspotData) => {
    if (!Number.isFinite(Number(hotspot.pitch)) || !Number.isFinite(Number(hotspot.yaw))) {
      warnInDevelopment('Info hotspot focus skipped because pitch or yaw is missing.', hotspot)
      return true
    }

    return focusScenePitchYaw(Number(hotspot.pitch), Number(hotspot.yaw), 72)
  }, [focusScenePitchYaw])

  const handleInfoFocus = useCallback((hotspot: HotspotData, openInfo: () => void) => {
    void (async () => {
      const didFocus = await focusInfoHotspot(hotspot)
      if (didFocus) openInfo()
    })()
  }, [focusInfoHotspot])

  const handleSceneNavigation = useCallback((
    targetSlug: string,
    targetFloorSlug?: string,
    _clickEvent?: MouseEvent,
    hotspot?: HotspotData,
  ) => {
    navigateToHotspot(hotspot || {
      targetFloor: targetFloorSlug ? { slug: targetFloorSlug } : null,
      targetScene: { slug: targetSlug },
      type: 'scene',
    })
  }, [navigateToHotspot])

  useEffect(() => {
    setActiveSceneSlug(initialSceneSlug)
    const nextScene = scenes.find((scene) => scene.slug === initialSceneSlug)
    if (nextScene) {
      setCameraState(getSceneCameraState(nextScene))
      onSceneChange(initialSceneSlug)
    }
  }, [initialSceneSlug, onSceneChange, scenes, setCameraState])

  useEffect(() => {
    return () => {
      animationAbortRef.current?.abort()
      animationAbortRef.current = null
    }
  }, [])

  useEffect(() => {
    const api: ThreeViewerApi = {
      camera: cameraRef.current,
      focusInfoHotspot,
      getCameraState,
      loadScene: (sceneSlug: string) => {
        const targetScene = scenes.find((scene) => scene.slug === sceneSlug)
        if (!targetScene) {
          warnInDevelopment(`Scene "${sceneSlug}" was not found in the current floor scene list.`)
          return
        }
        void runSameFloorTransition(targetScene, null)
      },
      lookAt: (pitch: number, yaw: number, hfov?: number) => {
        void focusScenePitchYaw(pitch, yaw, hfov)
      },
      navigateToHotspot,
    }

    window.threePanoramaViewer = api

    return () => {
      if (window.threePanoramaViewer === api) {
        delete window.threePanoramaViewer
      }
    }
  }, [
    cameraForApi,
    focusScenePitchYaw,
    focusInfoHotspot,
    getCameraState,
    navigateToHotspot,
    runSameFloorTransition,
    scenes,
  ])

  if (!activeScene) {
    return (
      <div className="h-dvh w-dvw inset-0 absolute bg-black text-white flex items-center justify-center">
        Scene unavailable
      </div>
    )
  }

  return (
    <>
      <div
        ref={containerRef}
        className="h-dvh w-dvw inset-0 absolute overflow-hidden bg-black"
        id="three-panorama"
        style={{
          filter: isCameraTransitioning ? 'brightness(0.95)' : 'none',
          touchAction: 'none',
          transition: 'filter 0.3s ease',
        }}
      >
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
          <PanoramaCameraBridge
            applyCameraState={applyCameraState}
            cameraRef={cameraRef}
            onCameraChange={setCameraForApi}
          />
          <HotspotProjectionBridge
            containerRef={containerRef}
            hotspots={activeSceneHotspots}
            onChange={setProjectedHotspots}
          />
          <PanoramaSphere texture={texture} />
        </Canvas>
        {isLoading && !texture && (
          <div className="absolute inset-0 flex items-center justify-center text-white/70 text-sm">
            Loading scene...
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-white/80 text-sm px-4 text-center">
            Unable to load this panorama.
          </div>
        )}
        <ThreeHotspotLayer
          floorSlug={floorSlug}
          onInfoFocus={handleInfoFocus}
          onNavigate={handleSceneNavigation}
          projectedHotspots={projectedHotspots}
          tourSlug={tourSlug}
        />
      </div>
    </>
  )
}

function HotspotProjectionBridge({
  containerRef,
  hotspots,
  onChange,
}: {
  containerRef: React.RefObject<HTMLElement | null>
  hotspots: HotspotData[]
  onChange: React.Dispatch<React.SetStateAction<ProjectedHotspot[]>>
}) {
  const previousRef = useRef<ProjectedHotspot[]>([])

  useFrame(({ camera }) => {
    const container = containerRef.current
    if (!(camera instanceof THREE.PerspectiveCamera) || !container) {
      if (previousRef.current.length > 0) {
        previousRef.current = []
        onChange([])
      }
      return
    }

    const width = container.clientWidth
    const height = container.clientHeight
    const nextHotspots = hotspots
      .filter((hotspot) => hotspot.pitch !== undefined && hotspot.yaw !== undefined)
      .map((hotspot) => {
        // Hotspots use stored raw coordinates. Ignore scene.rotation here so
        // hotspot placement matches the authored CMS values.
        const displayPosition = getStoredPitchYaw(
          Number(hotspot.pitch),
          Number(hotspot.yaw),
        )
        const projected = projectPitchYawToScreen(
          displayPosition.pitch,
          displayPosition.yaw,
          camera,
          container,
        )
        const insideViewport =
          projected.x >= -HOTSPOT_EDGE_PADDING &&
          projected.x <= width + HOTSPOT_EDGE_PADDING &&
          projected.y >= -HOTSPOT_EDGE_PADDING &&
          projected.y <= height + HOTSPOT_EDGE_PADDING

        return {
          hotspot,
          x: projected.x,
          y: projected.y,
          visible: projected.visible && insideViewport,
        }
      })

    if (areProjectedHotspotsEqual(previousRef.current, nextHotspots)) return

    previousRef.current = nextHotspots
    onChange(nextHotspots)
  })

  useEffect(() => {
    previousRef.current = []
    onChange((current) => (current.length ? [] : current))
  }, [hotspots, onChange])

  return null
}

function PanoramaCameraBridge({
  applyCameraState,
  cameraRef,
  onCameraChange,
}: {
  applyCameraState: () => void
  cameraRef: React.RefObject<THREE.PerspectiveCamera | null>
  onCameraChange: (camera: THREE.PerspectiveCamera | null) => void
}) {
  const { camera, size } = useThree()

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) {
      onCameraChange(null)
      return
    }

    cameraRef.current = camera
    onCameraChange(camera)
    applyCameraState()

    return () => {
      if (cameraRef.current === camera) {
        cameraRef.current = null
      }
      onCameraChange(null)
    }
  }, [applyCameraState, camera, cameraRef, onCameraChange])

  useEffect(() => {
    applyCameraState()
  }, [applyCameraState, size.height, size.width])

  return null
}

function PanoramaSphere({ texture }: { texture: THREE.Texture | null }) {
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

  return (
    <mesh geometry={geometry}>
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

function areProjectedHotspotsEqual(
  current: ProjectedHotspot[],
  next: ProjectedHotspot[],
) {
  if (current.length !== next.length) return false

  return next.every((projected, index) => {
    const previous = current[index]
    return (
      previous?.hotspot === projected.hotspot &&
      previous.visible === projected.visible &&
      Math.abs(previous.x - projected.x) <= 0.5 &&
      Math.abs(previous.y - projected.y) <= 0.5
    )
  })
}

function getSceneCameraState(scene: ThreeSceneData): CameraState {
  const displayPosition = toThreeDisplayPitchYaw(
    scene.initialPitch,
    scene.initialYaw,
    scene.rotation,
  )

  return {
    pitch: displayPosition.pitch,
    yaw: displayPosition.yaw,
    hfov: scene.initialHfov,
  }
}

function getHotspotDirection(
  hotspot?: HotspotData | null,
  targetScene?: ThreeSceneData,
) {
  if (Number.isFinite(Number(hotspot?.pitch)) && Number.isFinite(Number(hotspot?.yaw))) {
    // Portal hotspots use stored raw coordinates. scene.rotation is
    // intentionally ignored until hotspot rotation behavior is validated
    // separately.
    return getStoredPitchYaw(
      Number(hotspot?.pitch),
      Number(hotspot?.yaw),
    )
  }

  if (targetScene) {
    return getSceneCameraState(targetScene)
  }

  return null
}

function buildSceneUrl(
  tourSlug: string,
  floorSlug: string,
  sceneSlug: string,
  isDraft: boolean,
  debugHotspots: boolean,
) {
  const query = new URLSearchParams()
  if (isDraft) query.set('draft', 'true')
  if (debugHotspots) query.set('debugHotspots', 'true')
  const queryString = query.toString() ? `?${query.toString()}` : ''
  return `/tour/${tourSlug}/${floorSlug}/${sceneSlug}${queryString}`
}

function warnInDevelopment(message: string, context?: unknown) {
  if (process.env.NODE_ENV !== 'development') return
  if (context === undefined) {
    console.warn(`[ThreePanoramaViewer] ${message}`)
    return
  }
  console.warn(`[ThreePanoramaViewer] ${message}`, context)
}
