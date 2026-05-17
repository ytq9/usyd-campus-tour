import React from 'react'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import TourLanding from '@/components/tour/TourLanding'

export const dynamic = 'force-dynamic'

type Params = Promise<{ tourSlug: string }>
type SearchParams = Promise<{ debugHotspots?: string }>

export default async function TourLandingPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { tourSlug } = await params
  const { debugHotspots } = await searchParams
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

  return (
    <TourLanding
      tour={tour}
      tourSlug={tourSlug}
      debugHotspots={debugHotspots === 'true'}
    />
  )
}
