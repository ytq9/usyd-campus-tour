'use client'

import React from 'react'
import HotspotButton from '../HotspotButton'
import type { HotspotNavigationHandler, InfoHotspotFocusHandler, ProjectedHotspot } from './types'

type Props = {
  floorSlug: string
  onInfoFocus: InfoHotspotFocusHandler
  onNavigate: HotspotNavigationHandler
  projectedHotspots: ProjectedHotspot[]
  tourSlug: string
}

export default function ThreeHotspotLayer({
  floorSlug,
  onInfoFocus,
  onNavigate,
  projectedHotspots,
  tourSlug,
}: Props) {
  const stopViewerGesture = (event: React.SyntheticEvent) => {
    event.stopPropagation()
    ;(event.nativeEvent as Event & { stopImmediatePropagation?: () => void }).stopImmediatePropagation?.()
  }

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {projectedHotspots.map(({ hotspot, x, y, visible }, index) => {
        if (!visible) return null

        return (
          <div
            key={`${hotspot.text || hotspot.type}-${index}`}
            data-tour-hotspot-interactive="true"
            className="absolute pointer-events-auto"
            onClick={stopViewerGesture}
            onDoubleClick={stopViewerGesture}
            onPointerDown={stopViewerGesture}
            onPointerDownCapture={stopViewerGesture}
            onTouchStart={stopViewerGesture}
            onTouchStartCapture={stopViewerGesture}
            style={{
              left: x,
              top: y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <HotspotButton
              hotspot={{ ...hotspot, floorSlug }}
              tourSlug={tourSlug}
              floorSlug={floorSlug}
              onInfoFocus={onInfoFocus}
              onNavigate={onNavigate}
            />
          </div>
        )
      })}
    </div>
  )
}
