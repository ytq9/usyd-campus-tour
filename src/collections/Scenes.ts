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
      admin: {
        description: 'Upload or select an equirectangular 360 panorama with a 2:1 aspect ratio, such as 7680x3840.',
        components: {
          afterInput: ['/components/admin/PanoramaValidationPreview'],
        },
      },
    },
    {
      name: 'initialYaw',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Initial horizontal camera angle' },
    },
    {
      name: 'initialPitch',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Initial vertical camera angle' },
    },
    {
      name: 'initialHfov',
      type: 'number',
      defaultValue: 120,
      admin: { description: 'Initial horizontal field of view' },
    },
    {
      name: 'rotation',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Image rotation offset in degrees' },
    },
    {
      name: 'hotspots',
      type: 'array',
      admin: {
        description: 'Floating items: portals (scene navigation) and info items (content modals)',
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Portal (Scene Navigation)', value: 'scene' },
            { label: 'Info Item', value: 'info' },
          ],
        },
        {
          name: 'pitch',
          type: 'number',
          required: true,
          admin: { description: 'Vertical position (-90 to 90)' },
        },
        {
          name: 'yaw',
          type: 'number',
          required: true,
          admin: { description: 'Horizontal position (-180 to 180)' },
        },
        {
          name: 'text',
          type: 'text',
          required: true,
          admin: { description: 'Hotspot label' },
        },
        {
          name: 'targetScene',
          type: 'relationship',
          relationTo: 'scenes',
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'scene',
            description: 'Target scene for portal navigation',
          },
        },
        {
          name: 'targetFloor',
          type: 'relationship',
          relationTo: 'floors',
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'scene',
            description: 'Target floor (for cross-floor portals)',
          },
        },
        {
          name: 'infoContent',
          type: 'richText',
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'info',
            description: 'Content shown in info modal',
          },
        },
        {
          name: 'cssClass',
          type: 'text',
          admin: { description: 'Optional CSS class for styling' },
        },
        {
          name: 'iconColor',
          type: 'text',
          admin: { description: 'Optional icon color (hex)' },
        },
        {
          name: 'iconSize',
          type: 'select',
          options: [
            { label: 'Small', value: 'sm' },
            { label: 'Medium', value: 'md' },
            { label: 'Large', value: 'lg' },
          ],
          defaultValue: 'md',
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
