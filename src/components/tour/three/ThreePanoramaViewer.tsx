'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { SceneTransition, useSceneTransition, useTransitionSettings } from '../transition'
import ThreeHotspotLayer from './ThreeHotspotLayer'
import { useThreePanoramaControls } from './useThreePanoramaControls'
import { useThreeSceneTexture } from './useThreeSceneTexture'
import type { ThreePanoramaViewerProps, ThreeSceneData } from './types'

export default function ThreePanoramaViewer({
  scenes,
  initialSceneSlug,
  tourSlug,
  floorSlug,
  isDraft,
  onSceneChange,
}: ThreePanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const sphereRef = useRef<THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> | null>(null)
  const frameRef = useRef<number | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const [cameraForHotspots, setCameraForHotspots] = useState<THREE.PerspectiveCamera | null>(null)
  const [activeSceneSlug, setActiveSceneSlug] = useState(initialSceneSlug)
  const { state: transitionState, startTransition, isTransitioning } = useSceneTransition()
  const { getConfig } = useTransitionSettings()

  const activeScene = useMemo<ThreeSceneData>(() => (
    scenes.find((scene) => scene.slug === activeSceneSlug) ||
    scenes.find((scene) => scene.slug === initialSceneSlug) ||
    scenes[0]
  ), [activeSceneSlug, initialSceneSlug, scenes])

  const { applyCameraState, setCameraState } = useThreePanoramaControls({
    cameraRef,
    containerRef,
    initialPitch: activeScene?.initialPitch ?? 0,
    initialYaw: activeScene?.initialYaw ?? 0,
    initialHfov: activeScene?.initialHfov ?? 120,
  })

  const { texture, isLoading, error } = useThreeSceneTexture(activeScene?.panoramaUrl)

  const switchToScene = useCallback((sceneSlug: string) => {
    const nextScene = scenes.find((scene) => scene.slug === sceneSlug)
    if (!nextScene) return

    setActiveSceneSlug(sceneSlug)
    setCameraState({
      pitch: nextScene.initialPitch,
      yaw: nextScene.initialYaw,
      hfov: nextScene.initialHfov,
    })
    onSceneChange(sceneSlug)
  }, [onSceneChange, scenes, setCameraState])

  const handleSceneNavigation = useCallback(async (
    targetSlug: string,
    targetFloorSlug?: string,
    clickEvent?: MouseEvent,
  ) => {
    const isSameFloor = !targetFloorSlug || targetFloorSlug === floorSlug
    const query = new URLSearchParams()
    if (isDraft) query.set('draft', 'true')
    query.set('viewer', 'three')
    const queryString = query.toString() ? `?${query.toString()}` : ''
    const clickPosition = clickEvent
      ? { x: clickEvent.clientX, y: clickEvent.clientY }
      : undefined
    const transitionConfig = getConfig(isSameFloor)

    await startTransition({
      targetSceneSlug: targetSlug,
      targetFloorSlug,
      isSameFloor,
      originPosition: clickPosition,
      customConfig: transitionConfig,
      onMidpoint: async () => {
        if (isSameFloor) {
          switchToScene(targetSlug)
        } else {
          window.location.assign(`/tour/${tourSlug}/${targetFloorSlug}/${targetSlug}${queryString}`)
        }
      },
    })
  }, [floorSlug, getConfig, isDraft, startTransition, switchToScene, tourSlug])

  useEffect(() => {
    setActiveSceneSlug(initialSceneSlug)
  }, [initialSceneSlug])

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
          filter: isTransitioning ? 'brightness(0.95)' : 'none',
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
          onNavigate={handleSceneNavigation}
          tourSlug={tourSlug}
        />
      </div>
      <SceneTransition state={transitionState} />
    </>
  )
}
