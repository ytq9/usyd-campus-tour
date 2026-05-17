'use client'

import type { PerspectiveCamera } from 'three'

export type InfoVideoData = {
  alt?: string | null
  filename?: string | null
  mimeType?: string | null
  url?: string | null
}

export type HotspotData = {
  type: 'scene' | 'info'
  pitch?: number
  yaw?: number
  text?: string
  targetScene?: { slug?: string; title?: string } | null
  targetFloor?: { slug?: string } | null
  infoContent?: any
  infoVideo?: InfoVideoData | null
  cssClass?: string
  iconColor?: string
  iconSize?: 'sm' | 'md' | 'lg' | string
  [key: string]: any
}

export type ThreeSceneData = {
  id?: string | number
  slug: string
  title: string
  panoramaUrl: string
  previewUrl?: string
  initialYaw: number
  initialPitch: number
  initialHfov: number
  rotation?: number
  hotspots: HotspotData[]
}

export type CameraState = {
  pitch: number
  yaw: number
  hfov: number
}

export type ProjectedHotspot = {
  hotspot: HotspotData
  x: number
  y: number
  visible: boolean
}

export type PitchYaw = {
  pitch: number
  yaw: number
}

export type ThreePanoramaViewerProps = {
  scenes: ThreeSceneData[]
  initialSceneSlug: string
  tourSlug: string
  floorSlug: string
  isDraft: boolean
  debugHotspots?: boolean
  onSceneChange: (sceneSlug: string) => void
}

export type HotspotNavigationHandler = (
  targetSlug: string,
  targetFloorSlug?: string,
  clickEvent?: MouseEvent,
  hotspot?: HotspotData,
) => void

export type InfoHotspotFocusHandler = (
  hotspot: HotspotData,
  openInfo: () => void,
) => void

export type ThreeViewerApi = {
  camera: PerspectiveCamera | null
  focusInfoHotspot: (hotspot: HotspotData) => Promise<boolean>
  getCameraState: () => CameraState
  loadScene: (sceneSlug: string) => void
  lookAt: (pitch: number, yaw: number, hfov?: number) => void
  navigateToHotspot: (hotspot: HotspotData) => void
}
