import React from 'react'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import TourViewer from '@/components/tour/TourViewer'

export const dynamic = 'force-dynamic'

type Params = Promise<{ tourSlug: string; floorSlug: string; sceneSlug: string }>
type SearchParams = Promise<{ draft?: string }>

export default async function SceneViewerPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { tourSlug, floorSlug, sceneSlug } = await params
  const { draft: draftParam } = await searchParams
  const isDraft = draftParam === 'true'
  const payload = await getPayload({ config })

  // Fetch tour
  const tours = await payload.find({
    collection: 'tours',
    where: { slug: { equals: tourSlug } },
    depth: 2,
    limit: 1,
    draft: isDraft,
  })
  const tour = tours.docs[0]
  if (!tour) notFound()

  // Fetch current floor
  const floors = await payload.find({
    collection: 'floors',
    where: { slug: { equals: floorSlug } },
    depth: 1,
    limit: 1,
  })
  const floor = floors.docs[0]
  if (!floor) notFound()

  // Fetch current scene
  const scenes = await payload.find({
    collection: 'scenes',
    where: { slug: { equals: sceneSlug } },
    depth: 2,
    limit: 1,
    draft: isDraft,
  })
  const scene = scenes.docs[0]
  if (!scene) notFound()

  // Fetch all scenes on this floor for Pannellum multi-scene config
  const floorScenes = await payload.find({
    collection: 'scenes',
    where: { floor: { equals: floor.id } },
    depth: 2,
    limit: 100,
    draft: isDraft,
  })

  // Fetch all floors for the tour (for floor map)
  const tourFloors = tour.floors
    ? await Promise.all(
        tour.floors.map(async (f: any) => {
          const fId = typeof f === 'object' ? f.id : f
          const floorData = await payload.findByID({
            collection: 'floors',
            id: fId,
            depth: 1,
          })
          return floorData
        })
      )
    : []

  // Build scene data for client
  const sceneData = {
    tour: {
      id: tour.id,
      title: tour.title,
      slug: tour.slug,
      welcomeTitle: tour.welcomeTitle || '',
      welcomeText: tour.welcomeText || '',
    },
    currentFloor: {
      id: floor.id,
      name: floor.name,
      slug: floor.slug,
      floorplan: floor.floorplan && typeof floor.floorplan === 'object' ? floor.floorplan.url : null,
      mapPoints: floor.mapPoints || [],
    },
    currentScene: {
      id: scene.id,
      title: scene.title,
      slug: scene.slug,
      description: scene.description || null,
      panoramaUrl: scene.panorama && typeof scene.panorama === 'object' ? scene.panorama.url : '',
      previewUrl: scene.panorama && typeof scene.panorama === 'object'
        ? (scene.panorama.sizes?.preview?.url || scene.panorama.url)
        : '',
      initialYaw: scene.initialYaw || 0,
      initialPitch: scene.initialPitch || 0,
      initialHfov: scene.initialHfov || 120,
      rotation: scene.rotation || 0,
      hotspots: (scene.hotspots || []).map((hs: any) => ({
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
        cssClass: hs.cssClass || '',
        iconColor: hs.iconColor || '',
        iconSize: hs.iconSize || 'md',
      })),
    },
    floorScenes: floorScenes.docs.map((s: any) => ({
      id: s.id,
      slug: s.slug,
      title: s.title,
      panoramaUrl: s.panorama && typeof s.panorama === 'object' ? s.panorama.url : '',
      initialYaw: s.initialYaw || 0,
      initialPitch: s.initialPitch || 0,
      initialHfov: s.initialHfov || 120,
      rotation: s.rotation || 0,
      hotspots: (s.hotspots || []).map((hs: any) => ({
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
        cssClass: hs.cssClass || '',
        iconColor: hs.iconColor || '',
        iconSize: hs.iconSize || 'md',
      })),
    })),
    tourFloors: tourFloors.map((f: any) => ({
      id: f.id,
      name: f.name,
      slug: f.slug,
      floorplan: f.floorplan && typeof f.floorplan === 'object' ? f.floorplan.url : null,
      initialScene: f.initialScene && typeof f.initialScene === 'object'
        ? { slug: f.initialScene.slug }
        : null,
      mapPoints: (f.mapPoints || []).map((mp: any) => ({
        scene: mp.scene && typeof mp.scene === 'object'
          ? { slug: mp.scene.slug }
          : null,
        cx: mp.cx,
        cy: mp.cy,
        color: mp.color || '#E64626',
      })),
    })),
    tourSlug,
    floorSlug,
    isDraft,
  }

  return <TourViewer data={sceneData} />
}
