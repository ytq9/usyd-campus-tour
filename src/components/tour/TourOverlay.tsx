'use client'

import React, { useState } from 'react'
import HotspotSidebar from './HotspotSidebar'
import FloorMapModal from './FloorMapModal'
import { hasRichTextContent } from './infoContentText'
import RichTextContent from './RichTextContent'

type Props = {
  tour: any
  currentScene: any
  currentFloor: any
  hotspots: any[]
  tourFloors: any[]
  tourSlug: string
  floorSlug: string
  isDraft: boolean
  debugHotspots?: boolean
}

export default function TourOverlay({ tour, currentScene, currentFloor, hotspots, tourFloors, tourSlug, floorSlug, isDraft, debugHotspots }: Props) {
  const [descExpanded, setDescExpanded] = useState(false)
  const homeHref = buildTourHomeHref(tourSlug, isDraft, Boolean(debugHotspots))
  const hasSceneDescription = hasRichTextContent(currentScene.description)

  return (
    <div className="h-dvh w-dvw absolute pointer-events-none flex flex-col justify-between z-10">
      <div className="w-full flex flex-row justify-between">
        <div className="w-1/3" />
        <div className="sm:w-1/3 lg:w-1/2 mt-4 text-white text-xl text-center">
          <div className="bg-black/65 rounded-sm p-2">
            <div className="text-md md:text-lg">{currentScene.title}</div>
            {hasSceneDescription && (
              <div className="pointer-events-auto">
                <button
                  onClick={() => setDescExpanded(!descExpanded)}
                  className="bg-blue-600 text-white text-sm p-2 min-h-0 my-2 cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  Room Description
                </button>
                {descExpanded && (
                  <div className="prose prose-sm prose-invert max-w-none text-white text-left mt-1 p-2 bg-black/50 rounded">
                    <RichTextContent value={currentScene.description} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <HotspotSidebar
          hotspots={hotspots}
          tourSlug={tourSlug}
          floorSlug={floorSlug}
          isDraft={isDraft}
          debugHotspots={debugHotspots}
        />
      </div>

      <div />

      <div className="w-full flex flex-row">
        <div className="bg-black/60 p-6 pl-4 rounded-r-xl mb-10 pointer-events-auto flex flex-row space-x-2">
          <a
            href={homeHref}
            className="bg-ochre hover:bg-orange-700 p-2 size-14 rounded-full cursor-pointer flex items-center justify-center"
            title="Back to tour"
          >
            <svg className="size-6 fill-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
            </svg>
          </a>

          <FloorMapModal
            tourFloors={tourFloors}
            currentFloor={currentFloor}
            currentSceneSlug={currentScene.slug}
            tourSlug={tourSlug}
            isDraft={isDraft}
            debugHotspots={debugHotspots}
          />
        </div>
      </div>
    </div>
  )
}

function buildTourHomeHref(
  tourSlug: string,
  isDraft: boolean,
  debugHotspots: boolean,
) {
  const query = new URLSearchParams()
  if (debugHotspots) query.set('debugHotspots', 'true')
  const queryString = query.toString() ? `?${query.toString()}` : ''
  return isDraft
    ? `/tour/${tourSlug}/preview${queryString}`
    : `/tour/${tourSlug}${queryString}`
}
