import type { CollectionConfig } from 'payload'
import { publishedOrAdmin } from '../access/publishedOrAdmin'

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
        description: 'Each row mirrors a marker from the visual editor above. Use this list for advanced editing (rich text info content lives here).',
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
      async ({ data, req }) => {
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

        return data
      },
    ],
  },
}
