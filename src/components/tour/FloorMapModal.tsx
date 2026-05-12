'use client'

import React, { useRef, useState } from 'react'

const MAP_VIEWBOX_WIDTH = 5000
const MAP_VIEWBOX_HEIGHT = 2000
const LABEL_MARGIN = 70
const LABEL_HEIGHT = 190
const LABEL_OFFSET_X = 260
const LABEL_OFFSET_Y = 220

type Props = {
  tourFloors: any[]
  currentFloor: any
  currentSceneSlug: string
  tourSlug: string
  isDraft: boolean
  debugHotspots?: boolean
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const getSceneLabel = (mapPoint: any) =>
  mapPoint?.scene?.title || mapPoint?.scene?.slug || 'Untitled scene'

const getDisplayLabel = (label: string) => {
  const normalized = label.trim() || 'Untitled scene'
  return normalized.length > 32 ? `${normalized.slice(0, 29)}...` : normalized
}

const getCalloutLayout = (mapPoint: any) => {
  const cx = Number(mapPoint.cx) || 0
  const cy = Number(mapPoint.cy) || 0
  const label = getDisplayLabel(getSceneLabel(mapPoint))
  const labelWidth = clamp(label.length * 52 + 160, 480, 1500)

  let horizontal: 'left' | 'right' =
    cx + LABEL_OFFSET_X + labelWidth <= MAP_VIEWBOX_WIDTH - LABEL_MARGIN ? 'right' : 'left'
  if (horizontal === 'left' && cx - LABEL_OFFSET_X - labelWidth < LABEL_MARGIN) {
    horizontal = 'right'
  }

  let vertical: 'down' | 'up' =
    cy - LABEL_OFFSET_Y - LABEL_HEIGHT >= LABEL_MARGIN ? 'up' : 'down'
  if (vertical === 'down' && cy + LABEL_OFFSET_Y + LABEL_HEIGHT > MAP_VIEWBOX_HEIGHT - LABEL_MARGIN) {
    vertical = 'up'
  }

  const labelX = clamp(
    horizontal === 'right' ? cx + LABEL_OFFSET_X : cx - LABEL_OFFSET_X - labelWidth,
    LABEL_MARGIN,
    MAP_VIEWBOX_WIDTH - labelWidth - LABEL_MARGIN,
  )
  const labelY = clamp(
    vertical === 'up' ? cy - LABEL_OFFSET_Y - LABEL_HEIGHT : cy + LABEL_OFFSET_Y,
    LABEL_MARGIN,
    MAP_VIEWBOX_HEIGHT - LABEL_HEIGHT - LABEL_MARGIN,
  )
  const anchorX = horizontal === 'right' ? labelX : labelX + labelWidth
  const anchorY = vertical === 'up' ? labelY + LABEL_HEIGHT : labelY
  const elbowX =
    horizontal === 'right' ? Math.min(cx + 130, anchorX - 80) : Math.max(cx - 130, anchorX + 80)

  return {
    anchorX,
    anchorY,
    cx,
    cy,
    elbowX,
    label,
    labelWidth,
    labelX,
    labelY,
  }
}

export default function FloorMapModal({ tourFloors, currentFloor, currentSceneSlug, tourSlug, isDraft, debugHotspots }: Props) {
  const modalRef = useRef<HTMLDialogElement>(null)
  const lastPointerTypeRef = useRef('mouse')
  const initialActiveFloorIdx = tourFloors.findIndex((f: any) => (
    f.id === currentFloor.id || f.slug === currentFloor.slug
  ))
  const [activeFloorIdx, setActiveFloorIdx] = useState(
    initialActiveFloorIdx >= 0 ? initialActiveFloorIdx : 0
  )
  const [hoveredMapPointIdx, setHoveredMapPointIdx] = useState<number | null>(null)
  const [focusedMapPointIdx, setFocusedMapPointIdx] = useState<number | null>(null)
  const [tappedMapPointIdx, setTappedMapPointIdx] = useState<number | null>(null)

  const resetMapPointLabel = () => {
    setHoveredMapPointIdx(null)
    setFocusedMapPointIdx(null)
    setTappedMapPointIdx(null)
  }

  const handleMapPointClick = (floorSlug: string, sceneSlug: string) => {
    const query = new URLSearchParams()
    if (isDraft) query.set('draft', 'true')
    if (debugHotspots) query.set('debugHotspots', 'true')
    const queryString = query.toString() ? `?${query.toString()}` : ''
    window.location.assign(`/tour/${tourSlug}/${floorSlug}/${sceneSlug}${queryString}`)
  }

  const activeFloor = tourFloors[activeFloorIdx]
  const activeMapPointIdx = hoveredMapPointIdx ?? focusedMapPointIdx ?? tappedMapPointIdx
  const activeMapPoint = activeFloor?.mapPoints?.[activeMapPointIdx ?? -1]
  const activeCallout = activeMapPoint ? getCalloutLayout(activeMapPoint) : null

  return (
    <>
      <button
        onClick={() => modalRef.current?.showModal()}
        className="bg-ochre hover:bg-orange-700 p-2 size-14 rounded-full cursor-pointer flex items-center justify-center"
        title="Floor Map"
      >
        <svg className="size-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
        </svg>
      </button>

      <dialog ref={modalRef} className="d-modal">
        <div className="d-modal-box relative w-full max-w-5xl bg-white/90">
          <div className="d-tabs d-tabs-lift mb-4">
            {tourFloors.map((floor: any, idx: number) => (
              <button
                key={floor.id}
                onClick={() => {
                  setActiveFloorIdx(idx)
                  resetMapPointLabel()
                }}
                className={`d-tab ${activeFloorIdx === idx ? 'd-tab-active' : ''}`}
              >
                {floor.name}
              </button>
            ))}
          </div>

          {activeFloor && (
            <div className="p-4 bg-white rounded-lg">
              {activeFloor.floorplan ? (
                <div className="relative">
                  <img
                    src={activeFloor.floorplan}
                    alt={`${activeFloor.name} floorplan`}
                    className="w-full h-auto"
                  />
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 5000 2000" preserveAspectRatio="xMidYMid meet">
                    {(activeFloor.mapPoints || []).map((mp: any, i: number) => {
                      const isCurrentScene = mp.scene?.slug === currentSceneSlug
                      const canNavigate = !isCurrentScene && Boolean(mp.scene?.slug)
                      const label = getSceneLabel(mp)
                      const isActive = activeMapPointIdx === i

                      return (
                        <circle
                          key={i}
                          tabIndex={0}
                          role="button"
                          aria-current={isCurrentScene ? 'location' : undefined}
                          aria-label={isCurrentScene ? `Current scene: ${label}` : `Open scene: ${label}`}
                          cx={mp.cx}
                          cy={mp.cy}
                          r={isCurrentScene ? 44 : 32}
                          fill={isCurrentScene ? '#000000' : mp.color}
                          stroke={isActive ? '#111827' : '#ffffff'}
                          strokeWidth={isActive ? 14 : 8}
                          className={canNavigate ? 'cursor-pointer hover:opacity-80' : 'cursor-help'}
                          onBlur={() => {
                            if (focusedMapPointIdx === i) setFocusedMapPointIdx(null)
                          }}
                          onFocus={() => setFocusedMapPointIdx(i)}
                          onKeyDown={(event) => {
                            if (event.key !== 'Enter' && event.key !== ' ') return
                            event.preventDefault()
                            if (canNavigate) {
                              handleMapPointClick(activeFloor.slug, mp.scene.slug)
                            }
                          }}
                          onClick={() => {
                            if (!canNavigate) {
                              setTappedMapPointIdx(i)
                              return
                            }

                            if (lastPointerTypeRef.current === 'touch' || lastPointerTypeRef.current === 'pen') {
                              if (tappedMapPointIdx === i) {
                                handleMapPointClick(activeFloor.slug, mp.scene.slug)
                              } else {
                                setTappedMapPointIdx(i)
                              }
                              return
                            }

                            handleMapPointClick(activeFloor.slug, mp.scene.slug)
                          }}
                          onMouseEnter={() => setHoveredMapPointIdx(i)}
                          onMouseLeave={() => {
                            if (hoveredMapPointIdx === i) setHoveredMapPointIdx(null)
                          }}
                          onPointerDown={(event) => {
                            lastPointerTypeRef.current = event.pointerType
                          }}
                        />
                      )
                    })}
                    {activeCallout && (
                      <g pointerEvents="none" aria-hidden="true">
                        <polyline
                          points={`${activeCallout.cx},${activeCallout.cy} ${activeCallout.elbowX},${activeCallout.anchorY} ${activeCallout.anchorX},${activeCallout.anchorY}`}
                          fill="none"
                          stroke="#ffffff"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={28}
                          opacity={0.88}
                        />
                        <polyline
                          points={`${activeCallout.cx},${activeCallout.cy} ${activeCallout.elbowX},${activeCallout.anchorY} ${activeCallout.anchorX},${activeCallout.anchorY}`}
                          fill="none"
                          stroke="#111827"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={10}
                        />
                        <rect
                          x={activeCallout.labelX}
                          y={activeCallout.labelY}
                          width={activeCallout.labelWidth}
                          height={LABEL_HEIGHT}
                          rx={22}
                          fill="#111827"
                          opacity={0.94}
                        />
                        <text
                          x={activeCallout.labelX + 80}
                          y={activeCallout.labelY + LABEL_HEIGHT / 2}
                          fill="#ffffff"
                          fontSize={88}
                          fontWeight={700}
                          dominantBaseline="middle"
                        >
                          {activeCallout.label}
                        </text>
                      </g>
                    )}
                  </svg>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No floorplan available</p>
              )}
            </div>
          )}

          <form method="dialog">
            <button className="d-btn d-btn-sm d-btn-circle d-btn-ghost absolute right-2 top-2">✕</button>
          </form>
        </div>
        <form method="dialog" className="d-modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  )
}
