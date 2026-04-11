export const FLOOR_MAP_WIDTH = 5000
export const FLOOR_MAP_HEIGHT = 2000

export type WizardAssetPayload = {
  id: string
  alt: string
  fileName: string
  tags: string[]
  existingMediaId?: string | number | null
}

export type WizardMapPointPayload = {
  id: string
  sceneId: string
  cx: number
  cy: number
  color: string
}

export type WizardHotspotPayload = {
  id: string
  type: 'scene' | 'info'
  pitch: number
  yaw: number
  text: string
  targetSceneId: string | null
  infoContent: string
  cssClass: string
  iconColor: string
  iconSize: 'sm' | 'md' | 'lg'
}

export type WizardFloorPayload = {
  id: string
  name: string
  slug: string
  order: number
  floorplanAssetId: string | null
  initialSceneId: string | null
  mapPoints: WizardMapPointPayload[]
}

export type WizardScenePayload = {
  id: string
  floorId: string
  title: string
  slug: string
  description: string
  panoramaAssetId: string | null
  initialYaw: number
  initialPitch: number
  initialHfov: number
  rotation: number
  hotspots: WizardHotspotPayload[]
}

export type WizardTourPayload = {
  title: string
  slug: string
  description: string
  welcomeTitle: string
  welcomeText: string
  tags: string[]
  coverAssetId: string | null
  defaultFloorId: string | null
  publish: boolean
}

export type WizardSubmission = {
  assets: WizardAssetPayload[]
  floors: WizardFloorPayload[]
  scenes: WizardScenePayload[]
  tour: WizardTourPayload
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function parseTagInput(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

export function buildLexicalParagraph(text: string) {
  const trimmed = text.trim()

  if (!trimmed) {
    return undefined
  }

  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              text: trimmed,
            },
          ],
        },
      ],
      direction: null,
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

export function extractPlainTextFromRichText(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim()
  }

  const parts: string[] = []

  const visit = (node: unknown) => {
    if (!node || typeof node !== 'object') {
      return
    }

    if ('text' in node && typeof node.text === 'string') {
      const text = node.text.trim()

      if (text) {
        parts.push(text)
      }
    }

    if ('children' in node && Array.isArray(node.children)) {
      for (const child of node.children) {
        visit(child)
      }
    }
  }

  visit(value)

  return parts.join(' ').replace(/\s+/g, ' ').trim()
}
