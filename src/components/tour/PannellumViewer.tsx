'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import HotspotButton from './HotspotButton'

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
  onSceneChange: (sceneSlug: string) => void
}

export default function PannellumViewer({ scenes, initialSceneSlug, tourSlug, floorSlug, onSceneChange }: Props) {
  const viewerRef = useRef<HTMLDivElement>(null)
  const pannellumRef = useRef<any>(null)

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
          onNavigate={(targetSlug: string, targetFloorSlug?: string) => {
            if (targetFloorSlug && targetFloorSlug !== floorSlug) {
              // Cross-floor navigation - full page load
              window.location.assign(`/tour/${tourSlug}/${targetFloorSlug}/${targetSlug}`)
            } else {
              // Same floor - use Pannellum scene transition
              if (pannellumRef.current) {
                pannellumRef.current.loadScene(targetSlug)
                onSceneChange(targetSlug)
              }
            }
          }}
        />
      )
    },
    [tourSlug, floorSlug, onSceneChange]
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
          sceneFadeDuration: 500,
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
    <div
      ref={viewerRef}
      className="h-dvh w-dvw inset-0 absolute"
      id="panorama"
    />
  )
}

// Window type extensions are in src/types/pannellum.d.ts
