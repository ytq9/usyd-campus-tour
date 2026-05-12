'use client'

import React, { useRef } from 'react'
import type { InfoHotspotFocusHandler } from './three/types'
import { getInfoContentTextBlocks } from './infoContentText'
import { HotspotIcon } from './hotspotIcons'

type Props = {
  hotspot: any
  onFocus?: InfoHotspotFocusHandler
}

export default function InfoHotspot({ hotspot, onFocus }: Props) {
  const modalRef = useRef<HTMLDialogElement>(null)
  const contentBlocks = getInfoContentTextBlocks(hotspot.infoContent)

  const modalId = `info_modal_${(hotspot.text || '').replace(/[^a-zA-Z0-9]/g, '_')}`
  const openModal = () => {
    if (modalRef.current && !modalRef.current.open) {
      modalRef.current.showModal()
    }
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (onFocus) {
      onFocus(hotspot, openModal)
      return
    }

    openModal()
  }

  const stopViewerGesture = (event: React.SyntheticEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    ;(event.nativeEvent as Event & { stopImmediatePropagation?: () => void }).stopImmediatePropagation?.()
  }

  return (
    <>
      <button
        data-tour-hotspot-interactive="true"
        className="pointer-events-auto cursor-pointer"
        type="button"
        onClick={handleClick}
        onPointerDown={stopViewerGesture}
        onTouchStart={stopViewerGesture}
      >
        <span className="absolute inline-flex size-10 animate-ping rounded-full bg-ochre opacity-75" />
        <HotspotIcon
          iconKey={hotspot.iconStyle}
          hotspotType="info"
          color={hotspot.iconColor || 'black'}
          className="relative inline-flex size-10 transition duration-300 hover:scale-110 bg-white rounded-full p-1"
        />
      </button>

      <dialog ref={modalRef} className="d-modal d-modal-bottom md:d-modal-middle" id={modalId}>
        <div className="d-modal-box bg-white">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-gray-900">{hotspot.text}</h3>
            <form method="dialog">
              <button className="d-btn d-btn-sm d-btn-circle d-btn-ghost">✕</button>
            </form>
          </div>
          <div className="py-4 prose text-gray-700">
            {contentBlocks.length > 0 ? (
              <div>
                {contentBlocks.map((block, index) => (
                  <p key={index}>{block}</p>
                ))}
              </div>
            ) : (
              <p>{hotspot.text}</p>
            )}
          </div>
        </div>
        <form method="dialog" className="d-modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  )
}
