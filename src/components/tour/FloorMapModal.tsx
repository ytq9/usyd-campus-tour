'use client'

import React, { useRef, useState } from 'react'

type Props = {
  tourFloors: any[]
  currentFloor: any
  currentSceneSlug: string
  tourSlug: string
  isDraft: boolean
}

export default function FloorMapModal({ tourFloors, currentFloor, currentSceneSlug, tourSlug, isDraft }: Props) {
  const modalRef = useRef<HTMLDialogElement>(null)
  const [activeFloorIdx, setActiveFloorIdx] = useState(
    tourFloors.findIndex((f: any) => f.id === currentFloor.id)
  )

  const handleMapPointClick = (floorSlug: string, sceneSlug: string) => {
    const draftQuery = isDraft ? '?draft=true' : ''
    window.location.assign(`/tour/${tourSlug}/${floorSlug}/${sceneSlug}${draftQuery}`)
  }

  return (
    <>
      <button
        onClick={() => modalRef.current?.showModal()}
        className="bg-ochre hover:bg-orange-700 p-2 size-14 rounded-full cursor-pointer flex items-center justify-center"
        title="Floor Map"
      >
        <svg className="size-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
        </svg>
      </button>

      <dialog ref={modalRef} className="d-modal">
        <div className="d-modal-box relative w-full max-w-5xl bg-white/90">
          {/* Floor tabs */}
          <div className="d-tabs d-tabs-lift mb-4">
            {tourFloors.map((floor: any, idx: number) => (
              <button
                key={floor.id}
                onClick={() => setActiveFloorIdx(idx)}
                className={`d-tab ${activeFloorIdx === idx ? 'd-tab-active' : ''}`}
              >
                {floor.name}
              </button>
            ))}
          </div>

          {/* Floor map content */}
          {tourFloors[activeFloorIdx] && (
            <div className="p-4 bg-white rounded-lg">
              {tourFloors[activeFloorIdx].floorplan ? (
                <div className="relative">
                  <img
                    src={tourFloors[activeFloorIdx].floorplan}
                    alt={`${tourFloors[activeFloorIdx].name} floorplan`}
                    className="w-full h-auto"
                  />
                  {/* Map points overlay */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 5000 2000" preserveAspectRatio="xMidYMid meet">
                    {(tourFloors[activeFloorIdx].mapPoints || []).map((mp: any, i: number) => {
                      const isCurrentScene = mp.scene?.slug === currentSceneSlug
                      return (
                        <circle
                          key={i}
                          cx={mp.cx}
                          cy={mp.cy}
                          r={isCurrentScene ? 44 : 32}
                          fill={isCurrentScene ? '#000000' : mp.color}
                          className={isCurrentScene ? '' : 'cursor-pointer hover:opacity-80'}
                          onClick={() => {
                            if (!isCurrentScene && mp.scene?.slug) {
                              handleMapPointClick(tourFloors[activeFloorIdx].slug, mp.scene.slug)
                            }
                          }}
                        />
                      )
                    })}
                  </svg>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No floorplan available</p>
              )}
            </div>
          )}

          <form method="dialog">
            <button className="d-btn d-btn-sm d-btn-circle d-btn-ghost absolute right-2 top-2">✕</button>
          </form>
        </div>
        <form method="dialog" className="d-modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  )
}
