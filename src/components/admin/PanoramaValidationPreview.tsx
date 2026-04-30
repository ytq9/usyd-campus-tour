'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useField } from '@payloadcms/ui'

type MediaDoc = {
  id: number | string
  url?: string | null
  filename?: string | null
  mimeType?: string | null
  width?: number | null
  height?: number | null
}

type ValidationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'invalid'; message: string; media: MediaDoc | null }
  | { status: 'valid'; message: string; media: MediaDoc }

type PannellumViewer = {
  addHotSpot?: (config: Record<string, unknown>) => void
  destroy?: () => void
  getHfov?: () => number
  mouseEventToCoords?: (event: { clientX: number; clientY: number }) => [number, number] | false | null
  removeHotSpot?: (id: string) => void
}

const INITIAL_CAMERA_MARKER_ID = 'initial-camera-marker'
const CLICK_DRAG_THRESHOLD_PX = 6

const isValidEquirectangular = (width?: number | null, height?: number | null) => {
  if (!width || !height) return false
  return width === height * 2
}

const formatDimensions = (width?: number | null, height?: number | null) => {
  if (!width || !height) return 'unknown dimensions'
  return `${width}x${height}`
}

const roundCameraValue = (value: number) => Math.round(value * 100) / 100

const numberOrFallback = (value: number | string | null | undefined, fallback: number) => {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : fallback
}

const clampPitch = (pitch: number) => Math.max(-90, Math.min(90, pitch))

const clampHfov = (hfov: number) => Math.max(1, Math.min(180, hfov))

const getInitialCameraHotspot = (pitch: number, yaw: number) => ({
  id: INITIAL_CAMERA_MARKER_ID,
  pitch,
  yaw,
  type: 'info',
  text: `Initial view: pitch ${pitch.toFixed(1)}°, yaw ${yaw.toFixed(1)}°`,
  cssClass: 'initial-camera-marker',
})

const isViewerControlTarget = (target: EventTarget | null) => {
  if (!(target instanceof Element)) return false

  return Boolean(
    target.closest(
      '.pnlm-controls-container, .pnlm-control, .pnlm-load-box, .pnlm-error-msg, .pnlm-about-msg, .initial-camera-marker',
    ),
  )
}

export default function PanoramaValidationPreview() {
  const { value, setValue } = useField<number | string | MediaDoc | null>({ path: 'panorama' })
  const { value: initialYaw, setValue: setInitialYaw } = useField<number | string | null>({ path: 'initialYaw' })
  const { value: initialPitch, setValue: setInitialPitch } = useField<number | string | null>({ path: 'initialPitch' })
  const { value: initialHfov, setValue: setInitialHfov } = useField<number | string | null>({ path: 'initialHfov' })
  const viewerRef = useRef<HTMLDivElement>(null)
  const pannellumRef = useRef<PannellumViewer | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const suppressNextClickRef = useRef(false)
  const [state, setState] = useState<ValidationState>({ status: 'idle' })
  const [modalMessage, setModalMessage] = useState<string | null>(null)
  const [lastRejectedId, setLastRejectedId] = useState<number | string | null>(null)

  const panoramaId = useMemo(() => {
    if (!value) return null
    return typeof value === 'object' ? value.id : value
  }, [value])

  const currentCamera = useMemo(() => ({
    hfov: roundCameraValue(clampHfov(numberOrFallback(initialHfov, 120))),
    pitch: roundCameraValue(clampPitch(numberOrFallback(initialPitch, 0))),
    yaw: roundCameraValue(numberOrFallback(initialYaw, 0)),
  }), [initialHfov, initialPitch, initialYaw])
  const currentCameraRef = useRef(currentCamera)

  useEffect(() => {
    currentCameraRef.current = currentCamera
  }, [currentCamera])

  function setupMarkerDrag(markerElement: Element) {
    const viewer = pannellumRef.current
    const viewerElement = viewerRef.current

    if (!viewer || !viewerElement || typeof viewer.mouseEventToCoords !== 'function') return

    const marker = markerElement as HTMLElement
    if (marker.dataset.initialCameraDragBound === 'true') return
    marker.dataset.initialCameraDragBound = 'true'

    marker.addEventListener('click', (event) => {
      event.stopPropagation()
    })

    marker.addEventListener('mousedown', (event) => {
      event.preventDefault()
      event.stopPropagation()

      const viewerRect = viewerElement.getBoundingClientRect()
      const markerRect = marker.getBoundingClientRect()
      const startX = markerRect.left - viewerRect.left + markerRect.width / 2
      const startY = markerRect.top - viewerRect.top + markerRect.height / 2

      if (overlayRef.current) {
        overlayRef.current.style.display = 'block'
        overlayRef.current.style.left = `${startX}px`
        overlayRef.current.style.top = `${startY}px`
      }

      marker.style.opacity = '0'

      let lastClientX = event.clientX
      let lastClientY = event.clientY
      let hasMoved = false

      const handleMouseMove = (moveEvent: MouseEvent) => {
        lastClientX = moveEvent.clientX
        lastClientY = moveEvent.clientY
        hasMoved = true

        if (overlayRef.current) {
          const currentViewerRect = viewerElement.getBoundingClientRect()
          overlayRef.current.style.left = `${moveEvent.clientX - currentViewerRect.left}px`
          overlayRef.current.style.top = `${moveEvent.clientY - currentViewerRect.top}px`
        }
      }

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)

        if (overlayRef.current) {
          overlayRef.current.style.display = 'none'
        }

        if (!hasMoved) {
          marker.style.opacity = '1'
          return
        }

        const coords = viewer.mouseEventToCoords?.({ clientX: lastClientX, clientY: lastClientY })
        if (!coords || !Number.isFinite(coords[0]) || !Number.isFinite(coords[1])) {
          marker.style.opacity = '1'
          return
        }

        const newPitch = roundCameraValue(clampPitch(coords[0]))
        const newYaw = roundCameraValue(coords[1])
        const currentHfov = typeof viewer.getHfov === 'function' ? viewer.getHfov() : currentCameraRef.current.hfov
        const newHfov = roundCameraValue(clampHfov(currentHfov))

        currentCameraRef.current = { hfov: newHfov, pitch: newPitch, yaw: newYaw }
        suppressNextClickRef.current = true
        setInitialPitch(newPitch)
        setInitialYaw(newYaw)
        setInitialHfov(newHfov)
        placeInitialCameraMarker(newPitch, newYaw)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    })
  }

  const placeInitialCameraMarker = useCallback((pitch: number, yaw: number) => {
    const viewer = pannellumRef.current
    if (!viewer?.addHotSpot) return

    try {
      viewer.removeHotSpot?.(INITIAL_CAMERA_MARKER_ID)
    } catch {}

    try {
      viewer.addHotSpot?.(getInitialCameraHotspot(pitch, yaw))
      window.setTimeout(() => {
        const markerElement = viewerRef.current?.querySelector('.initial-camera-marker')
        if (markerElement) {
          setupMarkerDrag(markerElement)
        }
      }, 80)
    } catch {}
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let isActive = true

    const loadMedia = async () => {
      if (!panoramaId) {
        setState({ status: 'idle' })
        return
      }

      setState({ status: 'loading' })

      try {
        const response = await fetch(`/api/media/${panoramaId}`)

        if (!response.ok) {
          throw new Error('Unable to load the selected image for validation.')
        }

        const media = (await response.json()) as MediaDoc
        if (!isActive) return

        const width = media.width ?? undefined
        const height = media.height ?? undefined

        if (!isValidEquirectangular(width, height)) {
          if (panoramaId !== lastRejectedId) {
            setModalMessage(
              `The selected file cannot be used as a scene panorama. A valid 360° panorama must be an equirectangular image with a 2:1 aspect ratio, but this file is ${formatDimensions(width, height)}.`
            )
            setLastRejectedId(panoramaId)
          }

          setValue(null)
          setState({
            status: 'invalid',
            media,
            message: `This image is not a valid 360° panorama. Expected a 2:1 equirectangular image, but received ${formatDimensions(width, height)}.`,
          })
          return
        }

        setState({
          status: 'valid',
          media,
          message: `Valid 360° panorama detected (${formatDimensions(width, height)}). Interactive preview ready.`,
        })
      } catch (error) {
        if (!isActive) return

        setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Unable to validate the selected image.',
        })
      }
    }

    void loadMedia()

    return () => {
      isActive = false
    }
  }, [lastRejectedId, panoramaId, setValue])

  useEffect(() => {
    let isCancelled = false
    let removeEventListeners: (() => void) | null = null

    const renderViewer = async () => {
      if (state.status !== 'valid' || !state.media.url || !viewerRef.current) {
        removeEventListeners?.()
        removeEventListeners = null
        if (pannellumRef.current?.destroy) {
          pannellumRef.current.destroy()
          pannellumRef.current = null
        }
        return
      }

      await import('pannellum/build/pannellum.css')
      await import('pannellum/build/pannellum.js')

      if (isCancelled || !(window as any).pannellum || !viewerRef.current) return

      removeEventListeners?.()
      removeEventListeners = null
      if (pannellumRef.current?.destroy) {
        pannellumRef.current.destroy()
      }

      const viewerElement = viewerRef.current
      const initCamera = currentCameraRef.current
      const viewer = (window as any).pannellum.viewer(viewerElement, {
        type: 'equirectangular',
        panorama: state.media.url,
        autoLoad: true,
        showControls: true,
        compass: false,
        pitch: initCamera.pitch,
        yaw: initCamera.yaw,
        hfov: initCamera.hfov,
        hotSpots: [getInitialCameraHotspot(initCamera.pitch, initCamera.yaw)],
      }) as PannellumViewer

      pannellumRef.current = viewer
      window.setTimeout(() => {
        const markerElement = viewerElement.querySelector('.initial-camera-marker')
        if (markerElement) {
          setupMarkerDrag(markerElement)
        }
      }, 600)

      let pointerStart: { x: number; y: number } | null = null

      const handlePointerDown = (event: PointerEvent) => {
        pointerStart = { x: event.clientX, y: event.clientY }
      }

      const handleClick = (event: MouseEvent) => {
        if (suppressNextClickRef.current) {
          suppressNextClickRef.current = false
          return
        }

        if (isViewerControlTarget(event.target) || typeof viewer.mouseEventToCoords !== 'function') {
          return
        }

        if (pointerStart) {
          const distance = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y)
          if (distance > CLICK_DRAG_THRESHOLD_PX) {
            return
          }
        }

        const coords = viewer.mouseEventToCoords(event)
        if (!coords || !Number.isFinite(coords[0]) || !Number.isFinite(coords[1])) {
          return
        }

        const newPitch = roundCameraValue(clampPitch(coords[0]))
        const newYaw = roundCameraValue(coords[1])
        const currentHfov = typeof viewer.getHfov === 'function' ? viewer.getHfov() : currentCameraRef.current.hfov
        const newHfov = roundCameraValue(clampHfov(currentHfov))

        currentCameraRef.current = { hfov: newHfov, pitch: newPitch, yaw: newYaw }
        setInitialPitch(newPitch)
        setInitialYaw(newYaw)
        setInitialHfov(newHfov)
        placeInitialCameraMarker(newPitch, newYaw)
      }

      viewerElement.addEventListener('pointerdown', handlePointerDown)
      viewerElement.addEventListener('click', handleClick)
      removeEventListeners = () => {
        viewerElement.removeEventListener('pointerdown', handlePointerDown)
        viewerElement.removeEventListener('click', handleClick)
      }
    }

    void renderViewer()

    return () => {
      isCancelled = true
      removeEventListeners?.()
      if (pannellumRef.current?.destroy) {
        pannellumRef.current.destroy()
        pannellumRef.current = null
      }
    }
  }, [placeInitialCameraMarker, setInitialHfov, setInitialPitch, setInitialYaw, state])

  useEffect(() => {
    const viewer = pannellumRef.current
    if (!viewer) return

    placeInitialCameraMarker(currentCamera.pitch, currentCamera.yaw)
  }, [currentCamera, placeInitialCameraMarker])

  if (!panoramaId) {
    return (
      <>
        <div style={panelStyle}>
          <strong style={titleStyle}>360 Panorama Validation</strong>
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
      <div style={panelStyle}>
        <strong style={titleStyle}>Initial Viewpoint</strong>

        {state.status === 'loading' && (
          <p style={helperStyle}>Validating the selected image and preparing the preview...</p>
        )}

        {state.status === 'error' && <p style={errorStyle}>{state.message}</p>}

        {state.status === 'invalid' && (
          <p style={errorStyle}>{state.message}</p>
        )}

        {state.status === 'valid' && (
          <>
            <p style={successStyle}>{state.message}</p>
            <style>{`
              .initial-camera-marker {
                width: 22px !important;
                height: 22px !important;
                background: radial-gradient(circle at 35% 35%, #93c5fd, #2563eb) !important;
                border: 3px solid #fff !important;
                border-radius: 50% !important;
                box-shadow: 0 0 0 2px #2563eb, 0 2px 8px rgba(0, 0, 0, 0.42) !important;
                cursor: grab !important;
                margin-left: -11px !important;
                margin-top: -11px !important;
              }
              .initial-camera-marker:active {
                cursor: grabbing !important;
              }
            `}</style>
            <div style={cameraHintStyle}>
              <span>Click the preview to place the initial camera point, or drag the blue point to adjust it.</span>
              <span>
                Pitch {currentCamera.pitch.toFixed(1)}° · Yaw {currentCamera.yaw.toFixed(1)}° · Hfov {currentCamera.hfov.toFixed(1)}°
              </span>
            </div>
            <div style={viewerShellStyle}>
              <div ref={viewerRef} style={viewerStyle} />
              <div ref={overlayRef} style={overlayMarkerStyle} />
            </div>
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
    <div style={modalOverlayStyle} role="alertdialog" aria-modal="true" aria-labelledby="panorama-validation-title">
      <div style={modalStyle}>
        <h3 id="panorama-validation-title" style={modalTitleStyle}>
          Invalid 360 Panorama
        </h3>
        <p style={modalTextStyle}>{message}</p>
        <p style={modalHintStyle}>
          This file has been removed from the Scene. Upload or select a valid 2:1 panorama before saving.
        </p>
        <button type="button" onClick={onClose} style={modalButtonStyle}>
          Close
        </button>
      </div>
    </div>
  )
}

const panelStyle: React.CSSProperties = {
  borderRadius: 12,
  padding: 16,
  marginTop: 12,
  background: 'transparent',
}

const titleStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 8,
  fontSize: 16,
  fontWeight: 600,
  color: '#9ba3af',
}

const helperStyle: React.CSSProperties = {
  margin: 0,
  color: '#52606d',
  lineHeight: 1.6,
}

const errorStyle: React.CSSProperties = {
  margin: '0 0 8px',
  color: '#b42318',
  lineHeight: 1.6,
}

const successStyle: React.CSSProperties = {
  margin: '0 0 12px',
  color: '#027a48',
  lineHeight: 1.6,
}

const cameraHintStyle: React.CSSProperties = {
  alignItems: 'center',
  color: '#475467',
  display: 'flex',
  flexWrap: 'wrap',
  fontSize: 13,
  gap: '8px 16px',
  justifyContent: 'space-between',
  margin: '0 0 8px',
}

const viewerStyle: React.CSSProperties = {
  aspectRatio: '2 / 1',
  width: '100%',
  borderRadius: 10,
  overflow: 'hidden',
  background: '#101828',
}

const viewerShellStyle: React.CSSProperties = {
  position: 'relative',
}

const overlayMarkerStyle: React.CSSProperties = {
  display: 'none',
  position: 'absolute',
  width: 22,
  height: 22,
  background: 'radial-gradient(circle at 35% 35%, #93c5fd, #2563eb)',
  border: '3px solid #fff',
  borderRadius: '50%',
  boxShadow: '0 0 0 2px #2563eb, 0 2px 8px rgba(0, 0, 0, 0.42)',
  cursor: 'grabbing',
  pointerEvents: 'none',
  transform: 'translate(-50%, -50%)',
  zIndex: 20,
}

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(16, 24, 40, 0.62)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
  zIndex: 9999,
}

const modalStyle: React.CSSProperties = {
  width: 'min(560px, 100%)',
  background: '#fff5f5',
  border: '2px solid #d92d20',
  borderRadius: 14,
  padding: 24,
  boxShadow: '0 24px 48px rgba(16, 24, 40, 0.18)',
}

const modalTitleStyle: React.CSSProperties = {
  margin: '0 0 12px',
  color: '#b42318',
  fontSize: 22,
  fontWeight: 700,
}

const modalTextStyle: React.CSSProperties = {
  margin: '0 0 10px',
  color: '#b42318',
  lineHeight: 1.7,
  fontSize: 16,
}

const modalHintStyle: React.CSSProperties = {
  margin: '0 0 18px',
  color: '#7a271a',
  lineHeight: 1.7,
}

const modalButtonStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: 10,
  background: '#d92d20',
  color: '#fff',
  padding: '10px 16px',
  fontWeight: 600,
  cursor: 'pointer',
}
