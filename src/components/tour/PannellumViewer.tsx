'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import HotspotButton from './HotspotButton'
import { SceneTransition, useSceneTransition, useTransitionSettings } from './transition'

type Scene = {
  slug: string
  title: string
  panoramaUrl: string
  initialYaw: number
  initialPitch: number
  initialHfov: number
  rotation: number
  hotspots: any[]
}

type Props = {
  scenes: Scene[]
  initialSceneSlug: string
  tourSlug: string
  floorSlug: string
  isDraft: boolean
  onSceneChange: (sceneSlug: string) => void
}

export default function PannellumViewer({ scenes, initialSceneSlug, tourSlug, floorSlug, isDraft, onSceneChange }: Props) {
  const viewerRef = useRef<HTMLDivElement>(null)
  const pannellumRef = useRef<any>(null)
  const { state: transitionState, startTransition, isTransitioning } = useSceneTransition()
  const { getConfig } = useTransitionSettings()

  const handleSceneNavigation = useCallback(async (
    targetSlug: string,
    targetFloorSlug?: string,
    clickPosition?: { x: number; y: number }
  ) => {
    const isSameFloor = !targetFloorSlug || targetFloorSlug === floorSlug
    const draftQuery = isDraft ? '?draft=true' : ''
    const transitionConfig = getConfig(isSameFloor)

    await startTransition({
      targetSceneSlug: targetSlug,
      targetFloorSlug,
      isSameFloor,
      originPosition: clickPosition,
      customConfig: transitionConfig,
      onMidpoint: async () => {
        if (isSameFloor) {
          if (pannellumRef.current) {
            pannellumRef.current.loadScene(targetSlug)
            onSceneChange(targetSlug)
          }
        } else {
          window.location.assign(`/tour/${tourSlug}/${targetFloorSlug}/${targetSlug}${draftQuery}`)
        }
      }
    })
  }, [floorSlug, isDraft, tourSlug, onSceneChange, startTransition, getConfig])

  const createTooltip = useCallback(
    (hotSpotDiv: HTMLDivElement, args: any) => {
      hotSpotDiv.onclick = null
      hotSpotDiv.classList.add('pointer-events-none')
      const root = createRoot(hotSpotDiv)
      root.render(
        <HotspotButton
          hotspot={args}
          tourSlug={tourSlug}
          floorSlug={floorSlug}
          onNavigate={(targetSlug: string, targetFloorSlug?: string, clickEvent?: MouseEvent) => {
            const clickPosition = clickEvent
              ? { x: clickEvent.clientX, y: clickEvent.clientY }
              : undefined
            handleSceneNavigation(targetSlug, targetFloorSlug, clickPosition)
          }}
        />
      )
    },
    [tourSlug, floorSlug, handleSceneNavigation]
  )

  useEffect(() => {
    if (typeof window === 'undefined' || !viewerRef.current) return

    // Dynamically import pannellum
    const loadPannellum = async () => {
      await import('pannellum/build/pannellum.css')
      await import('pannellum/build/pannellum.js')

      if (!window.pannellum || !viewerRef.current) return

      const pannellumScenes: Record<string, any> = {}
      for (const scene of scenes) {
        pannellumScenes[scene.slug] = {
          type: 'equirectangular',
          panorama: scene.panoramaUrl,
          yaw: scene.initialYaw,
          pitch: scene.initialPitch,
          hfov: scene.initialHfov,
          hotSpots: scene.hotspots
            .filter((hs: any) => hs.pitch !== undefined && hs.yaw !== undefined)
            .map((hs: any) => ({
              type: hs.type === 'scene' ? 'scene' : 'info',
              pitch: hs.pitch,
              yaw: hs.yaw,
              text: hs.text,
              sceneId: hs.targetScene?.slug,
              createTooltipFunc: createTooltip,
              createTooltipArgs: { ...hs, floorSlug },
            })),
        }
      }

      pannellumRef.current = (window.pannellum as any).viewer(viewerRef.current, {
        autoLoad: true,
        default: {
          firstScene: initialSceneSlug,
          sceneFadeDuration: 0,
        },
        scenes: pannellumScenes,
      } as any)

      // Listen for scene changes
      pannellumRef.current.on('scenechange', (sceneId: string) => {
        onSceneChange(sceneId)
      })
    }

    loadPannellum()

    return () => {
      if (pannellumRef.current) {
        pannellumRef.current.destroy()
        pannellumRef.current = null
      }
    }
  }, []) // Only run once on mount

  return (
    <>
      <div
        ref={viewerRef}
        className="h-dvh w-dvw inset-0 absolute"
        id="panorama"
        style={{
          filter: isTransitioning ? 'brightness(0.95)' : 'none',
          transition: 'filter 0.3s ease',
        }}
      />
      <SceneTransition state={transitionState} />
    </>
  )
}

// Window type extensions are in src/types/pannellum.d.ts
