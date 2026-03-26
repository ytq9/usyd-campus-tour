import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Tours } from './collections/Tours'
import { Floors } from './collections/Floors'
import { Scenes } from './collections/Scenes'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    livePreview: {
      url: ({ data, collectionConfig }) => {
        if (collectionConfig?.slug === 'tours') {
          return `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/tour/${data?.slug}/preview`
        }
        return `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}`
      },
      collections: ['tours'],
    },
  },
  collections: [Users, Media, Tours, Floors, Scenes],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'default-secret-change-me',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    push: true,
    pool: {
      connectionString: process.env.DATABASE_URI || 'postgresql://localhost:5432/usyd_campus_tour',
    },
  }),
  sharp,
})
