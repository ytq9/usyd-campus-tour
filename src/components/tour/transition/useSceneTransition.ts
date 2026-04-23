'use client'

/**
 * Scene Transition Hook
 * 场景过渡动画状态管理 Hook
 * 
 * 提供场景切换时的过渡动画控制
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { TransitionConfig, TRANSITION_PRESETS } from './transitionConfig'

export type TransitionPhase = 
  | 'idle'        // 空闲状态
  | 'exiting'     // 退出当前场景（动画进行中）
  | 'switching'   // 切换场景中
  | 'entering'    // 进入新场景（动画进行中）
  | 'complete'    // 过渡完成

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
  onMidpoint?: () => void | Promise<void>  // 动画中点回调（用于实际切换场景）
  onComplete?: () => void
}

const INITIAL_STATE: TransitionState = {
  phase: 'idle',
  config: TRANSITION_PRESETS.blur,
  progress: 0,
  targetSceneSlug: null,
  targetFloorSlug: null,
  originPosition: null
}

export function useSceneTransition(): UseSceneTransitionReturn {
  const [state, setState] = useState<TransitionState>(INITIAL_STATE)
  const animationRef = useRef<number | null>(null)
  const abortRef = useRef<boolean>(false)
  const phaseRef = useRef<TransitionPhase>('idle')  // 用于在动画循环中跟踪当前阶段
  const midpointCalledRef = useRef<boolean>(false)  // 确保 midpoint 只调用一次

  // 清理动画
  const cleanup = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }, [])

  useEffect(() => {
    return cleanup
  }, [cleanup])

  // 取消过渡
  const cancelTransition = useCallback(() => {
    abortRef.current = true
    cleanup()
    phaseRef.current = 'idle'
    midpointCalledRef.current = false
    setState(INITIAL_STATE)
  }, [cleanup])

  // 设置配置
  const setConfig = useCallback((config: Partial<TransitionConfig>) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, ...config }
    }))
  }, [])

  // 开始过渡动画
  const startTransition = useCallback(async ({
    targetSceneSlug,
    targetFloorSlug,
    isSameFloor,
    originPosition,
    customConfig,
    onMidpoint,
    onComplete
  }: StartTransitionParams): Promise<void> => {
    abortRef.current = false
    midpointCalledRef.current = false
    cleanup()

    // Use blur transition config
    const finalConfig: TransitionConfig = {
      ...TRANSITION_PRESETS.blur,
      ...customConfig
    }

    // 更新状态为开始退出
    phaseRef.current = 'exiting'
    setState({
      phase: 'exiting',
      config: finalConfig,
      progress: 0,
      targetSceneSlug,
      targetFloorSlug: targetFloorSlug || null,
      originPosition: originPosition || null
    })

    const totalDuration = finalConfig.duration

    return new Promise<void>((resolve) => {
      if (abortRef.current) {
        resolve()
        return
      }

      const startTime = performance.now()

      // 动画循环
      const animate = async (currentTime: number) => {
        if (abortRef.current) {
          resolve()
          return
        }

        const elapsed = currentTime - startTime
        const totalProgress = Math.min(elapsed / totalDuration, 1)

        // 退出阶段 (0-0.5)
        if (totalProgress < 0.5) {
          const exitProgress = totalProgress / 0.5
          phaseRef.current = 'exiting'
          setState(prev => ({
            ...prev,
            phase: 'exiting',
            progress: exitProgress
          }))
          animationRef.current = requestAnimationFrame(animate)
        }
        // 切换点 (0.5) - 确保只执行一次
        else if (totalProgress >= 0.5 && !midpointCalledRef.current) {
          midpointCalledRef.current = true
          phaseRef.current = 'switching'
          
          setState(prev => ({
            ...prev,
            phase: 'switching',
            progress: 1
          }))

          // 执行场景切换回调
          if (onMidpoint) {
            try {
              await onMidpoint()
            } catch (e) {
              console.error('Scene switch error:', e)
            }
          }

          // 进入新场景阶段
          phaseRef.current = 'entering'
          setState(prev => ({
            ...prev,
            phase: 'entering',
            progress: 0
          }))
          
          animationRef.current = requestAnimationFrame(animate)
        }
        // 进入阶段 (0.5-1.0)
        else if (midpointCalledRef.current && totalProgress < 1) {
          const enterProgress = (totalProgress - 0.5) / 0.5
          phaseRef.current = 'entering'
          setState(prev => ({
            ...prev,
            phase: 'entering',
            progress: enterProgress
          }))
          
          animationRef.current = requestAnimationFrame(animate)
        }
        // 完成
        else if (totalProgress >= 1) {
          phaseRef.current = 'complete'
          setState(prev => ({
            ...prev,
            phase: 'complete',
            progress: 1
          }))

          // 短暂延迟后重置状态
          setTimeout(() => {
            if (!abortRef.current) {
              phaseRef.current = 'idle'
              midpointCalledRef.current = false
              setState(INITIAL_STATE)
              onComplete?.()
            }
            resolve()
          }, 100)
          return
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    })
  }, [cleanup])

  return {
    state,
    startTransition,
    cancelTransition,
    isTransitioning: state.phase !== 'idle' && state.phase !== 'complete',
    setConfig
  }
}

export default useSceneTransition
