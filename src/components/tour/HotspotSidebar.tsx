'use client'

import React, { useRef, useState } from 'react'

type Props = {
  hotspots: any[]
  tourSlug: string
  floorSlug: string
  isDraft: boolean
  viewerMode?: 'pannellum' | 'three'
  debugHotspots?: boolean
}

export default function HotspotSidebar({ hotspots, tourSlug, floorSlug, isDraft, viewerMode, debugHotspots }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedInfoHotspot, setSelectedInfoHotspot] = useState<any | null>(null)
  const infoModalRef = useRef<HTMLDialogElement>(null)

  const handleNavigate = async (hs: any) => {
    if (hs.type === 'scene' && hs.targetScene?.slug) {
      if (viewerMode !== 'pannellum' && window.threePanoramaViewer?.navigateToHotspot) {
        window.threePanoramaViewer.navigateToHotspot(hs)
        return
      }

      const targetFloorSlug = hs.targetFloor?.slug || floorSlug
      const query = new URLSearchParams()
      if (isDraft) query.set('draft', 'true')
      if (viewerMode === 'pannellum') query.set('viewer', 'pannellum')
      if (debugHotspots) query.set('debugHotspots', 'true')
      const queryString = query.toString() ? `?${query.toString()}` : ''
      if (targetFloorSlug !== floorSlug) {
        window.location.assign(`/tour/${tourSlug}/${targetFloorSlug}/${hs.targetScene.slug}${queryString}`)
      } else if (window.pannellumViewer) {
        window.pannellumViewer.loadScene(hs.targetScene.slug)
      } else {
        window.location.assign(`/tour/${tourSlug}/${floorSlug}/${hs.targetScene.slug}${queryString}`)
      }
    } else if (hs.type === 'info') {
      setSelectedInfoHotspot(hs)
      let shouldOpenInfo = true

      if (viewerMode !== 'pannellum' && window.threePanoramaViewer?.focusInfoHotspot) {
        shouldOpenInfo = await window.threePanoramaViewer.focusInfoHotspot(hs)
      } else if (window.pannellumViewer) {
        window.pannellumViewer.lookAt(hs.pitch, hs.yaw, hs.initialHfov || 120, 2000)
      }

      if (!shouldOpenInfo) return

      requestAnimationFrame(() => {
        if (infoModalRef.current && !infoModalRef.current.open) {
          infoModalRef.current.showModal()
        }
      })
    }
  }

  return (
    <div className="w-1/3 flex flex-col items-end">
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden pointer-events-auto p-2 bg-black/70 rounded-l-md mt-4"
      >
        <svg className="size-6 stroke-white fill-white/30" viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </svg>
      </button>

      {/* Sidebar content */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block pointer-events-auto mt-2 mr-2`}>
        <div className="space-y-2 w-64 lg:w-80 bg-black/50 p-4 rounded-md border-2 border-white/20 max-h-[70vh] overflow-y-auto">
          {hotspots.map((hs, i) => (
            <button
              key={i}
              onClick={() => handleNavigate(hs)}
              className={`p-3 w-full text-left cursor-pointer text-sm ${
                hs.type === 'info'
                  ? 'border-2 bg-white text-black hover:bg-gray-100'
                  : 'bg-ochre text-white hover:bg-orange-700'
              } transition-colors`}
            >
              {hs.type === 'info' && (
                <svg className="size-5 inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              )}
              {hs.text}
            </button>
          ))}
          {hotspots.length === 0 && (
            <p className="text-white/50 text-sm text-center py-2">No hotspots in this scene</p>
          )}
        </div>
      </div>

      <dialog ref={infoModalRef} className="d-modal d-modal-bottom md:d-modal-middle">
        <div className="d-modal-box bg-white">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-gray-900">{selectedInfoHotspot?.text}</h3>
            <form method="dialog">
              <button className="d-btn d-btn-sm d-btn-circle d-btn-ghost">✕</button>
            </form>
          </div>
          <div className="py-4 prose text-gray-700">
            {selectedInfoHotspot?.infoContent ? (
              <div>
                {typeof selectedInfoHotspot.infoContent === 'string'
                  ? selectedInfoHotspot.infoContent
                  : 'Information available'}
              </div>
            ) : (
              <p>{selectedInfoHotspot?.text}</p>
            )}
          </div>
        </div>
        <form method="dialog" className="d-modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  )
}
