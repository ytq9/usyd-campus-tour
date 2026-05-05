'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import HotspotButton from './HotspotButton'
import { getDefaultTransitionConfig, SceneTransition, useSceneTransition } from './transition'

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
  debugHotspots?: boolean
  onSceneChange: (sceneSlug: string) => void
}

export default function PannellumViewer({ scenes, initialSceneSlug, tourSlug, floorSlug, isDraft, debugHotspots, onSceneChange }: Props) {
  const viewerRef = useRef<HTMLDivElement>(null)
  const pannellumRef = useRef<any>(null)
  const { state: transitionState, startTransition, isTransitioning } = useSceneTransition()

  // 处理场景导航（带过渡动画）
  const handleSceneNavigation = useCallback(async (
    targetSlug: string, 
    targetFloorSlug?: string,
    clickPosition?: { x: number; y: number }
  ) => {
    const isSameFloor = !targetFloorSlug || targetFloorSlug === floorSlug
    const query = new URLSearchParams()
    if (isDraft) query.set('draft', 'true')
    if (debugHotspots) query.set('debugHotspots', 'true')
    if (typeof window !== 'undefined') {
      const currentParams = new URLSearchParams(window.location.search)
      if (currentParams.get('viewer') === 'pannellum') {
        query.set('viewer', 'pannellum')
      }
    }
    const queryString = query.toString() ? `?${query.toString()}` : ''

    const transitionConfig = getDefaultTransitionConfig(isSameFloor)

    await startTransition({
      targetSceneSlug: targetSlug,
      targetFloorSlug: targetFloorSlug,
      isSameFloor,
      originPosition: clickPosition,
      customConfig: transitionConfig,
      onMidpoint: async () => {
        if (isSameFloor) {
          // 同楼层 - 使用 Pannellum 内部切换
          if (pannellumRef.current) {
            pannellumRef.current.loadScene(targetSlug)
            onSceneChange(targetSlug)
          }
        } else {
          // 跨楼层 - 页面跳转
          window.location.assign(`/tour/${tourSlug}/${targetFloorSlug}/${targetSlug}${queryString}`)
        }
      }
    })
  }, [debugHotspots, floorSlug, isDraft, tourSlug, onSceneChange, startTransition])

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
            // 获取点击位置用于定向动画
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
          sceneFadeDuration: 0,  // 禁用 Pannellum 内置过渡，使用自定义过渡动画
        },
        scenes: pannellumScenes,
      } as any)
      window.pannellumViewer = pannellumRef.current

      // Listen for scene changes
      pannellumRef.current.on('scenechange', (sceneId: string) => {
        onSceneChange(sceneId)
      })
    }

    loadPannellum()

    return () => {
      if (pannellumRef.current) {
        if (window.pannellumViewer === pannellumRef.current) {
          window.pannellumViewer = null
        }
        pannellumRef.current.destroy()
        pannellumRef.current = null
      }
    }
  }, []) // Only run once on mount

  return (
    <>
      {/* Pannellum 360° 查看器 */}
      <div
        ref={viewerRef}
        className="h-dvh w-dvw inset-0 absolute"
        id="panorama"
        style={{
          // 过渡动画时略微降低亮度增强效果
          filter: isTransitioning ? 'brightness(0.95)' : 'none',
          transition: 'filter 0.3s ease'
        }}
      />
      
      {/* 场景过渡动画层 */}
      <SceneTransition state={transitionState} />
    </>
  )
}

// Window type extensions are in src/types/pannellum.d.ts
