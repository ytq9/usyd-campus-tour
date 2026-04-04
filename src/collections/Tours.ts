import type { CollectionConfig } from 'payload'
import { publishedOrAdmin } from '../access/publishedOrAdmin'

export const Tours: CollectionConfig = {
  slug: 'tours',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
  },
  access: {
    read: publishedOrAdmin,
  },
  versions: {
    drafts: true,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { position: 'sidebar' },
    },
    { name: 'description', type: 'richText' },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
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
      async ({ data, req, operation }) => {
        // Auto-generate slug from title if not set
        if (data?.title && !data?.slug) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }
        return data
      },
      async ({ data, req }) => {
        // Publish workflow validation — only runs when publishing
        if (data._status !== 'published') return data

        const { payload } = req
        const errors: string[] = []

        // Check 1: Tour must have floors
        const floorRefs = data.floors as (string | number | { id: string | number })[] | undefined
        if (!floorRefs || floorRefs.length === 0) {
          errors.push('Tour has no floors linked. Add at least one floor before publishing.')
        }

        // Check 2: Tour must have a defaultFloor
        if (!data.defaultFloor) {
          errors.push('Tour has no default floor set. Set a default floor before publishing.')
        }

        // Checks 3–7: Per-floor and per-scene validation
        const floorIds = (floorRefs || []).map((f) => (typeof f === 'object' ? f.id : f))

        for (const floorId of floorIds) {
          let floor: any
          try {
            floor = await payload.findByID({
              collection: 'floors',
              id: floorId,
              depth: 1,
              overrideAccess: true,
            })
          } catch {
            errors.push(`Could not load floor with id "${floorId}".`)
            continue
          }

          const floorLabel = `Floor "${floor.name}"`

          // Check 3: Each floor must have an initialScene
          if (!floor.initialScene) {
            errors.push(`${floorLabel} has no initial scene set.`)
          }

          // Fetch all scenes on this floor (including drafts)
          const scenesResult = await payload.find({
            collection: 'scenes',
            where: { floor: { equals: floorId } },
            limit: 200,
            depth: 2,
            overrideAccess: true,
            draft: true,
          })

          const allScenes: any[] = scenesResult.docs

          // Check 4: Each floor must have at least one published scene
          const publishedScenes = allScenes.filter((s) => s._status === 'published')
          if (allScenes.length === 0) {
            errors.push(`${floorLabel} has no scenes.`)
          } else if (publishedScenes.length === 0) {
            errors.push(`${floorLabel} has no published scenes. Publish at least one scene first.`)
          }

          // Check 5: initialScene must be published
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

          // Checks 6 & 7: Per-scene checks (panorama and portal hotspot targets)
          for (const scene of publishedScenes) {
            const sceneLabel = `Scene "${scene.title}" (${floorLabel})`

            // Check 6: Published scene must have a panorama
            if (!scene.panorama) {
              errors.push(`${sceneLabel} is missing a panorama image.`)
            }

            // Check 7: Portal hotspots must point to published scenes
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
  },
}
