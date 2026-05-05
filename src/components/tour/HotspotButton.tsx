'use client'

import React, { useState } from 'react'
import InfoHotspot from './InfoHotspot'
import type { InfoHotspotFocusHandler } from './three/types'

type Props = {
  hotspot: any
  tourSlug: string
  floorSlug: string
  onNavigate: (targetSlug: string, targetFloorSlug?: string, clickEvent?: MouseEvent, hotspot?: any) => void
  onInfoFocus?: InfoHotspotFocusHandler
}

export default function HotspotButton({ hotspot, tourSlug, floorSlug, onNavigate, onInfoFocus }: Props) {
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
      {/* 外层脉冲动画 */}
      <span 
        className={`absolute inline-flex size-12 rounded-full bg-ochre transition-all duration-200
          ${isPressed ? 'scale-90 opacity-50' : 'animate-ping opacity-75'}`} 
      />
      
      {/* 中间光晕层 */}
      <span 
        className={`absolute inline-flex size-14 rounded-full bg-gradient-to-r from-ochre/30 to-orange-500/30
          transition-all duration-300 ${isPressed ? 'scale-150 opacity-100' : 'scale-100 opacity-0 group-hover:scale-125 group-hover:opacity-60'}`}
      />
      
      {/* Portal 图标 */}
      <svg 
        className={`relative inline-flex size-12 transition-all duration-300 drop-shadow-lg
          ${isPressed ? 'scale-125' : 'group-hover:scale-110'}`}
        viewBox="0 0 24 24" 
        fill="white"
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <path 
          filter="url(#glow)"
          fillRule="evenodd" 
          d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm.53 5.47a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l1.72-1.72v5.69a.75.75 0 001.5 0v-5.69l1.72 1.72a.75.75 0 101.06-1.06l-3-3z" 
          clipRule="evenodd" 
        />
      </svg>
      
      {/* 悬停时显示的标签 */}
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
