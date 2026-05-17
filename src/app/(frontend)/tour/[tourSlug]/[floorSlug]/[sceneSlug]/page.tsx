import React from 'react'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import TourViewer from '@/components/tour/TourViewer'

export const dynamic = 'force-dynamic'

type Params = Promise<{ tourSlug: string; floorSlug: string; sceneSlug: string }>
type SearchParams = Promise<{ draft?: string; debugHotspots?: string }>

const valueOrFallback = (value: unknown, fallback: string): string =>
  typeof value === 'string' && value.length > 0 ? value : fallback

const serializeInfoVideo = (value: unknown) => {
  if (!value || typeof value !== 'object') return null

  const video = value as {
    alt?: unknown
    filename?: unknown
    mimeType?: unknown
    url?: unknown
  }
  const url = typeof video.url === 'string' ? video.url : ''
  if (!url) return null

  const mimeType = typeof video.mimeType === 'string' ? video.mimeType : null
  if (mimeType && !mimeType.startsWith('video/')) return null

  return {
    alt: typeof video.alt === 'string' ? video.alt : null,
    filename: typeof video.filename === 'string' ? video.filename : null,
    mimeType,
    url,
  }
}

const serializeHotspot = (hs: any) => ({
  type: hs.type,
  pitch: hs.pitch,
  yaw: hs.yaw,
  text: hs.text,
  targetScene: hs.targetScene && typeof hs.targetScene === 'object'
    ? { slug: hs.targetScene.slug, title: hs.targetScene.title }
    : null,
  targetFloor: hs.targetFloor && typeof hs.targetFloor === 'object'
    ? { slug: hs.targetFloor.slug }
    : null,
  infoContent: hs.infoContent || null,
  infoVideo: serializeInfoVideo(hs.infoVideo),
  cssClass: hs.cssClass || '',
  iconColor: hs.iconColor || '',
  iconSize: hs.iconSize || 'md',
  iconStyle: hs.iconStyle || 'default',
})

export default async function SceneViewerPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { tourSlug, floorSlug, sceneSlug } = await params
  const { draft: draftParam, debugHotspots: debugHotspotsParam } = await searchParams
  const isDraft = draftParam === 'true'
  const debugHotspots = debugHotspotsParam === 'true'
  const payload = await getPayload({ config })

  const tours = await payload.find({
    collection: 'tours',
    where: { slug: { equals: tourSlug } },
    depth: 2,
    limit: 1,
    draft: isDraft,
  })
  const tour = tours.docs[0]
  if (!tour) notFound()

  const floors = await payload.find({
    collection: 'floors',
    where: { slug: { equals: floorSlug } },
    depth: 1,
    limit: 1,
    draft: isDraft,
  })
  const floor = floors.docs[0]
  if (!floor) notFound()

  const tourFloorIds = new Set(
    (tour.floors || []).map((f: any) => String(typeof f === 'object' ? f.id : f)),
  )
  if (!tourFloorIds.has(String(floor.id))) notFound()

  const scenes = await payload.find({
    collection: 'scenes',
    where: { slug: { equals: sceneSlug } },
    depth: 2,
    limit: 1,
    draft: isDraft,
  })
  const scene = scenes.docs[0]
  if (!scene) notFound()

  const sceneFloorId = scene.floor && typeof scene.floor === 'object' ? scene.floor.id : scene.floor
  if (String(sceneFloorId) !== String(floor.id)) notFound()

  const floorScenes = await payload.find({
    collection: 'scenes',
    where: { floor: { equals: floor.id } },
    depth: 2,
    limit: 100,
    draft: isDraft,
  })

  const tourFloors = tour.floors
    ? await Promise.all(
        tour.floors.map(async (f: any) => {
          const fId = typeof f === 'object' ? f.id : f
          const floorData = await payload.findByID({
            collection: 'floors',
            id: fId,
            depth: 1,
            draft: isDraft,
          })
          return floorData
        })
      )
    : []

  const sceneData = {
    tour: {
      id: tour.id,
      title: tour.title,
      slug: valueOrFallback(tour.slug, tourSlug),
      welcomeTitle: tour.welcomeTitle || '',
      welcomeText: tour.welcomeText || '',
    },
    currentFloor: {
      id: floor.id,
      name: floor.name,
      slug: valueOrFallback(floor.slug, floorSlug),
      floorplan: floor.floorplan && typeof floor.floorplan === 'object' ? (floor.floorplan.url ?? null) : null,
      mapPoints: floor.mapPoints || [],
    },
    currentScene: {
      id: scene.id,
      title: scene.title,
      slug: valueOrFallback(scene.slug, sceneSlug),
      description: scene.description || null,
      panoramaUrl: scene.panorama && typeof scene.panorama === 'object' ? (scene.panorama.url ?? '') : '',
      previewUrl: scene.panorama && typeof scene.panorama === 'object'
        ? (scene.panorama.sizes?.preview?.url ?? scene.panorama.url ?? '')
        : '',
      initialYaw: scene.initialYaw || 0,
      initialPitch: scene.initialPitch || 0,
      initialHfov: scene.initialHfov || 120,
      rotation: scene.rotation || 0,
      hotspots: (scene.hotspots || []).map(serializeHotspot),
    },
    floorScenes: floorScenes.docs.map((s: any) => ({
      id: s.id,
      slug: valueOrFallback(s.slug, String(s.id)),
      title: s.title,
      description: s.description || null,
      panoramaUrl: s.panorama && typeof s.panorama === 'object' ? (s.panorama.url ?? '') : '',
      initialYaw: s.initialYaw || 0,
      initialPitch: s.initialPitch || 0,
      initialHfov: s.initialHfov || 120,
      rotation: s.rotation || 0,
      hotspots: (s.hotspots || []).map(serializeHotspot),
    })),
    tourFloors: tourFloors.map((f: any) => ({
      id: f.id,
      name: f.name,
      slug: valueOrFallback(f.slug, String(f.id)),
      floorplan: f.floorplan && typeof f.floorplan === 'object' ? (f.floorplan.url ?? null) : null,
      initialScene: f.initialScene && typeof f.initialScene === 'object'
        ? { slug: f.initialScene.slug }
        : null,
      mapPoints: (f.mapPoints || []).map((mp: any) => ({
        scene: mp.scene && typeof mp.scene === 'object'
          ? { slug: mp.scene.slug, title: mp.scene.title || mp.scene.slug || 'Untitled scene' }
          : null,
        cx: mp.cx,
        cy: mp.cy,
        color: mp.color || '#E64626',
      })),
    })),
    tourSlug,
    floorSlug,
    routeTourSlug: tourSlug,
    routeFloorSlug: floorSlug,
    routeSceneSlug: sceneSlug,
    isDraft,
    debugHotspots,
  }

  return <TourViewer data={sceneData} />
}
