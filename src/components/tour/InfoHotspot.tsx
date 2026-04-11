'use client'

import React, { useRef } from 'react'
import { extractPlainTextFromRichText } from '@/lib/contentWizard'

type Props = {
  hotspot: any
}

export default function InfoHotspot({ hotspot }: Props) {
  const modalRef = useRef<HTMLDialogElement>(null)
  const sizePx = hotspot.iconSize === 'sm' ? 36 : hotspot.iconSize === 'lg' ? 60 : 46
  const accentColor = hotspot.iconColor || '#ff970f'
  const infoText = extractPlainTextFromRichText(hotspot.infoContent) || hotspot.text

  const modalId = `info_modal_${(hotspot.text || '').replace(/[^a-zA-Z0-9]/g, '_')}`

  return (
    <>
      <button
        className={`pointer-events-auto relative inline-flex items-center justify-center cursor-pointer ${hotspot.cssClass || ''}`}
        type="button"
        onClick={() => modalRef.current?.showModal()}
        style={{ width: sizePx, height: sizePx }}
      >
        <span
          className="absolute inline-flex animate-ping rounded-full opacity-75"
          style={{ width: sizePx, height: sizePx, backgroundColor: accentColor }}
        />
        <svg
          className="relative inline-flex transition duration-300 hover:scale-110 rounded-full bg-white"
          style={{ width: sizePx, height: sizePx, color: accentColor }}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
        </svg>
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
            <p>{infoText}</p>
          </div>
        </div>
        <form method="dialog" className="d-modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  )
}
