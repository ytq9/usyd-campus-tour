'use client'

import React, { useEffect, useRef } from 'react'
import InfoHotspot from './InfoHotspot'

type Props = {
  hotspot: any
  tourSlug: string
  floorSlug: string
  onNavigate: (targetSlug: string, targetFloorSlug?: string) => void
}

export default function HotspotButton({ hotspot, tourSlug, floorSlug, onNavigate }: Props) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const sizePx = hotspot.iconSize === 'sm' ? 40 : hotspot.iconSize === 'lg' ? 64 : 52
  const accentColor = hotspot.iconColor || '#ff970f'

  useEffect(() => {
    // Disable pannellum touch handling on this element
    const el = btnRef.current?.closest('.pnlm-hotspot')
    if (el) {
      (el as HTMLElement).ontouchend = null
    }
  }, [])

  if (hotspot.type === 'info') {
    return <InfoHotspot hotspot={hotspot} />
  }

  const handleClick = () => {
    const targetSlug = hotspot.targetScene?.slug
    const targetFloorSlug = hotspot.targetFloor?.slug
    if (targetSlug) {
      onNavigate(targetSlug, targetFloorSlug)
    }
  }

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      className={`pointer-events-auto relative inline-flex items-center justify-center cursor-pointer ${hotspot.cssClass || ''}`}
      title={hotspot.text}
      style={{ width: sizePx, height: sizePx }}
    >
      <span
        className="absolute inline-flex animate-ping rounded-full opacity-75"
        style={{ width: sizePx, height: sizePx, backgroundColor: accentColor }}
      />
      <svg
        className="relative inline-flex transition duration-300 hover:scale-110"
        style={{ width: sizePx, height: sizePx, color: accentColor }}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm.53 5.47a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l1.72-1.72v5.69a.75.75 0 001.5 0v-5.69l1.72 1.72a.75.75 0 101.06-1.06l-3-3z" clipRule="evenodd" />
      </svg>
    </button>
  )
}
