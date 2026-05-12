'use client'

import React, { useState } from 'react'
import InfoHotspot from './InfoHotspot'
import type { InfoHotspotFocusHandler } from './three/types'
import { HotspotIcon } from './hotspotIcons'

type Props = {
  hotspot: any
  tourSlug: string
  floorSlug: string
  onNavigate: (targetSlug: string, targetFloorSlug?: string, clickEvent?: MouseEvent, hotspot?: any) => void
  onInfoFocus?: InfoHotspotFocusHandler
}

export default function HotspotButton({ hotspot, onNavigate, onInfoFocus }: Props) {
  const [isPressed, setIsPressed] = useState(false)

  if (hotspot.type === 'info') {
    return <InfoHotspot hotspot={hotspot} onFocus={onInfoFocus} />
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const targetSlug = hotspot.targetScene?.slug
    const targetFloorSlug = hotspot.targetFloor?.slug

    if (targetSlug) {
      const nativeEvent = e.nativeEvent as MouseEvent
      onNavigate(targetSlug, targetFloorSlug, nativeEvent, hotspot)
    }
  }

  const stopViewerGesture = (e: React.SyntheticEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    ;(e.nativeEvent as Event & { stopImmediatePropagation?: () => void }).stopImmediatePropagation?.()
  }

  const handleMouseDown = () => setIsPressed(true)
  const handleMouseUp = () => setIsPressed(false)
  const handleMouseLeave = () => setIsPressed(false)

  return (
    <button
      data-tour-hotspot-interactive="true"
      onClick={handleClick}
      onPointerDown={stopViewerGesture}
      onTouchStart={stopViewerGesture}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className="pointer-events-auto cursor-pointer hotspot-portal-button group"
      title={hotspot.text}
    >
      <span
        className={`absolute inline-flex size-12 rounded-full bg-ochre transition-all duration-200
          ${isPressed ? 'scale-90 opacity-50' : 'animate-ping opacity-75'}`}
      />

      <span
        className={`absolute inline-flex size-14 rounded-full bg-gradient-to-r from-ochre/30 to-orange-500/30
          transition-all duration-300 ${isPressed ? 'scale-150 opacity-100' : 'scale-100 opacity-0 group-hover:scale-125 group-hover:opacity-60'}`}
      />

      <HotspotIcon
        iconKey={hotspot.iconStyle}
        hotspotType="scene"
        color={hotspot.iconColor || 'white'}
        strokeWidth={2}
        className={`relative inline-flex size-12 transition-all duration-300 drop-shadow-lg
          ${isPressed ? 'scale-125' : 'group-hover:scale-110'}`}
      />

      <span
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 
          bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 
          transition-opacity duration-200 pointer-events-none"
      >
        {hotspot.text}
      </span>
    </button>
  )
}
