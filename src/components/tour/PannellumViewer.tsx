'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import HotspotButton from './HotspotButton'
import { SceneTransition, useSceneTransition, TRANSITION_PRESETS } from './transition'

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
  
  // Use refs to always access the latest values in closures
  const startTransitionRef = useRef(startTransition)
  const floorSlugRef = useRef(floorSlug)
  const isDraftRef = useRef(isDraft)
  const tourSlugRef = useRef(tourSlug)
  const onSceneChangeRef = useRef(onSceneChange)
  
  // Keep refs updated
  useEffect(() => {
    startTransitionRef.current = startTransition
    floorSlugRef.current = floorSlug
    isDraftRef.current = isDraft
    tourSlugRef.current = tourSlug
    onSceneChangeRef.current = onSceneChange
  }, [startTransition, floorSlug, isDraft, tourSlug, onSceneChange])

  // Handle scene navigation with blur transition effect
  const handleSceneNavigation = useCallback(async (
    targetSlug: string, 
    targetFloorSlug?: string,
    clickPosition?: { x: number; y: number }
  ) => {
    const currentFloorSlug = floorSlugRef.current
    const currentIsDraft = isDraftRef.current
    const currentTourSlug = tourSlugRef.current
    const currentOnSceneChange = onSceneChangeRef.current
    const currentStartTransition = startTransitionRef.current
    
    const isSameFloor = !targetFloorSlug || targetFloorSlug === currentFloorSlug
    const draftQuery = currentIsDraft ? '?draft=true' : ''

    // Always use blur transition effect
    await currentStartTransition({
      targetSceneSlug: targetSlug,
      targetFloorSlug: targetFloorSlug,
      isSameFloor,
      originPosition: clickPosition,
      customConfig: TRANSITION_PRESETS.blur,
      onMidpoint: async () => {
        if (isSameFloor) {
          // Same floor - use Pannellum internal scene switch
          if (pannellumRef.current) {
            pannellumRef.current.loadScene(targetSlug)
            currentOnSceneChange(targetSlug)
          }
        } else {
          // Cross floor - page navigation
          window.location.assign(`/tour/${currentTourSlug}/${targetFloorSlug}/${targetSlug}${draftQuery}`)
        }
      }
    })
  }, []) // Empty deps - uses refs for latest values

  // Store handleSceneNavigation in ref for stable closure
  const handleSceneNavigationRef = useRef(handleSceneNavigation)
  useEffect(() => {
    handleSceneNavigationRef.current = handleSceneNavigation
  }, [handleSceneNavigation])

  const createTooltip = useCallback(
    (hotSpotDiv: HTMLDivElement, args: any) => {
      hotSpotDiv.onclick = null
      hotSpotDiv.classList.add('pointer-events-none')
      const root = createRoot(hotSpotDiv)
      root.render(
        <HotspotButton
          hotspot={args}
          tourSlug={tourSlugRef.current}
          floorSlug={floorSlugRef.current}
          onNavigate={(targetSlug: string, targetFloorSlug?: string, clickEvent?: MouseEvent) => {
            // Get click position for directional animation
            const clickPosition = clickEvent 
              ? { x: clickEvent.clientX, y: clickEvent.clientY }
              : undefined
            
            // Use ref to always call the latest handler
            handleSceneNavigationRef.current(targetSlug, targetFloorSlug, clickPosition)
          }}
        />
      )
    },
    [] // Empty deps - uses refs for latest values
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
          sceneFadeDuration: 0,  // Disable Pannellum built-in transition, use custom transition
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
      {/* Pannellum 360° Viewer */}
      <div
        ref={viewerRef}
        className="h-dvh w-dvw inset-0 absolute"
        id="panorama"
        style={{
          // Slightly dim during transition for enhanced effect
          filter: isTransitioning ? 'brightness(0.95)' : 'none',
          transition: 'filter 0.3s ease'
        }}
      />
      
      {/* Scene Transition Animation Layer */}
      <SceneTransition state={transitionState} />
    </>
  )
}

// Window type extensions are in src/types/pannellum.d.ts
