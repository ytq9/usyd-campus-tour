'use client'

import { useEffect, useMemo, useState } from 'react'

export type AdminMediaDoc = {
  id: number | string
  url?: string | null
  filename?: string | null
  mimeType?: string | null
  width?: number | null
  height?: number | null
}

type MediaState =
  | { status: 'idle'; media: null; panoramaId: null; panoramaUrl: null; error: null }
  | { status: 'loading'; media: null; panoramaId: number | string | null; panoramaUrl: string | null; error: null }
  | { status: 'loaded'; media: AdminMediaDoc; panoramaId: number | string; panoramaUrl: string; error: null }
  | { status: 'error'; media: null; panoramaId: number | string | null; panoramaUrl: string | null; error: Error }

type Options = {
  requireMetadata?: boolean
}

export function useAdminPanoramaMedia(
  panoramaValue: AdminMediaDoc | number | string | null | undefined,
  options: Options = {},
): MediaState {
  const requireMetadata = Boolean(options.requireMetadata)
  const panoramaId = useMemo(() => getPanoramaId(panoramaValue), [panoramaValue])

  const inlineMedia = useMemo(() => {
    if (!panoramaValue || typeof panoramaValue !== 'object') return null
    return panoramaValue
  }, [panoramaValue])

  const [state, setState] = useState<MediaState>({
    status: 'idle',
    media: null,
    panoramaId: null,
    panoramaUrl: null,
    error: null,
  })

  useEffect(() => {
    if (!panoramaValue) {
      setState({ status: 'idle', media: null, panoramaId: null, panoramaUrl: null, error: null })
      return
    }

    const inlineUrl = inlineMedia?.url || null
    const inlineHasMetadata =
      typeof inlineMedia?.width === 'number' &&
      typeof inlineMedia?.height === 'number'

    if (inlineMedia && inlineUrl && (!requireMetadata || inlineHasMetadata)) {
      setState({
        status: 'loaded',
        media: inlineMedia,
        panoramaId: inlineMedia.id,
        panoramaUrl: inlineUrl,
        error: null,
      })
      return
    }

    if (!panoramaId) {
      setState({
        status: 'error',
        media: null,
        panoramaId: null,
        panoramaUrl: inlineUrl,
        error: new Error('The selected panorama could not be resolved.'),
      })
      return
    }

    let isActive = true
    setState({ status: 'loading', media: null, panoramaId, panoramaUrl: inlineUrl, error: null })

    fetch(`/api/media/${panoramaId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to load the selected panorama image.')
        }

        return response.json() as Promise<AdminMediaDoc>
      })
      .then((media) => {
        if (!isActive) return

        if (!media.url) {
          throw new Error('The selected panorama image is missing a URL.')
        }

        setState({
          status: 'loaded',
          media,
          panoramaId,
          panoramaUrl: media.url,
          error: null,
        })
      })
      .catch((error) => {
        if (!isActive) return

        setState({
          status: 'error',
          media: null,
          panoramaId,
          panoramaUrl: inlineUrl,
          error: error instanceof Error ? error : new Error('Unable to load the selected panorama image.'),
        })
      })

    return () => {
      isActive = false
    }
  }, [inlineMedia, panoramaId, panoramaValue, requireMetadata])

  return state
}

export function getPanoramaId(value: AdminMediaDoc | number | string | null | undefined) {
  if (!value) return null
  return typeof value === 'object' ? value.id : value
}

export function isValidEquirectangular(width?: number | null, height?: number | null) {
  if (!width || !height) return false
  return width === height * 2
}

export function formatDimensions(width?: number | null, height?: number | null) {
  if (!width || !height) return 'unknown dimensions'
  return `${width}x${height}`
}
