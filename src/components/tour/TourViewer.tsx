'use client'

import dynamic from 'next/dynamic'
import React, { useState, useCallback } from 'react'
import PannellumViewer from './PannellumViewer'
import TourOverlay from './TourOverlay'
import WelcomeModal from './WelcomeModal'
import HotspotDebugPanel from './HotspotDebugPanel'

const ThreePanoramaViewer = dynamic(() => import('./three/ThreePanoramaViewer'), {
  ssr: false,
})

type SceneData = {
  tour: { id: string | number; title: string; slug: string; welcomeTitle: string; welcomeText: any }
  currentFloor: { id: string | number; name: string; slug: string; floorplan: string | null; mapPoints: any[] }
  currentScene: {
    id: string | number; title: string; slug: string; description: any
    panoramaUrl: string; previewUrl: string
    initialYaw: number; initialPitch: number; initialHfov: number; rotation: number
    hotspots: any[]
  }
  floorScenes: any[]
  tourFloors: any[]
  tourSlug: string
  floorSlug: string
  routeTourSlug?: string
  routeFloorSlug?: string
  routeSceneSlug?: string
  isDraft: boolean
  viewerMode?: 'pannellum' | 'three'
  debugHotspots?: boolean
}

export default function TourViewer({ data }: { data: SceneData }) {
  const [currentSceneSlug, setCurrentSceneSlug] = useState(data.currentScene.slug)
  const [showWelcome, setShowWelcome] = useState(false)

  const currentScene = data.floorScenes.find((s: any) => s.slug === currentSceneSlug) || data.currentScene
  const hotspots = currentScene.hotspots || []
  const usePannellumViewer = data.viewerMode === 'pannellum'

  const handleSceneChange = useCallback((sceneSlug: string) => {
    setCurrentSceneSlug(sceneSlug)
  }, [])

  return (
    <div className="flex items-center justify-center h-dvh w-dvw relative font-sans">
      {usePannellumViewer ? (
        <PannellumViewer
          scenes={data.floorScenes}
          initialSceneSlug={data.currentScene.slug}
          tourSlug={data.tourSlug}
          floorSlug={data.floorSlug}
          isDraft={data.isDraft}
          debugHotspots={Boolean(data.debugHotspots)}
          onSceneChange={handleSceneChange}
        />
      ) : (
        <ThreePanoramaViewer
          scenes={data.floorScenes}
          initialSceneSlug={data.currentScene.slug}
          tourSlug={data.tourSlug}
          floorSlug={data.floorSlug}
          isDraft={data.isDraft}
          debugHotspots={Boolean(data.debugHotspots)}
          onSceneChange={handleSceneChange}
        />
      )}
      <TourOverlay
        tour={data.tour}
        currentScene={currentScene}
        currentFloor={data.currentFloor}
        hotspots={hotspots}
        tourFloors={data.tourFloors}
        tourSlug={data.tourSlug}
        floorSlug={data.floorSlug}
        isDraft={data.isDraft}
        viewerMode={data.viewerMode}
        debugHotspots={Boolean(data.debugHotspots)}
      />
      {data.debugHotspots && (
        <HotspotDebugPanel
          activeSceneSlug={currentSceneSlug}
          currentScene={data.currentScene}
          floorScenes={data.floorScenes}
          isDraft={data.isDraft}
          routeFloorSlug={data.routeFloorSlug || data.floorSlug}
          routeSceneSlug={data.routeSceneSlug || data.currentScene.slug}
          routeTourSlug={data.routeTourSlug || data.tourSlug}
          viewerMode={data.viewerMode || 'three'}
        />
      )}
      {showWelcome && data.tour.welcomeTitle && (
        <WelcomeModal
          title={data.tour.welcomeTitle}
          text={data.tour.welcomeText}
          onClose={() => setShowWelcome(false)}
        />
      )}
    </div>
  )
}
