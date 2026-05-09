'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { TransitionConfig } from './transitionConfig'
import {
  TRANSITION_PRESETS,
  getRecommendedTransition,
} from './transitionConfig'

export type TransitionPhase =
  | 'idle'
  | 'exiting'
  | 'switching'
  | 'entering'
  | 'complete'

export interface TransitionState {
  phase: TransitionPhase
  config: TransitionConfig
  progress: number          // 动画进度 0-1
  targetSceneSlug: string | null
  targetFloorSlug: string | null
  originPosition: { x: number; y: number } | null  // 点击位置（用于定向动画）
}

export interface UseSceneTransitionReturn {
  state: TransitionState
  startTransition: (params: StartTransitionParams) => Promise<void>
  cancelTransition: () => void
  isTransitioning: boolean
  setConfig: (config: Partial<TransitionConfig>) => void
}

export interface StartTransitionParams {
  targetSceneSlug: string
  targetFloorSlug?: string
  isSameFloor: boolean
  originPosition?: { x: number; y: number }
  customConfig?: Partial<TransitionConfig>
  onMidpoint?: () => void | Promise<void>
  onComplete?: () => void
}

const INITIAL_STATE: TransitionState = {
  phase: 'idle',
  config: TRANSITION_PRESETS.default,
  progress: 0,
  targetSceneSlug: null,
  targetFloorSlug: null,
  originPosition: null,
}

export function useSceneTransition(): UseSceneTransitionReturn {
  const [state, setState] = useState<TransitionState>(INITIAL_STATE)
  const animationRef = useRef<number | null>(null)
  const abortRef = useRef<boolean>(false)
  const midpointCalledRef = useRef<boolean>(false)

  const cleanup = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }, [])

  useEffect(() => {
    return cleanup
  }, [cleanup])

  const cancelTransition = useCallback(() => {
    abortRef.current = true
    cleanup()
    midpointCalledRef.current = false
    setState(INITIAL_STATE)
  }, [cleanup])

  const setConfig = useCallback((config: Partial<TransitionConfig>) => {
    setState((prev) => ({
      ...prev,
      config: { ...prev.config, ...config },
    }))
  }, [])

  const startTransition = useCallback(async ({
    targetSceneSlug,
    targetFloorSlug,
    isSameFloor,
    originPosition,
    customConfig,
    onMidpoint,
    onComplete,
  }: StartTransitionParams): Promise<void> => {
    abortRef.current = false
    midpointCalledRef.current = false
    cleanup()

    const recommendedConfig = getRecommendedTransition(isSameFloor, true)
    const finalConfig: TransitionConfig = {
      ...recommendedConfig,
      ...customConfig,
    }

    setState({
      phase: 'exiting',
      config: finalConfig,
      progress: 0,
      targetSceneSlug,
      targetFloorSlug: targetFloorSlug || null,
      originPosition: originPosition || null,
    })

    const totalDuration = finalConfig.duration
    const delay = finalConfig.delay || 0

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (abortRef.current) {
          resolve()
          return
        }

        const startTime = performance.now()

        const animate = async (currentTime: number) => {
          if (abortRef.current) {
            resolve()
            return
          }

          const elapsed = currentTime - startTime
          const totalProgress = Math.min(elapsed / totalDuration, 1)

          if (totalProgress < 0.5) {
            const exitProgress = totalProgress / 0.5
            setState((prev) => ({
              ...prev,
              phase: 'exiting',
              progress: exitProgress,
            }))
            animationRef.current = requestAnimationFrame(animate)
          } else if (totalProgress >= 0.5 && !midpointCalledRef.current) {
            midpointCalledRef.current = true

            setState((prev) => ({
              ...prev,
              phase: 'switching',
              progress: 1,
            }))

            if (onMidpoint) {
              try {
                await onMidpoint()
              } catch (e) {
                console.error('Scene switch error:', e)
              }
            }

            setState((prev) => ({
              ...prev,
              phase: 'entering',
              progress: 0,
            }))

            animationRef.current = requestAnimationFrame(animate)
          } else if (midpointCalledRef.current && totalProgress < 1) {
            const enterProgress = (totalProgress - 0.5) / 0.5
            setState((prev) => ({
              ...prev,
              phase: 'entering',
              progress: enterProgress,
            }))

            animationRef.current = requestAnimationFrame(animate)
          } else if (totalProgress >= 1) {
            setState((prev) => ({
              ...prev,
              phase: 'complete',
              progress: 1,
            }))

            // Leave the completed frame visible briefly so the overlay does not snap away.
            setTimeout(() => {
              if (!abortRef.current) {
                midpointCalledRef.current = false
                setState(INITIAL_STATE)
                onComplete?.()
              }
              resolve()
            }, 100)
            return
          } else {
            animationRef.current = requestAnimationFrame(animate)
          }
        }

        animationRef.current = requestAnimationFrame(animate)
      }, delay)
    })
  }, [cleanup])

  return {
    state,
    startTransition,
    cancelTransition,
    isTransitioning: state.phase !== 'idle' && state.phase !== 'complete',
    setConfig,
  }
}

export default useSceneTransition
