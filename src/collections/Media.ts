import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  upload: {
    mimeTypes: ['image/*', 'image/svg+xml'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: undefined, position: 'centre' },
      { name: 'preview', width: 1200, height: undefined, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
  },
  fields: [
    { name: 'alt', type: 'text', required: true },
    {
      name: 'tags',
      type: 'array',
      fields: [{ name: 'tag', type: 'text', required: true }],
    },
  ],
  hooks: {
    beforeDelete: [
      async ({ req, id }) => {
        const { payload } = req
        // Check if media is referenced by any scene panorama
        const scenesUsingMedia = await payload.find({
          collection: 'scenes',
          where: { panorama: { equals: id } },
          limit: 1,
          depth: 0,
        })
        if (scenesUsingMedia.totalDocs > 0) {
          throw new Error(
            `Cannot delete: this media is used as a panorama in scene "${scenesUsingMedia.docs[0].title}". Remove the reference first.`
          )
        }
        // Check if media is used as tour cover image
        const toursUsingMedia = await payload.find({
          collection: 'tours',
          where: { coverImage: { equals: id } },
          limit: 1,
          depth: 0,
        })
        if (toursUsingMedia.totalDocs > 0) {
          throw new Error(
            `Cannot delete: this media is used as a cover image in tour "${toursUsingMedia.docs[0].title}". Remove the reference first.`
          )
        }
        // Check floors floorplan
        const floorsUsingMedia = await payload.find({
          collection: 'floors',
          where: { floorplan: { equals: id } },
          limit: 1,
          depth: 0,
        })
        if (floorsUsingMedia.totalDocs > 0) {
          throw new Error(
            `Cannot delete: this media is used as a floorplan in floor "${floorsUsingMedia.docs[0].name}". Remove the reference first.`
          )
        }
      },
    ],
  },
}
