/**
 * Seed script to import reference project data into PayloadCMS.
 *
 * Usage: Copy the reference project's public/tour and src/config directories,
 * then run: npx tsx src/seed/index.ts
 *
 * This script expects:
 * - src/seed/data/tour.json (from reference src/config/tour.json)
 * - src/seed/data/floorplans/*.json (from reference src/config/floorplans/)
 * - public/tour/panoramas/ (panorama images)
 * - public/tour/floorplan/ (floorplan SVGs)
 */

import { getPayload } from 'payload'
import config from '../payload.config'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

type HotspotRef = {
  sceneLocalId: string
  floorLocalId: string
  hotspot: any
  sceneDbId: number
}

// This project uses numeric Postgres IDs. Keep seed relationship values aligned
// with Payload's generated relationship types.
type PayloadId = number
type IdMap = Record<string, PayloadId>

type RichTextValue = {
  root: {
    type: string
    children: {
      type: any
      version: number
      [key: string]: unknown
    }[]
    direction: ('ltr' | 'rtl') | null
    format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | ''
    indent: number
    version: number
  }
  [key: string]: unknown
}

function createRichText(text: string): RichTextValue {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              text,
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              version: 1,
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          textFormat: 0,
          textStyle: '',
          version: 1,
        },
      ],
      direction: null,
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

const toNumberId = (id: string | number | null | undefined): number => {
  const numericId = Number(id)
  if (!Number.isFinite(numericId)) {
    throw new Error(`Expected numeric Payload ID, received ${String(id)}`)
  }
  return numericId
}

async function seed() {
  console.log('Starting seed...')

  const payload = await getPayload({ config })

  const existingUsers = await payload.find({ collection: 'users', limit: 1 })
  if (existingUsers.totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: {
        email: 'admin@usyd.edu.au',
        password: 'admin123',
      },
    })
    console.log('Created admin user: admin@usyd.edu.au / admin123')
  }

  const tourConfigPath = path.resolve(__dirname, 'data/tour.json')
  if (!fs.existsSync(tourConfigPath)) {
    console.log('No seed data found at src/seed/data/tour.json')
    console.log('To seed with reference data:')
    console.log('  1. mkdir -p src/seed/data/floorplans')
    console.log('  2. Copy reference src/config/tour.json to src/seed/data/tour.json')
    console.log('  3. Copy reference src/config/floorplans/*.json to src/seed/data/floorplans/')
    console.log('  4. Copy reference public/tour/ to public/tour/')
    console.log('  5. Re-run this script')

    console.log('\nCreating sample tour data...')
    await createSampleTour(payload)
    process.exit(0)
  }

  const tourConfig = JSON.parse(fs.readFileSync(tourConfigPath, 'utf-8'))

  const mediaMap: IdMap = {}
  const floorMap: IdMap = {}
  const sceneMap: IdMap = {}
  const hotspotRefs: HotspotRef[] = []

  console.log('Uploading media files...')
  const publicDir = path.resolve(__dirname, '../../public')

  for (const floorplan of tourConfig.floorplans) {
    const floorSlug = floorplan.config.replace('.json', '')

    const svgPath = path.join(publicDir, floorplan.floorplan)
    if (fs.existsSync(svgPath)) {
      const svgFilename = path.basename(svgPath)
      const existing = await payload.find({
        collection: 'media',
        where: { filename: { equals: svgFilename } },
        limit: 1,
      })
      if (existing.totalDocs === 0) {
        const media = await payload.create({
          collection: 'media',
          data: { alt: `${floorplan.floorName} floorplan` },
          filePath: svgPath,
        })
        mediaMap[floorplan.floorplan] = toNumberId(media.id)
        console.log(`  Uploaded floorplan: ${svgFilename}`)
      } else {
        mediaMap[floorplan.floorplan] = toNumberId(existing.docs[0].id)
      }
    }

    const floorConfigPath = path.resolve(__dirname, `data/floorplans/${floorplan.config}`)
    if (fs.existsSync(floorConfigPath)) {
      const floorConfig = JSON.parse(fs.readFileSync(floorConfigPath, 'utf-8'))
      for (const [sceneId, sceneData] of Object.entries(floorConfig) as [string, any][]) {
        const panoramaPath = path.join(publicDir, sceneData.panorama)
        if (fs.existsSync(panoramaPath)) {
          const panoramaFilename = path.basename(panoramaPath)
          const existing = await payload.find({
            collection: 'media',
            where: { filename: { equals: panoramaFilename } },
            limit: 1,
          })
          if (existing.totalDocs === 0) {
            try {
              const media = await payload.create({
                collection: 'media',
                data: { alt: sceneData.title || sceneId },
                filePath: panoramaPath,
              })
              mediaMap[sceneData.panorama] = toNumberId(media.id)
              console.log(`  Uploaded panorama: ${panoramaFilename}`)
            } catch (err) {
              console.error(`  Failed to upload ${panoramaFilename}:`, err)
            }
          } else {
            mediaMap[sceneData.panorama] = toNumberId(existing.docs[0].id)
          }
        }
      }
    }
  }

  console.log('Creating tour...')
  const tour = await payload.create({
    collection: 'tours',
    draft: false,
    data: {
      title: tourConfig.landingPageTitle,
      slug: 'shepherd-street-j15',
      welcomeTitle: tourConfig.welcomeTitle,
      welcomeText: createRichText(tourConfig.welcomeText),
      tags: [{ tag: 'engineering' }, { tag: 'campus' }],
      _status: 'published',
    },
  })
  console.log(`  Created tour: ${tour.title}`)

  console.log('Creating floors...')
  for (let i = 0; i < tourConfig.floorplans.length; i++) {
    const fp = tourConfig.floorplans[i]
    const floorSlug = fp.config.replace('.json', '')

    const floorData: any = {
      name: fp.floorName,
      slug: floorSlug,
      tour: toNumberId(tour.id),
      _status: 'published',
    }

    if (mediaMap[fp.floorplan]) {
      floorData.floorplan = mediaMap[fp.floorplan]
    }

    const floor = await payload.create({
      collection: 'floors',
      draft: false,
      data: floorData,
    })
    floorMap[floorSlug] = toNumberId(floor.id)
    console.log(`  Created floor: ${fp.floorName}`)
  }

  console.log('Creating scenes...')
  for (const fp of tourConfig.floorplans) {
    const floorSlug = fp.config.replace('.json', '')
    const floorConfigPath = path.resolve(__dirname, `data/floorplans/${fp.config}`)

    if (!fs.existsSync(floorConfigPath)) continue

    const floorConfig = JSON.parse(fs.readFileSync(floorConfigPath, 'utf-8'))

    for (const [sceneLocalId, sceneData] of Object.entries(floorConfig) as [string, any][]) {
      const sceneSlug = sceneLocalId.replace(/\./g, '-')
      const panoramaId = mediaMap[sceneData.panorama]

      if (!panoramaId) {
        console.warn(`  Skipping scene without panorama media: ${sceneData.title || sceneLocalId}`)
        continue
      }

      const scene = await payload.create({
        collection: 'scenes',
        draft: false,
        data: {
          title: sceneData.title || sceneLocalId,
          slug: sceneSlug,
          floor: floorMap[floorSlug],
          description: sceneData.sceneDesc
            ? createRichText(sceneData.sceneDesc)
            : undefined,
          panorama: panoramaId,
          initialYaw: sceneData.yaw || 0,
          initialPitch: sceneData.pitch || 0,
          initialHfov: sceneData.hfov || 120,
          rotation: sceneData.rotation || 0,
          _status: 'published',
        },
      })

      sceneMap[`${floorSlug}/${sceneLocalId}`] = toNumberId(scene.id)

      if (sceneData.hotSpots) {
        for (const hs of sceneData.hotSpots) {
          hotspotRefs.push({
            sceneLocalId,
            floorLocalId: floorSlug,
            hotspot: hs,
            sceneDbId: toNumberId(scene.id),
          })
        }
      }

      console.log(`  Created scene: ${sceneData.title || sceneLocalId}`)
    }
  }

  console.log('Adding hotspots to scenes...')
  const sceneHotspots: Record<string, any[]> = {}

  for (const ref of hotspotRefs) {
    const sceneDbId = String(ref.sceneDbId)
    if (!sceneHotspots[sceneDbId]) {
      sceneHotspots[sceneDbId] = []
    }

    const hs = ref.hotspot
    const hotspotData: any = {
      type: hs.type === 'info' ? 'info' : 'scene',
      pitch: hs.pitch || 0,
      yaw: hs.yaw || 0,
      text: hs.text || '',
      iconSize: 'md',
    }

    if (hs.type === 'scene' || hs.type !== 'info') {
      const isNewFloor = hs.navType === 'newFloorScene'
      if (isNewFloor && hs.sceneId) {
        const parts = hs.sceneId.split('/')
        if (parts.length === 2) {
          const targetFloorSlug = parts[0]
          const targetSceneLocalId = parts[1]
          const targetSceneDbId = sceneMap[`${targetFloorSlug}/${targetSceneLocalId}`]
          if (targetSceneDbId) {
            hotspotData.targetScene = targetSceneDbId
            hotspotData.targetFloor = floorMap[targetFloorSlug]
          }
        }
      } else if (hs.sceneId) {
        const targetSceneDbId = sceneMap[`${ref.floorLocalId}/${hs.sceneId}`]
        if (targetSceneDbId) {
          hotspotData.targetScene = targetSceneDbId
        }
      }
    }

    if (hs.type === 'info' && hs.description) {
      hotspotData.infoContent = createRichText(hs.description)
    }

    sceneHotspots[sceneDbId].push(hotspotData)
  }

  for (const [sceneId, hotspots] of Object.entries(sceneHotspots)) {
    await payload.update({
      collection: 'scenes',
      id: toNumberId(sceneId),
      data: { hotspots },
    })
  }
  console.log(`  Updated ${Object.keys(sceneHotspots).length} scenes with hotspots`)

  console.log('Updating floors with initial scenes and map points...')
  for (const fp of tourConfig.floorplans) {
    const floorSlug = fp.config.replace('.json', '')
    const floorDbId = floorMap[floorSlug]

    const initialSceneDbId = sceneMap[`${floorSlug}/${fp.initialSceneId}`]

    const mapPoints = (fp.hotSpotPoints || [])
      .map((pt: any) => {
        const sceneDbId = sceneMap[`${floorSlug}/${pt.sceneId}`]
        if (!sceneDbId) return null
        return {
          scene: sceneDbId,
          cx: parseInt(pt.cx, 10),
          cy: parseInt(pt.cy, 10),
          color: pt.fill || '#E64626',
        }
      })
      .filter(Boolean)

    await payload.update({
      collection: 'floors',
      id: floorDbId,
      draft: false,
      data: {
        initialScene: initialSceneDbId || undefined,
        mapPoints,
        _status: 'published',
      } as any,
    })
    console.log(`  Updated floor: ${fp.floorName}`)
  }

  console.log('Updating tour with floors...')
  const floorIds = tourConfig.floorplans.map((fp: any) => {
    const floorSlug = fp.config.replace('.json', '')
    return floorMap[floorSlug]
  })

  const defaultFloorSlug = tourConfig.floorplans[tourConfig.defaultFloor]?.config.replace('.json', '')

  await payload.update({
    collection: 'tours',
    id: toNumberId(tour.id),
    data: {
      floors: floorIds,
      defaultFloor: floorMap[defaultFloorSlug] || floorIds[0],
    },
  })
  console.log('  Updated tour with floors')

  console.log('\nSeed complete!')
  process.exit(0)
}

async function createSampleTour(payload: any) {
  // Keep local setup usable even when the reference data bundle is not present.
  const tour = await payload.create({
    collection: 'tours',
    draft: false,
    data: {
      title: 'Sample Campus Tour',
      slug: 'sample-tour',
      welcomeTitle: 'Welcome to the Campus Tour',
      tags: [{ tag: 'sample' }],
      _status: 'published',
    },
  })

  const floor = await payload.create({
    collection: 'floors',
    draft: false,
    data: {
      name: 'Ground Floor',
      slug: 'ground-floor',
      tour: toNumberId(tour.id),
      _status: 'published',
    },
  })

  await payload.update({
    collection: 'tours',
    id: toNumberId(tour.id),
    data: {
      floors: [toNumberId(floor.id)],
      defaultFloor: toNumberId(floor.id),
    },
  })

  console.log('Created sample tour: /tour/sample-tour')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
