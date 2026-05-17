import type { CollectionConfig } from 'payload'
import { publishedOrAdmin } from '../access/publishedOrAdmin'

const IMAGE_MEDIA_FILTER = { mimeType: { like: 'image/' } }
const VIDEO_MEDIA_FILTER = { mimeType: { in: ['video/mp4', 'video/webm'] } }

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

const toPayloadId = (id: string): string | number => {
  const numericId = Number(id)
  return Number.isNaN(numericId) ? id : numericId
}

export const Scenes: CollectionConfig = {
  slug: 'scenes',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'floor', '_status', 'updatedAt'],
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
    },
    {
      name: 'floor',
      type: 'relationship',
      relationTo: 'floors',
      required: true,
    },
    { name: 'description', type: 'richText' },
    {
      name: 'tags',
      type: 'array',
      fields: [{ name: 'tag', type: 'text', required: true }],
      admin: { position: 'sidebar' },
    },
    {
      name: 'accessibilityNotes',
      type: 'textarea',
      admin: { position: 'sidebar' },
    },
    {
      name: 'panorama',
      type: 'upload',
      relationTo: 'media',
      filterOptions: IMAGE_MEDIA_FILTER,
      required: true,
    },
    {
      name: 'initialYaw',
      type: 'number',
      defaultValue: 0,
      admin: { hidden: true },
    },
    {
      name: 'initialPitch',
      type: 'number',
      defaultValue: 0,
      admin: { hidden: true },
    },
    {
      name: 'initialHfov',
      type: 'number',
      defaultValue: 120,
      admin: { hidden: true },
    },
    {
      name: 'rotation',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Image rotation offset in degrees' },
    },
    {
      name: 'hotspotEditor',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/admin/three/ThreeSceneHotspotEditor',
        },
      },
    },
    {
      name: 'hotspots',
      type: 'array',
      admin: {
        description: 'Each row mirrors a marker from the visual editor above. This list remains available as a fallback for advanced hotspot editing.',
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'info',
          options: [
            { label: 'Portal (Scene Navigation)', value: 'scene' },
            { label: 'Info Item', value: 'info' },
          ],
        },
        {
          name: 'text',
          type: 'text',
          required: true,
          defaultValue: 'New Hotspot',
        },
        {
          name: 'pitch',
          type: 'number',
          required: true,
          defaultValue: 0,
        },
        {
          name: 'yaw',
          type: 'number',
          required: true,
          defaultValue: 0,
        },
        {
          name: 'targetScene',
          type: 'relationship',
          relationTo: 'scenes',
        },
        {
          name: 'targetFloor',
          type: 'relationship',
          relationTo: 'floors',
        },
        {
          name: 'infoContent',
          type: 'richText',
        },
        {
          name: 'infoVideo',
          type: 'upload',
          relationTo: 'media',
          filterOptions: VIDEO_MEDIA_FILTER,
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'info',
            description: 'Optional MP4 or WebM video attachment for this info item.',
          },
        },
        {
          name: 'iconStyle',
          type: 'select',
          defaultValue: 'default',
          options: [
            { label: 'Default (Arrow / Info)', value: 'default' },
            { label: 'Arrow', value: 'arrow' },
            { label: 'Info', value: 'info' },
            { label: 'Pin', value: 'pin' },
            { label: 'Star', value: 'star' },
            { label: 'Building', value: 'building' },
            { label: 'Academic', value: 'academic' },
            { label: 'Camera', value: 'camera' },
            { label: 'Question', value: 'question' },
          ],
        },
        {
          name: 'iconColor',
          type: 'text',
        },
        {
          name: 'iconSize',
          type: 'select',
          defaultValue: 'md',
          options: [
            { label: 'Small', value: 'sm' },
            { label: 'Medium', value: 'md' },
            { label: 'Large', value: 'lg' },
          ],
        },
        {
          name: 'cssClass',
          type: 'text',
        },
      ],
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

        if (data?.panorama) {
          const panoramaId = typeof data.panorama === 'object' ? data.panorama.id : data.panorama

          if (panoramaId) {
            const panorama = await req.payload.findByID({
              collection: 'media',
              id: panoramaId,
              depth: 0,
            })

            const width = typeof panorama.width === 'number' ? panorama.width : 0
            const height = typeof panorama.height === 'number' ? panorama.height : 0
            const isValidPanorama = width > 0 && height > 0 && width === height * 2

            if (!isValidPanorama) {
              const dimensionText = width > 0 && height > 0 ? `${width}x${height}` : 'unknown dimensions'

              throw new Error(
                `The selected image is not a valid 360° panorama. Expected a 2:1 equirectangular image, but received ${dimensionText}.`
              )
            }
          }
        }

        const previousPanoramaId = getRelationshipId(originalDoc?.panorama as RelationshipRef)
        const nextPanoramaId = getRelationshipId(data?.panorama as RelationshipRef)
        if (previousPanoramaId && nextPanoramaId && previousPanoramaId !== nextPanoramaId) {
          data.hotspots = []
        } else if (Array.isArray(data?.hotspots)) {
          const currentFloorId = getRelationshipId((data?.floor ?? originalDoc?.floor) as RelationshipRef)

          for (const hotspot of data.hotspots) {
            if (hotspot?.type !== 'scene' || !hotspot.targetScene) continue

            const targetSceneId = getRelationshipId(hotspot.targetScene as RelationshipRef)
            if (!targetSceneId) continue

            try {
              const targetScene = await req.payload.findByID({
                collection: 'scenes',
                id: toPayloadId(targetSceneId),
                depth: 0,
                overrideAccess: true,
                draft: true,
              })

              const targetFloorId = getRelationshipId(targetScene?.floor as RelationshipRef)
              if (!targetFloorId || !currentFloorId) continue

              hotspot.targetFloor =
                targetFloorId === currentFloorId ? null : toPayloadId(targetFloorId)
            } catch {
              // Leave invalid targetScene references for existing publish validation to report.
            }
          }
        }

        return data
      },
    ],
  },
}
