'use client'

import React, { useEffect, useRef, useState } from 'react'

// ---------------------------------------------------------------------------
// Tooltip content map
// Keys are normalised label/nav text (lowercase, trimmed, no asterisks).
//
// A map value can be either:
//   • a plain TooltipEntry — same description in every context
//   • a ContextualEntry    — different description for nav vs. field
//                            ({ default, nav?, field? })
// ---------------------------------------------------------------------------
type TooltipEntry = { title: string; desc: string }

type ContextualEntry = {
  default: TooltipEntry
  nav?: TooltipEntry
  field?: TooltipEntry
}

type MapValue = TooltipEntry | ContextualEntry
type Context = 'nav' | 'field'

const isContextual = (v: MapValue): v is ContextualEntry =>
  (v as ContextualEntry).default !== undefined

const resolveEntry = (value: MapValue, context: Context): TooltipEntry => {
  if (!isContextual(value)) return value
  return value[context] ?? value.default
}

const TOOLTIP_MAP: Record<string, MapValue> = {
  // ── Sidebar navigation ───────────────────────────────────────────────────
  media: {
    title: '📸 Media',
    desc: 'Store and manage all images and files used across tours, floors, and scenes.',
  },
  tours: {
    title: '🗺️ Tours',
    desc: 'Define virtual building routes. A tour contains one or more floors for visitors to explore.',
  },
  // "Floors" appears in two contexts — sidebar module vs. form field —
  // so it gets a contextual entry with both descriptions.
  floors: {
    default: {
      title: '🏢 Floors',
      desc: 'Represent individual levels inside a building. Each floor holds scenes and a floorplan map.',
    },
    nav: {
      title: '🏢 Floors',
      desc: 'Represent individual levels inside a building. Each floor holds scenes and a floorplan map.',
    },
    field: {
      title: 'Floors',
      desc: 'Select which building floors belong to this tour. A floor can only be assigned to one tour at a time.',
    },
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
// Normalise raw text to a lookup key.
// Strips required-asterisks, decorative chars, count suffixes like "(0 of 5)",
// and collapses whitespace.
// ---------------------------------------------------------------------------
function normalise(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[*()[\]{}]/g, ' ')        // remove decorative chars
    .replace(/\s+/g, ' ')
    .trim()
}

// Try increasingly shorter prefixes of `text` against TOOLTIP_MAP.
// e.g. "tags 0 of unlimited" → "tags 0 of unlimited" (miss) → "tags 0 of" → ... → "tags" (hit)
function lookupByPrefix(text: string): MapValue | undefined {
  if (TOOLTIP_MAP[text]) return TOOLTIP_MAP[text]
  const words = text.split(' ')
  for (let i = words.length - 1; i > 0; i--) {
    const candidate = words.slice(0, i).join(' ')
    if (TOOLTIP_MAP[candidate]) return TOOLTIP_MAP[candidate]
  }
  return undefined
}

// ---------------------------------------------------------------------------
// Walk up the DOM from the hovered element looking for a label / heading / nav.
// Context (field vs. nav) drives which variant of a ContextualEntry to return.
// ---------------------------------------------------------------------------
function resolveTooltip(target: HTMLElement): TooltipEntry | null {
  let el: HTMLElement | null = target
  for (let depth = 0; depth < 8; depth++) {
    if (!el) break

    const tag = el.tagName.toLowerCase()
    const role = el.getAttribute('role')

    let context: Context | null = null

    if (tag === 'label') {
      context = 'field'
    } else if (tag === 'a' || (tag === 'span' && role === 'link')) {
      context = 'nav'
    } else if (/^h[1-5]$/.test(tag) || role === 'heading') {
      // Array / group field headers in PayloadCMS use <h2>/<h3> not <label>
      context = 'field'
    } else if (tag === 'button') {
      // Collapsible field headers render as <button>; only match if text is short
      const previewText = el.textContent ?? ''
      if (previewText.length < 60) context = 'field'
    }

    if (context) {
      const text = normalise(el.textContent ?? '')
      if (text && text.length < 80) {
        const value = lookupByPrefix(text)
        if (value) return resolveEntry(value, context)
      }
    }

    el = el.parentElement
  }
  return null
}

// ---------------------------------------------------------------------------
// Timing configuration
// ---------------------------------------------------------------------------
const SHOW_DELAY_MS = 100 // require the cursor to dwell this long before showing
const HIDE_DELAY_MS = 120 // grace period when leaving so child elements don't flicker

// ---------------------------------------------------------------------------
// Provider component
// ---------------------------------------------------------------------------
export function AdminTooltipProvider({ children }: { children: React.ReactNode }) {
  const [tooltip, setTooltip] = useState<{
    entry: TooltipEntry
    x: number
    y: number
  } | null>(null)

  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const visibleKey = useRef<string>('')   // title of currently-shown tooltip
  const pendingKey = useRef<string>('')   // title of tooltip about to show
  const mousePos = useRef({ x: 0, y: 0 }) // latest cursor position

  useEffect(() => {
    const cancelShow = () => {
      if (showTimer.current) {
        clearTimeout(showTimer.current)
        showTimer.current = null
      }
      pendingKey.current = ''
    }

    const cancelHide = () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current)
        hideTimer.current = null
      }
    }

    const handleOver = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
      const entry = resolveTooltip(e.target as HTMLElement)

      if (entry) {
        // Hovering a known target — cancel any pending hide
        cancelHide()
        const key = entry.title

        // Already showing this tooltip? mousemove will keep the position fresh
        if (key === visibleKey.current) return
        // Already scheduled to show this exact tooltip? don't restart the timer
        if (key === pendingKey.current) return

        // New target — schedule show after SHOW_DELAY_MS
        cancelShow()
        pendingKey.current = key
        showTimer.current = setTimeout(() => {
          setTooltip({ entry, x: mousePos.current.x, y: mousePos.current.y })
          visibleKey.current = key
          pendingKey.current = ''
          showTimer.current = null
        }, SHOW_DELAY_MS)
      } else {
        // Hovered off a known target — abandon any pending show
        cancelShow()

        // Schedule hide if a tooltip is currently visible
        if (visibleKey.current && !hideTimer.current) {
          hideTimer.current = setTimeout(() => {
            setTooltip(null)
            visibleKey.current = ''
            hideTimer.current = null
          }, HIDE_DELAY_MS)
        }
      }
    }

    const handleMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
      setTooltip((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null))
    }

    document.addEventListener('mouseover', handleOver)
    document.addEventListener('mousemove', handleMove)

    return () => {
      document.removeEventListener('mouseover', handleOver)
      document.removeEventListener('mousemove', handleMove)
      cancelShow()
      cancelHide()
    }
  }, [])

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
