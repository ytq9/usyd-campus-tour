'use client'

import React, { RefObject, useEffect, useState } from 'react'
import type { PerspectiveCamera } from 'three'
import HotspotButton from '../HotspotButton'
import { getStoredPitchYaw, projectPitchYawToScreen } from './threePanoramaMath'
import type { HotspotData, HotspotNavigationHandler, InfoHotspotFocusHandler, ProjectedHotspot } from './types'

type Props = {
  camera: PerspectiveCamera | null
  containerRef: RefObject<HTMLElement | null>
  floorSlug: string
  hotspots: HotspotData[]
  onInfoFocus: InfoHotspotFocusHandler
  onNavigate: HotspotNavigationHandler
  tourSlug: string
}

const HOTSPOT_EDGE_PADDING = 48

export default function ThreeHotspotLayer({
  camera,
  containerRef,
  floorSlug,
  hotspots,
  onInfoFocus,
  onNavigate,
  tourSlug,
}: Props) {
  const [projectedHotspots, setProjectedHotspots] = useState<ProjectedHotspot[]>([])

  useEffect(() => {
    let frameId = 0

    const update = () => {
      const container = containerRef.current
      if (!camera || !container) {
        setProjectedHotspots([])
        frameId = requestAnimationFrame(update)
        return
      }

      const width = container.clientWidth
      const height = container.clientHeight
      const nextHotspots = hotspots
        .filter((hotspot) => hotspot.pitch !== undefined && hotspot.yaw !== undefined)
        .map((hotspot) => {
          // Hotspots use stored raw coordinates. Ignore scene.rotation here so
          // hotspot placement matches the authored CMS values.
          const displayPosition = getStoredPitchYaw(
            Number(hotspot.pitch),
            Number(hotspot.yaw),
          )
          const projected = projectPitchYawToScreen(
            displayPosition.pitch,
            displayPosition.yaw,
            camera,
            container,
          )
          const insideViewport =
            projected.x >= -HOTSPOT_EDGE_PADDING &&
            projected.x <= width + HOTSPOT_EDGE_PADDING &&
            projected.y >= -HOTSPOT_EDGE_PADDING &&
            projected.y <= height + HOTSPOT_EDGE_PADDING

          return {
            hotspot,
            x: projected.x,
            y: projected.y,
            visible: projected.visible && insideViewport,
          }
        })

      setProjectedHotspots(nextHotspots)
      frameId = requestAnimationFrame(update)
    }

    frameId = requestAnimationFrame(update)

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [camera, containerRef, hotspots])

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
