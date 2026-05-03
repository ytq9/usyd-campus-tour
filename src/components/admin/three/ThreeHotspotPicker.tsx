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

export default function ThreeHotspotPicker({ path }: Props) {
  const basePath = path.replace(/\.visualPicker$/, '')
  const { value: pitch, setValue: setPitch } = useField<number | string | null>({ path: `${basePath}.pitch` })
  const { value: yaw, setValue: setYaw } = useField<number | string | null>({ path: `${basePath}.yaw` })
  const panoramaFieldValue = useFormFields(([fields]) => fields.panorama?.value as any)
  const panorama = useAdminPanoramaMedia(panoramaFieldValue)
  const [isOpen, setIsOpen] = useState(false)
  const [cursor, setCursor] = useState<PitchYaw | null>(null)
  const [draftPick, setDraftPick] = useState<PitchYaw | null>(null)
  const [lastWritten, setLastWritten] = useState<PitchYaw | null>(null)
  const [camera, setCamera] = useState<CameraState>({ pitch: 0, yaw: 0, hfov: 120 })

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
}
