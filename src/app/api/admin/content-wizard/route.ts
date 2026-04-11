import fs from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getAdminUser } from '@/lib/adminUser'
import { buildLexicalParagraph, slugify, type WizardSubmission } from '@/lib/contentWizard'

export const dynamic = 'force-dynamic'

type SlugCollection = 'tours' | 'floors' | 'scenes'
type HttpError = Error & { status?: number }

type ListedMedia = {
  id: string | number
  alt?: string | null
  filename?: string | null
  url?: string | null
  mimeType?: string | null
  sizes?: {
    thumbnail?: {
      url?: string | null
    } | null
    preview?: {
      url?: string | null
    } | null
  } | null
  tags?: Array<{
    tag?: string | null
  }> | null
}

function toTagRows(tags: string[]) {
  return tags.filter(Boolean).map((tag) => ({ tag }))
}

function createHttpError(status: number, message: string): HttpError {
  const error = new Error(message) as HttpError
  error.status = status
  return error
}

function getErrorStatus(error: unknown) {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status?: unknown }).status

    if (typeof status === 'number') {
      return status
    }
  }

  return 500
}

async function writeUploadToTemp(assetId: string, file: File) {
  const extension = path.extname(file.name)
  const safeName = path
    .basename(file.name, extension)
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/^-+|-+$/g, '')
  const tempPath = path.join('/tmp', `content-wizard-${assetId}-${Date.now()}-${safeName}${extension}`)

  await fs.writeFile(tempPath, Buffer.from(await file.arrayBuffer()))

  return tempPath
}

function isWizardSubmission(value: unknown): value is WizardSubmission {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'assets' in value &&
      'floors' in value &&
      'scenes' in value &&
      'tour' in value
  )
}

function isDefined<T>(value: T | null): value is T {
  return value !== null
}

function isPresent<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

async function ensureUniqueSlug(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: SlugCollection,
  value: string,
  reserved: Set<string>
) {
  const baseSlug = slugify(value) || collection.slice(0, -1)
  let candidate = baseSlug
  let suffix = 2

  while (reserved.has(candidate)) {
    candidate = `${baseSlug}-${suffix}`
    suffix += 1
  }

  while (true) {
    const existing = await payload.find({
      collection,
      where: { slug: { equals: candidate } },
      limit: 1,
      depth: 0,
    })

    if (existing.totalDocs === 0) {
      reserved.add(candidate)
      return candidate
    }

    candidate = `${baseSlug}-${suffix}`
    suffix += 1
  }
}

export async function GET(request: Request) {
  const user = await getAdminUser(request.headers)

  if (!user) {
    return NextResponse.json({ error: 'You must be signed in as an admin to use the content wizard.' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const existingMedia = await payload.find({
      collection: 'media',
      depth: 0,
      limit: 200,
      sort: '-updatedAt',
    })

    return NextResponse.json({
      media: (existingMedia.docs as ListedMedia[])
        .filter((doc) => doc.url || doc.sizes?.thumbnail?.url || doc.sizes?.preview?.url)
        .map((doc) => ({
          id: doc.id,
          alt: doc.alt || '',
          fileName: doc.filename || `media-${doc.id}`,
          previewUrl: doc.sizes?.thumbnail?.url || doc.sizes?.preview?.url || doc.url || '',
          url: doc.url || doc.sizes?.preview?.url || doc.sizes?.thumbnail?.url || '',
          mimeType: doc.mimeType || '',
          tags: (doc.tags || [])
            .map((tagRow) => tagRow.tag?.trim())
            .filter((tag): tag is string => Boolean(tag)),
        })),
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'The wizard could not load existing media.',
      },
      { status: getErrorStatus(error) }
    )
  }
}

export async function POST(request: Request) {
  const user = await getAdminUser(request.headers)

  if (!user) {
    return NextResponse.json({ error: 'You must be signed in as an admin to use the content wizard.' }, { status: 401 })
  }

  const payload = await getPayload({ config })
  const formData = await request.formData()
  const rawPayload = formData.get('payload')

  if (typeof rawPayload !== 'string') {
    return NextResponse.json({ error: 'Wizard payload is missing.' }, { status: 400 })
  }

  let submission: WizardSubmission

  try {
    const parsed = JSON.parse(rawPayload)

    if (!isWizardSubmission(parsed)) {
      throw new Error('Wizard payload is not in the expected format.')
    }

    submission = parsed
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Wizard payload could not be parsed.' },
      { status: 400 }
    )
  }

  const tempFiles: string[] = []
  const createdMediaIds: Array<string | number> = []
  const createdSceneIds: Array<string | number> = []
  const createdFloorIds: Array<string | number> = []
  let createdTourId: string | number | null = null
  let reusedMediaCount = 0

  try {
    const mediaIdByAssetId = new Map<string, string | number>()
    const sceneByWizardId = new Map(submission.scenes.map((scene) => [scene.id, scene]))
    const reservedSlugs = {
      tours: new Set<string>(),
      floors: new Set<string>(),
      scenes: new Set<string>(),
    }

    for (const asset of submission.assets) {
      if (asset.existingMediaId !== null && asset.existingMediaId !== undefined) {
        const existingMedia = await payload
          .findByID({
            collection: 'media',
            id: asset.existingMediaId,
            depth: 0,
          })
          .catch(() => null)

        if (!existingMedia) {
          throw createHttpError(400, `Existing media not found for asset ${asset.fileName}.`)
        }

        mediaIdByAssetId.set(asset.id, existingMedia.id)
        reusedMediaCount += 1
        continue
      }

      const fileField = formData.get(`file:${asset.id}`)

      if (!(fileField instanceof File)) {
        return NextResponse.json({ error: `Uploaded file missing for asset ${asset.fileName}.` }, { status: 400 })
      }

      const tempPath = await writeUploadToTemp(asset.id, fileField)
      tempFiles.push(tempPath)

      const media = await payload.create({
        collection: 'media',
        data: {
          alt: asset.alt || asset.fileName,
          tags: toTagRows(asset.tags),
        },
        filePath: tempPath,
      })

      mediaIdByAssetId.set(asset.id, media.id)
      createdMediaIds.push(media.id)
    }

    const publishStatus = submission.tour.publish ? 'published' : 'draft'
    const tourSlug = await ensureUniqueSlug(
      payload,
      'tours',
      submission.tour.slug || submission.tour.title,
      reservedSlugs.tours
    )

    const tour = await payload.create({
      collection: 'tours',
      data: {
        title: submission.tour.title,
        slug: tourSlug,
        description: buildLexicalParagraph(submission.tour.description),
        coverImage: submission.tour.coverAssetId
          ? mediaIdByAssetId.get(submission.tour.coverAssetId)
          : undefined,
        tags: toTagRows(submission.tour.tags),
        welcomeTitle: submission.tour.welcomeTitle,
        welcomeText: buildLexicalParagraph(submission.tour.welcomeText),
        _status: publishStatus,
      },
    })
    createdTourId = tour.id

    const floorIdByWizardId = new Map<string, string | number>()
    const floorSlugByWizardId = new Map<string, string>()

    for (const floor of submission.floors) {
      const floorSlug = await ensureUniqueSlug(
        payload,
        'floors',
        floor.slug || floor.name,
        reservedSlugs.floors
      )
      const createdFloor = await payload.create({
        collection: 'floors',
        data: {
          name: floor.name,
          slug: floorSlug,
          tour: tour.id,
          order: floor.order,
          floorplan: floor.floorplanAssetId
            ? mediaIdByAssetId.get(floor.floorplanAssetId)
            : undefined,
        },
      })

      floorIdByWizardId.set(floor.id, createdFloor.id)
      floorSlugByWizardId.set(floor.id, floorSlug)
      createdFloorIds.push(createdFloor.id)
    }

    const sceneIdByWizardId = new Map<string, string | number>()

    for (const scene of submission.scenes) {
      const floorSlug = floorSlugByWizardId.get(scene.floorId) || 'floor'
      const sceneSlug = await ensureUniqueSlug(
        payload,
        'scenes',
        scene.slug || `${floorSlug}-${scene.title}`,
        reservedSlugs.scenes
      )
      const createdScene = await payload.create({
        collection: 'scenes',
        data: {
          title: scene.title,
          slug: sceneSlug,
          floor: floorIdByWizardId.get(scene.floorId),
          description: buildLexicalParagraph(scene.description),
          panorama: scene.panoramaAssetId
            ? mediaIdByAssetId.get(scene.panoramaAssetId)
            : undefined,
          initialYaw: scene.initialYaw,
          initialPitch: scene.initialPitch,
          initialHfov: scene.initialHfov,
          rotation: scene.rotation,
          _status: publishStatus,
        },
      })

      sceneIdByWizardId.set(scene.id, createdScene.id)
      createdSceneIds.push(createdScene.id)
    }

    for (const scene of submission.scenes) {
      const createdSceneId = sceneIdByWizardId.get(scene.id)

      if (!createdSceneId) {
        continue
      }

      await payload.update({
        collection: 'scenes',
        id: createdSceneId,
        data: {
          hotspots: scene.hotspots
            .map((hotspot) => {
              const targetScene = hotspot.targetSceneId
                ? sceneByWizardId.get(hotspot.targetSceneId)
                : null
              const targetSceneId = hotspot.targetSceneId
                ? sceneIdByWizardId.get(hotspot.targetSceneId)
                : undefined
              const targetFloorId =
                targetScene && targetScene.floorId && targetScene.floorId !== scene.floorId
                  ? floorIdByWizardId.get(targetScene.floorId)
                  : undefined

              if (hotspot.type === 'scene' && !targetSceneId) {
                return null
              }

              return {
                type: hotspot.type,
                pitch: hotspot.pitch,
                yaw: hotspot.yaw,
                text: hotspot.text,
                targetScene: hotspot.type === 'scene' ? targetSceneId : undefined,
                targetFloor: hotspot.type === 'scene' ? targetFloorId : undefined,
                infoContent:
                  hotspot.type === 'info'
                    ? buildLexicalParagraph(hotspot.infoContent)
                    : undefined,
                cssClass: hotspot.cssClass || undefined,
                iconColor: hotspot.iconColor || undefined,
                iconSize: hotspot.iconSize,
              }
            })
            .filter(isPresent),
        },
      })
    }

    for (const floor of submission.floors) {
      const floorId = floorIdByWizardId.get(floor.id)

      if (!floorId) {
        continue
      }

      await payload.update({
        collection: 'floors',
        id: floorId,
        data: {
          initialScene: floor.initialSceneId ? sceneIdByWizardId.get(floor.initialSceneId) : undefined,
          mapPoints: floor.mapPoints
            .map((point) => {
              const sceneId = sceneIdByWizardId.get(point.sceneId)

              if (!sceneId) {
                return null
              }

              return {
                scene: sceneId,
                cx: point.cx,
                cy: point.cy,
                color: point.color,
              }
            })
            .filter(isDefined),
        },
      })
    }

    await payload.update({
      collection: 'tours',
      id: tour.id,
      data: {
        floors: createdFloorIds,
        defaultFloor: submission.tour.defaultFloorId
          ? floorIdByWizardId.get(submission.tour.defaultFloorId)
          : createdFloorIds[0],
      },
    })

    return NextResponse.json({
      adminEditUrl: `/admin/collections/tours/${tour.id}`,
      liveUrl: submission.tour.publish ? `/tour/${tour.slug}` : null,
      previewUrl: `/tour/${tour.slug}/preview`,
      slug: tour.slug,
      title: tour.title,
      created: {
        assets: createdMediaIds.length,
        reusedAssets: reusedMediaCount,
        floors: submission.floors.length,
        scenes: submission.scenes.length,
      },
    })
  } catch (error) {
    for (const sceneId of createdSceneIds.slice().reverse()) {
      await payload.delete({
        collection: 'scenes',
        id: sceneId,
      }).catch(() => null)
    }

    for (const floorId of createdFloorIds.slice().reverse()) {
      await payload.delete({
        collection: 'floors',
        id: floorId,
      }).catch(() => null)
    }

    if (createdTourId) {
      await payload.delete({
        collection: 'tours',
        id: createdTourId,
      }).catch(() => null)
    }

    for (const mediaId of createdMediaIds.slice().reverse()) {
      await payload.delete({
        collection: 'media',
        id: mediaId,
      }).catch(() => null)
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'The wizard failed while creating the tour records.',
      },
      { status: getErrorStatus(error) }
    )
  } finally {
    await Promise.allSettled(tempFiles.map((tempPath) => fs.unlink(tempPath)))
  }
}
