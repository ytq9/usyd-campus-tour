'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useField, useFormFields } from '@payloadcms/ui'
import {
  clampInteractionPitch,
  normaliseYaw,
} from '@/components/tour/three/threePanoramaMath'
import type { CameraState, PitchYaw } from '@/components/tour/three/types'
import ThreeAdminPanoramaPicker from './ThreeAdminPanoramaPicker'
import { useAdminPanoramaMedia } from './useAdminPanoramaMedia'

type Props = {
  path: string
  [key: string]: unknown
}

type SceneSummary = {
  id: number | string
  title: string
  slug?: string
  panoramaUrl: string | null
}

const idOf = (v: unknown): string | null => {
  if (v == null) return null
  if (typeof v === 'object') return (v as { id?: number | string }).id != null ? String((v as { id: number | string }).id) : null
  return String(v)
}

export default function ThreeHotspotPicker({ path }: Props) {
  const basePath = path.replace(/\.visualPicker$/, '')
  const { value: pitch, setValue: setPitch } = useField<number | string | null>({ path: `${basePath}.pitch` })
  const { value: yaw, setValue: setYaw } = useField<number | string | null>({ path: `${basePath}.yaw` })
  const { value: hotspotType } = useField<string>({ path: `${basePath}.type` })
  const { value: targetScene, setValue: setTargetScene } = useField<number | string | { id: number | string } | null>({ path: `${basePath}.targetScene` })
  const panoramaFieldValue = useFormFields(([fields]) => fields.panorama?.value as any)
  const panorama = useAdminPanoramaMedia(panoramaFieldValue)
  const [isOpen, setIsOpen] = useState(false)
  const [cursor, setCursor] = useState<PitchYaw | null>(null)
  const [draftPick, setDraftPick] = useState<PitchYaw | null>(null)
  const [lastWritten, setLastWritten] = useState<PitchYaw | null>(null)
  const [camera, setCamera] = useState<CameraState>({ pitch: 0, yaw: 0, hfov: 120 })
  const [scenes, setScenes] = useState<SceneSummary[]>([])
  const [scenesError, setScenesError] = useState<string | null>(null)
  const [sceneSearch, setSceneSearch] = useState('')

  const fieldPoint = useMemo(() => {
    const fieldPitch = Number(pitch)
    const fieldYaw = Number(yaw)

    if (!Number.isFinite(fieldPitch) || !Number.isFinite(fieldYaw)) return null

    return {
      pitch: roundPickerValue(clampInteractionPitch(fieldPitch)),
      yaw: roundPickerValue(normaliseYaw(fieldYaw)),
    }
  }, [pitch, yaw])

  useEffect(() => {
    if (!fieldPoint) {
      setDraftPick(null)
      return
    }

    setDraftPick((current) => {
      if (current && Math.abs(current.pitch - fieldPoint.pitch) < 0.01 && Math.abs(current.yaw - fieldPoint.yaw) < 0.01) {
        return current
      }

      return fieldPoint
    })
  }, [fieldPoint])

  const commitPick = useCallback((coords: PitchYaw) => {
    const next = {
      pitch: roundPickerValue(clampInteractionPitch(coords.pitch)),
      yaw: roundPickerValue(normaliseYaw(coords.yaw)),
    }

    setDraftPick(next)
    setLastWritten(next)
    setPitch(next.pitch)
    setYaw(next.yaw)
  }, [setPitch, setYaw])

  const handleMarkerDrag = useCallback((coords: PitchYaw) => {
    setDraftPick({
      pitch: roundPickerValue(clampInteractionPitch(coords.pitch)),
      yaw: roundPickerValue(normaliseYaw(coords.yaw)),
    })
  }, [])

  const initialCamera = useMemo(() => ({
    pitch: fieldPoint?.pitch ?? 0,
    yaw: fieldPoint?.yaw ?? 0,
    hfov: 100,
  }), [fieldPoint])

  const markerPoint = draftPick || fieldPoint

  const isPortal = hotspotType === 'scene'

  useEffect(() => {
    if (!isOpen || !isPortal || scenes.length > 0) return

    let cancelled = false
    fetch('/api/scenes?limit=200&depth=1')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        const docs = Array.isArray(data?.docs) ? data.docs : []
        setScenes(docs.map((s: any) => ({
          id: s.id,
          title: s.title || s.slug || `Scene ${s.id}`,
          slug: s.slug,
          panoramaUrl: s.panorama?.url || null,
        })))
        setScenesError(null)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setScenesError(err instanceof Error ? err.message : 'Failed to load scenes')
      })

    return () => { cancelled = true }
  }, [isOpen, isPortal, scenes.length])

  const targetSceneId = idOf(targetScene)
  const selectedScene = useMemo(
    () => (targetSceneId ? scenes.find((s) => String(s.id) === targetSceneId) ?? null : null),
    [targetSceneId, scenes],
  )

  const filteredScenes = useMemo(() => {
    const q = sceneSearch.trim().toLowerCase()
    if (!q) return scenes
    return scenes.filter((s) =>
      s.title.toLowerCase().includes(q) || (s.slug || '').toLowerCase().includes(q),
    )
  }, [scenes, sceneSearch])

  const handlePickScene = useCallback((sceneId: number | string) => {
    const num = Number(sceneId)
    setTargetScene(Number.isNaN(num) ? sceneId : num)
  }, [setTargetScene])

  const handleClearScene = useCallback(() => {
    setTargetScene(null)
  }, [setTargetScene])

  return (
    <div style={styles.panel}>
      <div style={styles.toolbar}>
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          style={{
            ...styles.primaryButton,
            background: isOpen ? '#475467' : '#1a6ef5',
          }}
        >
          {isOpen ? 'Close Three.js Placement Tool' : 'Open Three.js Placement Tool'}
        </button>

        <span style={styles.fieldSummary}>
          Current Payload field: pitch {formatMaybePointValue(fieldPoint?.pitch)} / yaw {formatMaybePointValue(fieldPoint?.yaw)}
        </span>
      </div>

      {isOpen && (
        <div style={styles.toolShell}>
          {panorama.status === 'loading' && (
            <p style={styles.helperText}>Loading selected panorama...</p>
          )}

          {panorama.status === 'error' && (
            <p style={styles.errorText}>{panorama.error.message}</p>
          )}

          <ThreeAdminPanoramaPicker
            panoramaUrl={panorama.panoramaUrl}
            initialCamera={initialCamera}
            resetKey={`${panorama.panoramaUrl || 'empty'}:${initialCamera.pitch}:${initialCamera.yaw}:${initialCamera.hfov}`}
            selectedPitch={markerPoint?.pitch}
            selectedYaw={markerPoint?.yaw}
            markerTone="hotspot"
            markerLabel="Hotspot"
            markerDraggable={Boolean(markerPoint)}
            enableClickPick
            height={390}
            onCameraChange={setCamera}
            onCursorChange={setCursor}
            onPick={(coords) => commitPick(coords)}
            onMarkerDrag={handleMarkerDrag}
            onMarkerDragEnd={(coords) => commitPick(coords)}
          />

          {isPortal && (
            <div style={styles.targetSection}>
              <div style={styles.targetHeader}>
                <span style={styles.targetTitle}>Target scene</span>
                <span style={styles.targetCount}>
                  {scenes.length} scene{scenes.length === 1 ? '' : 's'}
                </span>
              </div>

              {scenesError ? (
                <p style={styles.errorText}>Could not load scenes: {scenesError}</p>
              ) : null}

              <div
                style={{
                  ...styles.selectedCard,
                  borderColor: selectedScene ? '#1a6ef5' : '#d0d5dd',
                  background: selectedScene ? '#eff4ff' : '#f9fafb',
                }}
              >
                {selectedScene ? (
                  <>
                    {selectedScene.panoramaUrl ? (
                      <img
                        src={selectedScene.panoramaUrl}
                        alt={selectedScene.title}
                        style={styles.selectedPreview}
                      />
                    ) : (
                      <div style={styles.selectedPreviewEmpty}>No preview</div>
                    )}
                    <div style={styles.selectedMeta}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={styles.selectedLabel}>Selected</div>
                        <div style={styles.selectedTitle}>{selectedScene.title}</div>
                      </div>
                      <button type="button" onClick={handleClearScene} style={styles.clearButton}>
                        Clear
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={styles.selectedEmpty}>
                    {targetSceneId
                      ? `Selected scene #${targetSceneId} not in list`
                      : 'No scene selected — pick one below'}
                  </div>
                )}
              </div>

              <input
                type="text"
                value={sceneSearch}
                onChange={(e) => setSceneSearch(e.target.value)}
                placeholder={`Search ${scenes.length} scene${scenes.length === 1 ? '' : 's'}...`}
                style={styles.searchInput}
              />

              <div style={styles.thumbGrid}>
                {filteredScenes.length === 0 ? (
                  <div style={styles.thumbEmpty}>
                    {scenes.length === 0 ? 'Loading scenes...' : `No scenes match "${sceneSearch}"`}
                  </div>
                ) : filteredScenes.map((s) => {
                  const isSelected = String(s.id) === targetSceneId
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handlePickScene(s.id)}
                      title={s.title}
                      style={{
                        ...styles.thumbButton,
                        borderColor: isSelected ? '#1a6ef5' : '#e4e7ec',
                        boxShadow: isSelected ? '0 0 0 2px rgba(26,110,245,0.25)' : 'none',
                      }}
                    >
                      <div style={styles.thumbImageWrap}>
                        {s.panoramaUrl ? (
                          <img src={s.panoramaUrl} alt={s.title} style={styles.thumbImage} />
                        ) : (
                          <div style={styles.thumbImageEmpty}>No image</div>
                        )}
                        {isSelected && <div style={styles.thumbCheck}>OK</div>}
                      </div>
                      <div
                        style={{
                          ...styles.thumbCaption,
                          color: isSelected ? '#1d2939' : '#475467',
                          fontWeight: isSelected ? 600 : 400,
                        }}
                      >
                        {s.title}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {!isPortal && hotspotType === 'info' && (
            <p style={styles.infoNote}>
              Info hotspots: edit the rich text body in the Info Content field below.
            </p>
          )}

          <div style={styles.debugGrid}>
            <DebugValue label="panorama URL" value={panorama.panoramaUrl || '(none)'} />
            <DebugValue label="current field pitch/yaw" value={formatPoint(fieldPoint)} />
            <DebugValue label="live cursor pitch/yaw" value={formatPoint(cursor)} />
            <DebugValue label="picked pitch/yaw" value={formatPoint(markerPoint)} />
            <DebugValue label="last saved pitch/yaw" value={formatPoint(lastWritten)} />
            <DebugValue label="current camera" value={`pitch ${formatNumber(camera.pitch)} / yaw ${formatNumber(camera.yaw)} / hfov ${formatNumber(camera.hfov)}`} />
          </div>

          <p style={styles.saveNote}>
            After updating coordinates, click Save Draft or Publish for public viewer changes.
          </p>
        </div>
      )}
    </div>
  )
}

function DebugValue({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span style={styles.debugLabel}>{label}</span>
      <span style={styles.debugValue}>{value}</span>
    </>
  )
}

function roundPickerValue(value: number) {
  return Math.round(value * 100) / 100
}

function formatNumber(value: number) {
  return Number.isFinite(value) ? value.toFixed(2) : '(none)'
}

function formatMaybePointValue(value: number | undefined) {
  return typeof value === 'number' ? formatNumber(value) : '(none)'
}

function formatPoint(point: PitchYaw | null | undefined) {
  if (!point) return '(none)'
  return `pitch ${formatNumber(point.pitch)} / yaw ${formatNumber(point.yaw)}`
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    margin: '8px 0',
  },
  toolbar: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
  },
  primaryButton: {
    border: 'none',
    borderRadius: 4,
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    padding: '6px 14px',
  },
  fieldSummary: {
    color: '#667085',
    fontSize: 12,
  },
  toolShell: {
    border: '1px solid #344054',
    borderRadius: 8,
    marginTop: 8,
    overflow: 'hidden',
    padding: 10,
  },
  helperText: {
    color: '#667085',
    fontSize: 13,
    margin: '0 0 8px',
  },
  errorText: {
    color: '#b42318',
    fontSize: 13,
    margin: '0 0 8px',
  },
  debugGrid: {
    display: 'grid',
    gap: '4px 10px',
    gridTemplateColumns: '150px minmax(0, 1fr)',
    marginTop: 10,
  },
  debugLabel: {
    color: '#667085',
    fontSize: 12,
  },
  debugValue: {
    color: '#1d2939',
    fontSize: 12,
    overflowWrap: 'anywhere',
  },
  saveNote: {
    background: '#fff7ed',
    border: '1px solid #fed7aa',
    borderRadius: 6,
    color: '#9a3412',
    fontSize: 13,
    margin: '10px 0 0',
    padding: '8px 10px',
  },
  targetSection: {
    border: '1px solid #e4e7ec',
    borderRadius: 6,
    marginTop: 10,
    padding: 10,
    background: '#ffffff',
  },
  targetHeader: {
    alignItems: 'baseline',
    display: 'flex',
    gap: 8,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  targetTitle: {
    color: '#1d2939',
    fontSize: 13,
    fontWeight: 600,
  },
  targetCount: {
    color: '#667085',
    fontSize: 11,
  },
  selectedCard: {
    border: '1px solid #d0d5dd',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  selectedPreview: {
    background: '#000',
    display: 'block',
    height: 90,
    objectFit: 'cover',
    width: '100%',
  },
  selectedPreviewEmpty: {
    alignItems: 'center',
    color: '#98a2b3',
    display: 'flex',
    fontSize: 12,
    height: 90,
    justifyContent: 'center',
  },
  selectedMeta: {
    alignItems: 'center',
    display: 'flex',
    gap: 8,
    justifyContent: 'space-between',
    padding: '6px 10px',
  },
  selectedLabel: {
    color: '#1a6ef5',
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  selectedTitle: {
    color: '#1d2939',
    fontSize: 13,
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  selectedEmpty: {
    color: '#667085',
    fontSize: 12,
    padding: '14px 10px',
    textAlign: 'center',
  },
  clearButton: {
    background: '#ffffff',
    border: '1px solid #d0d5dd',
    borderRadius: 4,
    color: '#475467',
    cursor: 'pointer',
    flexShrink: 0,
    fontSize: 11,
    padding: '4px 8px',
  },
  searchInput: {
    border: '1px solid #d0d5dd',
    borderRadius: 4,
    boxSizing: 'border-box',
    color: '#1d2939',
    fontSize: 12,
    marginBottom: 8,
    padding: '6px 8px',
    width: '100%',
  },
  thumbGrid: {
    background: '#f9fafb',
    border: '1px solid #e4e7ec',
    borderRadius: 4,
    display: 'grid',
    gap: 6,
    gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
    maxHeight: 240,
    overflowY: 'auto',
    padding: 6,
  },
  thumbEmpty: {
    color: '#98a2b3',
    fontSize: 12,
    gridColumn: '1 / -1',
    padding: '20px 8px',
    textAlign: 'center',
  },
  thumbButton: {
    background: '#ffffff',
    border: '1px solid #e4e7ec',
    borderRadius: 4,
    cursor: 'pointer',
    overflow: 'hidden',
    padding: 0,
    textAlign: 'left',
  },
  thumbImageWrap: {
    background: '#000',
    height: 60,
    position: 'relative',
    width: '100%',
  },
  thumbImage: {
    display: 'block',
    height: '100%',
    objectFit: 'cover',
    width: '100%',
  },
  thumbImageEmpty: {
    alignItems: 'center',
    color: '#475467',
    display: 'flex',
    fontSize: 10,
    height: '100%',
    justifyContent: 'center',
  },
  thumbCheck: {
    alignItems: 'center',
    background: '#1a6ef5',
    borderRadius: '50%',
    boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
    color: '#ffffff',
    display: 'flex',
    fontSize: 9,
    fontWeight: 700,
    height: 18,
    justifyContent: 'center',
    position: 'absolute',
    right: 4,
    top: 4,
    width: 18,
  },
  thumbCaption: {
    fontSize: 11,
    overflow: 'hidden',
    padding: '4px 6px',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  infoNote: {
    background: '#eef4ff',
    border: '1px solid #b6d4fe',
    borderRadius: 6,
    color: '#1f4ea1',
    fontSize: 12,
    margin: '10px 0 0',
    padding: '8px 10px',
  },
}
