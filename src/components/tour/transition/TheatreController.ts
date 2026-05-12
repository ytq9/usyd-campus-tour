'use client'

import { getProject, types } from '@theatre/core'
import theatreState from './theatreState.json'

type TheatreProject = ReturnType<typeof getProject>
type TheatreSheet = ReturnType<TheatreProject['sheet']>
type TheatreObject = ReturnType<TheatreSheet['object']>

interface TransitionValues {
  opacity: number
  scale: number
  blur: number
  brightness: number
  rotation: number
}

class TheatreTransitionController {
  private project: TheatreProject | null = null
  private sheet: TheatreSheet | null = null
  private transitionObject: TheatreObject | null = null
  private isInitialized = false
  private listeners: Map<string, (values: TransitionValues) => void> = new Map()

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize()
    }
  }

  private async initialize() {
    if (this.isInitialized) return

    try {
      this.project = getProject('Campus Tour Transitions', {
        state: theatreState as any,
      })

      this.sheet = this.project.sheet('Scene Transition')

      this.transitionObject = this.sheet.object('Transition', {
        opacity: types.number(0, { range: [0, 1] }),
        scale: types.number(1, { range: [0.5, 5] }),
        blur: types.number(0, { range: [0, 50] }),
        brightness: types.number(1, { range: [0.5, 2] }),
        rotation: types.number(0, { range: [-180, 180] }),
      }) as unknown as TheatreObject

      this.transitionObject.onValuesChange((values) => {
        this.notifyListeners(values as TransitionValues)
      })

      this.isInitialized = true
    } catch (error) {
      console.warn('Theatre.js initialization failed, using fallback animations:', error)
    }
  }

  async playTransition(
    duration = 1200,
    onMidpoint?: () => void | Promise<void>,
  ): Promise<void> {
    if (!this.sheet || !this.isInitialized) {
      console.warn('Theatre.js not initialized, skipping animation')
      if (onMidpoint) {
        await new Promise((resolve) => setTimeout(resolve, duration / 2))
        await onMidpoint()
        await new Promise((resolve) => setTimeout(resolve, duration / 2))
      }
      return
    }

    const sequence = this.sheet.sequence
    const durationInSeconds = duration / 1000

    return new Promise<void>(async (resolve) => {
      let midpointCalled = false
      const checkMidpoint = async () => {
        if (!midpointCalled && sequence.position >= durationInSeconds / 2) {
          midpointCalled = true
          if (onMidpoint) {
            await onMidpoint()
          }
        }
      }

      await this.project!.ready

      const playPromise = sequence.play({
        iterationCount: 1,
        range: [0, durationInSeconds],
        rate: 1,
      })

      const interval = setInterval(checkMidpoint, 16) // ~60fps

      await playPromise

      clearInterval(interval)

      // Keep the scene switch from being skipped on very short transitions.
      if (!midpointCalled && onMidpoint) {
        await onMidpoint()
      }

      resolve()
    })
  }

  addListener(id: string, callback: (values: TransitionValues) => void) {
    this.listeners.set(id, callback)
  }

  removeListener(id: string) {
    this.listeners.delete(id)
  }

  private notifyListeners(values: TransitionValues) {
    this.listeners.forEach((callback) => callback(values))
  }

  getCurrentValues(): TransitionValues | null {
    if (!this.transitionObject) return null
    return this.transitionObject.value as TransitionValues
  }

  setValues(_values: Partial<TransitionValues>) {
    if (!this.transitionObject) return
  }

  get ready(): boolean {
    return this.isInitialized
  }
}

let controllerInstance: TheatreTransitionController | null = null

export function getTheatreController(): TheatreTransitionController {
  if (!controllerInstance) {
    controllerInstance = new TheatreTransitionController()
  }
  return controllerInstance
}

export async function initTheatreStudio() {
  if (typeof window === 'undefined') return
  if (process.env.NODE_ENV !== 'development') return

  try {
    const studio = await import('@theatre/studio')
    studio.default.initialize()
  } catch (error) {
    console.warn('Failed to initialize Theatre.js Studio:', error)
  }
}

export type { TransitionValues }
export default TheatreTransitionController
