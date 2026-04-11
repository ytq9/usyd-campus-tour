'use client'

import Link from 'next/link'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import styles from './ContentWizard.module.css'
import {
  FLOOR_MAP_HEIGHT,
  FLOOR_MAP_WIDTH,
  parseTagInput,
  slugify,
  type WizardSubmission,
} from '@/lib/contentWizard'

type AssetKind = 'panorama' | 'floorplan'
type AssetSource = 'upload' | 'existing'
type WizardStepId = 'upload' | 'floors' | 'scenes' | 'tour' | 'review'
type HotspotType = 'scene' | 'info'
type HotspotIconSize = 'sm' | 'md' | 'lg'

type AssetDraft = {
  id: string
  kind: AssetKind
  alt: string
  file: File | null
  fileName: string
  previewUrl: string
  tagsInput: string
  source: AssetSource
  existingMediaId: string | number | null
}

type MapPointDraft = {
  id: string
  sceneId: string
  cx: string
  cy: string
  color: string
}

type HotspotDraft = {
  id: string
  type: HotspotType
  pitch: string
  yaw: string
  text: string
  targetSceneId: string
  infoContent: string
  cssClass: string
  iconColor: string
  iconSize: HotspotIconSize
}

type SceneDraft = {
  id: string
  assetId: string
  title: string
  slug: string
  description: string
  floorId: string
  initialYaw: string
  initialPitch: string
  initialHfov: string
  rotation: string
  hotspots: HotspotDraft[]
}

type FloorDraft = {
  id: string
  name: string
  slug: string
  floorplanAssetId: string
  initialSceneId: string
  mapPoints: MapPointDraft[]
}

type TourDraft = {
  title: string
  slug: string
  description: string
  welcomeTitle: string
  welcomeText: string
  tagsInput: string
  coverAssetId: string
  defaultFloorId: string
  publish: boolean
}

type WizardResult = {
  adminEditUrl: string
  liveUrl: string | null
  previewUrl: string
  slug: string
  title: string
  created: {
    assets: number
    reusedAssets: number
    floors: number
    scenes: number
  }
}

type ExistingMediaOption = {
  id: string
  mediaId: string | number
  alt: string
  fileName: string
  previewUrl: string
  url: string
  mimeType: string
  tags: string[]
}

const STEPS: Array<{ id: WizardStepId; number: string; title: string }> = [
  { id: 'upload', number: 'Step 1', title: 'Upload panoramas' },
  { id: 'floors', number: 'Step 2', title: 'Assign floors' },
  { id: 'scenes', number: 'Step 3', title: 'Link scenes and hotspots' },
  { id: 'tour', number: 'Step 4', title: 'Assemble tour' },
  { id: 'review', number: 'Step 5', title: 'Review and publish' },
]

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 11)}`
}

function titleFromFilename(fileName: string) {
  const name = fileName.replace(/\.[^.]+$/, '')
  return name
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function createFloor(index: number): FloorDraft {
  return {
    id: createId('floor'),
    name: `Floor ${index + 1}`,
    slug: `floor-${index + 1}`,
    floorplanAssetId: '',
    initialSceneId: '',
    mapPoints: [],
  }
}

function getCurrentStepIndex(stepId: WizardStepId) {
  return STEPS.findIndex((step) => step.id === stepId)
}

function getAssetLabel(asset: AssetDraft) {
  return asset.alt.trim() || asset.fileName
}

function getSceneLabel(scene: SceneDraft) {
  return scene.title.trim() || 'Untitled scene'
}

function createMapPointDraft(sceneId = '', cx = FLOOR_MAP_WIDTH / 2, cy = FLOOR_MAP_HEIGHT / 2): MapPointDraft {
  return {
    id: createId('map-point'),
    sceneId,
    cx: String(Math.round(cx)),
    cy: String(Math.round(cy)),
    color: '#E64626',
  }
}

function createHotspotDraft(type: HotspotType = 'scene'): HotspotDraft {
  return {
    id: createId('hotspot'),
    type,
    pitch: '0',
    yaw: '0',
    text: '',
    targetSceneId: '',
    infoContent: '',
    cssClass: '',
    iconColor: '',
    iconSize: 'md',
  }
}

function createSceneDraft(assetId: string, title: string): SceneDraft {
  return {
    id: createId('scene'),
    assetId,
    title,
    slug: slugify(title),
    description: '',
    floorId: '',
    initialYaw: '0',
    initialPitch: '0',
    initialHfov: '120',
    rotation: '0',
    hotspots: [],
  }
}

export default function ContentWizard() {
  const [currentStep, setCurrentStep] = useState<WizardStepId>('upload')
  const [assets, setAssets] = useState<AssetDraft[]>([])
  const [scenes, setScenes] = useState<SceneDraft[]>([])
  const [floors, setFloors] = useState<FloorDraft[]>(() => [createFloor(0)])
  const [tour, setTour] = useState<TourDraft>({
    title: '',
    slug: '',
    description: '',
    welcomeTitle: '',
    welcomeText: '',
    tagsInput: 'campus',
    coverAssetId: '',
    defaultFloorId: '',
    publish: false,
  })
  const [errors, setErrors] = useState<string[]>([])
  const [apiError, setApiError] = useState<string>('')
  const [result, setResult] = useState<WizardResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExistingMediaOpen, setIsExistingMediaOpen] = useState(false)
  const [existingMedia, setExistingMedia] = useState<ExistingMediaOption[]>([])
  const [selectedExistingMediaIds, setSelectedExistingMediaIds] = useState<string[]>([])
  const [isLoadingExistingMedia, setIsLoadingExistingMedia] = useState(false)
  const [existingMediaError, setExistingMediaError] = useState('')
  const [activeMapPointIdByFloor, setActiveMapPointIdByFloor] = useState<Record<string, string>>({})
  const assetsRef = useRef<AssetDraft[]>([])
  const requestIdRef = useRef(0)

  useEffect(() => {
    assetsRef.current = assets
  }, [assets])

  useEffect(() => {
    return () => {
      for (const asset of assetsRef.current) {
        if (asset.source === 'upload') {
          URL.revokeObjectURL(asset.previewUrl)
        }
      }
    }
  }, [])

  useEffect(() => {
    setTour((current) => {
      if (current.defaultFloorId && floors.some((floor) => floor.id === current.defaultFloorId)) {
        return current
      }

      return {
        ...current,
        defaultFloorId: floors[0]?.id || '',
      }
    })
  }, [floors])

  useEffect(() => {
    setFloors((current) => {
      let changed = false

      const nextFloors = current.map((floor) => {
        const floorScenes = scenes.filter((scene) => scene.floorId === floor.id)
        const sceneIds = floorScenes.map((scene) => scene.id)

        if (sceneIds.length === 0 && floor.initialSceneId) {
          changed = true
          return {
            ...floor,
            initialSceneId: '',
          }
        }

        if (sceneIds.length > 0 && !sceneIds.includes(floor.initialSceneId)) {
          changed = true
          return {
            ...floor,
            initialSceneId: sceneIds[0],
          }
        }

        return floor
      })

      return changed ? nextFloors : current
    })
  }, [scenes])

  useEffect(() => {
    setActiveMapPointIdByFloor((current) => {
      let changed = false
      const next = { ...current }

      for (const floor of floors) {
        const activeMapPointId = next[floor.id]

        if (activeMapPointId && !floor.mapPoints.some((point) => point.id === activeMapPointId)) {
          delete next[floor.id]
          changed = true
        }
      }

      return changed ? next : current
    })
  }, [floors])

  const panoramaAssets = useMemo(
    () => assets.filter((asset) => asset.kind === 'panorama'),
    [assets]
  )

  const floorplanAssets = useMemo(
    () => assets.filter((asset) => asset.kind === 'floorplan'),
    [assets]
  )

  const importedExistingMediaIds = useMemo(
    () =>
      new Set(
        assets
          .map((asset) => asset.existingMediaId)
          .filter((mediaId): mediaId is string | number => mediaId !== null)
          .map((mediaId) => String(mediaId))
      ),
    [assets]
  )

  const availableExistingMedia = useMemo(
    () => existingMedia.filter((item) => !importedExistingMediaIds.has(item.id)),
    [existingMedia, importedExistingMediaIds]
  )

  const floorSceneMap = useMemo(() => {
    const next = new Map<string, SceneDraft[]>()

    for (const floor of floors) {
      next.set(
        floor.id,
        scenes.filter((scene) => scene.floorId === floor.id)
      )
    }

    return next
  }, [floors, scenes])

  const floorNameById = useMemo(
    () => new Map(floors.map((floor) => [floor.id, floor.name || 'Untitled floor'])),
    [floors]
  )

  const totalAssignedScenes = scenes.filter((scene) => scene.floorId).length

  const updateTour = <Key extends keyof TourDraft>(key: Key, value: TourDraft[Key]) => {
    setTour((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const updateFloor = (floorId: string, updater: (floor: FloorDraft) => FloorDraft) => {
    setFloors((current) => current.map((floor) => (floor.id === floorId ? updater(floor) : floor)))
  }

  const updateScene = (sceneId: string, updater: (scene: SceneDraft) => SceneDraft) => {
    setScenes((current) => current.map((scene) => (scene.id === sceneId ? updater(scene) : scene)))
  }

  const updateFloorMapPoint = (
    floorId: string,
    mapPointId: string,
    updater: (mapPoint: MapPointDraft) => MapPointDraft
  ) => {
    updateFloor(floorId, (current) => ({
      ...current,
      mapPoints: current.mapPoints.map((point) =>
        point.id === mapPointId ? updater(point) : point
      ),
    }))
  }

  const addFloorMapPoint = (floorId: string, initialSceneId = '', cx?: number, cy?: number) => {
    const nextPoint = createMapPointDraft(initialSceneId, cx, cy)

    updateFloor(floorId, (current) => ({
      ...current,
      mapPoints: [...current.mapPoints, nextPoint],
    }))

    setActiveMapPointIdByFloor((current) => ({
      ...current,
      [floorId]: nextPoint.id,
    }))
  }

  const removeFloorMapPoint = (floorId: string, mapPointId: string) => {
    updateFloor(floorId, (current) => ({
      ...current,
      mapPoints: current.mapPoints.filter((point) => point.id !== mapPointId),
    }))

    setActiveMapPointIdByFloor((current) => {
      if (current[floorId] !== mapPointId) {
        return current
      }

      const next = { ...current }
      delete next[floorId]
      return next
    })
  }

  const updateSceneHotspot = (
    sceneId: string,
    hotspotId: string,
    updater: (hotspot: HotspotDraft) => HotspotDraft
  ) => {
    updateScene(sceneId, (current) => ({
      ...current,
      hotspots: current.hotspots.map((hotspot) =>
        hotspot.id === hotspotId ? updater(hotspot) : hotspot
      ),
    }))
  }

  const addSceneHotspot = (sceneId: string, type: HotspotType = 'scene') => {
    updateScene(sceneId, (current) => ({
      ...current,
      hotspots: [...current.hotspots, createHotspotDraft(type)],
    }))
  }

  const removeSceneHotspot = (sceneId: string, hotspotId: string) => {
    updateScene(sceneId, (current) => ({
      ...current,
      hotspots: current.hotspots.filter((hotspot) => hotspot.id !== hotspotId),
    }))
  }

  const createUploadedAssetDraft = (file: File, kind: AssetKind, altOverride?: string): AssetDraft => ({
    id: createId('asset'),
    kind,
    alt: altOverride || titleFromFilename(file.name),
    file,
    fileName: file.name,
    previewUrl: URL.createObjectURL(file),
    tagsInput: kind,
    source: 'upload',
    existingMediaId: null,
  })

  const createExistingAssetDraft = (media: ExistingMediaOption): AssetDraft => ({
    id: createId('asset'),
    kind: 'panorama',
    alt: media.alt.trim() || titleFromFilename(media.fileName),
    file: null,
    fileName: media.fileName,
    previewUrl: media.previewUrl || media.url,
    tagsInput: media.tags.join(', ') || 'panorama',
    source: 'existing',
    existingMediaId: media.mediaId,
  })

  const handlePanoramaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) {
      return
    }

    const nextAssets: AssetDraft[] = []
    const nextScenes: SceneDraft[] = []

    for (const file of files) {
      const asset = createUploadedAssetDraft(file, 'panorama')
      const title = titleFromFilename(file.name)

      nextAssets.push(asset)
      nextScenes.push(createSceneDraft(asset.id, title))
    }

    setAssets((current) => [...current, ...nextAssets])
    setScenes((current) => [...current, ...nextScenes])
    event.target.value = ''
  }

  const handleFloorplanUpload = (floorId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const floor = floors.find((candidate) => candidate.id === floorId)
    const asset = createUploadedAssetDraft(file, 'floorplan', `${floor?.name || 'Floor'} floor plan`)

    setAssets((current) => [...current, asset])
    updateFloor(floorId, (current) => ({
      ...current,
      floorplanAssetId: asset.id,
    }))
    event.target.value = ''
  }

  const handleFloorplanMapClick = (
    floorId: string,
    event: React.MouseEvent<HTMLButtonElement>,
    fallbackSceneId = ''
  ) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const xRatio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1)
    const yRatio = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1)
    const nextCx = Math.round(xRatio * FLOOR_MAP_WIDTH)
    const nextCy = Math.round(yRatio * FLOOR_MAP_HEIGHT)
    const activeMapPointId = activeMapPointIdByFloor[floorId]

    if (!activeMapPointId && !fallbackSceneId) {
      return
    }

    if (!activeMapPointId) {
      addFloorMapPoint(floorId, fallbackSceneId, nextCx, nextCy)
      return
    }

    updateFloorMapPoint(floorId, activeMapPointId, (current) => ({
      ...current,
      cx: String(nextCx),
      cy: String(nextCy),
    }))
  }

  const loadExistingMedia = async () => {
    if (isLoadingExistingMedia) {
      return
    }

    setIsLoadingExistingMedia(true)
    setExistingMediaError('')

    try {
      const response = await fetch('/api/admin/content-wizard', {
        method: 'GET',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'The wizard could not load existing media.')
      }

      const media: Array<Record<string, unknown>> = Array.isArray(data.media) ? data.media : []

      setExistingMedia(
        media.flatMap((item) => {
          if (typeof item.id !== 'string' && typeof item.id !== 'number') {
            return []
          }

          return [
            {
              id: String(item.id),
              mediaId: item.id,
              alt: typeof item.alt === 'string' ? item.alt : '',
              fileName:
                typeof item.fileName === 'string' ? item.fileName : `media-${String(item.id)}`,
              previewUrl: typeof item.previewUrl === 'string' ? item.previewUrl : '',
              url: typeof item.url === 'string' ? item.url : '',
              mimeType: typeof item.mimeType === 'string' ? item.mimeType : '',
              tags: Array.isArray(item.tags)
                ? item.tags.filter(
                    (tag: unknown): tag is string =>
                      typeof tag === 'string' && tag.trim().length > 0
                  )
                : [],
            },
          ]
        })
      )
    } catch (error) {
      setExistingMediaError(
        error instanceof Error ? error.message : 'The wizard could not load existing media.'
      )
    } finally {
      setIsLoadingExistingMedia(false)
    }
  }

  const openExistingMediaPicker = () => {
    setIsExistingMediaOpen(true)
    setExistingMediaError('')

    if (existingMedia.length === 0) {
      void loadExistingMedia()
    }
  }

  const toggleExistingMediaSelection = (mediaId: string) => {
    setSelectedExistingMediaIds((current) =>
      current.includes(mediaId)
        ? current.filter((candidate) => candidate !== mediaId)
        : [...current, mediaId]
    )
  }

  const useSelectedExistingMediaAndContinue = () => {
    const selectedMedia = availableExistingMedia.filter((item) =>
      selectedExistingMediaIds.includes(item.id)
    )

    if (selectedMedia.length === 0) {
      setExistingMediaError('Select at least one media item to continue.')
      return
    }

    const importedAssets = selectedMedia.map((item) => createExistingAssetDraft(item))
    const importedScenes = importedAssets.map((asset) =>
      createSceneDraft(asset.id, asset.alt.trim() || titleFromFilename(asset.fileName))
    )

    setAssets((current) => [...current, ...importedAssets])
    setScenes((current) => [...current, ...importedScenes])
    setSelectedExistingMediaIds([])
    setExistingMediaError('')
    setErrors([])
    setApiError('')
    setIsExistingMediaOpen(false)
    setCurrentStep('floors')
  }

  const removeAsset = (assetId: string) => {
    const sceneToRemove = scenes.find((scene) => scene.assetId === assetId)

    setTour((current) => ({
      ...current,
      coverAssetId: current.coverAssetId === assetId ? '' : current.coverAssetId,
    }))

    setAssets((current) => {
      const assetToRemove = current.find((asset) => asset.id === assetId)
      if (assetToRemove?.source === 'upload') {
        URL.revokeObjectURL(assetToRemove.previewUrl)
      }

      return current.filter((asset) => asset.id !== assetId)
    })

    if (sceneToRemove) {
      setScenes((current) =>
        current
          .filter((scene) => scene.id !== sceneToRemove.id)
          .map((scene) => ({
            ...scene,
            hotspots: scene.hotspots.map((hotspot) =>
              hotspot.targetSceneId === sceneToRemove.id
                ? {
                    ...hotspot,
                    targetSceneId: '',
                  }
                : hotspot
            ),
          }))
      )
      setFloors((current) =>
        current.map((floor) => ({
          ...floor,
          initialSceneId: floor.initialSceneId === sceneToRemove.id ? '' : floor.initialSceneId,
          mapPoints: floor.mapPoints.filter((point) => point.sceneId !== sceneToRemove.id),
        }))
      )

      return
    }

    setFloors((current) =>
      current.map((floor) => ({
        ...floor,
        floorplanAssetId: floor.floorplanAssetId === assetId ? '' : floor.floorplanAssetId,
        mapPoints: floor.floorplanAssetId === assetId ? [] : floor.mapPoints,
      }))
    )
    setActiveMapPointIdByFloor((current) => {
      const next = { ...current }

      for (const floor of floors) {
        if (floor.floorplanAssetId === assetId) {
          delete next[floor.id]
        }
      }

      return next
    })
  }

  const addFloor = () => {
    setFloors((current) => [...current, createFloor(current.length)])
  }

  const removeFloor = (floorId: string) => {
    setFloors((current) => current.filter((floor) => floor.id !== floorId))
    setScenes((current) =>
      current.map((scene) =>
        scene.floorId === floorId
          ? {
              ...scene,
              floorId: '',
            }
          : scene
      )
    )
    setTour((current) => ({
      ...current,
      defaultFloorId: current.defaultFloorId === floorId ? '' : current.defaultFloorId,
    }))
    setActiveMapPointIdByFloor((current) => {
      const next = { ...current }
      delete next[floorId]
      return next
    })
  }

  const getSceneByAssetId = (assetId: string) =>
    scenes.find((scene) => scene.assetId === assetId) || null

  const getSceneOptionLabel = (scene: SceneDraft) => {
    const floorName = floorNameById.get(scene.floorId)

    return floorName ? `${getSceneLabel(scene)} (${floorName})` : getSceneLabel(scene)
  }

  const validateStep = (stepId: WizardStepId): string[] => {
    if (stepId === 'upload') {
      if (panoramaAssets.length === 0) {
        return ['Upload at least one panorama to start the wizard.']
      }

      return []
    }

    if (stepId === 'floors') {
      const issues: string[] = []

      if (floors.length === 0) {
        issues.push('Add at least one floor.')
      }

      if (scenes.length === 0) {
        issues.push('Upload panoramas first so scenes exist.')
      }

      for (const floor of floors) {
        if (!floor.name.trim()) {
          issues.push('Each floor needs a name.')
          break
        }
      }

      const unassignedScenes = scenes.filter((scene) => !scene.floorId)
      if (unassignedScenes.length > 0) {
        issues.push('Assign every scene to a floor before continuing.')
      }

      for (const floor of floors) {
        const sceneIds = new Set((floorSceneMap.get(floor.id) || []).map((scene) => scene.id))
        const invalidPoint = floor.mapPoints.find(
          (point) =>
            !point.sceneId ||
            !sceneIds.has(point.sceneId) ||
            Number.isNaN(Number(point.cx)) ||
            Number.isNaN(Number(point.cy))
        )

        if (invalidPoint) {
          issues.push(`Finish the map points for "${floor.name}".`)
          break
        }
      }

      return issues
    }

    if (stepId === 'scenes') {
      const issues: string[] = []

      for (const floor of floors) {
        const floorScenes = floorSceneMap.get(floor.id) || []

        if (floorScenes.length === 0) {
          issues.push(`"${floor.name}" has no scenes assigned.`)
        } else if (!floor.initialSceneId) {
          issues.push(`Choose an initial scene for "${floor.name}".`)
        }
      }

      for (const scene of scenes) {
        const invalidHotspot = scene.hotspots.find(
          (hotspot) =>
            !hotspot.text.trim() ||
            (hotspot.type === 'scene' && !hotspot.targetSceneId)
        )

        if (invalidHotspot) {
          issues.push(`Finish the hotspot setup for "${getSceneLabel(scene)}".`)
          break
        }
      }

      return issues
    }

    if (stepId === 'tour') {
      const issues: string[] = []

      if (!tour.title.trim()) {
        issues.push('Tour title is required.')
      }

      if (!tour.defaultFloorId) {
        issues.push('Choose a default floor.')
      }

      return issues
    }

    if (stepId === 'review') {
      return [
        ...validateStep('upload'),
        ...validateStep('floors'),
        ...validateStep('scenes'),
        ...validateStep('tour'),
      ]
    }

    return []
  }

  const currentIssues = validateStep(currentStep)

  const goToStep = (stepId: WizardStepId) => {
    setErrors([])
    setApiError('')
    setCurrentStep(stepId)
  }

  const goNext = () => {
    const issues = validateStep(currentStep)
    setErrors(issues)

    if (issues.length > 0) {
      return
    }

    const nextIndex = getCurrentStepIndex(currentStep) + 1
    const nextStep = STEPS[nextIndex]
    if (nextStep) {
      setCurrentStep(nextStep.id)
      setErrors([])
    }
  }

  const goBack = () => {
    const previousIndex = getCurrentStepIndex(currentStep) - 1
    const previousStep = STEPS[previousIndex]
    if (previousStep) {
      setCurrentStep(previousStep.id)
      setErrors([])
    }
  }

  const buildSubmission = (): WizardSubmission => ({
    assets: assets.map((asset) => ({
      id: asset.id,
      alt: asset.alt.trim() || asset.fileName,
      fileName: asset.fileName,
      tags: parseTagInput(asset.tagsInput),
      existingMediaId: asset.existingMediaId,
    })),
    floors: floors.map((floor, index) => ({
      id: floor.id,
      name: floor.name.trim(),
      slug: floor.slug.trim() || slugify(floor.name),
      order: index,
      floorplanAssetId: floor.floorplanAssetId || null,
      initialSceneId: floor.initialSceneId || null,
      mapPoints: floor.mapPoints.map((point) => ({
        id: point.id,
        sceneId: point.sceneId,
        cx: Number(point.cx || 0),
        cy: Number(point.cy || 0),
        color: point.color.trim() || '#E64626',
      })),
    })),
    scenes: scenes.map((scene) => ({
      id: scene.id,
      floorId: scene.floorId,
      title: scene.title.trim(),
      slug: scene.slug.trim() || slugify(scene.title),
      description: scene.description.trim(),
      panoramaAssetId: scene.assetId,
      initialYaw: Number(scene.initialYaw || 0),
      initialPitch: Number(scene.initialPitch || 0),
      initialHfov: Number(scene.initialHfov || 120),
      rotation: Number(scene.rotation || 0),
      hotspots: scene.hotspots.map((hotspot) => ({
        id: hotspot.id,
        type: hotspot.type,
        pitch: Number(hotspot.pitch || 0),
        yaw: Number(hotspot.yaw || 0),
        text: hotspot.text.trim(),
        targetSceneId: hotspot.targetSceneId || null,
        infoContent: hotspot.infoContent.trim(),
        cssClass: hotspot.cssClass.trim(),
        iconColor: hotspot.iconColor.trim(),
        iconSize: hotspot.iconSize,
      })),
    })),
    tour: {
      title: tour.title.trim(),
      slug: tour.slug.trim() || slugify(tour.title),
      description: tour.description.trim(),
      welcomeTitle: tour.welcomeTitle.trim(),
      welcomeText: tour.welcomeText.trim(),
      tags: parseTagInput(tour.tagsInput),
      coverAssetId: tour.coverAssetId || null,
      defaultFloorId: tour.defaultFloorId || null,
      publish: tour.publish,
    },
  })

  const handleSubmit = () => {
    const issues = validateStep('review')
    setErrors(issues)
    setApiError('')
    setResult(null)

    if (issues.length > 0 || isSubmitting) {
      return
    }

    const submission = buildSubmission()
    const formData = new FormData()
    formData.set('payload', JSON.stringify(submission))

    for (const asset of assets) {
      if (asset.file) {
        formData.set(`file:${asset.id}`, asset.file, asset.fileName)
      }
    }

    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    setIsSubmitting(true)

    void (async () => {
      try {
        const response = await fetch('/api/admin/content-wizard', {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()

        if (requestIdRef.current !== requestId) {
          return
        }

        if (!response.ok) {
          throw new Error(data.error || 'The wizard could not create the tour.')
        }

        setErrors([])
        setApiError('')
        setResult(data)
      } catch (error) {
        if (requestIdRef.current !== requestId) {
          return
        }

        setResult(null)
        setApiError(error instanceof Error ? error.message : 'The wizard could not create the tour.')
      } finally {
        if (requestIdRef.current === requestId) {
          setIsSubmitting(false)
        }
      }
    })()
  }

  const renderStepContent = () => {
    if (currentStep === 'upload') {
      return (
        <>
          <div className={styles.sectionIntro}>
            <h2>1. Bulk upload panorama files</h2>
            <p>
              Select multiple panorama images or pull from your existing media library. Each item
              becomes one draft scene with an auto-filled title, slug, and alt text.
            </p>
          </div>

          <div className={styles.stepActions}>
            <button type="button" className={styles.secondaryButton} onClick={openExistingMediaPicker}>
              Use existing media
            </button>
            {isExistingMediaOpen && (
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => {
                  setIsExistingMediaOpen(false)
                  setSelectedExistingMediaIds([])
                  setExistingMediaError('')
                }}
              >
                Hide media library
              </button>
            )}
          </div>

          <label className={styles.uploadCard}>
            <input
              className={styles.hiddenInput}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePanoramaUpload}
            />
            <strong>Choose panorama files</strong>
            <span>JPG files are a good starting point. You can select many files at once.</span>
          </label>

          {isExistingMediaOpen && (
            <section className={styles.existingMediaPanel}>
              <div className={styles.sectionIntro}>
                <h2>Use existing panorama media</h2>
                <p>
                  Choose media items you already uploaded, then we will create draft scenes and move
                  you to floor assignment.
                </p>
              </div>

              {existingMediaError && <p className={styles.inlineError}>{existingMediaError}</p>}

              {isLoadingExistingMedia ? (
                <div className={styles.emptyState}>Loading media library...</div>
              ) : availableExistingMedia.length > 0 ? (
                <>
                  <div className={styles.existingMediaGrid}>
                    {availableExistingMedia.map((item) => {
                      const isSelected = selectedExistingMediaIds.includes(item.id)

                      return (
                        <label key={item.id} className={styles.existingMediaCard}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleExistingMediaSelection(item.id)}
                          />
                          <div className={styles.existingMediaPreviewWrap}>
                            <img
                              src={item.previewUrl || item.url}
                              alt={item.alt || item.fileName}
                              className={styles.assetPreview}
                            />
                          </div>
                          <div className={styles.existingMediaBody}>
                            <strong>{item.alt || titleFromFilename(item.fileName)}</strong>
                            <p>{item.fileName}</p>
                            <span>{item.tags.length > 0 ? item.tags.join(', ') : 'No tags yet'}</span>
                          </div>
                        </label>
                      )
                    })}
                  </div>

                  <div className={styles.stepActions}>
                    <button
                      type="button"
                      className={styles.primaryButton}
                      onClick={useSelectedExistingMediaAndContinue}
                    >
                      Use selected media and continue
                    </button>
                  </div>
                </>
              ) : (
                <div className={styles.emptyState}>
                  {existingMedia.length === 0
                    ? 'No existing media is available yet.'
                    : 'All existing media items are already in this draft.'}
                </div>
              )}
            </section>
          )}

          {panoramaAssets.length > 0 ? (
            <div className={styles.assetGrid}>
              {panoramaAssets.map((asset) => {
                const scene = getSceneByAssetId(asset.id)
                if (!scene) {
                  return null
                }

                return (
                  <article key={asset.id} className={styles.assetCard}>
                    <div className={styles.assetPreviewWrap}>
                      <img src={asset.previewUrl} alt={asset.alt} className={styles.assetPreview} />
                    </div>
                    <div className={styles.assetBody}>
                      <p className={styles.assetMeta}>
                        {asset.fileName}
                        {asset.source === 'existing' ? ' • existing media' : ' • uploaded just now'}
                      </p>
                      <label className={styles.field}>
                        <span>Scene title</span>
                        <input
                          value={scene.title}
                          onChange={(event) =>
                            updateScene(scene.id, (current) => ({
                              ...current,
                              title: event.target.value,
                            }))
                          }
                          onBlur={() =>
                            updateScene(scene.id, (current) => ({
                              ...current,
                              slug: current.slug.trim() || slugify(current.title),
                            }))
                          }
                        />
                      </label>
                      <label className={styles.field}>
                        <span>Scene slug</span>
                        <input
                          value={scene.slug}
                          onChange={(event) =>
                            updateScene(scene.id, (current) => ({
                              ...current,
                              slug: slugify(event.target.value),
                            }))
                          }
                        />
                      </label>
                      <label className={styles.field}>
                        <span>
                          {asset.source === 'existing' ? 'Alt text (from media library)' : 'Alt text'}
                        </span>
                        <input
                          disabled={asset.source === 'existing'}
                          value={asset.alt}
                          onChange={(event) =>
                            setAssets((current) =>
                              current.map((candidate) =>
                                candidate.id === asset.id
                                  ? {
                                      ...candidate,
                                      alt: event.target.value,
                                    }
                                  : candidate
                              )
                            )
                          }
                        />
                      </label>
                      <button
                        type="button"
                        className={styles.inlineDanger}
                        onClick={() => removeAsset(asset.id)}
                      >
                        Remove panorama
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>Uploaded panoramas will appear here as draft scenes.</div>
          )}
        </>
      )
    }

    if (currentStep === 'floors') {
      return (
        <>
          <div className={styles.sectionIntro}>
            <h2>2. Assign floors</h2>
            <p>
              Create floors first, attach each scene to the right floor, then place map points on the
              floor plan so visitors can jump between rooms on the same level.
            </p>
          </div>

          <div className={styles.stepCanvas}>
            <div className={styles.toolbar}>
              <button type="button" className={styles.primaryButton} onClick={addFloor}>
                Add floor
              </button>
            </div>

            <div className={styles.floorGrid}>
              {floors.map((floor, index) => {
                const groupedScenes = floorSceneMap.get(floor.id) || []
                const activeMapPointId = activeMapPointIdByFloor[floor.id]
                const floorplanAsset = assets.find((asset) => asset.id === floor.floorplanAssetId)

                return (
                  <article key={floor.id} className={styles.floorCard}>
                    <div className={styles.floorHeader}>
                      <div>
                        <p className={styles.stepTag}>Floor {index + 1}</p>
                        <h3>{floor.name || 'Untitled floor'}</h3>
                      </div>
                      <button
                        type="button"
                        className={styles.inlineDanger}
                        disabled={floors.length === 1}
                        onClick={() => removeFloor(floor.id)}
                      >
                        Remove
                      </button>
                    </div>

                    <div className={styles.fieldGrid}>
                      <label className={styles.field}>
                        <span>Floor name</span>
                        <input
                          value={floor.name}
                          onChange={(event) =>
                            updateFloor(floor.id, (current) => ({
                              ...current,
                              name: event.target.value,
                            }))
                          }
                          onBlur={() =>
                            updateFloor(floor.id, (current) => ({
                              ...current,
                              slug: current.slug.trim() || slugify(current.name),
                            }))
                          }
                        />
                      </label>

                      <label className={styles.field}>
                        <span>Floor slug</span>
                        <input
                          value={floor.slug}
                          onChange={(event) =>
                            updateFloor(floor.id, (current) => ({
                              ...current,
                              slug: slugify(event.target.value),
                            }))
                          }
                        />
                      </label>

                      <label className={styles.field}>
                        <span>Floor plan</span>
                        <select
                          value={floor.floorplanAssetId}
                          onChange={(event) => {
                            const nextFloorplanId = event.target.value

                            updateFloor(floor.id, (current) => ({
                              ...current,
                              floorplanAssetId: nextFloorplanId,
                              mapPoints: nextFloorplanId ? current.mapPoints : [],
                            }))

                            if (!nextFloorplanId) {
                              setActiveMapPointIdByFloor((current) => {
                                const next = { ...current }
                                delete next[floor.id]
                                return next
                              })
                            }
                          }}
                        >
                          <option value="">No floor plan</option>
                          {floorplanAssets.map((asset) => (
                            <option key={asset.id} value={asset.id}>
                              {getAssetLabel(asset)}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className={styles.field}>
                        <span>Upload floor plan</span>
                        <input
                          type="file"
                          accept="image/*,image/svg+xml"
                          onChange={(event) => handleFloorplanUpload(floor.id, event)}
                        />
                      </label>
                    </div>

                    {floor.floorplanAssetId ? (
                      <>
                        <div className={styles.mapEditorHeader}>
                          <div>
                            <p className={styles.stepTag}>Map points</p>
                            <p className={styles.mapEditorHelp}>
                              Click the floor plan to add a point, or select an existing point and
                              click again to move it.
                            </p>
                          </div>
                          <button
                            type="button"
                            className={styles.secondaryButton}
                            disabled={groupedScenes.length === 0}
                            onClick={() =>
                              addFloorMapPoint(
                                floor.id,
                                floor.initialSceneId || groupedScenes[0]?.id || ''
                              )
                            }
                          >
                            Add map point
                          </button>
                        </div>

                        <button
                          type="button"
                          className={styles.floorplanStage}
                          onClick={(event) =>
                            handleFloorplanMapClick(
                              floor.id,
                              event,
                              floor.initialSceneId || groupedScenes[0]?.id || ''
                            )
                          }
                        >
                          {floorplanAsset?.previewUrl ? (
                            <img
                              src={floorplanAsset.previewUrl}
                              alt={`${floor.name} floor plan`}
                              className={styles.floorplanStageImage}
                            />
                          ) : (
                            <div className={styles.emptyState}>Floor plan preview unavailable.</div>
                          )}

                          <svg
                            className={styles.floorplanSvg}
                            viewBox={`0 0 ${FLOOR_MAP_WIDTH} ${FLOOR_MAP_HEIGHT}`}
                            preserveAspectRatio="xMidYMid meet"
                          >
                            {floor.mapPoints.map((point, mapPointIndex) => {
                              const isActive = activeMapPointId === point.id
                              return (
                                <g key={point.id}>
                                  <circle
                                    cx={Number(point.cx || 0)}
                                    cy={Number(point.cy || 0)}
                                    r={isActive ? 46 : 34}
                                    fill={point.color || '#E64626'}
                                    stroke={isActive ? '#ffffff' : '#0f1421'}
                                    strokeWidth={isActive ? 20 : 12}
                                  />
                                  <text
                                    x={Number(point.cx || 0)}
                                    y={Number(point.cy || 0) + 10}
                                    textAnchor="middle"
                                    fontSize="84"
                                    fontWeight="700"
                                    fill="#ffffff"
                                  >
                                    {mapPointIndex + 1}
                                  </text>
                                </g>
                              )
                            })}
                          </svg>
                        </button>

                        {floor.mapPoints.length > 0 ? (
                          <div className={styles.mapPointList}>
                            {floor.mapPoints.map((point, mapPointIndex) => {
                              const isActive = activeMapPointId === point.id

                              return (
                                <article
                                  key={point.id}
                                  className={
                                    isActive ? styles.mapPointCardActive : styles.mapPointCard
                                  }
                                >
                                  <div className={styles.mapPointHeader}>
                                    <strong>Map point {mapPointIndex + 1}</strong>
                                    <div className={styles.inlineActions}>
                                      <button
                                        type="button"
                                        className={styles.secondaryButton}
                                        onClick={() =>
                                          setActiveMapPointIdByFloor((current) => ({
                                            ...current,
                                            [floor.id]: point.id,
                                          }))
                                        }
                                      >
                                        {isActive ? 'Selected on plan' : 'Select on plan'}
                                      </button>
                                      <button
                                        type="button"
                                        className={styles.inlineDanger}
                                        onClick={() => removeFloorMapPoint(floor.id, point.id)}
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>

                                  <div className={styles.fieldGrid}>
                                    <label className={styles.field}>
                                      <span>Scene</span>
                                      <select
                                        value={point.sceneId}
                                        onChange={(event) =>
                                          updateFloorMapPoint(floor.id, point.id, (current) => ({
                                            ...current,
                                            sceneId: event.target.value,
                                          }))
                                        }
                                      >
                                        <option value="">Choose scene</option>
                                        {groupedScenes.map((scene) => (
                                          <option key={scene.id} value={scene.id}>
                                            {getSceneLabel(scene)}
                                          </option>
                                        ))}
                                      </select>
                                    </label>

                                    <label className={styles.field}>
                                      <span>Color</span>
                                      <input
                                        value={point.color}
                                        onChange={(event) =>
                                          updateFloorMapPoint(floor.id, point.id, (current) => ({
                                            ...current,
                                            color: event.target.value,
                                          }))
                                        }
                                      />
                                    </label>

                                    <label className={styles.field}>
                                      <span>Cx</span>
                                      <input
                                        type="number"
                                        value={point.cx}
                                        onChange={(event) =>
                                          updateFloorMapPoint(floor.id, point.id, (current) => ({
                                            ...current,
                                            cx: event.target.value,
                                          }))
                                        }
                                      />
                                    </label>

                                    <label className={styles.field}>
                                      <span>Cy</span>
                                      <input
                                        type="number"
                                        value={point.cy}
                                        onChange={(event) =>
                                          updateFloorMapPoint(floor.id, point.id, (current) => ({
                                            ...current,
                                            cy: event.target.value,
                                          }))
                                        }
                                      />
                                    </label>
                                  </div>
                                </article>
                              )
                            })}
                          </div>
                        ) : (
                          <div className={styles.emptyState}>
                            {groupedScenes.length > 0
                              ? 'No map points yet. Click the plan or use the button above to add one.'
                              : 'Assign scenes to this floor before adding map points.'}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className={styles.emptyState}>
                        Upload or select a floor plan to start placing map points.
                      </div>
                    )}
                  </article>
                )
              })}
            </div>

            <div className={styles.assignmentList}>
              {scenes.map((scene) => {
                const asset = assets.find((candidate) => candidate.id === scene.assetId)

                return (
                  <article key={scene.id} className={styles.assignmentCard}>
                    <div className={styles.assignmentMedia}>
                      {asset && (
                        <img
                          src={asset.previewUrl}
                          alt={asset.alt}
                          className={styles.assignmentThumb}
                        />
                      )}
                    </div>
                    <div className={styles.assignmentBody}>
                      <strong>{getSceneLabel(scene)}</strong>
                      <small>{asset?.fileName}</small>
                    </div>
                    <label className={styles.assignmentSelect}>
                      <span>Floor</span>
                      <select
                        value={scene.floorId}
                        onChange={(event) =>
                          updateScene(scene.id, (current) => ({
                            ...current,
                            floorId: event.target.value,
                          }))
                        }
                      >
                        <option value="">Assign floor</option>
                        {floors.map((floor) => (
                          <option key={floor.id} value={floor.id}>
                            {floor.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </article>
                )
              })}
            </div>
          </div>
        </>
      )
    }

    if (currentStep === 'scenes') {
      return (
        <>
          <div className={styles.sectionIntro}>
            <h2>3. Link scenes and hotspots</h2>
            <p>
              Review the scenes floor by floor. Pick the first scene visitors should enter on each
              floor, then adjust descriptions, camera settings, and interactive hotspots.
            </p>
          </div>

          <div className={styles.stepCanvas}>
            <div className={styles.sceneGroups}>
              {floors.map((floor) => {
                const groupedScenes = floorSceneMap.get(floor.id) || []

                return (
                  <section key={floor.id} className={styles.sceneGroup}>
                    <div className={styles.sceneGroupHeader}>
                      <div>
                        <p className={styles.stepTag}>Floor</p>
                        <h3>{floor.name}</h3>
                      </div>

                      <label className={styles.field}>
                        <span>Initial scene</span>
                        <select
                          value={floor.initialSceneId}
                          onChange={(event) =>
                            updateFloor(floor.id, (current) => ({
                              ...current,
                              initialSceneId: event.target.value,
                            }))
                          }
                        >
                          <option value="">Choose scene</option>
                          {groupedScenes.map((scene) => (
                            <option key={scene.id} value={scene.id}>
                              {getSceneLabel(scene)}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    {groupedScenes.length > 0 ? (
                      <div className={styles.sceneGrid}>
                        {groupedScenes.map((scene) => {
                          const asset = assets.find((candidate) => candidate.id === scene.assetId)
                          const availablePortalTargets = scenes.filter(
                            (candidate) => candidate.id !== scene.id && candidate.floorId
                          )

                          return (
                            <article key={scene.id} className={styles.sceneCard}>
                              {asset && (
                                <img
                                  src={asset.previewUrl}
                                  alt={asset.alt}
                                  className={styles.sceneThumb}
                                />
                              )}
                              <div className={styles.fieldGrid}>
                                <label className={styles.field}>
                                  <span>Title</span>
                                  <input
                                    value={scene.title}
                                    onChange={(event) =>
                                      updateScene(scene.id, (current) => ({
                                        ...current,
                                        title: event.target.value,
                                      }))
                                    }
                                  />
                                </label>
                                <label className={styles.field}>
                                  <span>Slug</span>
                                  <input
                                    value={scene.slug}
                                    onChange={(event) =>
                                      updateScene(scene.id, (current) => ({
                                        ...current,
                                        slug: slugify(event.target.value),
                                      }))
                                    }
                                  />
                                </label>
                                <label className={`${styles.field} ${styles.fieldWide}`}>
                                  <span>Description</span>
                                  <textarea
                                    rows={3}
                                    value={scene.description}
                                    onChange={(event) =>
                                      updateScene(scene.id, (current) => ({
                                        ...current,
                                        description: event.target.value,
                                      }))
                                    }
                                  />
                                </label>
                                <label className={styles.field}>
                                  <span>Yaw</span>
                                  <input
                                    type="number"
                                    value={scene.initialYaw}
                                    onChange={(event) =>
                                      updateScene(scene.id, (current) => ({
                                        ...current,
                                        initialYaw: event.target.value,
                                      }))
                                    }
                                  />
                                </label>
                                <label className={styles.field}>
                                  <span>Pitch</span>
                                  <input
                                    type="number"
                                    value={scene.initialPitch}
                                    onChange={(event) =>
                                      updateScene(scene.id, (current) => ({
                                        ...current,
                                        initialPitch: event.target.value,
                                      }))
                                    }
                                  />
                                </label>
                                <label className={styles.field}>
                                  <span>HFOV</span>
                                  <input
                                    type="number"
                                    value={scene.initialHfov}
                                    onChange={(event) =>
                                      updateScene(scene.id, (current) => ({
                                        ...current,
                                        initialHfov: event.target.value,
                                      }))
                                    }
                                  />
                                </label>
                                <label className={styles.field}>
                                  <span>Rotation</span>
                                  <input
                                    type="number"
                                    value={scene.rotation}
                                    onChange={(event) =>
                                      updateScene(scene.id, (current) => ({
                                        ...current,
                                        rotation: event.target.value,
                                      }))
                                    }
                                  />
                                </label>
                              </div>

                              <div className={styles.hotspotSection}>
                                <div className={styles.mapPointHeader}>
                                  <div>
                                    <p className={styles.stepTag}>Hotspots</p>
                                    <p className={styles.mapEditorHelp}>
                                      Add info items or portals that move visitors to another scene.
                                    </p>
                                  </div>
                                  <div className={styles.inlineActions}>
                                    <button
                                      type="button"
                                      className={styles.secondaryButton}
                                      onClick={() => addSceneHotspot(scene.id, 'scene')}
                                    >
                                      Add portal
                                    </button>
                                    <button
                                      type="button"
                                      className={styles.secondaryButton}
                                      onClick={() => addSceneHotspot(scene.id, 'info')}
                                    >
                                      Add info item
                                    </button>
                                  </div>
                                </div>

                                {scene.hotspots.length > 0 ? (
                                  <div className={styles.hotspotList}>
                                    {scene.hotspots.map((hotspot, hotspotIndex) => {
                                      const targetScene = scenes.find(
                                        (candidate) => candidate.id === hotspot.targetSceneId
                                      )

                                      return (
                                        <article key={hotspot.id} className={styles.hotspotCard}>
                                          <div className={styles.mapPointHeader}>
                                            <strong>
                                              {hotspot.type === 'info' ? 'Info item' : 'Portal'}{' '}
                                              {hotspotIndex + 1}
                                            </strong>
                                            <button
                                              type="button"
                                              className={styles.inlineDanger}
                                              onClick={() => removeSceneHotspot(scene.id, hotspot.id)}
                                            >
                                              Remove
                                            </button>
                                          </div>

                                          <div className={styles.fieldGrid}>
                                            <label className={styles.field}>
                                              <span>Type</span>
                                              <select
                                                value={hotspot.type}
                                                onChange={(event) =>
                                                  updateSceneHotspot(
                                                    scene.id,
                                                    hotspot.id,
                                                    (current) => ({
                                                      ...current,
                                                      type: event.target.value as HotspotType,
                                                      targetSceneId:
                                                        event.target.value === 'info'
                                                          ? ''
                                                          : current.targetSceneId,
                                                    })
                                                  )
                                                }
                                              >
                                                <option value="scene">Portal</option>
                                                <option value="info">Info item</option>
                                              </select>
                                            </label>

                                            <label className={styles.field}>
                                              <span>Label</span>
                                              <input
                                                value={hotspot.text}
                                                onChange={(event) =>
                                                  updateSceneHotspot(
                                                    scene.id,
                                                    hotspot.id,
                                                    (current) => ({
                                                      ...current,
                                                      text: event.target.value,
                                                    })
                                                  )
                                                }
                                              />
                                            </label>

                                            <label className={styles.field}>
                                              <span>Pitch</span>
                                              <input
                                                type="number"
                                                value={hotspot.pitch}
                                                onChange={(event) =>
                                                  updateSceneHotspot(
                                                    scene.id,
                                                    hotspot.id,
                                                    (current) => ({
                                                      ...current,
                                                      pitch: event.target.value,
                                                    })
                                                  )
                                                }
                                              />
                                            </label>

                                            <label className={styles.field}>
                                              <span>Yaw</span>
                                              <input
                                                type="number"
                                                value={hotspot.yaw}
                                                onChange={(event) =>
                                                  updateSceneHotspot(
                                                    scene.id,
                                                    hotspot.id,
                                                    (current) => ({
                                                      ...current,
                                                      yaw: event.target.value,
                                                    })
                                                  )
                                                }
                                              />
                                            </label>

                                            {hotspot.type === 'scene' ? (
                                              <label
                                                className={`${styles.field} ${styles.fieldWide}`}
                                              >
                                                <span>Target scene</span>
                                                <select
                                                  value={hotspot.targetSceneId}
                                                  onChange={(event) =>
                                                    updateSceneHotspot(
                                                      scene.id,
                                                      hotspot.id,
                                                      (current) => ({
                                                        ...current,
                                                        targetSceneId: event.target.value,
                                                      })
                                                    )
                                                  }
                                                >
                                                  <option value="">Choose destination</option>
                                                  {availablePortalTargets.map((candidate) => (
                                                    <option key={candidate.id} value={candidate.id}>
                                                      {getSceneOptionLabel(candidate)}
                                                    </option>
                                                  ))}
                                                </select>
                                                {targetScene && (
                                                  <small className={styles.inlineHint}>
                                                    Opens on{' '}
                                                    {targetScene.floorId === scene.floorId
                                                      ? 'this floor'
                                                      : floorNameById.get(targetScene.floorId) ||
                                                        'another floor'}
                                                  </small>
                                                )}
                                              </label>
                                            ) : (
                                              <label
                                                className={`${styles.field} ${styles.fieldWide}`}
                                              >
                                                <span>Info content</span>
                                                <textarea
                                                  rows={4}
                                                  value={hotspot.infoContent}
                                                  onChange={(event) =>
                                                    updateSceneHotspot(
                                                      scene.id,
                                                      hotspot.id,
                                                      (current) => ({
                                                        ...current,
                                                        infoContent: event.target.value,
                                                      })
                                                    )
                                                  }
                                                />
                                              </label>
                                            )}

                                            <label className={styles.field}>
                                              <span>Icon color</span>
                                              <input
                                                value={hotspot.iconColor}
                                                onChange={(event) =>
                                                  updateSceneHotspot(
                                                    scene.id,
                                                    hotspot.id,
                                                    (current) => ({
                                                      ...current,
                                                      iconColor: event.target.value,
                                                    })
                                                  )
                                                }
                                                placeholder="#FF970F"
                                              />
                                            </label>

                                            <label className={styles.field}>
                                              <span>Icon size</span>
                                              <select
                                                value={hotspot.iconSize}
                                                onChange={(event) =>
                                                  updateSceneHotspot(
                                                    scene.id,
                                                    hotspot.id,
                                                    (current) => ({
                                                      ...current,
                                                      iconSize: event.target.value as HotspotIconSize,
                                                    })
                                                  )
                                                }
                                              >
                                                <option value="sm">Small</option>
                                                <option value="md">Medium</option>
                                                <option value="lg">Large</option>
                                              </select>
                                            </label>

                                            <label className={`${styles.field} ${styles.fieldWide}`}>
                                              <span>Optional CSS class</span>
                                              <input
                                                value={hotspot.cssClass}
                                                onChange={(event) =>
                                                  updateSceneHotspot(
                                                    scene.id,
                                                    hotspot.id,
                                                    (current) => ({
                                                      ...current,
                                                      cssClass: event.target.value,
                                                    })
                                                  )
                                                }
                                              />
                                            </label>
                                          </div>
                                        </article>
                                      )
                                    })}
                                  </div>
                                ) : (
                                  <div className={styles.emptyState}>
                                    No hotspots yet. Add a portal or an info item for this scene.
                                  </div>
                                )}
                              </div>
                            </article>
                          )
                        })}
                      </div>
                    ) : (
                      <div className={styles.emptyState}>
                        Assign some scenes to this floor in Step 2 first.
                      </div>
                    )}
                  </section>
                )
              })}
            </div>
          </div>
        </>
      )
    }

    if (currentStep === 'tour') {
      return (
        <>
          <div className={styles.sectionIntro}>
            <h2>4. Assemble tour</h2>
            <p>Set the tour title, intro copy, cover media, and default floor before publishing.</p>
          </div>

          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span>Tour title</span>
              <input
                value={tour.title}
                onChange={(event) => updateTour('title', event.target.value)}
                onBlur={() => updateTour('slug', tour.slug.trim() || slugify(tour.title))}
              />
            </label>
            <label className={styles.field}>
              <span>Tour slug</span>
              <input
                value={tour.slug}
                onChange={(event) => updateTour('slug', slugify(event.target.value))}
              />
            </label>
            <label className={styles.field}>
              <span>Default floor</span>
              <select
                value={tour.defaultFloorId}
                onChange={(event) => updateTour('defaultFloorId', event.target.value)}
              >
                <option value="">Choose floor</option>
                {floors.map((floor) => (
                  <option key={floor.id} value={floor.id}>
                    {floor.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Cover image</span>
              <select
                value={tour.coverAssetId}
                onChange={(event) => updateTour('coverAssetId', event.target.value)}
              >
                <option value="">No cover selected</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {getAssetLabel(asset)}
                  </option>
                ))}
              </select>
            </label>
            <label className={`${styles.field} ${styles.fieldWide}`}>
              <span>Tour description</span>
              <textarea
                rows={4}
                value={tour.description}
                onChange={(event) => updateTour('description', event.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>Welcome title</span>
              <input
                value={tour.welcomeTitle}
                onChange={(event) => updateTour('welcomeTitle', event.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>Tags</span>
              <input
                value={tour.tagsInput}
                onChange={(event) => updateTour('tagsInput', event.target.value)}
              />
            </label>
            <label className={`${styles.field} ${styles.fieldWide}`}>
              <span>Welcome text</span>
              <textarea
                rows={4}
                value={tour.welcomeText}
                onChange={(event) => updateTour('welcomeText', event.target.value)}
              />
            </label>
          </div>
        </>
      )
    }

    return (
      <>
        <div className={styles.sectionIntro}>
          <h2>5. Review and publish</h2>
          <p>Check the structure one more time, then create the tour as a draft or publish it immediately.</p>
        </div>

        <div className={styles.reviewGrid}>
          <article className={styles.reviewCard}>
            <span>Panoramas</span>
            <strong>{panoramaAssets.length}</strong>
          </article>
          <article className={styles.reviewCard}>
            <span>Floors</span>
            <strong>{floors.length}</strong>
          </article>
          <article className={styles.reviewCard}>
            <span>Assigned scenes</span>
            <strong>{totalAssignedScenes}</strong>
          </article>
          <article className={styles.reviewCard}>
            <span>Mode</span>
            <strong>{tour.publish ? 'Publish now' : 'Save as draft'}</strong>
          </article>
        </div>

        <div className={styles.toggleCard}>
          <input
            type="checkbox"
            checked={tour.publish}
            onChange={(event) => updateTour('publish', event.target.checked)}
          />
          <div>
            <strong>{tour.publish ? 'Publish immediately' : 'Create draft records first'}</strong>
            <p>
              Draft mode is safer while the wizard is still settling down. You can publish from admin after review.
            </p>
          </div>
        </div>

        <div className={styles.reviewSummary}>
          {floors.map((floor) => {
            const groupedScenes = floorSceneMap.get(floor.id) || []

            return (
              <article key={floor.id} className={styles.summaryCard}>
                <h3>{floor.name}</h3>
                <p>{groupedScenes.length} scenes</p>
                <ul className={styles.summaryList}>
                  {groupedScenes.map((scene) => (
                    <li key={scene.id}>{getSceneLabel(scene)}</li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>

        {result && (
          <section className={styles.successPanel}>
            <div>
              <p className={styles.stepTag}>Created successfully</p>
              <h3>{result.title}</h3>
              <p>
                Added {result.created.assets} new media items
                {result.created.reusedAssets > 0
                  ? `, reused ${result.created.reusedAssets} existing media items,`
                  : ','}{' '}
                and created {result.created.floors} floors plus {result.created.scenes} scenes.
              </p>
            </div>
            <div className={styles.successActions}>
              <Link href={result.adminEditUrl} className={styles.primaryButton}>
                Open tour record
              </Link>
              <Link href={result.previewUrl} className={styles.secondaryButton}>
                Preview draft
              </Link>
              {result.liveUrl && (
                <Link href={result.liveUrl} className={styles.secondaryButton}>
                  View live tour
                </Link>
              )}
            </div>
          </section>
        )}
      </>
    )
  }

  return (
    <div className={styles.page} data-content-wizard>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <p className={styles.kicker}>Manage tours</p>
          <h1 className={styles.title}>Tour creation wizard</h1>
          <p className={styles.subtitle}>
            We build this one small step at a time: upload panoramas, group them into floors, tune the
            scenes, then publish the tour once the structure looks right.
          </p>
          <div className={styles.heroActions}>
            <Link href="/admin" className={styles.secondaryButton}>
              Back to admin
            </Link>
            <Link href="/admin/collections/tours" className={styles.secondaryButton}>
              Existing tours
            </Link>
          </div>
        </section>

        <section className={styles.stepRail}>
          {STEPS.map((step) => {
            const isActive = step.id === currentStep

            return (
              <button
                key={step.id}
                type="button"
                className={isActive ? styles.stepCardActive : styles.stepCard}
                onClick={() => goToStep(step.id)}
              >
                <span className={styles.stepNumber}>{step.number}</span>
                <strong>{step.title}</strong>
              </button>
            )
          })}
        </section>

        {(errors.length > 0 || apiError) && (
          <section className={styles.errorPanel}>
            <h2>Keep going with these fixes</h2>
            {errors.length > 0 && (
              <ul>
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            )}
            {apiError && <p>{apiError}</p>}
          </section>
        )}

        <section className={styles.panel}>
          {renderStepContent()}

          <div className={styles.footerBar}>
            <div className={styles.footerStats}>
              <span>{panoramaAssets.length} panoramas</span>
              <span>{floors.length} floors</span>
              <span>{totalAssignedScenes} assigned scenes</span>
              <span>{currentIssues.length === 0 ? 'Ready for this step' : `${currentIssues.length} issues to fix`}</span>
            </div>
            <div className={styles.footerActions}>
              {currentStep !== 'upload' && (
                <button type="button" className={styles.secondaryButton} onClick={goBack}>
                  Back
                </button>
              )}
              {currentStep !== 'review' ? (
                <button type="button" className={styles.primaryButton} onClick={goNext}>
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.primaryButton}
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? 'Creating tour...' : 'Create tour'}
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
