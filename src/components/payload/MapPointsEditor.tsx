'use client'

import type { ArrayFieldClientComponent } from 'payload'
import { FieldLabel, useForm, useFormFields } from '@payloadcms/ui'
import React, { useEffect, useMemo, useRef, useState } from 'react'

type SceneOption = {
  id: number | string
  title?: string | null
  slug?: string | null
}

type MediaValue = {
  url?: string | null
}

type FieldState<T> = {
  value?: T
}

type MapPointValue = {
  scene?: number | string | SceneOption | null
  cx?: number | null
  cy?: number | null
  color?: string | null
}

type DragPosition = {
  cx: number
  cy: number
}

type PendingAddState = DragPosition & {
  sceneId: string
}

type EditState = {
  color: string
  index: number
  sceneId: string
}

const SVG_WIDTH = 5000
const SVG_HEIGHT = 2000
const DEFAULT_COLOR = '#E64626'

const editorStyles: Record<string, React.CSSProperties> = {
  root: {
    display: 'grid',
    gap: '0.75rem',
  },
  helperText: {
    color: 'var(--theme-elevation-600)',
    fontSize: '0.875rem',
    lineHeight: 1.5,
    margin: 0,
  },
  panel: {
    background: 'var(--theme-input-bg)',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '12px',
  },
  mapShell: {
    position: 'relative',
    width: '100%',
  },
  image: {
    display: 'block',
    height: 'auto',
    userSelect: 'none',
    width: '100%',
  },
  overlay: {
    inset: 0,
    position: 'absolute',
  },
  emptyState: {
    alignItems: 'center',
    color: 'var(--theme-elevation-500)',
    display: 'flex',
    fontSize: '0.95rem',
    justifyContent: 'center',
    minHeight: '220px',
    padding: '1rem',
    textAlign: 'center',
  },
  popover: {
    background: 'var(--theme-bg)',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.16)',
    display: 'grid',
    gap: '0.75rem',
    minWidth: '250px',
    padding: '0.875rem',
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 3,
  },
  popoverTitle: {
    color: 'var(--theme-text)',
    fontSize: '0.95rem',
    fontWeight: 600,
    margin: 0,
  },
  fieldGroup: {
    display: 'grid',
    gap: '0.35rem',
  },
  fieldLabel: {
    color: 'var(--theme-elevation-700)',
    fontSize: '0.78rem',
    fontWeight: 600,
    margin: 0,
  },
  input: {
    background: 'var(--theme-input-bg)',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '8px',
    color: 'var(--theme-text)',
    font: 'inherit',
    minHeight: '40px',
    padding: '0.55rem 0.7rem',
    width: '100%',
  },
  buttonRow: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'flex-end',
  },
  button: {
    appearance: 'none',
    background: 'var(--theme-elevation-800)',
    border: 'none',
    borderRadius: '8px',
    color: 'var(--theme-base-0)',
    cursor: 'pointer',
    font: 'inherit',
    fontWeight: 600,
    minHeight: '38px',
    padding: '0.55rem 0.9rem',
  },
  secondaryButton: {
    appearance: 'none',
    background: 'transparent',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '8px',
    color: 'var(--theme-text)',
    cursor: 'pointer',
    font: 'inherit',
    fontWeight: 500,
    minHeight: '38px',
    padding: '0.55rem 0.9rem',
  },
  dangerButton: {
    appearance: 'none',
    background: '#C7362C',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    font: 'inherit',
    fontWeight: 600,
    minHeight: '38px',
    padding: '0.55rem 0.9rem',
  },
  infoBar: {
    color: 'var(--theme-elevation-600)',
    display: 'flex',
    fontSize: '0.82rem',
    gap: '1rem',
    justifyContent: 'space-between',
    padding: '0.75rem 0.9rem',
  },
}

function clamp(value: number, max: number) {
  return Math.max(0, Math.min(max, Math.round(value)))
}

function getSceneId(value: MapPointValue['scene']): string {
  if (typeof value === 'number' || typeof value === 'string') {
    return String(value)
  }

  if (value && typeof value === 'object' && 'id' in value && value.id != null) {
    return String(value.id)
  }

  return ''
}

function getSceneLabel(value: MapPointValue['scene'], scenesById: Map<string, SceneOption>): string {
  if (value && typeof value === 'object' && 'title' in value && value.title) {
    return value.title
  }

  const sceneId = getSceneId(value)
  if (!sceneId) {
    return 'Unassigned scene'
  }

  return scenesById.get(sceneId)?.title || `Scene ${sceneId}`
}

function getSceneSubmitValue(
  sceneId: string,
  scenesById: Map<string, SceneOption>,
  fallbackValue?: MapPointValue['scene'],
) {
  const sceneOption = scenesById.get(sceneId)
  if (sceneOption) {
    return sceneOption.id
  }

  if (typeof fallbackValue === 'number') {
    return Number(sceneId)
  }

  if (fallbackValue && typeof fallbackValue === 'object' && 'id' in fallbackValue && typeof fallbackValue.id === 'number') {
    return Number(sceneId)
  }

  return sceneId
}

function getDisplayPoint(point: MapPointValue, localPosition?: DragPosition) {
  return {
    color: point.color || DEFAULT_COLOR,
    cx: localPosition?.cx ?? clamp(Number(point.cx ?? 0), SVG_WIDTH),
    cy: localPosition?.cy ?? clamp(Number(point.cy ?? 0), SVG_HEIGHT),
  }
}

function getSvgCoords(svg: SVGSVGElement, clientX: number, clientY: number) {
  const svgPoint = svg.createSVGPoint()
  svgPoint.x = clientX
  svgPoint.y = clientY

  const ctm = svg.getScreenCTM()
  if (!ctm) {
    return null
  }

  const transformed = svgPoint.matrixTransform(ctm.inverse())

  return {
    cx: clamp(transformed.x, SVG_WIDTH),
    cy: clamp(transformed.y, SVG_HEIGHT),
  }
}

export const MapPointsEditor: ArrayFieldClientComponent = ({ field, path, readOnly, schemaPath }) => {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const justDraggedRef = useRef(false)

  const { addFieldRow, dispatchFields, removeFieldRow } = useForm()
  const floorplanField = useFormFields(([fields]) => fields.floorplan as FieldState<number | string | MediaValue | null> | undefined)

  // Read live form rows so newly added map markers appear before the document is saved.
  const points = useFormFields(([fields]) => {
    const rows = (fields[path]?.rows ?? []) as unknown[]
    return rows.map((_, i) => ({
      scene: fields[`${path}.${i}.scene`]?.value as MapPointValue['scene'],
      cx: fields[`${path}.${i}.cx`]?.value as number | null,
      cy: fields[`${path}.${i}.cy`]?.value as number | null,
      color: fields[`${path}.${i}.color`]?.value as string | null,
    }))
  }) ?? []

  const [floorplanURL, setFloorplanURL] = useState<string | null>(null)
  const [floorplanLoading, setFloorplanLoading] = useState(false)
  const [scenes, setScenes] = useState<SceneOption[]>([])
  const [scenesLoading, setScenesLoading] = useState(false)
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const [localPositions, setLocalPositions] = useState<Record<number, DragPosition>>({})
  const [pendingAdd, setPendingAdd] = useState<PendingAddState | null>(null)
  const [editing, setEditing] = useState<EditState | null>(null)
  const scenesById = useMemo(() => new Map(scenes.map((scene) => [String(scene.id), scene])), [scenes])

  useEffect(() => {
    const controller = new AbortController()

    setScenesLoading(true)

    void fetch('/api/scenes?limit=100&depth=0', {
      credentials: 'same-origin',
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch scenes: ${response.status}`)
        }

        const data = (await response.json()) as { docs?: SceneOption[] }
        setScenes(Array.isArray(data.docs) ? data.docs : [])
      })
      .catch((error: unknown) => {
        if ((error as Error)?.name !== 'AbortError') {
          setScenes([])
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setScenesLoading(false)
        }
      })

    return () => {
      controller.abort()
    }
  }, [])

  useEffect(() => {
    const floorplanValue = floorplanField?.value
    const controller = new AbortController()

    if (!floorplanValue) {
      setFloorplanLoading(false)
      setFloorplanURL(null)
      return () => {
        controller.abort()
      }
    }

    if (typeof floorplanValue === 'object' && floorplanValue.url) {
      setFloorplanLoading(false)
      setFloorplanURL(floorplanValue.url)
      return () => {
        controller.abort()
      }
    }

    if (typeof floorplanValue === 'number' || typeof floorplanValue === 'string') {
      setFloorplanLoading(true)
      setFloorplanURL(null)

      void fetch(`/api/media/${String(floorplanValue)}`, {
        credentials: 'same-origin',
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch media: ${response.status}`)
          }

          const data = (await response.json()) as MediaValue
          setFloorplanURL(data.url || null)
        })
        .catch((error: unknown) => {
          if ((error as Error)?.name !== 'AbortError') {
            setFloorplanURL(null)
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setFloorplanLoading(false)
          }
        })
    }

    return () => {
      controller.abort()
    }
  }, [floorplanField?.value])

  useEffect(() => {
    if (editing && editing.index >= points.length) {
      setEditing(null)
    }
  }, [editing, points.length])

  const closePopovers = () => {
    setPendingAdd(null)
    setEditing(null)
  }

  const startDrag = (index: number, event: React.PointerEvent<SVGCircleElement>) => {
    if (readOnly || !svgRef.current) {
      return
    }

    const point = getSvgCoords(svgRef.current, event.clientX, event.clientY)
    if (!point) {
      return
    }

    closePopovers()
    justDraggedRef.current = false
    event.currentTarget.setPointerCapture(event.pointerId)
    setDraggingIndex(index)
    setLocalPositions((current) => ({
      ...current,
      [index]: point,
    }))
  }

  const moveDrag = (index: number, event: React.PointerEvent<SVGCircleElement>) => {
    if (readOnly || draggingIndex !== index || !svgRef.current) {
      return
    }

    const point = getSvgCoords(svgRef.current, event.clientX, event.clientY)
    if (!point) {
      return
    }

    justDraggedRef.current = true
    setLocalPositions((current) => ({
      ...current,
      [index]: point,
    }))
  }

  const finishDrag = (index: number, event: React.PointerEvent<SVGCircleElement>) => {
    if (readOnly || draggingIndex !== index) {
      return
    }

    const point = svgRef.current ? getSvgCoords(svgRef.current, event.clientX, event.clientY) : null

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    const localPosition = point || localPositions[index]
    if (localPosition) {
      dispatchFields({
        path: `${path}.${index}.cx`,
        type: 'UPDATE',
        value: localPosition.cx,
      })
      dispatchFields({
        path: `${path}.${index}.cy`,
        type: 'UPDATE',
        value: localPosition.cy,
      })
    }

    setDraggingIndex(null)
    setLocalPositions((current) => {
      const next = { ...current }
      delete next[index]
      return next
    })
  }

  const cancelDrag = (index: number, event: React.PointerEvent<SVGCircleElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    justDraggedRef.current = false
    setDraggingIndex(null)
    setLocalPositions((current) => {
      const next = { ...current }
      delete next[index]
      return next
    })
  }

  const openAddPopover = (event: React.MouseEvent<SVGRectElement>) => {
    if (readOnly || !svgRef.current) {
      return
    }

    const point = getSvgCoords(svgRef.current, event.clientX, event.clientY)
    if (!point) {
      return
    }

    setEditing(null)
    setPendingAdd({
      ...point,
      sceneId: scenes[0] ? String(scenes[0].id) : '',
    })
  }

  const addPoint = () => {
    if (readOnly || !pendingAdd?.sceneId) {
      return
    }

    void addFieldRow({
      path,
      rowIndex: points.length,
      schemaPath: schemaPath || path,
      subFieldState: {
        scene: { value: getSceneSubmitValue(pendingAdd.sceneId, scenesById) },
        cx: { value: pendingAdd.cx },
        cy: { value: pendingAdd.cy },
        color: { value: DEFAULT_COLOR },
      },
    })

    setPendingAdd(null)
  }

  const openEditPopover = (index: number) => {
    if (readOnly) {
      return
    }

    const point = points[index]
    if (!point) {
      return
    }

    setPendingAdd(null)
    setEditing({
      color: point.color || DEFAULT_COLOR,
      index,
      sceneId: getSceneId(point.scene),
    })
  }

  const saveEdit = () => {
    if (readOnly || editing == null) {
      return
    }

    const currentPoint = points[editing.index]

    dispatchFields({
      path: `${path}.${editing.index}.scene`,
      type: 'UPDATE',
      value: getSceneSubmitValue(editing.sceneId, scenesById, currentPoint?.scene),
    })
    dispatchFields({
      path: `${path}.${editing.index}.color`,
      type: 'UPDATE',
      value: editing.color || DEFAULT_COLOR,
    })

    setEditing(null)
  }

  const deletePoint = () => {
    if (readOnly || editing == null) {
      return
    }

    removeFieldRow({
      path,
      rowIndex: editing.index,
    })
    setEditing(null)
  }

  const renderPopover = () => {
    if (!floorplanURL) {
      return null
    }

    if (pendingAdd) {
      const leftPct = Math.max(15, Math.min(85, (pendingAdd.cx / SVG_WIDTH) * 100))
      return (
        <div
          style={{
            ...editorStyles.popover,
            left: `${leftPct}%`,
          }}
        >
          <p style={editorStyles.popoverTitle}>Add map point</p>
          <div style={editorStyles.fieldGroup}>
            <p style={editorStyles.fieldLabel}>Scene</p>
            <select
              disabled={readOnly || scenesLoading || scenes.length === 0}
              onChange={(event) =>
                setPendingAdd((current) => (current ? { ...current, sceneId: event.target.value } : current))
              }
              style={editorStyles.input}
              value={pendingAdd.sceneId}
            >
              <option value="">Select a scene</option>
              {scenes.map((scene) => (
                <option key={String(scene.id)} value={String(scene.id)}>
                  {scene.title || scene.slug || `Scene ${String(scene.id)}`}
                </option>
              ))}
            </select>
          </div>
          <div style={editorStyles.buttonRow}>
            <button onClick={closePopovers} style={editorStyles.secondaryButton} type="button">
              Cancel
            </button>
            <button
              disabled={!pendingAdd.sceneId || readOnly}
              onClick={addPoint}
              style={{
                ...editorStyles.button,
                opacity: !pendingAdd.sceneId || readOnly ? 0.55 : 1,
              }}
              type="button"
            >
              Add
            </button>
          </div>
        </div>
      )
    }

    if (editing) {
      const point = points[editing.index]
      if (!point) {
        return null
      }

      const displayPoint = getDisplayPoint(point)

      const leftPct = Math.max(15, Math.min(85, (displayPoint.cx / SVG_WIDTH) * 100))
      return (
        <div
          style={{
            ...editorStyles.popover,
            left: `${leftPct}%`,
          }}
        >
          <p style={editorStyles.popoverTitle}>Edit map point</p>
          <div style={editorStyles.fieldGroup}>
            <p style={editorStyles.fieldLabel}>Scene</p>
            <select
              disabled={readOnly || scenesLoading || scenes.length === 0}
              onChange={(event) => setEditing((current) => (current ? { ...current, sceneId: event.target.value } : current))}
              style={editorStyles.input}
              value={editing.sceneId}
            >
              <option value="">Select a scene</option>
              {scenes.map((scene) => (
                <option key={String(scene.id)} value={String(scene.id)}>
                  {scene.title || scene.slug || `Scene ${String(scene.id)}`}
                </option>
              ))}
            </select>
          </div>
          <div style={editorStyles.fieldGroup}>
            <p style={editorStyles.fieldLabel}>Color</p>
            <input
              onChange={(event) => setEditing((current) => (current ? { ...current, color: event.target.value } : current))}
              placeholder="#E64626"
              style={editorStyles.input}
              type="text"
              value={editing.color}
            />
          </div>
          <div style={{ ...editorStyles.buttonRow, justifyContent: 'space-between' }}>
            <button onClick={deletePoint} style={editorStyles.dangerButton} type="button">
              Delete
            </button>
            <div style={editorStyles.buttonRow}>
              <button onClick={closePopovers} style={editorStyles.secondaryButton} type="button">
                Cancel
              </button>
              <button
                disabled={!editing.sceneId || readOnly}
                onClick={saveEdit}
                style={{
                  ...editorStyles.button,
                  opacity: !editing.sceneId || readOnly ? 0.55 : 1,
                }}
                type="button"
              >
                Save point
              </button>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div style={editorStyles.root}>
      <FieldLabel label={field.label || field.name} path={path} required={field.required} />
      <p style={editorStyles.helperText}>
        Drag markers to reposition them. Click the floorplan to add a marker, or click an existing marker to edit
        its scene and color.
      </p>

      <div style={editorStyles.panel}>
        {floorplanURL ? (
          <div style={editorStyles.mapShell}>
            <img alt="Floorplan" draggable={false} src={floorplanURL} style={editorStyles.image} />
            <svg
              onClick={() => {
                if (justDraggedRef.current) {
                  justDraggedRef.current = false
                }
              }}
              preserveAspectRatio="xMidYMid meet"
              ref={svgRef}
              style={editorStyles.overlay}
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            >
              <rect
                fill="transparent"
                height={SVG_HEIGHT}
                onClick={openAddPopover}
                width={SVG_WIDTH}
                x={0}
                y={0}
              />

              {points.map((point, index) => {
                const displayPoint = getDisplayPoint(point, localPositions[index])
                const sceneLabel = getSceneLabel(point.scene, scenesById)

                return (
                  <g key={`${path}-${index}`}>
                    <circle
                      cx={displayPoint.cx}
                      cy={displayPoint.cy}
                      fill={displayPoint.color}
                      onClick={() => {
                        if (justDraggedRef.current) {
                          justDraggedRef.current = false
                          return
                        }

                        openEditPopover(index)
                      }}
                      onPointerCancel={(event) => cancelDrag(index, event)}
                      onPointerDown={(event) => startDrag(index, event)}
                      onPointerMove={(event) => moveDrag(index, event)}
                      onPointerUp={(event) => finishDrag(index, event)}
                      r={34}
                      stroke="#111"
                      strokeWidth={draggingIndex === index ? 10 : 6}
                      style={{
                        cursor: readOnly ? 'default' : 'grab',
                        touchAction: 'none',
                      }}
                    />
                    <text
                      fill="#111"
                      fontFamily="system-ui, sans-serif"
                      fontSize={54}
                      fontWeight={700}
                      pointerEvents="none"
                      stroke="#fff"
                      strokeWidth={16}
                      x={displayPoint.cx + 54}
                      y={displayPoint.cy + 18}
                    >
                      {sceneLabel}
                    </text>
                  </g>
                )
              })}

              {pendingAdd && (
                <circle
                  cx={pendingAdd.cx}
                  cy={pendingAdd.cy}
                  fill="rgba(255,255,255,0.35)"
                  pointerEvents="none"
                  r={34}
                  stroke="#E64626"
                  strokeDasharray="30 15"
                  strokeWidth={10}
                />
              )}
            </svg>
            {renderPopover()}
          </div>
        ) : (
          <div style={editorStyles.emptyState}>
            {floorplanLoading ? 'Loading floorplan...' : 'Upload a floorplan image to start placing map points.'}
          </div>
        )}

        <div style={editorStyles.infoBar}>
          <span>{points.length} map point{points.length === 1 ? '' : 's'}</span>
          <span>{scenesLoading ? 'Loading scenes...' : `${scenes.length} scenes available`}</span>
        </div>
      </div>
    </div>
  )
}

export default MapPointsEditor
