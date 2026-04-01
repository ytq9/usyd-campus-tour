'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
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

const isValidEquirectangular = (width?: number | null, height?: number | null) => {
  if (!width || !height) return false
  return width === height * 2
}

const formatDimensions = (width?: number | null, height?: number | null) => {
  if (!width || !height) return 'unknown dimensions'
  return `${width}x${height}`
}

export default function PanoramaValidationPreview() {
  const { value, setValue } = useField<number | string | MediaDoc | null>({ path: 'panorama' })
  const viewerRef = useRef<HTMLDivElement>(null)
  const pannellumRef = useRef<{ destroy?: () => void } | null>(null)
  const [state, setState] = useState<ValidationState>({ status: 'idle' })
  const [modalMessage, setModalMessage] = useState<string | null>(null)
  const [lastRejectedId, setLastRejectedId] = useState<number | string | null>(null)

  const panoramaId = useMemo(() => {
    if (!value) return null
    return typeof value === 'object' ? value.id : value
  }, [value])

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
    const renderViewer = async () => {
      if (state.status !== 'valid' || !state.media.url || !viewerRef.current) {
        if (pannellumRef.current?.destroy) {
          pannellumRef.current.destroy()
          pannellumRef.current = null
        }
        return
      }

      await import('pannellum/build/pannellum.css')
      await import('pannellum/build/pannellum.js')

      if (!(window as any).pannellum || !viewerRef.current) return

      if (pannellumRef.current?.destroy) {
        pannellumRef.current.destroy()
      }

      pannellumRef.current = (window as any).pannellum.viewer(viewerRef.current, {
        type: 'equirectangular',
        panorama: state.media.url,
        autoLoad: true,
        showControls: true,
        compass: false,
      })
    }

    void renderViewer()

    return () => {
      if (pannellumRef.current?.destroy) {
        pannellumRef.current.destroy()
        pannellumRef.current = null
      }
    }
  }, [state])

  if (!panoramaId) {
    return (
      <>
        <div style={panelStyle}>
          <strong style={titleStyle}>360 Panorama Validation</strong>
          <p style={helperStyle}>
            Select or upload a panorama image to validate its 2:1 aspect ratio and preview it interactively.
          </p>
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
        <strong style={titleStyle}>360 Panorama Validation</strong>

        {state.status === 'loading' && (
          <p style={helperStyle}>Validating the selected image and preparing the preview...</p>
        )}

        {state.status === 'error' && <p style={errorStyle}>{state.message}</p>}

        {state.status === 'invalid' && (
          <>
            <p style={errorStyle}>{state.message}</p>
            <p style={helperStyle}>
              Please upload an equirectangular panorama with a 2:1 aspect ratio, for example 7680x3840.
            </p>
          </>
        )}

        {state.status === 'valid' && (
          <>
            <p style={successStyle}>{state.message}</p>
            <div ref={viewerRef} style={viewerStyle} />
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
  border: '1px solid #d9e2ec',
  borderRadius: 12,
  padding: 16,
  marginTop: 12,
  background: '#fff',
}

const titleStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 8,
  fontSize: 16,
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

const viewerStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 360,
  borderRadius: 10,
  overflow: 'hidden',
  background: '#101828',
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
