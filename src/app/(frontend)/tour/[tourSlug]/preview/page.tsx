import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

type Params = Promise<{ tourSlug: string }>
type SearchParams = Promise<{ viewer?: string; debugHotspots?: string }>

export default async function PreviewPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { tourSlug } = await params
  const { viewer, debugHotspots } = await searchParams
  const payload = await getPayload({ config })

  // Fetch tour as draft
  const tours = await payload.find({
    collection: 'tours',
    where: { slug: { equals: tourSlug } },
    depth: 2,
    limit: 1,
    draft: true,
  })

  const tour = tours.docs[0]
  if (!tour) notFound()

  // Find default floor and redirect to scene viewer
  const defaultFloor = tour.defaultFloor && typeof tour.defaultFloor === 'object'
    ? tour.defaultFloor
    : null

  if (defaultFloor) {
    const initialScene = defaultFloor.initialScene && typeof defaultFloor.initialScene === 'object'
      ? defaultFloor.initialScene
      : null
    if (initialScene) {
      const query = new URLSearchParams({ draft: 'true' })
      if (viewer === 'pannellum') query.set('viewer', 'pannellum')
      if (debugHotspots === 'true') query.set('debugHotspots', 'true')
      redirect(`/tour/${tourSlug}/${defaultFloor.slug}/${initialScene.slug}?${query.toString()}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Preview: {tour.title}</h1>
        <p className="text-gray-400">This tour has no default floor/scene configured yet.</p>
        <p className="text-gray-500 mt-2">Set a default floor with an initial scene in the admin panel.</p>
      </div>
    </div>
  )
}
