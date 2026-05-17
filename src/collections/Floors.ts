import type { CollectionConfig } from 'payload'
import { publishedOrAdmin } from '../access/publishedOrAdmin'

const IMAGE_MEDIA_FILTER = { mimeType: { like: 'image/' } }

type RelationshipRef =
  | string
  | number
  | { id?: string | number; value?: string | number }
  | null
  | undefined

const getRelationshipId = (value: RelationshipRef): string | null => {
  if (value == null) return null

  if (typeof value === 'object') {
    if (value.id != null) return String(value.id)
    if (value.value != null) return String(value.value)
    return null
  }

  return String(value)
}

const getRelationshipIds = (value: RelationshipRef | RelationshipRef[]): string[] => {
  if (!Array.isArray(value)) {
    const id = getRelationshipId(value)
    return id ? [id] : []
  }

  return value.map((entry) => getRelationshipId(entry)).filter((id): id is string => Boolean(id))
}

const toPayloadId = (id: string): string | number => {
  const numericId = Number(id)
  return Number.isNaN(numericId) ? id : numericId
}

const formatSlug = (value: string, fallback = 'floor'): string => {
  const slug = value
    .trim()
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/(^-|-$)/g, '')

  return slug || fallback
}

const getUniqueFloorSlug = async ({
  currentId,
  req,
  slug,
}: {
  currentId?: string | null
  req: any
  slug: string
}): Promise<string> => {
  let candidate = slug
  let suffix = 2

  while (true) {
    const existingDraft = await req.payload.find({
      collection: 'floors',
      where: { slug: { equals: candidate } },
      limit: 1,
      depth: 0,
      draft: true,
      overrideAccess: true,
      req,
    })
    const existingPublished = await req.payload.find({
      collection: 'floors',
      where: { slug: { equals: candidate } },
      limit: 1,
      depth: 0,
      draft: false,
      overrideAccess: true,
      req,
    })

    const existingIds = [...existingDraft.docs, ...existingPublished.docs]
      .map((doc) => getRelationshipId(doc?.id as RelationshipRef))
      .filter((id): id is string => Boolean(id))

    if (existingIds.length === 0 || existingIds.every((id) => id === currentId)) {
      return candidate
    }

    candidate = `${slug}-${suffix}`
    suffix += 1
  }
}

const syncFloorToTour = async ({
  context,
  floorId,
  mode,
  req,
  tourId,
}: {
  context: Record<string, unknown>
  floorId: string
  mode: 'add' | 'remove'
  req: any
  tourId: string
}): Promise<void> => {
  const tour = await req.payload.findByID({
    collection: 'tours',
    id: toPayloadId(tourId),
    depth: 0,
    draft: true,
    overrideAccess: true,
    req,
  })

  const currentFloorIds = getRelationshipIds(tour?.floors as RelationshipRef | RelationshipRef[])
  const nextFloorIds =
    mode === 'add'
      ? Array.from(new Set([...currentFloorIds, floorId]))
      : currentFloorIds.filter((id) => id !== floorId)

  const defaultFloorId = getRelationshipId(tour?.defaultFloor as RelationshipRef)
  const shouldClearDefaultFloor = mode === 'remove' && defaultFloorId === floorId
  const changed =
    shouldClearDefaultFloor ||
    nextFloorIds.length !== currentFloorIds.length ||
    nextFloorIds.some((id, index) => id !== currentFloorIds[index])

  if (!changed) return

  await req.payload.update({
    collection: 'tours',
    id: toPayloadId(tourId),
    data: {
      floors: nextFloorIds.map(toPayloadId),
      ...(shouldClearDefaultFloor ? { defaultFloor: null } : {}),
    },
    draft: true,
    context: { ...context, skipTourFloorSync: true },
    overrideAccess: true,
    req,
  })
}

const removeFloorFromOtherTours = async ({
  context,
  floorId,
  req,
  tourIdToKeep,
}: {
  context: Record<string, unknown>
  floorId: string
  req: any
  tourIdToKeep?: string | null
}): Promise<void> => {
  const tours = await req.payload.find({
    collection: 'tours',
    limit: 1000,
    depth: 0,
    draft: true,
    overrideAccess: true,
    req,
  })

  for (const tour of tours.docs as any[]) {
    const tourId = getRelationshipId(tour.id as RelationshipRef)
    if (!tourId || tourId === tourIdToKeep) continue

    const currentFloorIds = getRelationshipIds(tour?.floors as RelationshipRef | RelationshipRef[])
    if (!currentFloorIds.includes(floorId)) continue

    const nextFloorIds = currentFloorIds.filter((id) => id !== floorId)
    const defaultFloorId = getRelationshipId(tour?.defaultFloor as RelationshipRef)

    await req.payload.update({
      collection: 'tours',
      id: toPayloadId(tourId),
      data: {
        floors: nextFloorIds.map(toPayloadId),
        ...(defaultFloorId === floorId ? { defaultFloor: null } : {}),
      },
      draft: true,
      context: { ...context, skipTourFloorSync: true },
      overrideAccess: true,
      req,
    })
  }
}

export const Floors: CollectionConfig = {
  slug: 'floors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'tour', '_status', 'updatedAt'],
  },
  access: {
    read: publishedOrAdmin,
  },
  versions: {
    drafts: true,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      index: true,
      admin: {
        description: 'Leave blank to generate from the floor name. It will be used in public URLs.',
      },
      hooks: {
        beforeValidate: [
          async ({ originalDoc, req, siblingData, value }) => {
            const nextSlugSource = typeof value === 'string' && value.trim()
              ? value
              : typeof siblingData?.name === 'string'
                ? siblingData.name
                : ''

            if (!nextSlugSource) return value

            const currentId = getRelationshipId(originalDoc?.id as RelationshipRef)
            return getUniqueFloorSlug({
              currentId,
              req,
              slug: formatSlug(nextSlugSource),
            })
          },
        ],
      },
    },
    {
      name: 'tour',
      type: 'relationship',
      relationTo: 'tours',
    },
    {
      name: 'floorplan',
      type: 'upload',
      relationTo: 'media',
      filterOptions: IMAGE_MEDIA_FILTER,
    },
    {
      name: 'initialScene',
      type: 'relationship',
      relationTo: 'scenes',
      filterOptions: ({ id }) => (id ? { floor: { equals: id } } : false),
      admin: {
        description: 'Only scenes assigned to this floor are available. Save a new floor before selecting its initial scene.',
      },
    },
    {
      name: 'mapPoints',
      type: 'array',
      admin: {
        components: {
          Field: '@/components/payload/MapPointsEditor#MapPointsEditor',
        },
      },
      fields: [
        {
          name: 'scene',
          type: 'relationship',
          relationTo: 'scenes',
          required: true,
        },
        { name: 'cx', type: 'number', required: true },
        { name: 'cy', type: 'number', required: true },
        {
          name: 'color',
          type: 'text',
          defaultValue: '#E64626',
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        const nextSlugSource = typeof data?.slug === 'string' && data.slug.trim()
          ? data.slug
          : typeof data?.name === 'string'
            ? data.name
            : ''

        if (nextSlugSource) {
          const currentId = getRelationshipId(originalDoc?.id as RelationshipRef)
          const formattedSlug = formatSlug(nextSlugSource)
          data.slug = await getUniqueFloorSlug({
            currentId,
            req,
            slug: formattedSlug,
          })
        }

        return data
      },
    ],
    afterChange: [
      async ({ context, doc, previousDoc, req }) => {
        if (context?.skipFloorTourSync) return doc

        const floorId = getRelationshipId(doc?.id as RelationshipRef)
        if (!floorId) return doc

        const previousTourId = getRelationshipId(previousDoc?.tour as RelationshipRef)
        const nextTourId = getRelationshipId(doc?.tour as RelationshipRef)
        if (previousTourId === nextTourId) return doc

        await removeFloorFromOtherTours({
          context,
          floorId,
          req,
          tourIdToKeep: nextTourId,
        })

        if (nextTourId) {
          await syncFloorToTour({
            context,
            floorId,
            mode: 'add',
            req,
            tourId: nextTourId,
          })
        }

        return doc
      },
    ],
  },
}
