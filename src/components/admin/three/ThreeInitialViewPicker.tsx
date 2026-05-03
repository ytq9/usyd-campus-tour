'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useField, useFormFields } from '@payloadcms/ui'
import {
  clampHfov,
  clampInteractionPitch,
  normaliseYaw,
} from '@/components/tour/three/threePanoramaMath'
import type { CameraState } from '@/components/tour/three/types'
import ThreeAdminPanoramaPicker from './ThreeAdminPanoramaPicker'
import {
  formatDimensions,
  isValidEquirectangular,
  type AdminMediaDoc,
  useAdminPanoramaMedia,
} from './useAdminPanoramaMedia'

type ValidationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'invalid'; message: string; media: AdminMediaDoc | null }
  | { status: 'valid'; message: string; media: AdminMediaDoc }

export default function ThreeInitialViewPicker() {
  const { value, setValue } = useField<number | string | AdminMediaDoc | null>({ path: 'panorama' })
  const { value: initialYaw, setValue: setInitialYaw } = useField<number | string | null>({ path: 'initialYaw' })
  const { value: initialPitch, setValue: setInitialPitch } = useField<number | string | null>({ path: 'initialPitch' })
  const { value: initialHfov, setValue: setInitialHfov } = useField<number | string | null>({ path: 'initialHfov' })
  const rotation = useFormFields(([fields]) => fields.rotation?.value as number | string | null | undefined)
  const panorama = useAdminPanoramaMedia(value, { requireMetadata: true })
  const [validation, setValidation] = useState<ValidationState>({ status: 'idle' })
  const [modalMessage, setModalMessage] = useState<string | null>(null)
  const [lastRejectedId, setLastRejectedId] = useState<number | string | null>(null)
  const [camera, setCamera] = useState<CameraState>(() => getFieldCamera(initialPitch, initialYaw, initialHfov))
  const [lastWritten, setLastWritten] = useState<CameraState | null>(null)

  const fieldCamera = useMemo(() => (
    getFieldCamera(initialPitch, initialYaw, initialHfov)
  ), [initialHfov, initialPitch, initialYaw])

  useEffect(() => {
    if (panorama.status === 'idle') {
      setValidation({ status: 'idle' })
      return
    }

    if (panorama.status === 'loading') {
      setValidation({ status: 'loading' })
      return
    }

    if (panorama.status === 'error') {
      setValidation({ status: 'error', message: panorama.error.message })
      return
    }

    const width = panorama.media.width ?? undefined
    const height = panorama.media.height ?? undefined

    if (!isValidEquirectangular(width, height)) {
      if (panorama.panoramaId !== lastRejectedId) {
        setModalMessage(
          `The selected file cannot be used as a scene panorama. A valid 360 panorama must be an equirectangular image with a 2:1 aspect ratio, but this file is ${formatDimensions(width, height)}.`,
        )
        setLastRejectedId(panorama.panoramaId)
      }

      setValue(null)
      setValidation({
        status: 'invalid',
        media: panorama.media,
        message: `This image is not a valid 360 panorama. Expected a 2:1 equirectangular image, but received ${formatDimensions(width, height)}.`,
      })
      return
    }

    setValidation({
      status: 'valid',
      media: panorama.media,
      message: `Valid 360 panorama detected (${formatDimensions(width, height)}). Three.js preview ready.`,
    })
  }, [lastRejectedId, panorama, setValue])

  useEffect(() => {
    setCamera(fieldCamera)
  }, [fieldCamera])

  const handleUseCurrentView = useCallback(() => {
    const next = {
      pitch: roundPickerValue(clampInteractionPitch(camera.pitch)),
      yaw: roundPickerValue(normaliseYaw(camera.yaw)),
      hfov: roundPickerValue(clampHfov(camera.hfov)),
    }

    setInitialPitch(next.pitch)
    setInitialYaw(next.yaw)
    setInitialHfov(next.hfov)
    setLastWritten(next)
  }, [camera, setInitialHfov, setInitialPitch, setInitialYaw])

  const numericRotation = Number(rotation)
  const hasRotation = Number.isFinite(numericRotation) && numericRotation !== 0

  if (!value) {
    return (
      <>
        <div style={styles.panel}>
          <strong style={styles.title}>Initial Viewpoint</strong>
        </div>
        {modalMessage && (
          <ValidationModal
            message={modalMessage}
            onClose={() => setModalMessage(null)}
          />
        )}
      </>
    )
  }

  return (
    <>
      <div style={styles.panel}>
        <strong style={styles.title}>Initial Viewpoint</strong>

        {validation.status === 'loading' && (
          <p style={styles.helperText}>Validating the selected image and preparing the Three.js preview...</p>
        )}

        {validation.status === 'error' && (
          <p style={styles.errorText}>{validation.message}</p>
        )}

        {validation.status === 'invalid' && (
          <p style={styles.errorText}>{validation.message}</p>
        )}

        {validation.status === 'valid' && (
          <>
            <p style={styles.successText}>{validation.message}</p>

            <ThreeAdminPanoramaPicker
              panoramaUrl={panorama.panoramaUrl}
              initialCamera={fieldCamera}
              resetKey={`${panorama.panoramaUrl || 'empty'}:${fieldCamera.pitch}:${fieldCamera.yaw}:${fieldCamera.hfov}`}
              selectedPitch={fieldCamera.pitch}
              selectedYaw={fieldCamera.yaw}
              markerTone="initial"
              markerLabel="Saved initial view"
              showCenterReticle
              height="min(420px, 52vw)"
              onCameraChange={setCamera}
            />

            <div style={styles.actionRow}>
              <button type="button" onClick={handleUseCurrentView} style={styles.primaryButton}>
                Use Current View as Initial View
              </button>
              <span style={styles.fieldSummary}>
                Current camera: pitch {formatNumber(camera.pitch)} / yaw {formatNumber(camera.yaw)} / hfov {formatNumber(camera.hfov)}
              </span>
            </div>

            <div style={styles.debugGrid}>
              <DebugValue label="panorama URL" value={panorama.panoramaUrl || '(none)'} />
              <DebugValue label="current field pitch/yaw/hfov" value={formatCamera(fieldCamera)} />
              <DebugValue label="current camera pitch/yaw/hfov" value={formatCamera(camera)} />
              <DebugValue label="last saved pitch/yaw/hfov" value={formatCamera(lastWritten)} />
              <DebugValue label="scene rotation" value={hasRotation ? `${formatNumber(numericRotation)} ignored by this picker` : '0 ignored'} />
            </div>

            {hasRotation && (
              <p style={styles.rotationNote}>
                This prototype saves raw camera values and ignores scene rotation. The public initial camera path still applies rotation before display.
              </p>
            )}

            <p style={styles.saveNote}>
              After updating coordinates, click Save Draft or Publish for public viewer changes.
            </p>
          </>
        )}
      </div>

      {modalMessage && (
        <ValidationModal
          message={modalMessage}
          onClose={() => setModalMessage(null)}
        />
      )}
    </>
  )
}

function ValidationModal({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div style={styles.modalOverlay} role="alertdialog" aria-modal="true" aria-labelledby="panorama-validation-title">
      <div style={styles.modal}>
        <h3 id="panorama-validation-title" style={styles.modalTitle}>
          Invalid 360 Panorama
        </h3>
        <p style={styles.modalText}>{message}</p>
        <p style={styles.modalHint}>
          This file has been removed from the Scene. Upload or select a valid 2:1 panorama before saving.
        </p>
        <button type="button" onClick={onClose} style={styles.modalButton}>
          Close
        </button>
      </div>
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

function getFieldCamera(
  pitch: number | string | null | undefined,
  yaw: number | string | null | undefined,
  hfov: number | string | null | undefined,
): CameraState {
  return {
    pitch: roundPickerValue(clampInteractionPitch(numberOrFallback(pitch, 0))),
    yaw: roundPickerValue(normaliseYaw(numberOrFallback(yaw, 0))),
    hfov: roundPickerValue(clampHfov(numberOrFallback(hfov, 120))),
  }
}

function numberOrFallback(value: number | string | null | undefined, fallback: number) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : fallback
}

function roundPickerValue(value: number) {
  return Math.round(value * 100) / 100
}

function formatNumber(value: number) {
  return Number.isFinite(value) ? value.toFixed(2) : '(none)'
}

function formatCamera(camera: CameraState | null | undefined) {
  if (!camera) return '(none)'
  return `pitch ${formatNumber(camera.pitch)} / yaw ${formatNumber(camera.yaw)} / hfov ${formatNumber(camera.hfov)}`
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    background: 'transparent',
    borderRadius: 12,
    marginTop: 12,
    padding: 16,
  },
  title: {
    color: '#9ba3af',
    display: 'block',
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 8,
  },
  helperText: {
    color: '#52606d',
    lineHeight: 1.6,
    margin: 0,
  },
  errorText: {
    color: '#b42318',
    lineHeight: 1.6,
    margin: '0 0 8px',
  },
  successText: {
    color: '#027a48',
    lineHeight: 1.6,
    margin: '0 0 12px',
  },
  actionRow: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px 12px',
    marginTop: 10,
  },
  primaryButton: {
    background: '#1a6ef5',
    border: 'none',
    borderRadius: 6,
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    padding: '8px 12px',
  },
  fieldSummary: {
    color: '#475467',
    fontSize: 13,
  },
  debugGrid: {
    display: 'grid',
    gap: '4px 10px',
    gridTemplateColumns: '180px minmax(0, 1fr)',
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
  rotationNote: {
    background: '#eff8ff',
    border: '1px solid #b2ddff',
    borderRadius: 6,
    color: '#175cd3',
    fontSize: 13,
    margin: '10px 0 0',
    padding: '8px 10px',
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
  modalOverlay: {
    alignItems: 'center',
    background: 'rgba(16, 24, 40, 0.62)',
    display: 'flex',
    inset: 0,
    justifyContent: 'center',
    padding: 24,
    position: 'fixed',
    zIndex: 9999,
  },
  modal: {
    background: '#fff5f5',
    border: '2px solid #d92d20',
    borderRadius: 14,
    boxShadow: '0 24px 48px rgba(16, 24, 40, 0.18)',
    padding: 24,
    width: 'min(560px, 100%)',
  },
  modalTitle: {
    color: '#b42318',
    fontSize: 22,
    fontWeight: 700,
    margin: '0 0 12px',
  },
  modalText: {
    color: '#b42318',
    fontSize: 16,
    lineHeight: 1.7,
    margin: '0 0 10px',
  },
  modalHint: {
    color: '#7a271a',
    lineHeight: 1.7,
    margin: '0 0 18px',
  },
  modalButton: {
    background: '#d92d20',
    border: 'none',
    borderRadius: 10,
    color: '#ffffff',
    cursor: 'pointer',
    fontWeight: 600,
    padding: '10px 16px',
  },
}
