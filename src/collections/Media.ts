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
  // ✅ 注册自定义组件到 Media 列表页顶部
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
    // ✅ 兜底：如果 alt 为空，自动用文件名填充
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
        })
        if (floorsUsingMedia.totalDocs > 0) {
          throw new Error(
            `Cannot delete: this media is used as a floorplan in floor "${floorsUsingMedia.docs[0].name}". Remove the reference first.`,
          )
        }
      },
    ],
  },
}