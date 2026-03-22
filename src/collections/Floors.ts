import type { CollectionConfig } from 'payload'

export const Floors: CollectionConfig = {
  slug: 'floors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'order', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
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
    },
    {
      name: 'initialScene',
      type: 'relationship',
      relationTo: 'scenes',
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
    {
      name: 'mapPoints',
      type: 'array',
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
      async ({ data }) => {
        if (data?.name && !data?.slug) {
          data.slug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }
        return data
      },
    ],
  },
}
