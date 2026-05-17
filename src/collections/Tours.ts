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

const jsonResponse = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const readJsonBody = async (req: Request): Promise<Record<string, unknown>> => {
  try {
    return (await req.json()) as Record<string, unknown>
  } catch {
    return {}
  }
}

const getTourFloorIds = async (
  req: any,
  tourId: string,
  floorIdsOverride?: unknown,
): Promise<string[]> => {
  const overrideIds = getRelationshipIds(floorIdsOverride as RelationshipRef | RelationshipRef[])
  if (floorIdsOverride !== undefined) return overrideIds

  const tour = await req.payload.findByID({
    collection: 'tours',
    id: toPayloadId(tourId),
    depth: 0,
    draft: true,
    overrideAccess: true,
    req,
  })

  return getRelationshipIds(tour?.floors as RelationshipRef | RelationshipRef[])
}

const getFloorOwnershipConflicts = async (
  req: any,
  currentTourId: string | null,
  floorIds: string[],
): Promise<string[]> => {
  if (floorIds.length === 0) return []

  const conflicts = new Map<string, string>()
  const floors = await req.payload.find({
    collection: 'floors',
    where: { id: { in: floorIds.map(toPayloadId) } },
    limit: floorIds.length,
    depth: 1,
    draft: true,
    overrideAccess: true,
    req,
  })

  for (const floor of floors.docs as any[]) {
    const floorId = getRelationshipId(floor.id as RelationshipRef)
    if (!floorId) continue

    const assignedTourId = getRelationshipId(floor.tour as RelationshipRef)
    if (!assignedTourId || assignedTourId === currentTourId) continue

    const assignedTourTitle =
      floor.tour && typeof floor.tour === 'object' && 'title' in floor.tour
        ? floor.tour.title
        : assignedTourId

    conflicts.set(
      floorId,
      `Floor "${floor.name || floorId}" already belongs to tour "${assignedTourTitle}". Remove it from that tour before adding it here.`,
    )
  }

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
    if (!tourId || tourId === currentTourId) continue

    const otherTourFloorIds = new Set(getRelationshipIds(tour.floors as RelationshipRef | RelationshipRef[]))
    for (const floorId of floorIds) {
      if (!otherTourFloorIds.has(floorId) || conflicts.has(floorId)) continue
      conflicts.set(
        floorId,
        `Floor "${floorId}" is already selected in tour "${tour.title || tourId}". Remove it from that tour before adding it here.`,
      )
    }
  }

  return Array.from(conflicts.values())
}

const getDraftFloorsForTour = async (req: any, floorIds: string[]): Promise<any[]> => {
  const draftFloors: any[] = []

  for (const floorId of floorIds) {
    const floor = await req.payload.findByID({
      collection: 'floors',
      id: toPayloadId(floorId),
      depth: 0,
      draft: true,
      overrideAccess: true,
      req,
    })

    if (floor?._status !== 'published') {
      draftFloors.push(floor)
    }
  }

  return draftFloors
}

const serializeDraftFloors = (floors: any[]) =>
  floors.map((floor) => ({
    id: floor.id,
    title: floor.name || `Floor ${floor.id}`,
    status: floor._status,
  }))

const getDraftScenesForFloors = async (req: any, floorIds: string[]): Promise<any[]> => {
  const scenesById = new Map<string, any>()

  for (const floorId of floorIds) {
    const scenes = await req.payload.find({
      collection: 'scenes',
      where: { floor: { equals: toPayloadId(floorId) } },
      limit: 500,
      depth: 0,
      draft: true,
      overrideAccess: true,
      req,
    })

    for (const scene of scenes.docs as any[]) {
      const sceneId = getRelationshipId(scene.id as RelationshipRef)
      if (sceneId && scene._status !== 'published') {
        scenesById.set(sceneId, scene)
      }
    }
  }

  return Array.from(scenesById.values())
}

const serializeDraftScenes = (scenes: any[]) =>
  scenes.map((scene) => ({
    id: scene.id,
    title: scene.title || `Scene ${scene.id}`,
    floor: getRelationshipId(scene.floor as RelationshipRef),
    status: scene._status,
  }))

const getDraftScenesEndpoint = async (req: any): Promise<Response> => {
  if (!req.user) return jsonResponse({ error: 'Unauthorized' }, 401)

  const tourId = getRelationshipId(req.routeParams?.id as RelationshipRef)
  if (!tourId) return jsonResponse({ error: 'Missing tour id' }, 400)

  const body = await readJsonBody(req)
  const floorIds = await getTourFloorIds(req, tourId, body.floorIds)
  const draftScenes = await getDraftScenesForFloors(req, floorIds)

  return jsonResponse({
    count: draftScenes.length,
    scenes: serializeDraftScenes(draftScenes),
  })
}

const getDraftFloorsEndpoint = async (req: any): Promise<Response> => {
  if (!req.user) return jsonResponse({ error: 'Unauthorized' }, 401)

  const tourId = getRelationshipId(req.routeParams?.id as RelationshipRef)
  if (!tourId) return jsonResponse({ error: 'Missing tour id' }, 400)

  const body = await readJsonBody(req)
  const floorIds = await getTourFloorIds(req, tourId, body.floorIds)
  const draftFloors = await getDraftFloorsForTour(req, floorIds)

  return jsonResponse({
    count: draftFloors.length,
    floors: serializeDraftFloors(draftFloors),
  })
}

const publishDraftScenesEndpoint = async (req: any): Promise<Response> => {
  if (!req.user) return jsonResponse({ error: 'Unauthorized' }, 401)

  const tourId = getRelationshipId(req.routeParams?.id as RelationshipRef)
  if (!tourId) return jsonResponse({ error: 'Missing tour id' }, 400)

  const body = await readJsonBody(req)
  const floorIds = await getTourFloorIds(req, tourId, body.floorIds)
  const draftScenes = await getDraftScenesForFloors(req, floorIds)
  const publishedScenes: any[] = []

  for (const scene of draftScenes) {
    const sceneId = getRelationshipId(scene.id as RelationshipRef)
    if (!sceneId) continue

    const published = await req.payload.update({
      collection: 'scenes',
      id: toPayloadId(sceneId),
      data: { _status: 'published' },
      overrideAccess: true,
      req,
    })

    publishedScenes.push(published)
  }

  return jsonResponse({
    count: publishedScenes.length,
    scenes: serializeDraftScenes(publishedScenes),
  })
}

const publishDraftFloorsEndpoint = async (req: any): Promise<Response> => {
  if (!req.user) return jsonResponse({ error: 'Unauthorized' }, 401)

  const tourId = getRelationshipId(req.routeParams?.id as RelationshipRef)
  if (!tourId) return jsonResponse({ error: 'Missing tour id' }, 400)

  const body = await readJsonBody(req)
  const floorIds = await getTourFloorIds(req, tourId, body.floorIds)
  const draftFloors = await getDraftFloorsForTour(req, floorIds)
  const publishedFloors: any[] = []

  for (const floor of draftFloors) {
    const floorId = getRelationshipId(floor.id as RelationshipRef)
    if (!floorId) continue

    const published = await req.payload.update({
      collection: 'floors',
      id: toPayloadId(floorId),
      data: { _status: 'published' },
      overrideAccess: true,
      req,
    })

    publishedFloors.push(published)
  }

  return jsonResponse({
    count: publishedFloors.length,
    floors: serializeDraftFloors(publishedFloors),
  })
}

export const Tours: CollectionConfig = {
  slug: 'tours',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    components: {
      edit: {
        PublishButton: '@/components/admin/TourPublishButton#TourPublishButton',
      },
    },
  },
  access: {
    read: publishedOrAdmin,
  },
  versions: {
    drafts: true,
  },
  endpoints: [
    {
      path: '/:id/draft-floors',
      method: 'post',
      handler: getDraftFloorsEndpoint,
    },
    {
      path: '/:id/publish-draft-floors',
      method: 'post',
      handler: publishDraftFloorsEndpoint,
    },
    {
      path: '/:id/draft-scenes',
      method: 'post',
      handler: getDraftScenesEndpoint,
    },
    {
      path: '/:id/publish-draft-scenes',
      method: 'post',
      handler: publishDraftScenesEndpoint,
    },
  ],
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      filterOptions: IMAGE_MEDIA_FILTER,
    },
    {
      name: 'tags',
      type: 'array',
      fields: [{ name: 'tag', type: 'text', required: true }],
      admin: { position: 'sidebar' },
    },
    { name: 'welcomeTitle', type: 'text' },
    { name: 'welcomeText', type: 'richText' },
    {
      name: 'defaultFloor',
      type: 'relationship',
      relationTo: 'floors',
      filterOptions: ({ siblingData }) => {
        const floorIds = getRelationshipIds((siblingData as any)?.floors)
        return floorIds.length > 0 ? { id: { in: floorIds } } : false
      },
      admin: {
        description: 'Only floors selected in this tour are available.',
      },
    },
    {
      name: 'floors',
      type: 'relationship',
      relationTo: 'floors',
      hasMany: true,
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        if (data?.title && !data?.slug) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }

        const floorIds = getRelationshipIds(data?.floors as RelationshipRef[] | undefined)
        const defaultFloorId = getRelationshipId(data?.defaultFloor as RelationshipRef)
        if (defaultFloorId && !floorIds.includes(defaultFloorId)) {
          throw new Error('Default floor must be one of the floors selected for this tour.')
        }

        const currentTourId = getRelationshipId((data?.id ?? originalDoc?.id) as RelationshipRef)
        const conflicts = await getFloorOwnershipConflicts(req, currentTourId, floorIds)
        if (conflicts.length > 0) {
          throw new Error(`A floor can only belong to one tour.\n\n${conflicts.join('\n')}`)
        }

        return data
      },
      async ({ data, req }) => {
        if (data._status !== 'published') return data

        const { payload } = req
        const errors: string[] = []

        // Keep incomplete drafts flexible, but block publishing until the viewer can load a complete tour.
        const floorRefs = data.floors as (string | number | { id: string | number })[] | undefined
        if (!floorRefs || floorRefs.length === 0) {
          errors.push('Tour has no floors linked. Add at least one floor before publishing.')
        }

        if (!data.defaultFloor) {
          errors.push('Tour has no default floor set. Set a default floor before publishing.')
        }

        const floorIds = (floorRefs || []).map((f) => (typeof f === 'object' ? f.id : f))
        const defaultFloorId = getRelationshipId(data.defaultFloor as RelationshipRef)
        if (defaultFloorId && !floorIds.map(String).includes(defaultFloorId)) {
          errors.push('Default floor must be one of the floors selected for this tour.')
        }

        for (const floorId of floorIds) {
          let floor: any
          try {
            floor = await payload.findByID({
              collection: 'floors',
              id: floorId,
              depth: 1,
              draft: true,
              overrideAccess: true,
            })
          } catch {
            errors.push(`Could not load floor with id "${floorId}".`)
            continue
          }

          const floorLabel = `Floor "${floor.name}"`

          if (floor._status !== 'published') {
            errors.push(`${floorLabel} has unpublished floor changes. Publish the floor before publishing the tour.`)
          }

          if (!floor.initialScene) {
            errors.push(`${floorLabel} has no initial scene set.`)
          }

          // Draft scenes are included so validation can explain what still needs publishing.
          const scenesResult = await payload.find({
            collection: 'scenes',
            where: { floor: { equals: floorId } },
            limit: 200,
            depth: 2,
            overrideAccess: true,
            draft: true,
          })

          const allScenes: any[] = scenesResult.docs

          const publishedScenes = allScenes.filter((s) => s._status === 'published')
          if (allScenes.length === 0) {
            errors.push(`${floorLabel} has no scenes.`)
          } else if (publishedScenes.length === 0) {
            errors.push(`${floorLabel} has no published scenes. Publish at least one scene first.`)
          }

          if (floor.initialScene) {
            const initialSceneId =
              typeof floor.initialScene === 'object' ? floor.initialScene.id : floor.initialScene
            const initialScene = allScenes.find((s) => s.id == initialSceneId)
            if (initialScene && initialScene._status !== 'published') {
              errors.push(
                `${floorLabel}: initial scene "${initialScene.title}" is not published. Publish it before publishing the tour.`,
              )
            }
          }

          for (const scene of publishedScenes) {
            const sceneLabel = `Scene "${scene.title}" (${floorLabel})`

            if (!scene.panorama) {
              errors.push(`${sceneLabel} is missing a panorama image.`)
            }

            for (const hotspot of scene.hotspots || []) {
              if (hotspot.type !== 'scene') continue
              if (!hotspot.targetScene) continue

              const targetId =
                typeof hotspot.targetScene === 'object'
                  ? hotspot.targetScene.id
                  : hotspot.targetScene

              let targetScene: any
              try {
                targetScene = await payload.findByID({
                  collection: 'scenes',
                  id: targetId,
                  depth: 0,
                  overrideAccess: true,
                  draft: true,
                })
              } catch {
                errors.push(
                  `${sceneLabel}: portal "${hotspot.text}" points to a scene that no longer exists (id: ${targetId}).`,
                )
                continue
              }

              if (targetScene._status !== 'published') {
                errors.push(
                  `${sceneLabel}: portal "${hotspot.text}" points to unpublished scene "${targetScene.title}". Publish the target scene first.`,
                )
              }

              const targetFloorId = getRelationshipId(targetScene.floor as RelationshipRef)
              const hotspotTargetFloorId = getRelationshipId(hotspot.targetFloor as RelationshipRef)
              if (targetFloorId && targetFloorId !== String(floorId) && hotspotTargetFloorId !== targetFloorId) {
                errors.push(
                  `${sceneLabel}: portal "${hotspot.text}" points to scene "${targetScene.title}" on another floor, but target floor is not set correctly. Re-select the target scene in the visual editor.`,
                )
              }
            }
          }
        }

        if (errors.length > 0) {
          throw new Error(
            `Cannot publish tour. Fix the following issues first:\n\n${errors.map((e) => `• ${e}`).join('\n')}`,
          )
        }

        return data
      },
    ],
    afterChange: [
      async ({ context, doc, req }) => {
        if (context?.skipTourFloorSync) return doc

        const tourId = getRelationshipId(doc?.id as RelationshipRef)
        if (!tourId) return doc

        const selectedFloorIds = new Set(getRelationshipIds(doc?.floors as RelationshipRef[] | undefined))
        const selectedFloorIdList = Array.from(selectedFloorIds)

        const linkedFloors = await req.payload.find({
          collection: 'floors',
          where: { tour: { equals: toPayloadId(tourId) } },
          limit: 1000,
          depth: 0,
          draft: true,
          overrideAccess: true,
          req,
        })

        const linkedFloorIds = new Set(
          linkedFloors.docs.map((floor: any) => getRelationshipId(floor.id)).filter((id): id is string => Boolean(id)),
        )

        const selectedFloors = selectedFloorIdList.length > 0
          ? await req.payload.find({
              collection: 'floors',
              where: { id: { in: selectedFloorIdList.map(toPayloadId) } },
              limit: selectedFloorIdList.length,
              depth: 0,
              draft: true,
              overrideAccess: true,
              req,
            })
          : { docs: [] }

        for (const floor of selectedFloors.docs as any[]) {
          const floorId = getRelationshipId(floor.id)
          if (!floorId) continue

          const existingTourId = getRelationshipId(floor.tour as RelationshipRef)
          if (existingTourId === tourId) continue

          await req.payload.update({
            collection: 'floors',
            id: toPayloadId(floorId),
            data: { tour: Number(tourId) },
            draft: true,
            context: { ...context, skipFloorTourSync: true },
            overrideAccess: true,
            req,
          })
        }

        for (const floorId of linkedFloorIds) {
          if (selectedFloorIds.has(floorId)) continue

          await req.payload.update({
            collection: 'floors',
            id: toPayloadId(floorId),
            data: { tour: null },
            draft: true,
            context: { ...context, skipFloorTourSync: true },
            overrideAccess: true,
            req,
          })
        }

        return doc
      },
    ],
  },
}
