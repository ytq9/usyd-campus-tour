import type { CollectionConfig } from 'payload'

const VIDEO_MIME_TYPES = ['video/mp4', 'video/webm']

export const Media: CollectionConfig = {
  slug: 'media',
  defaultSort: '-updatedAt',
  access: {
    read: () => true,
  },
  upload: {
    bulkUpload: false,
    mimeTypes: ['image/*', 'image/svg+xml', ...VIDEO_MIME_TYPES],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: undefined, position: 'centre' },
      { name: 'preview', width: 1200, height: undefined, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
  },
  admin: {
    components: {
      beforeList: ['@/components/MediaBulkUpload/BeforeListComponent#MediaBeforeList'],
    },
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
    beforeOperation: [
      ({ args, operation }) => {
        if ((operation === 'create' || operation === 'update') && args.req?.file) {
          const file = args.req.file
          if (!args.data?.alt && file.name) {
            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
            if (!args.data) args.data = {}
            args.data.alt = nameWithoutExt
          }
        }
        return args
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        const { payload } = req
        const scenesUsingMedia = await payload.find({
          collection: 'scenes',
          where: { panorama: { equals: id } },
          limit: 1,
          depth: 0,
          draft: true,
          overrideAccess: true,
          req,
        })
        if (scenesUsingMedia.totalDocs > 0) {
          throw new Error(
            `Cannot delete: this media is used as a panorama in scene "${scenesUsingMedia.docs[0].title}". Remove the reference first.`,
          )
        }
        const toursUsingMedia = await payload.find({
          collection: 'tours',
          where: { coverImage: { equals: id } },
          limit: 1,
          depth: 0,
          draft: true,
          overrideAccess: true,
          req,
        })
        if (toursUsingMedia.totalDocs > 0) {
          throw new Error(
            `Cannot delete: this media is used as a cover image in tour "${toursUsingMedia.docs[0].title}". Remove the reference first.`,
          )
        }
        const floorsUsingMedia = await payload.find({
          collection: 'floors',
          where: { floorplan: { equals: id } },
          limit: 1,
          depth: 0,
          draft: true,
          overrideAccess: true,
          req,
        })
        if (floorsUsingMedia.totalDocs > 0) {
          throw new Error(
            `Cannot delete: this media is used as a floorplan in floor "${floorsUsingMedia.docs[0].name}". Remove the reference first.`,
          )
        }
        const scenesUsingInfoVideo = await payload.find({
          collection: 'scenes',
          where: { 'hotspots.infoVideo': { equals: id } },
          limit: 1,
          depth: 0,
          draft: true,
          overrideAccess: true,
          req,
        })
        if (scenesUsingInfoVideo.totalDocs > 0) {
          throw new Error(
            `Cannot delete: this media is used as an info hotspot video in scene "${scenesUsingInfoVideo.docs[0].title}". Remove the reference first.`,
          )
        }
      },
    ],
  },
}
