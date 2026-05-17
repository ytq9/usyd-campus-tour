'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { getInfoContentTextBlocks } from './infoContentText'

type InfoVideo = {
  alt?: string | null
  filename?: string | null
  mimeType?: string | null
  url?: string | null
}

type Props = {
  dialogRef?: React.RefObject<HTMLDialogElement | null>
  hotspot?: any
}

export default function InfoHotspotContent({ dialogRef, hotspot }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoError, setVideoError] = useState(false)
  const contentBlocks = useMemo(
    () => getInfoContentTextBlocks(hotspot?.infoContent),
    [hotspot?.infoContent],
  )
  const video = getInfoVideo(hotspot?.infoVideo)
  const isBrowserPlayable = isBrowserPlayableVideo(video?.mimeType)
  const sourceType = isBrowserPlayable ? video?.mimeType || undefined : undefined

  useEffect(() => {
    setVideoError(false)
  }, [video?.url])

  useEffect(() => {
    const resetVideo = () => {
      if (!videoRef.current) return
      videoRef.current.pause()
      try {
        videoRef.current.currentTime = 0
      } catch {
        // Some browsers can reject seeking before metadata is loaded.
      }
    }

    const dialog = dialogRef?.current
    dialog?.addEventListener('close', resetVideo)

    return () => {
      dialog?.removeEventListener('close', resetVideo)
      resetVideo()
    }
  }, [dialogRef, video?.url])

  return (
    <div className="py-4 prose text-gray-700 max-w-none">
      {video?.url && (
        <div className="mb-4">
          <video
            key={video.url}
            ref={videoRef}
            aria-label={hotspot?.text ? `${hotspot.text} video` : 'Info video'}
            className="aspect-video w-full rounded bg-black"
            controls
            onCanPlay={() => setVideoError(false)}
            onError={() => setVideoError(true)}
            playsInline
            preload="metadata"
          >
            <source src={video.url} type={sourceType} />
          </video>

          {(videoError || !isBrowserPlayable) && (
            <p className="mt-2 text-sm text-gray-500">
              {videoError
                ? 'This browser cannot play this video file.'
                : 'This video format may not play in all browsers.'}{' '}
              <a href={video.url} target="_blank" rel="noreferrer">
                Open video file
              </a>
            </p>
          )}
        </div>
      )}

      {contentBlocks.length > 0 ? (
        <div>
          {contentBlocks.map((block, index) => (
            <p key={index}>{block}</p>
          ))}
        </div>
      ) : !video?.url ? (
        <p>{hotspot?.text}</p>
      ) : null}
    </div>
  )
}

function getInfoVideo(value: unknown): InfoVideo | null {
  if (!value || typeof value !== 'object') return null

  const video = value as InfoVideo
  if (typeof video.url !== 'string' || video.url.length === 0) return null

  return video
}

function isBrowserPlayableVideo(mimeType: unknown): boolean {
  return mimeType === 'video/mp4' || mimeType === 'video/webm'
}
