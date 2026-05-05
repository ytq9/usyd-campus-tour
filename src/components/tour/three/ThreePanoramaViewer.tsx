'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { getDefaultTransitionConfig } from '../transition'
import ThreeHotspotLayer from './ThreeHotspotLayer'
import {
  animateCameraExit,
  animateCameraFocus,
  animateCameraTransition,
} from './threeCameraTransition'
import { getRawPannellumPitchYaw, toThreeDisplayPitchYaw } from './threePanoramaMath'
import { useThreePanoramaControls } from './useThreePanoramaControls'
import { useThreeSceneTexture } from './useThreeSceneTexture'
import type { CameraState, HotspotData, ThreePanoramaViewerProps, ThreeSceneData, ThreeViewerApi } from './types'

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
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const sphereRef = useRef<THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> | null>(null)
  const frameRef = useRef<number | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const animationAbortRef = useRef<AbortController | null>(null)
  const [cameraForHotspots, setCameraForHotspots] = useState<THREE.PerspectiveCamera | null>(null)
  const [activeSceneSlug, setActiveSceneSlug] = useState(initialSceneSlug)
  const [isCameraTransitioning, setIsCameraTransitioning] = useState(false)

  const activeScene = useMemo<ThreeSceneData>(() => (
    scenes.find((scene) => scene.slug === activeSceneSlug) ||
    scenes.find((scene) => scene.slug === initialSceneSlug) ||
    scenes[0]
  ), [activeSceneSlug, initialSceneSlug, scenes])
  const activeSceneCameraState = useMemo(() => (
    activeScene ? getSceneCameraState(activeScene) : { pitch: 0, yaw: 0, hfov: 120 }
  ), [activeScene])

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
    // HotspotPicker stores raw Pannellum pitch/yaw, and PannellumViewer focuses
    // those raw coordinates. Ignore scene.rotation for hotspot focus parity.
    const displayPosition = getRawPannellumPitchYaw(pitch, yaw)
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
    cameraForHotspots,
    focusScenePitchYaw,
    focusInfoHotspot,
    getCameraState,
    navigateToHotspot,
    runSameFloorTransition,
    scenes,
  ])

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
    setCameraForHotspots(camera)
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
      setCameraForHotspots(null)
    }
  }, [applyCameraState])

  useEffect(() => {
    const sphere = sphereRef.current
    if (!sphere) return

    sphere.material.map = texture
    sphere.material.needsUpdate = true
  }, [texture])

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
          camera={cameraForHotspots}
          containerRef={containerRef}
          floorSlug={floorSlug}
          hotspots={activeScene.hotspots || []}
          onInfoFocus={handleInfoFocus}
          onNavigate={handleSceneNavigation}
          tourSlug={tourSlug}
        />
      </div>
    </>
  )
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
    // Portal hotspots use the same raw Pannellum coordinates rendered by the
    // admin picker and PannellumViewer. scene.rotation is intentionally ignored
    // until hotspot rotation behavior is validated separately.
    return getRawPannellumPitchYaw(
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
