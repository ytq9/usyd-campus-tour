import React from 'react'
import Link from 'next/link'
import type { Floor, Media, Scene, Tour } from '@/payload-types'
import { getInfoContentTextBlocks } from './infoContentText'

type Props = {
  tour: Tour
  tourSlug: string
  isDraft?: boolean
  debugHotspots?: boolean
}

const valueOrFallback = (value: unknown, fallback: string): string =>
  typeof value === 'string' && value.length > 0 ? value : fallback

const isPopulatedMedia = (value: unknown): value is Media =>
  typeof value === 'object' && value !== null

const isPopulatedFloor = (value: unknown): value is Floor =>
  typeof value === 'object' && value !== null

const isPopulatedScene = (value: unknown): value is Scene =>
  typeof value === 'object' && value !== null

export default function TourLanding({
  tour,
  tourSlug,
  isDraft = false,
  debugHotspots = false,
}: Props) {
  const coverImage = isPopulatedMedia(tour.coverImage) ? tour.coverImage : null
  const defaultFloor = isPopulatedFloor(tour.defaultFloor) ? tour.defaultFloor : null
  const welcomeTextBlocks = getInfoContentTextBlocks(tour.welcomeText)

  const buildViewerHref = (floor: Floor, scene: Scene) => {
    const floorSlug = valueOrFallback(floor.slug, String(floor.id))
    const sceneSlug = valueOrFallback(scene.slug, String(scene.id))
    const query = new URLSearchParams()

    if (isDraft) query.set('draft', 'true')
    if (debugHotspots) query.set('debugHotspots', 'true')

    const queryString = query.toString()
    const href = `/tour/${tourSlug}/${floorSlug}/${sceneSlug}`

    return queryString ? `${href}?${queryString}` : href
  }

  let startHref = isDraft ? `/tour/${tourSlug}/preview` : `/tour/${tourSlug}`
  if (defaultFloor) {
    const initialScene = isPopulatedScene(defaultFloor.initialScene)
      ? defaultFloor.initialScene
      : null

    if (initialScene) {
      startHref = buildViewerHref(defaultFloor, initialScene)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="relative h-[60vh] overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage.url ?? ''}
            alt={coverImage.alt || tour.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{tour.title}</h1>
            <Link
              href={startHref}
              className="d-btn d-btn-lg bg-ochre border-ochre text-white hover:bg-orange-700 text-lg px-8"
            >
              Start Tour
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {tour.welcomeTitle && (
          <h2 className="text-2xl font-bold mb-4">{tour.welcomeTitle}</h2>
        )}
        {welcomeTextBlocks.length > 0 && (
          <div className="prose prose-invert prose-lg max-w-none">
            {welcomeTextBlocks.map((block, index) => (
              <p key={index} className="text-gray-300">
                {block}
              </p>
            ))}
          </div>
        )}

        {tour.floors && tour.floors.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold mb-4">Floors</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tour.floors.map((floor) => {
                const f = isPopulatedFloor(floor) ? floor : null
                if (!f) return null

                const scene = isPopulatedScene(f.initialScene) ? f.initialScene : null
                const href = scene ? buildViewerHref(f, scene) : '#'

                return (
                  <Link
                    key={f.id}
                    href={href}
                    className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors"
                  >
                    <h4 className="font-medium">{f.name}</h4>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-12">
          <Link href="/" className="text-ochre hover:underline">
            &larr; Back to all tours
          </Link>
        </div>
      </div>
    </div>
  )
}
