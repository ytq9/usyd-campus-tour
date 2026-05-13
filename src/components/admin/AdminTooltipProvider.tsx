'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

// ---------------------------------------------------------------------------
// Tooltip content map
// Keys are normalised label/nav text (lowercase, trimmed, no asterisks).
// ---------------------------------------------------------------------------
type TooltipEntry = { title: string; desc: string }

const TOOLTIP_MAP: Record<string, TooltipEntry> = {
  // ── Sidebar navigation ───────────────────────────────────────────────────
  media: {
    title: '📸 Media',
    desc: 'Store and manage all images and files used across tours, floors, and scenes.',
  },
  tours: {
    title: '🗺️ Tours',
    desc: 'Define virtual building routes. A tour contains one or more floors for visitors to explore.',
  },
  floors: {
    title: '🏢 Floors',
    desc: 'Represent individual levels inside a building. Each floor holds scenes and a floorplan map.',
  },
  scenes: {
    title: '🔮 Scenes',
    desc: 'Define panoramic 360° viewpoints within a floor that visitors can look around in.',
  },
  users: {
    title: '👤 Users',
    desc: 'Manage administrator accounts that can create and edit tour content.',
  },

  // ── Media fields ─────────────────────────────────────────────────────────
  alt: {
    title: 'Alt Text',
    desc: 'A short description of the image for accessibility and search. Auto-filled from the filename.',
  },

  // ── Shared fields ────────────────────────────────────────────────────────
  tags: {
    title: 'Tags',
    desc: 'Optional labels to categorise and filter items. Add as many as you like.',
  },
  tag: {
    title: 'Tag',
    desc: 'A single keyword label used to categorise or group this item.',
  },
  title: {
    title: 'Title',
    desc: 'The display name for this item, shown throughout the admin and in the tour.',
  },
  slug: {
    title: 'Slug',
    desc: 'A unique URL-friendly identifier used in public links (e.g. /tour/my-tour). Auto-generated from the title.',
  },
  description: {
    title: 'Description',
    desc: 'Optional extra details about this item, visible to visitors inside the tour.',
  },
  name: {
    title: 'Name',
    desc: 'The display name for this floor shown in the floor navigation bar.',
  },

  // ── Tours fields ─────────────────────────────────────────────────────────
  'cover image': {
    title: 'Cover Image',
    desc: 'The thumbnail shown on the tour listing page and when sharing the tour link.',
  },
  'welcome title': {
    title: 'Welcome Title',
    desc: 'The heading visitors see on the welcome screen before they start exploring.',
  },
  'welcome text': {
    title: 'Welcome Text',
    desc: 'An introductory message shown to visitors on the welcome splash screen.',
  },
  'default floor': {
    title: 'Default Floor',
    desc: 'The floor visitors land on first when they open this tour. Must be one of the assigned floors.',
  },

  // ── Floors fields ─────────────────────────────────────────────────────────
  tour: {
    title: 'Tour',
    desc: 'The tour this floor is assigned to. A floor can only belong to one tour.',
  },
  floorplan: {
    title: 'Floorplan',
    desc: 'A map image of this floor shown in the interactive minimap. Use a clear overhead view.',
  },
  'initial scene': {
    title: 'Initial Scene',
    desc: 'The first panoramic scene visitors see when they arrive on this floor.',
  },
  order: {
    title: 'Order',
    desc: 'Controls display order in the floor selector. Lower numbers appear first.',
  },
  'map points': {
    title: 'Map Points',
    desc: 'Clickable markers on the floorplan that jump visitors to a specific scene.',
  },

  // ── Scenes fields ─────────────────────────────────────────────────────────
  floor: {
    title: 'Floor',
    desc: 'The floor this scene belongs to. A scene can only be on one floor.',
  },
  panorama: {
    title: 'Panorama Image',
    desc: 'The 360° equirectangular image for this scene. Must be exactly 2:1 ratio (e.g. 4096 × 2048 px).',
  },
  rotation: {
    title: 'Rotation',
    desc: 'Rotate the panorama starting angle in degrees to fine-tune the initial view direction.',
  },
  'hotspot editor': {
    title: 'Hotspot Editor',
    desc: 'Visually drag and place interactive hotspots on the panorama — navigation portals and info markers.',
  },
  hotspots: {
    title: 'Hotspots',
    desc: 'Interactive markers placed in the panorama. Portals navigate to other scenes; Info markers show additional content.',
  },
  'accessibility notes': {
    title: 'Accessibility Notes',
    desc: 'Physical accessibility information for this location, displayed to visitors in the tour.',
  },
}

// ---------------------------------------------------------------------------
// Normalise raw text to a lookup key
// ---------------------------------------------------------------------------
function normalise(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\s*\*\s*$/, '') // strip trailing required-asterisk
    .replace(/\s+/g, ' ')
    .trim()
}

// ---------------------------------------------------------------------------
// Walk up the DOM from the hovered element looking for a label / nav link
// ---------------------------------------------------------------------------
function resolveTooltip(target: HTMLElement): TooltipEntry | null {
  let el: HTMLElement | null = target
  for (let depth = 0; depth < 8; depth++) {
    if (!el) break

    const tag = el.tagName.toLowerCase()

    // Field labels
    if (tag === 'label') {
      // Use the label's own direct text (ignore nested icons/spans)
      const key = normalise(el.textContent ?? '')
      if (key && TOOLTIP_MAP[key]) return TOOLTIP_MAP[key]
    }

    // Sidebar nav links — match the innerText so SVG icon title text is excluded
    if (tag === 'a' || (tag === 'span' && el.getAttribute('role') === 'link')) {
      const key = normalise(el.innerText ?? el.textContent ?? '')
      if (key && TOOLTIP_MAP[key]) return TOOLTIP_MAP[key]
    }

    el = el.parentElement
  }
  return null
}

// ---------------------------------------------------------------------------
// Provider component
// ---------------------------------------------------------------------------
export function AdminTooltipProvider({ children }: { children: React.ReactNode }) {
  const [tooltip, setTooltip] = useState<{
    entry: TooltipEntry
    x: number
    y: number
  } | null>(null)

  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastKey = useRef<string>('')

  const clearHide = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current)
      hideTimer.current = null
    }
  }, [])

  useEffect(() => {
    const handleOver = (e: MouseEvent) => {
      const entry = resolveTooltip(e.target as HTMLElement)
      if (entry) {
        const key = entry.title
        clearHide()
        if (key !== lastKey.current) {
          lastKey.current = key
          setTooltip({ entry, x: e.clientX, y: e.clientY })
        }
      } else {
        // Schedule hide so tooltip doesn't flicker when crossing child elements
        if (!hideTimer.current) {
          hideTimer.current = setTimeout(() => {
            setTooltip(null)
            lastKey.current = ''
            hideTimer.current = null
          }, 120)
        }
      }
    }

    const handleMove = (e: MouseEvent) => {
      setTooltip((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null))
    }

    document.addEventListener('mouseover', handleOver)
    document.addEventListener('mousemove', handleMove)

    return () => {
      document.removeEventListener('mouseover', handleOver)
      document.removeEventListener('mousemove', handleMove)
      clearHide()
    }
  }, [clearHide])

  // Keep tooltip inside the viewport
  const pos = (() => {
    if (!tooltip) return {}
    const ox = 16
    const oy = 12
    const w = 280
    const h = 80 // rough estimate; real height is dynamic
    let x = tooltip.x + ox
    let y = tooltip.y + oy
    if (typeof window !== 'undefined') {
      if (x + w > window.innerWidth) x = tooltip.x - w - ox
      if (y + h > window.innerHeight) y = tooltip.y - h - oy
    }
    return { left: x, top: y }
  })()

  return (
    <>
      {children}

      {tooltip && (
        <div
          style={{
            position: 'fixed',
            zIndex: 99999,
            pointerEvents: 'none',
            maxWidth: '280px',
            padding: '10px 14px',
            background: 'rgba(10, 18, 35, 0.96)',
            color: '#e2e8f0',
            borderRadius: '10px',
            fontSize: '13px',
            lineHeight: '1.55',
            boxShadow: '0 6px 24px rgba(0,0,0,0.45)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(6px)',
            ...pos,
          }}
        >
          <div
            style={{
              fontWeight: 600,
              fontSize: '13.5px',
              marginBottom: '4px',
              color: '#93c5fd',
            }}
          >
            {tooltip.entry.title}
          </div>
          <div style={{ color: '#cbd5e1' }}>{tooltip.entry.desc}</div>
        </div>
      )}
    </>
  )
}
