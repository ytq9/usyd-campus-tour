'use client'

import React, { useMemo } from 'react'
import {
  getInfoContentPreview,
  getInfoContentType,
  isInfoContentEmpty,
} from './infoContentText'

type Props = {
  activeSceneSlug: string
  currentScene: any
  floorScenes: any[]
  isDraft: boolean
  routeFloorSlug: string
  routeSceneSlug: string
  routeTourSlug: string
}

export default function HotspotDebugPanel({
  activeSceneSlug,
  currentScene,
  floorScenes,
  isDraft,
  routeFloorSlug,
  routeSceneSlug,
  routeTourSlug,
}: Props) {
  const warnings = useMemo(() => {
    const nextWarnings: string[] = []
    const floorSceneSlugs = new Set(
      floorScenes
        .map((scene: any) => scene?.slug)
        .filter((slug: unknown): slug is string => typeof slug === 'string' && slug.length > 0),
    )

    if (currentScene?.slug && !floorSceneSlugs.has(currentScene.slug)) {
      nextWarnings.push(`currentScene "${currentScene.slug}" is not present in floorScenes.`)
    }

    if (activeSceneSlug && !floorSceneSlugs.has(activeSceneSlug)) {
      nextWarnings.push(`active scene "${activeSceneSlug}" is not present in floorScenes.`)
    }

    floorScenes.forEach((scene: any) => {
      const hotspots = scene?.hotspots || []

      hotspots.forEach((hotspot: any, index: number) => {
        const targetSceneSlug = hotspot?.targetScene?.slug
        const targetFloorSlug = hotspot?.targetFloor?.slug

        if (targetSceneSlug && !targetFloorSlug && !floorSceneSlugs.has(targetSceneSlug)) {
          nextWarnings.push(
            `Hotspot ${scene.slug || '(unknown scene)'} #${index} targets "${targetSceneSlug}", but that scene is not in floorScenes and targetFloor is missing.`,
          )
        }
      })
    })

    return nextWarnings
  }, [activeSceneSlug, currentScene?.slug, floorScenes])

  return (
    <aside className="fixed left-3 top-3 z-[80] max-h-[72vh] w-[min(92vw,430px)] overflow-y-auto rounded-sm border border-white/20 bg-black/85 p-3 text-xs leading-relaxed text-white shadow-2xl pointer-events-auto">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Hotspot Debug</h2>
          <p className="text-white/70">Public viewer data received from Payload.</p>
        </div>
        <span className="rounded-sm bg-white/10 px-2 py-1 uppercase tracking-wide text-white/80">
          {isDraft ? 'draft' : 'published'}
        </span>
      </div>

      <div className="mb-3 rounded-sm border border-amber-300/40 bg-amber-950/50 p-2 text-amber-100">
        If admin hotspot values look correct but public values are old, make sure the scene is saved and published.
        Use ?draft=true to compare draft values.
      </div>

      {warnings.length > 0 && (
        <div className="mb-3 rounded-sm border border-red-300/40 bg-red-950/50 p-2 text-red-100">
          <div className="mb-1 font-semibold">Warnings</div>
          <ul className="list-disc space-y-1 pl-4">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <dl className="mb-3 grid grid-cols-[120px_1fr] gap-x-2 gap-y-1">
        <dt className="text-white/60">draft mode</dt>
        <dd>{String(isDraft)}</dd>
        <dt className="text-white/60">data mode</dt>
        <dd>{isDraft ? 'draft data' : 'published data'}</dd>
        <dt className="text-white/60">route tourSlug</dt>
        <dd className="break-all">{routeTourSlug}</dd>
        <dt className="text-white/60">route floorSlug</dt>
        <dd className="break-all">{routeFloorSlug}</dd>
        <dt className="text-white/60">route sceneSlug</dt>
        <dd className="break-all">{routeSceneSlug}</dd>
        <dt className="text-white/60">currentScene slug</dt>
        <dd className="break-all">{currentScene?.slug || '(missing)'}</dd>
        <dt className="text-white/60">active scene slug</dt>
        <dd className="break-all">{activeSceneSlug || '(missing)'}</dd>
      </dl>

      <section className="mb-3">
        <h3 className="mb-1 font-semibold">floorScenes</h3>
        <div className="rounded-sm bg-white/10 p-2 text-white/80">
          {floorScenes.map((scene: any) => scene.slug).filter(Boolean).join(', ') || '(none)'}
        </div>
      </section>

      <section className="space-y-2">
        {floorScenes.map((scene: any, sceneIndex: number) => (
          <div key={scene.id || scene.slug || sceneIndex} className="rounded-sm border border-white/15 bg-white/5 p-2">
            <div className="mb-1 font-semibold">
              {scene.slug || '(missing slug)'} <span className="font-normal text-white/65">{scene.title || '(untitled)'}</span>
            </div>
            {(scene.hotspots || []).length > 0 ? (
              <div className="space-y-1">
                {(scene.hotspots || []).map((hotspot: any, hotspotIndex: number) => (
                  <div key={`${scene.slug || sceneIndex}-${hotspotIndex}`} className="rounded-sm bg-black/25 p-2">
                    <div className="font-semibold">#{hotspotIndex} {hotspot.text || '(no text)'}</div>
                    <div className="grid grid-cols-[90px_1fr] gap-x-2">
                      <span className="text-white/55">type</span>
                      <span>{hotspot.type || '(missing)'}</span>
                      <span className="text-white/55">pitch</span>
                      <span>{formatValue(hotspot.pitch)}</span>
                      <span className="text-white/55">yaw</span>
                      <span>{formatValue(hotspot.yaw)}</span>
                      <span className="text-white/55">targetScene</span>
                      <span className="break-all">{hotspot.targetScene?.slug || '(none)'}</span>
                      <span className="text-white/55">targetFloor</span>
                      <span className="break-all">{hotspot.targetFloor?.slug || '(none)'}</span>
                      {hotspot.type === 'info' && (
                        <>
                          <span className="text-white/55">info type</span>
                          <span>{getInfoContentType(hotspot.infoContent)}</span>
                          <span className="text-white/55">info empty</span>
                          <span>{String(isInfoContentEmpty(hotspot.infoContent))}</span>
                          <span className="text-white/55">info preview</span>
                          <span className="break-words">{getInfoContentPreview(hotspot.infoContent) || '(none)'}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-white/55">No hotspots.</div>
            )}
          </div>
        ))}
      </section>
    </aside>
  )
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '(missing)'
  return String(value)
}
