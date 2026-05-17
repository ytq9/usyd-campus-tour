import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { hasRichTextContent } from '@/components/tour/infoContentText'
import RichTextContent from '@/components/tour/RichTextContent'

export const dynamic = 'force-dynamic'

type Params = Promise<{ tourSlug: string }>
type SearchParams = Promise<{ debugHotspots?: string }>

export default async function TourLandingPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { tourSlug } = await params
  const { debugHotspots } = await searchParams
  const shouldPreserveHotspotDebug = debugHotspots === 'true'
  const payload = await getPayload({ config })

  const tours = await payload.find({
    collection: 'tours',
    where: {
      slug: { equals: tourSlug },
      _status: { equals: 'published' },
    },
    depth: 2,
    limit: 1,
  })

  const tour = tours.docs[0]
  if (!tour) notFound()
  const hasDescription = hasRichTextContent(tour.description)
  const hasWelcomeText = hasRichTextContent(tour.welcomeText)

  const defaultFloor = tour.defaultFloor && typeof tour.defaultFloor === 'object'
    ? tour.defaultFloor
    : null

  let startHref = `/tour/${tourSlug}`
  if (defaultFloor) {
    const initialScene = defaultFloor.initialScene && typeof defaultFloor.initialScene === 'object'
      ? defaultFloor.initialScene
      : null
    if (initialScene) {
      startHref = `/tour/${tourSlug}/${defaultFloor.slug}/${initialScene.slug}`
    }
  }

  const appendDebugQuery = (href: string) => {
    if (href === '#') return href

    const query = new URLSearchParams()
    if (shouldPreserveHotspotDebug) query.set('debugHotspots', 'true')
    const queryString = query.toString()

    if (!queryString) return href
    return `${href}${href.includes('?') ? '&' : '?'}${queryString}`
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="relative h-[60vh] overflow-hidden">
        {tour.coverImage && typeof tour.coverImage === 'object' ? (
          <img
            src={tour.coverImage.url ?? ''}
            alt={tour.coverImage.alt || tour.title}
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
              href={appendDebugQuery(startHref)}
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
        {hasWelcomeText && (
          <div className="prose prose-invert prose-lg max-w-none text-gray-300">
            <RichTextContent value={tour.welcomeText} />
          </div>
        )}
        {hasDescription && (
          <div className="prose prose-invert max-w-none text-gray-300 mt-8">
            <RichTextContent value={tour.description} />
          </div>
        )}

        {tour.floors && tour.floors.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold mb-4">Floors</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tour.floors.map((floor: any) => {
                const f = typeof floor === 'object' ? floor : null
                if (!f) return null
                const scene = f.initialScene && typeof f.initialScene === 'object' ? f.initialScene : null
                const href = scene ? appendDebugQuery(`/tour/${tourSlug}/${f.slug}/${scene.slug}`) : '#'
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
            ← Back to all tours
          </Link>
        </div>
      </div>
    </div>
  )
}
