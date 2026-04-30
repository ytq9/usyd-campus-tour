'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useFormFields } from '@payloadcms/ui'

declare global {
  interface Window {
    pannellum: any
  }
}

type Props = {
  path?: string
  [key: string]: any
}

type ScreenPos = { x: number; y: number; visible: boolean }

// Spherical (pitch, yaw) → canvas pixel coords for the current camera state.
// Mirrors Pannellum's renderHotSpot math so our overlay markers track the
// panorama exactly the way native Pannellum hotspots would.
function projectToScreen(
  hsPitch: number,
  hsYaw: number,
  viewPitch: number,
  viewYaw: number,
  hfov: number,
  canvasW: number,
  canvasH: number,
): ScreenPos {
  const hsP = (hsPitch * Math.PI) / 180
  const vP = (viewPitch * Math.PI) / 180
  const yawDelta = ((-hsYaw + viewYaw) * Math.PI) / 180

  const hsPS = Math.sin(hsP)
  const hsPC = Math.cos(hsP)
  const vPS = Math.sin(vP)
  const vPC = Math.cos(vP)
  const yawCos = Math.cos(yawDelta)
  const yawSin = Math.sin(yawDelta)

  const z = hsPS * vPS + hsPC * yawCos * vPC
  if (z <= 0) return { x: 0, y: 0, visible: false }

  const hfovTan = Math.tan((hfov * Math.PI) / 360)
  const offX = (-canvasW / hfovTan) * yawSin * hsPC / z / 2
  const offY = (-canvasW / hfovTan) * (hsPS * vPC - hsPC * yawCos * vPS) / z / 2

  return {
    x: offX + canvasW / 2,
    y: offY + canvasH / 2,
    visible: true,
  }
}

type HotspotRow = {
  type?: 'scene' | 'info'
  pitch?: number
  yaw?: number
  text?: string
  targetScene?: number | string | null | { id: number | string }
  targetFloor?: number | string | null | { id: number | string }
  iconColor?: string | null
  iconSize?: 'sm' | 'md' | 'lg' | null
}

type SceneSummary = {
  id: number | string
  title: string
  slug?: string
  panoramaUrl: string | null
}

const sizePx = (s?: string | null) => (s === 'sm' ? 16 : s === 'lg' ? 28 : 22)
const defaultColorFor = (type?: string) => (type === 'scene' ? '#1a6ef5' : '#ff4444')
const idOf = (v: unknown): string | null => {
  if (v == null) return null
  if (typeof v === 'object') return (v as any).id != null ? String((v as any).id) : null
  return String(v)
}

export default function HotspotVisualEditor(_props: Props) {
  const { dispatchFields } = useForm()

  // ─── Read panorama URL ──────────────────────────────────────────────
  const panoramaFieldValue = useFormFields(([fields]) => fields['panorama']?.value as any)
  const [panoramaUrl, setPanoramaUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!panoramaFieldValue) { setPanoramaUrl(null); return }
    if (typeof panoramaFieldValue === 'object' && panoramaFieldValue?.url) {
      setPanoramaUrl(panoramaFieldValue.url); return
    }
    const id = typeof panoramaFieldValue === 'object' ? panoramaFieldValue?.id : panoramaFieldValue
    if (id) {
      fetch(`/api/media/${id}`)
        .then(r => r.json())
        .then(doc => { if (doc?.url) setPanoramaUrl(doc.url) })
        .catch(() => {})
    }
  }, [panoramaFieldValue])

  // ─── Read hotspots array from form state ────────────────────────────
  const hotspotsState: HotspotRow[] = useFormFields(([fields]) => {
    const arr = (fields as any)['hotspots']
    const rows = arr?.rows
    const count = Array.isArray(rows) ? rows.length : 0
    const list: HotspotRow[] = []
    for (let i = 0; i < count; i++) {
      list.push({
        type: fields[`hotspots.${i}.type`]?.value as any,
        pitch: fields[`hotspots.${i}.pitch`]?.value as number,
        yaw: fields[`hotspots.${i}.yaw`]?.value as number,
        text: fields[`hotspots.${i}.text`]?.value as string,
        targetScene: fields[`hotspots.${i}.targetScene`]?.value as any,
        targetFloor: fields[`hotspots.${i}.targetFloor`]?.value as any,
        iconColor: fields[`hotspots.${i}.iconColor`]?.value as any,
        iconSize: fields[`hotspots.${i}.iconSize`]?.value as any,
      })
    }
    return list
  }) as HotspotRow[]

  // ─── Scenes list (for Target Scene picker) ──────────────────────────
  const [scenes, setScenes] = useState<SceneSummary[]>([])
  useEffect(() => {
    fetch('/api/scenes?limit=200&depth=1')
      .then(r => r.json())
      .then(data => {
        const docs = data?.docs || []
        setScenes(docs.map((s: any) => ({
          id: s.id,
          title: s.title || s.slug,
          slug: s.slug,
          panoramaUrl: s.panorama?.url || null,
        })))
      })
      .catch(() => {})
  }, [])

  // ─── Local state ────────────────────────────────────────────────────
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [markerPositions, setMarkerPositions] = useState<Map<number, ScreenPos>>(new Map())

  const viewerRef = useRef<HTMLDivElement>(null)
  const pannellumRef = useRef<any>(null)
  const draggingIndexRef = useRef<number | null>(null)
  const suppressClickRef = useRef(false)
  const hotspotsRef = useRef<HotspotRow[]>(hotspotsState)
  useEffect(() => { hotspotsRef.current = hotspotsState }, [hotspotsState])

  // ─── Init Pannellum (panorama only — no native hotspots) ────────────
  useEffect(() => {
    if (!viewerRef.current || !panoramaUrl) return
    let cancelled = false

    const init = async () => {
      await import('pannellum/build/pannellum.css')
      await import('pannellum/build/pannellum.js')
      if (cancelled || !window.pannellum || !viewerRef.current) return

      pannellumRef.current = window.pannellum.viewer(viewerRef.current, {
        type: 'equirectangular',
        panorama: panoramaUrl,
        autoLoad: true,
        showControls: false,
      })
    }
    init()

    return () => {
      cancelled = true
      if (pannellumRef.current) {
        try { pannellumRef.current.destroy() } catch {}
        pannellumRef.current = null
      }
    }
  }, [panoramaUrl])

  // ─── RAF projection loop: project all hotspots each frame ───────────
  useEffect(() => {
    if (!panoramaUrl) return
    let raf = 0

    const tick = () => {
      const viewer = pannellumRef.current
      const viewerEl = viewerRef.current
      if (viewer && viewerEl) {
        try {
          const cp = viewer.getPitch()
          const cy = viewer.getYaw()
          const fov = viewer.getHfov()
          const w = viewerEl.clientWidth
          const h = viewerEl.clientHeight

          setMarkerPositions(prev => {
            const next = new Map<number, ScreenPos>()
            const list = hotspotsRef.current
            let changed = prev.size !== list.length
            for (let i = 0; i < list.length; i++) {
              const hs = list[i]
              // While dragging this marker, keep prev position (mousemove writes it)
              if (draggingIndexRef.current === i) {
                const p = prev.get(i)
                if (p) next.set(i, p)
                continue
              }
              if (hs.pitch == null || hs.yaw == null) continue
              const proj = projectToScreen(Number(hs.pitch), Number(hs.yaw), cp, cy, fov, w, h)
              next.set(i, proj)
              if (!changed) {
                const old = prev.get(i)
                if (!old || old.visible !== proj.visible ||
                    Math.abs(old.x - proj.x) > 0.5 || Math.abs(old.y - proj.y) > 0.5) {
                  changed = true
                }
              }
            }
            return changed ? next : prev
          })
        } catch {}
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [panoramaUrl])

  // ─── Click panorama to add new hotspot ──────────────────────────────
  useEffect(() => {
    if (!isAdding) return
    const viewerEl = viewerRef.current
    if (!viewerEl) return

    const onClick = (e: MouseEvent) => {
      if (suppressClickRef.current) {
        suppressClickRef.current = false
        return
      }
      const viewer = pannellumRef.current
      if (!viewer) return
      const coords = viewer.mouseEventToCoords(e)
      if (!coords || isNaN(coords[0]) || isNaN(coords[1])) return

      const np = Math.round(Math.max(-85, Math.min(85, coords[0])) * 100) / 100
      const ny = Math.round(Math.max(-180, Math.min(180, coords[1])) * 100) / 100
      const newIndex = hotspotsRef.current.length

      // Add row, then immediately seed required fields
      try {
        dispatchFields({
          type: 'ADD_ROW',
          path: 'hotspots',
          rowIndex: newIndex,
        } as any)
        // Seed values via individual UPDATE actions (works even if state entries
        // are created lazily by ADD_ROW).
        setTimeout(() => {
          try {
            dispatchFields({ type: 'UPDATE', path: `hotspots.${newIndex}.type`, value: 'info' } as any)
            dispatchFields({ type: 'UPDATE', path: `hotspots.${newIndex}.pitch`, value: np } as any)
            dispatchFields({ type: 'UPDATE', path: `hotspots.${newIndex}.yaw`, value: ny } as any)
            dispatchFields({ type: 'UPDATE', path: `hotspots.${newIndex}.text`, value: 'New Hotspot' } as any)
            dispatchFields({ type: 'UPDATE', path: `hotspots.${newIndex}.iconSize`, value: 'md' } as any)
            setSelectedIndex(newIndex)
          } catch {}
        }, 30)
      } catch {}

      setIsAdding(false)
    }

    viewerEl.addEventListener('click', onClick)
    return () => { viewerEl.removeEventListener('click', onClick) }
  }, [isAdding, dispatchFields])

  // ─── Drag a marker ──────────────────────────────────────────────────
  const onMarkerMouseDown = useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setSelectedIndex(index)

    const viewer = pannellumRef.current
    const viewerEl = viewerRef.current
    if (!viewer || !viewerEl) return

    draggingIndexRef.current = index
    let lastClientX = e.clientX
    let lastClientY = e.clientY
    let hasMoved = false
    let lastValidPitch: number | null = null
    let lastValidYaw: number | null = null

    const onMove = (m: MouseEvent) => {
      lastClientX = m.clientX
      lastClientY = m.clientY
      hasMoved = true
      const rect = viewerEl.getBoundingClientRect()
      setMarkerPositions(prev => {
        const next = new Map(prev)
        next.set(index, {
          x: m.clientX - rect.left,
          y: m.clientY - rect.top,
          visible: true,
        })
        return next
      })
      const coords = viewer.mouseEventToCoords(m)
      if (coords && !isNaN(coords[0]) && !isNaN(coords[1])) {
        lastValidPitch = coords[0]
        lastValidYaw = coords[1]
      }
    }

    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      draggingIndexRef.current = null

      if (!hasMoved) return

      let newPitch: number | null = null
      let newYaw: number | null = null
      const final = viewer.mouseEventToCoords({ clientX: lastClientX, clientY: lastClientY })
      if (final && !isNaN(final[0]) && !isNaN(final[1])) {
        newPitch = final[0]; newYaw = final[1]
      } else if (lastValidPitch !== null && lastValidYaw !== null) {
        newPitch = lastValidPitch; newYaw = lastValidYaw
      }
      if (newPitch === null || newYaw === null) return

      newPitch = Math.round(Math.max(-85, Math.min(85, newPitch)) * 100) / 100
      newYaw = Math.round(Math.max(-180, Math.min(180, newYaw)) * 100) / 100

      suppressClickRef.current = true
      try {
        dispatchFields({ type: 'UPDATE', path: `hotspots.${index}.pitch`, value: newPitch } as any)
        dispatchFields({ type: 'UPDATE', path: `hotspots.${index}.yaw`, value: newYaw } as any)
      } catch {}
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [dispatchFields])

  // ─── Field updates from side panel ──────────────────────────────────
  const updateField = useCallback((index: number, field: string, value: any) => {
    try {
      dispatchFields({ type: 'UPDATE', path: `hotspots.${index}.${field}`, value } as any)
    } catch {}
  }, [dispatchFields])

  const handleDelete = useCallback((index: number) => {
    try {
      dispatchFields({ type: 'REMOVE_ROW', path: 'hotspots', rowIndex: index } as any)
    } catch {}
    setSelectedIndex(null)
  }, [dispatchFields])

  const selected = selectedIndex !== null ? hotspotsState[selectedIndex] : null

  // ─── Render ─────────────────────────────────────────────────────────
  if (!panoramaUrl) {
    return (
      <div style={{
        margin: '12px 0', padding: 16, background: '#1a1a1a',
        color: '#888', borderRadius: 6, fontSize: 13,
      }}>
        ⚠ Upload a panorama image first to use the visual editor.
      </div>
    )
  }

  return (
    <div style={{ margin: '16px 0' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', gap: 10, marginBottom: 8,
        flexWrap: 'wrap', alignItems: 'center',
      }}>
        <strong style={{ fontSize: 14, color: '#fff' }}>Hotspot Visual Editor</strong>
        <button
          type="button"
          onClick={() => {
            setIsAdding(v => !v)
            if (!isAdding) setSelectedIndex(null)
          }}
          style={{
            padding: '6px 14px',
            background: isAdding ? '#f90' : '#1a6ef5',
            color: isAdding ? '#000' : '#fff',
            border: 'none', borderRadius: 4,
            cursor: 'pointer', fontSize: 13, fontWeight: 600,
          }}
        >
          {isAdding ? '× Cancel · Click panorama to place' : '+ Add Hotspot'}
        </button>
        <span style={{ fontSize: 12, color: '#888' }}>
          {hotspotsState.length} hotspot{hotspotsState.length === 1 ? '' : 's'}
        </span>
        <span style={{ fontSize: 11, color: '#999', marginLeft: 'auto', display: 'flex', gap: 12 }}>
          <span><span style={{ color: '#1a6ef5' }}>●</span> Portal</span>
          <span><span style={{ color: '#ff4444' }}>●</span> Info</span>
        </span>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {/* Panorama viewer + overlay markers */}
        <div style={{
          flex: 1, position: 'relative',
          border: '1px solid #333', borderRadius: 6, overflow: 'hidden',
          minWidth: 0,
        }}>
          <div ref={viewerRef} style={{ width: '100%', height: 480 }} />

          {hotspotsState.map((hs, i) => {
            const pos = markerPositions.get(i)
            if (!pos || !pos.visible) return null
            const color = hs.iconColor || defaultColorFor(hs.type)
            const size = sizePx(hs.iconSize)
            const isSelected = selectedIndex === i
            const isPortal = hs.type === 'scene'

            return (
              <div
                key={i}
                onMouseDown={(e) => onMarkerMouseDown(i, e)}
                onClick={(e) => { e.stopPropagation(); setSelectedIndex(i) }}
                title={hs.text || (isPortal ? 'Portal' : 'Info')}
                style={{
                  position: 'absolute',
                  left: pos.x, top: pos.y,
                  width: size, height: size,
                  transform: 'translate(-50%, -50%)',
                  background: isPortal
                    ? `radial-gradient(circle at 35% 35%, #80b0ff, ${color})`
                    : `radial-gradient(circle at 35% 35%, #ffb080, ${color})`,
                  border: isSelected ? '3px solid #fff' : '2px solid #fff',
                  borderRadius: '50%',
                  boxShadow: isSelected
                    ? `0 0 0 3px ${color}, 0 2px 12px rgba(0,0,0,0.7)`
                    : `0 0 0 2px ${color}88, 0 2px 6px rgba(0,0,0,0.5)`,
                  cursor: draggingIndexRef.current === i ? 'grabbing' : 'grab',
                  zIndex: isSelected ? 101 : 100,
                  userSelect: 'none', touchAction: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff',
                  fontSize: size > 20 ? 12 : 10, fontWeight: 700,
                  textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                }}
              >
                {isPortal ? '→' : 'i'}
              </div>
            )
          })}

          {isAdding && (
            <div style={{
              position: 'absolute', top: 8, left: 8, zIndex: 200,
              background: 'rgba(255,153,0,0.95)', color: '#000',
              padding: '5px 12px', borderRadius: 4, fontSize: 12, fontWeight: 700,
              pointerEvents: 'none',
            }}>
              ✛ Click on the panorama to place a new hotspot
            </div>
          )}
        </div>

        {/* Side panel */}
        <div style={{
          width: 320, flexShrink: 0,
          border: '1px solid #333', borderRadius: 6,
          background: '#0e0e0e', padding: 14,
          maxHeight: 480, overflowY: 'auto',
        }}>
          {selectedIndex === null || !selected ? (
            <div style={{
              color: '#888', fontSize: 13, textAlign: 'center', padding: '60px 8px',
            }}>
              {hotspotsState.length === 0
                ? 'No hotspots yet.\nClick "+ Add Hotspot" to start.'
                : 'Click a marker on the panorama\nto edit it.'}
            </div>
          ) : (
            <SidePanel
              key={selectedIndex}
              index={selectedIndex}
              hotspot={selected}
              scenes={scenes}
              onChange={(field, value) => updateField(selectedIndex, field, value)}
              onDelete={() => handleDelete(selectedIndex)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Side panel editor ──────────────────────────────────────────────
function SidePanel({
  index, hotspot, scenes, onChange, onDelete,
}: {
  index: number
  hotspot: HotspotRow
  scenes: SceneSummary[]
  onChange: (field: string, value: any) => void
  onDelete: () => void
}) {
  const targetSceneId = idOf(hotspot.targetScene)
  const targetScene = useMemo(
    () => (targetSceneId ? scenes.find(s => String(s.id) === targetSceneId) : null) ?? null,
    [targetSceneId, scenes],
  )

  const [sceneSearch, setSceneSearch] = useState('')
  const filteredScenes = useMemo(() => {
    const q = sceneSearch.trim().toLowerCase()
    if (!q) return scenes
    return scenes.filter(s =>
      s.title.toLowerCase().includes(q) ||
      (s.slug || '').toLowerCase().includes(q),
    )
  }, [scenes, sceneSearch])

  const labelStyle: React.CSSProperties = {
    fontSize: 11, color: '#999',
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginBottom: 4, display: 'block',
  }
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '6px 8px', background: '#1a1a1a',
    border: '1px solid #333', borderRadius: 4, color: '#fff', fontSize: 13,
    boxSizing: 'border-box',
  }
  const fieldRow: React.CSSProperties = { marginBottom: 12 }

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #222',
      }}>
        <strong style={{ fontSize: 13, color: '#fff' }}>Hotspot #{index + 1}</strong>
        <button
          type="button"
          onClick={() => { if (window.confirm('Delete this hotspot?')) onDelete() }}
          style={{
            padding: '4px 10px', background: '#7a1a1a', color: '#fff',
            border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12,
          }}
        >
          Delete
        </button>
      </div>

      <div style={fieldRow}>
        <label style={labelStyle}>Type</label>
        <select
          value={hotspot.type || 'info'}
          onChange={(e) => onChange('type', e.target.value)}
          style={inputStyle}
        >
          <option value="info">Info Item</option>
          <option value="scene">Portal (Scene Navigation)</option>
        </select>
      </div>

      <div style={fieldRow}>
        <label style={labelStyle}>Label</label>
        <input
          type="text"
          value={hotspot.text || ''}
          onChange={(e) => onChange('text', e.target.value)}
          placeholder="Hotspot label"
          style={inputStyle}
        />
      </div>

      <div style={{ ...fieldRow, display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Pitch</label>
          <input
            type="number" step="0.1"
            value={hotspot.pitch ?? ''}
            onChange={(e) => onChange('pitch', e.target.value === '' ? null : parseFloat(e.target.value))}
            style={inputStyle}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Yaw</label>
          <input
            type="number" step="0.1"
            value={hotspot.yaw ?? ''}
            onChange={(e) => onChange('yaw', e.target.value === '' ? null : parseFloat(e.target.value))}
            style={inputStyle}
          />
        </div>
      </div>

      {hotspot.type === 'scene' ? (
        <div style={fieldRow}>
          <label style={labelStyle}>Target Scene</label>

          {/* Currently selected — prominent confirmation card */}
          <div style={{
            marginBottom: 8,
            border: targetScene ? '1px solid #1a6ef5' : '1px dashed #444',
            borderRadius: 4, overflow: 'hidden',
            background: targetScene ? '#0f1a2e' : '#181818',
          }}>
            {targetScene ? (
              <>
                {targetScene.panoramaUrl ? (
                  <img
                    src={targetScene.panoramaUrl}
                    alt={targetScene.title}
                    style={{
                      width: '100%', height: 90, objectFit: 'cover',
                      display: 'block', background: '#000',
                    }}
                  />
                ) : (
                  <div style={{
                    height: 90, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: '#555', fontSize: 12,
                  }}>No preview</div>
                )}
                <div style={{
                  padding: '6px 10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 8,
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      fontSize: 11, color: '#5a9bff',
                      textTransform: 'uppercase', letterSpacing: 0.4,
                    }}>
                      Selected
                    </div>
                    <div style={{
                      fontSize: 13, color: '#fff', fontWeight: 600,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {targetScene.title}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onChange('targetScene', null)}
                    style={{
                      padding: '4px 8px', background: 'transparent',
                      border: '1px solid #444', color: '#aaa',
                      borderRadius: 3, cursor: 'pointer', fontSize: 11,
                      flexShrink: 0,
                    }}
                  >
                    Clear
                  </button>
                </div>
              </>
            ) : (
              <div style={{
                padding: '14px 10px', textAlign: 'center',
                color: '#777', fontSize: 12,
              }}>
                No scene selected — pick one below
              </div>
            )}
          </div>

          {/* Search */}
          <input
            type="text"
            value={sceneSearch}
            onChange={(e) => setSceneSearch(e.target.value)}
            placeholder={`Search ${scenes.length} scene${scenes.length === 1 ? '' : 's'}…`}
            style={{ ...inputStyle, marginBottom: 8 }}
          />

          {/* Thumbnail grid picker — visual selection */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 6,
            maxHeight: 260, overflowY: 'auto',
            padding: 4, background: '#080808',
            border: '1px solid #222', borderRadius: 4,
          }}>
            {filteredScenes.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                padding: '20px 8px', textAlign: 'center',
                color: '#666', fontSize: 12,
              }}>
                No scenes match "{sceneSearch}"
              </div>
            ) : filteredScenes.map(s => {
              const isSelected = String(s.id) === targetSceneId
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    const num = Number(s.id)
                    onChange('targetScene', Number.isNaN(num) ? s.id : num)
                  }}
                  title={s.title}
                  style={{
                    display: 'block', textAlign: 'left',
                    padding: 0, background: '#161616',
                    border: isSelected ? '2px solid #1a6ef5' : '1px solid #2a2a2a',
                    borderRadius: 3, overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 0 0 2px rgba(26,110,245,0.3)' : 'none',
                    transition: 'transform 0.05s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none' }}
                >
                  <div style={{
                    width: '100%', height: 60,
                    background: '#000',
                    position: 'relative',
                  }}>
                    {s.panoramaUrl ? (
                      <img
                        src={s.panoramaUrl}
                        alt={s.title}
                        style={{
                          width: '100%', height: '100%',
                          objectFit: 'cover', display: 'block',
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#444', fontSize: 10,
                      }}>
                        No image
                      </div>
                    )}
                    {isSelected && (
                      <div style={{
                        position: 'absolute', top: 3, right: 3,
                        background: '#1a6ef5', color: '#fff',
                        width: 16, height: 16, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
                      }}>✓</div>
                    )}
                  </div>
                  <div style={{
                    padding: '4px 6px',
                    fontSize: 11, color: isSelected ? '#fff' : '#bbb',
                    fontWeight: isSelected ? 600 : 400,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {s.title}
                  </div>
                </button>
              )
            })}
          </div>
          <div style={{ fontSize: 10, color: '#666', marginTop: 4, textAlign: 'right' }}>
            Click a thumbnail to set as portal target
          </div>
        </div>
      ) : (
        <div style={{
          marginBottom: 12, padding: 8, background: '#181818',
          border: '1px dashed #333', borderRadius: 4,
          fontSize: 11, color: '#999', lineHeight: 1.5,
        }}>
          ℹ Rich text content for this Info hotspot is edited in the
          collapsed Hotspots form below — expand it and open row #{index + 1}.
        </div>
      )}

      <div style={{ ...fieldRow, display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Icon Color</label>
          <input
            type="text"
            value={hotspot.iconColor || ''}
            onChange={(e) => onChange('iconColor', e.target.value || null)}
            placeholder="#cc0000"
            style={inputStyle}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Size</label>
          <select
            value={hotspot.iconSize || 'md'}
            onChange={(e) => onChange('iconSize', e.target.value)}
            style={inputStyle}
          >
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </select>
        </div>
      </div>
    </div>
  )
}
