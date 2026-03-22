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
  sceneDbId: string | number
}

// ID maps use string keys to simplify cross-referencing
type IdMap = Record<string, string | number>

async function seed() {
  console.log('Starting seed...')

  const payload = await getPayload({ config })

  // Create admin user if none exists
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

  // Check for seed data
  const tourConfigPath = path.resolve(__dirname, 'data/tour.json')
  if (!fs.existsSync(tourConfigPath)) {
    console.log('No seed data found at src/seed/data/tour.json')
    console.log('To seed with reference data:')
    console.log('  1. mkdir -p src/seed/data/floorplans')
    console.log('  2. Copy reference src/config/tour.json to src/seed/data/tour.json')
    console.log('  3. Copy reference src/config/floorplans/*.json to src/seed/data/floorplans/')
    console.log('  4. Copy reference public/tour/ to public/tour/')
    console.log('  5. Re-run this script')

    // Create a sample tour anyway
    console.log('\nCreating sample tour data...')
    await createSampleTour(payload)
    process.exit(0)
  }

  // Load tour config
  const tourConfig = JSON.parse(fs.readFileSync(tourConfigPath, 'utf-8'))

  // Maps for tracking created records
  const mediaMap: IdMap = {} // filePath -> mediaId
  const floorMap: IdMap = {} // floorSlug -> floorId
  const sceneMap: IdMap = {} // "floorSlug/sceneLocalId" -> sceneDbId
  const hotspotRefs: HotspotRef[] = [] // deferred hotspot creation

  // 1. Upload panorama images and floorplan SVGs
  console.log('Uploading media files...')
  const publicDir = path.resolve(__dirname, '../../public')

  for (const floorplan of tourConfig.floorplans) {
    const floorSlug = floorplan.config.replace('.json', '')

    // Upload floorplan SVG
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
        mediaMap[floorplan.floorplan] = media.id
        console.log(`  Uploaded floorplan: ${svgFilename}`)
      } else {
        mediaMap[floorplan.floorplan] = existing.docs[0].id
      }
    }

    // Upload panorama images for this floor
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
              mediaMap[sceneData.panorama] = media.id
              console.log(`  Uploaded panorama: ${panoramaFilename}`)
            } catch (err) {
              console.error(`  Failed to upload ${panoramaFilename}:`, err)
            }
          } else {
            mediaMap[sceneData.panorama] = existing.docs[0].id
          }
        }
      }
    }
  }

  // 2. Create Tour
  console.log('Creating tour...')
  const tour = await payload.create({
    collection: 'tours',
    data: {
      title: tourConfig.landingPageTitle,
      slug: 'shepherd-street-j15',
      welcomeTitle: tourConfig.welcomeTitle,
      welcomeText: { root: { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', text: tourConfig.welcomeText }] }] } },
      tags: [{ tag: 'engineering' }, { tag: 'campus' }],
      _status: 'published',
    },
  })
  console.log(`  Created tour: ${tour.title}`)

  // 3. Create Floors (without initialScene - will update later)
  console.log('Creating floors...')
  for (let i = 0; i < tourConfig.floorplans.length; i++) {
    const fp = tourConfig.floorplans[i]
    const floorSlug = fp.config.replace('.json', '')

    const floorData: any = {
      name: fp.floorName,
      slug: floorSlug,
      tour: tour.id,
      order: i,
    }

    if (mediaMap[fp.floorplan]) {
      floorData.floorplan = mediaMap[fp.floorplan]
    }

    const floor = await payload.create({
      collection: 'floors',
      data: floorData,
    })
    floorMap[floorSlug] = floor.id
    console.log(`  Created floor: ${fp.floorName}`)
  }

  // 4. Create Scenes (without hotspots - will update later)
  console.log('Creating scenes...')
  for (const fp of tourConfig.floorplans) {
    const floorSlug = fp.config.replace('.json', '')
    const floorConfigPath = path.resolve(__dirname, `data/floorplans/${fp.config}`)

    if (!fs.existsSync(floorConfigPath)) continue

    const floorConfig = JSON.parse(fs.readFileSync(floorConfigPath, 'utf-8'))

    for (const [sceneLocalId, sceneData] of Object.entries(floorConfig) as [string, any][]) {
      const sceneSlug = sceneLocalId.replace(/\./g, '-')

      const scene = await payload.create({
        collection: 'scenes',
        data: {
          title: sceneData.title || sceneLocalId,
          slug: sceneSlug,
          floor: floorMap[floorSlug],
          description: sceneData.sceneDesc
            ? { root: { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', text: sceneData.sceneDesc }] }] } }
            : undefined,
          panorama: mediaMap[sceneData.panorama] || undefined,
          initialYaw: sceneData.yaw || 0,
          initialPitch: sceneData.pitch || 0,
          initialHfov: sceneData.hfov || 120,
          rotation: sceneData.rotation || 0,
          _status: 'published',
        },
      })

      sceneMap[`${floorSlug}/${sceneLocalId}`] = scene.id

      // Store hotspot references for later
      if (sceneData.hotSpots) {
        for (const hs of sceneData.hotSpots) {
          hotspotRefs.push({
            sceneLocalId,
            floorLocalId: floorSlug,
            hotspot: hs,
            sceneDbId: scene.id,
          })
        }
      }

      console.log(`  Created scene: ${sceneData.title || sceneLocalId}`)
    }
  }

  // 5. Update Scenes with hotspots (now that all scenes exist for cross-references)
  console.log('Adding hotspots to scenes...')
  const sceneHotspots: Record<string, any[]> = {}

  for (const ref of hotspotRefs) {
    if (!sceneHotspots[ref.sceneDbId]) {
      sceneHotspots[ref.sceneDbId] = []
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
      // Resolve target scene
      const isNewFloor = hs.navType === 'newFloorScene'
      if (isNewFloor && hs.sceneId) {
        // sceneId format: "floorSlug/sceneId" for cross-floor
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
        // Same floor
        const targetSceneDbId = sceneMap[`${ref.floorLocalId}/${hs.sceneId}`]
        if (targetSceneDbId) {
          hotspotData.targetScene = targetSceneDbId
        }
      }
    }

    if (hs.type === 'info' && hs.description) {
      hotspotData.infoContent = {
        root: { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', text: hs.description }] }] }
      }
    }

    sceneHotspots[ref.sceneDbId].push(hotspotData)
  }

  for (const [sceneId, hotspots] of Object.entries(sceneHotspots)) {
    await payload.update({
      collection: 'scenes',
      id: sceneId,
      data: { hotspots },
    })
  }
  console.log(`  Updated ${Object.keys(sceneHotspots).length} scenes with hotspots`)

  // 6. Update Floors with initialScene and mapPoints
  console.log('Updating floors with initial scenes and map points...')
  for (const fp of tourConfig.floorplans) {
    const floorSlug = fp.config.replace('.json', '')
    const floorDbId = floorMap[floorSlug]

    // Resolve initial scene
    const initialSceneDbId = sceneMap[`${floorSlug}/${fp.initialSceneId}`]

    // Resolve map points
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
      data: {
        initialScene: initialSceneDbId || undefined,
        mapPoints,
      },
    })
    console.log(`  Updated floor: ${fp.floorName}`)
  }

  // 7. Update Tour with floors and defaultFloor
  console.log('Updating tour with floors...')
  const floorIds = tourConfig.floorplans.map((fp: any) => {
    const floorSlug = fp.config.replace('.json', '')
    return floorMap[floorSlug]
  })

  const defaultFloorSlug = tourConfig.floorplans[tourConfig.defaultFloor]?.config.replace('.json', '')

  await payload.update({
    collection: 'tours',
    id: tour.id,
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
  // Create a minimal sample tour for testing
  const tour = await payload.create({
    collection: 'tours',
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
    data: {
      name: 'Ground Floor',
      slug: 'ground-floor',
      tour: tour.id,
      order: 0,
    },
  })

  await payload.update({
    collection: 'tours',
    id: tour.id,
    data: {
      floors: [floor.id],
      defaultFloor: floor.id,
    },
  })

  console.log('Created sample tour: /tour/sample-tour')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
