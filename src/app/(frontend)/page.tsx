import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ q?: string; tag?: string }>

export default async function ToursPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, tag } = await searchParams
  const payload = await getPayload({ config })

  const where: any = { _status: { equals: 'published' } }
  if (q) {
    where.title = { contains: q }
  }
  if (tag) {
    where['tags.tag'] = { equals: tag }
  }

  const tours = await payload.find({
    collection: 'tours',
    where,
    depth: 1,
    limit: 50,
  })

  // Get all unique tags for filter
  const allTours = await payload.find({
    collection: 'tours',
    where: { _status: { equals: 'published' } },
    depth: 0,
    limit: 100,
  })
  const allTags = Array.from(
    new Set(
      allTours.docs.flatMap((t: any) => (t.tags || []).map((tg: any) => tg.tag))
    )
  ).filter(Boolean)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">USYD Campus Tours</h1>
          <p className="mt-2 text-gray-600">Explore the University of Sydney campus in 360°</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filter */}
        <form className="mb-8 flex flex-col sm:flex-row gap-4" action="/" method="GET">
          <input
            type="text"
            name="q"
            defaultValue={q || ''}
            placeholder="Search tours..."
            className="d-input d-input-bordered flex-1"
          />
          <select name="tag" className="d-select d-select-bordered" defaultValue={tag || ''}>
            <option value="">All Tags</option>
            {allTags.map((t: string) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button type="submit" className="d-btn bg-ochre text-white hover:bg-orange-700">
            Search
          </button>
        </form>

        {/* Tour Grid */}
        {tours.docs.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl text-gray-500">No tours found</h2>
            <p className="mt-2 text-gray-400">Try adjusting your search or filters</p>
            {(q || tag) && (
              <Link href="/" className="d-btn d-btn-outline mt-4">
                Clear filters
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.docs.map((tour: any) => (
              <Link
                key={tour.id}
                href={`/tour/${tour.slug}`}
                className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-gray-200 overflow-hidden">
                  {tour.coverImage && typeof tour.coverImage === 'object' ? (
                    <img
                      src={tour.coverImage.sizes?.preview?.url || tour.coverImage.url}
                      alt={tour.coverImage.alt || tour.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-ochre transition-colors">
                    {tour.title}
                  </h2>
                  {tour.tags && tour.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {tour.tags.map((t: any, i: number) => (
                        <span key={i} className="d-badge d-badge-sm d-badge-outline">
                          {t.tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
