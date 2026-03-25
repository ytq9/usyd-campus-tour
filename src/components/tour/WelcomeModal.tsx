'use client'

import React, { useRef, useEffect } from 'react'

type Props = {
  title: string
  text: any
  onClose: () => void
}

export default function WelcomeModal({ title, text, onClose }: Props) {
  const modalRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    modalRef.current?.showModal()
  }, [])

  return (
    <dialog ref={modalRef} className="d-modal" onClose={onClose}>
      <div className="d-modal-box bg-white">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <div className="prose prose-sm py-4 text-gray-700">
          {typeof text === 'string' ? <p>{text}</p> : <p>Welcome to the tour!</p>}
        </div>
        <button
          onClick={() => {
            modalRef.current?.close()
            onClose()
          }}
          className="d-btn w-full bg-ochre text-white hover:bg-orange-700"
        >
          Take the tour
        </button>
      </div>
      <form method="dialog" className="d-modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  )
}
