'use client'

import React, { useState } from 'react'
import HotspotSidebar from './HotspotSidebar'
import FloorMapModal from './FloorMapModal'

type Props = {
  tour: any
  currentScene: any
  currentFloor: any
  hotspots: any[]
  tourFloors: any[]
  tourSlug: string
  floorSlug: string
}

export default function TourOverlay({ tour, currentScene, currentFloor, hotspots, tourFloors, tourSlug, floorSlug }: Props) {
  const [descExpanded, setDescExpanded] = useState(false)

  return (
    <div className="h-dvh w-dvw absolute pointer-events-none flex flex-col justify-between z-10">
      {/* Top Bar - Title */}
      <div className="w-full flex flex-row justify-between">
        <div className="w-1/3" />
        <div className="sm:w-1/3 lg:w-1/2 mt-4 text-white text-xl text-center">
          <div className="bg-black/65 rounded-sm p-2">
            <div className="text-md md:text-lg">{currentScene.title}</div>
            {currentScene.description && (
              <div className="pointer-events-auto">
                <button
                  onClick={() => setDescExpanded(!descExpanded)}
                  className="bg-blue-600 text-white text-sm p-2 min-h-0 my-2 cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  Room Description
                </button>
                {descExpanded && (
                  <div className="text-sm text-white text-left mt-1 p-2 bg-black/50 rounded">
                    {typeof currentScene.description === 'string'
                      ? currentScene.description
                      : 'Description available'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Sidebar */}
        <HotspotSidebar
          hotspots={hotspots}
          tourSlug={tourSlug}
          floorSlug={floorSlug}
        />
      </div>

      {/* Center spacer */}
      <div />

      {/* Bottom Bar */}
      <div className="w-full flex flex-row">
        <div className="bg-black/60 p-6 pl-4 rounded-r-xl mb-10 pointer-events-auto flex flex-row space-x-2">
          {/* Home button */}
          <a
            href={`/tour/${tourSlug}`}
            className="bg-ochre hover:bg-orange-700 p-2 size-14 rounded-full cursor-pointer flex items-center justify-center"
            title="Back to tour"
          >
            <svg className="size-6 fill-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
            </svg>
          </a>

          {/* Floor Map */}
          <FloorMapModal
            tourFloors={tourFloors}
            currentFloor={currentFloor}
            currentSceneSlug={currentScene.slug}
            tourSlug={tourSlug}
          />
        </div>
      </div>
    </div>
  )
}
