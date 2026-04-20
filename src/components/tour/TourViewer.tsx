'use client'

import React, { useState, useCallback } from 'react'
import PannellumViewer from './PannellumViewer'
import TourOverlay from './TourOverlay'
import WelcomeModal from './WelcomeModal'
import { TransitionProvider, TransitionSelector } from './transition'

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
  isDraft: boolean
}

export default function TourViewer({ data }: { data: SceneData }) {
  const [currentSceneSlug, setCurrentSceneSlug] = useState(data.currentScene.slug)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showTransitionSettings, setShowTransitionSettings] = useState(false)

  const currentScene = data.floorScenes.find((s: any) => s.slug === currentSceneSlug) || data.currentScene
  const hotspots = currentScene.hotspots || []

  const handleSceneChange = useCallback((sceneSlug: string) => {
    setCurrentSceneSlug(sceneSlug)
  }, [])

  return (
    <TransitionProvider>
      <div className="flex items-center justify-center h-dvh w-dvw relative font-sans">
        <PannellumViewer
          scenes={data.floorScenes}
          initialSceneSlug={data.currentScene.slug}
          tourSlug={data.tourSlug}
          floorSlug={data.floorSlug}
          isDraft={data.isDraft}
          onSceneChange={handleSceneChange}
        />
        <TourOverlay
          tour={data.tour}
          currentScene={currentScene}
          currentFloor={data.currentFloor}
          hotspots={hotspots}
          tourFloors={data.tourFloors}
          tourSlug={data.tourSlug}
          floorSlug={data.floorSlug}
          isDraft={data.isDraft}
        />
        {showWelcome && data.tour.welcomeTitle && (
          <WelcomeModal
            title={data.tour.welcomeTitle}
            text={data.tour.welcomeText}
            onClose={() => setShowWelcome(false)}
          />
        )}
        <button
          onClick={() => setShowTransitionSettings(!showTransitionSettings)}
          className="fixed bottom-4 right-4 z-50 p-3 bg-ochre text-white rounded-full shadow-lg hover:bg-ochre/90 transition-all"
          title="Transition Settings"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        {showTransitionSettings && (
          <div className="fixed bottom-20 right-4 z-50">
            <TransitionSelector />
          </div>
        )}
      </div>
    </TransitionProvider>
  )
}
