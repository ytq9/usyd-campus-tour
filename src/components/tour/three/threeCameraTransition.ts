'use client'

import type { CameraState } from './types'
import { clampHfov, clampInteractionPitch, normaliseYaw } from './threePanoramaMath'

type CameraStateSetter = (state: Partial<CameraState>) => void
type CameraStateGetter = () => CameraState

type Direction = {
  pitch?: number
  yaw?: number
}

type AnimationOptions = {
  duration?: number
  signal?: AbortSignal
}

type CameraTransitionOptions = AnimationOptions & {
  getCameraState: CameraStateGetter
  onMidpoint?: () => void | Promise<void>
  outgoingDirection?: Direction | null
  setCameraState: CameraStateSetter
  targetState: CameraState
}

type CameraExitOptions = AnimationOptions & {
  getCameraState: CameraStateGetter
  onComplete?: () => void | Promise<void>
  outgoingDirection?: Direction | null
  setCameraState: CameraStateSetter
}

type CameraFocusOptions = AnimationOptions & {
  getCameraState: CameraStateGetter
  setCameraState: CameraStateSetter
  targetPitch: number
  targetYaw: number
  targetHfov?: number
}

const DEFAULT_SCENE_TRANSITION_DURATION = 1200
const DEFAULT_FOCUS_DURATION = 650
const DEFAULT_INFO_FOCUS_HFOV = 72
const MIN_ZOOMED_OUT_HFOV = 96
const ZOOM_OUT_EXTRA_HFOV = 16

export function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function interpolateNumber(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

export function getShortestYawDelta(startYaw: number, endYaw: number): number {
  return normaliseYaw(endYaw - startYaw)
}

export function interpolateYaw(startYaw: number, endYaw: number, t: number): number {
  return normaliseYaw(startYaw + getShortestYawDelta(startYaw, endYaw) * t)
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export async function animateCameraTransition({
  duration = DEFAULT_SCENE_TRANSITION_DURATION,
  getCameraState,
  onMidpoint,
  outgoingDirection,
  setCameraState,
  signal,
  targetState,
}: CameraTransitionOptions): Promise<boolean> {
  const finalState = normaliseCameraState(targetState)

  if (prefersReducedMotion()) {
    await onMidpoint?.()
    if (signal?.aborted) return false
    setCameraState(finalState)
    return true
  }

  const startState = normaliseCameraState(getCameraState())
  const zoomedOutHfov = getZoomedOutHfov(startState.hfov, finalState.hfov)
  const exitState = normaliseCameraState({
    pitch: outgoingDirection?.pitch ?? finalState.pitch,
    yaw: outgoingDirection?.yaw ?? finalState.yaw,
    hfov: zoomedOutHfov,
  })

  const exitCompleted = await animateCameraSegment({
    duration: duration * 0.46,
    from: startState,
    setCameraState,
    signal,
    to: exitState,
  })
  if (!exitCompleted || signal?.aborted) return false

  await onMidpoint?.()
  if (signal?.aborted) return false

  const entryState = normaliseCameraState({
    pitch: finalState.pitch,
    yaw: finalState.yaw,
    hfov: zoomedOutHfov,
  })
  setCameraState(entryState)

  return animateCameraSegment({
    duration: duration * 0.54,
    from: entryState,
    setCameraState,
    signal,
    to: finalState,
  })
}

export async function animateCameraExit({
  duration = DEFAULT_SCENE_TRANSITION_DURATION * 0.6,
  getCameraState,
  onComplete,
  outgoingDirection,
  setCameraState,
  signal,
}: CameraExitOptions): Promise<boolean> {
  if (prefersReducedMotion()) {
    await onComplete?.()
    return !signal?.aborted
  }

  const startState = normaliseCameraState(getCameraState())
  const exitState = normaliseCameraState({
    pitch: outgoingDirection?.pitch ?? startState.pitch,
    yaw: outgoingDirection?.yaw ?? startState.yaw,
    hfov: getZoomedOutHfov(startState.hfov, startState.hfov),
  })

  const completed = await animateCameraSegment({
    duration,
    from: startState,
    setCameraState,
    signal,
    to: exitState,
  })
  if (!completed || signal?.aborted) return false

  await onComplete?.()
  return !signal?.aborted
}

export async function animateCameraFocus({
  duration = DEFAULT_FOCUS_DURATION,
  getCameraState,
  setCameraState,
  signal,
  targetHfov = DEFAULT_INFO_FOCUS_HFOV,
  targetPitch,
  targetYaw,
}: CameraFocusOptions): Promise<boolean> {
  const targetState = normaliseCameraState({
    pitch: targetPitch,
    yaw: targetYaw,
    hfov: targetHfov,
  })

  if (prefersReducedMotion()) {
    if (signal?.aborted) return false
    setCameraState(targetState)
    return true
  }

  return animateCameraSegment({
    duration,
    from: normaliseCameraState(getCameraState()),
    setCameraState,
    signal,
    to: targetState,
  })
}

function animateCameraSegment({
  duration,
  from,
  setCameraState,
  signal,
  to,
}: AnimationOptions & {
  duration: number
  from: CameraState
  setCameraState: CameraStateSetter
  to: CameraState
}): Promise<boolean> {
  if (signal?.aborted) return Promise.resolve(false)
  if (duration <= 0) {
    setCameraState(to)
    return Promise.resolve(true)
  }

  return new Promise((resolve) => {
    const startTime = performance.now()
    let frameId: number | null = null
    let done = false

    const finish = (completed: boolean) => {
      if (done) return
      done = true
      if (frameId !== null) cancelAnimationFrame(frameId)
      signal?.removeEventListener('abort', handleAbort)
      resolve(completed)
    }

    const handleAbort = () => finish(false)

    const tick = (time: number) => {
      if (signal?.aborted) {
        finish(false)
        return
      }

      const progress = Math.min((time - startTime) / duration, 1)
      const eased = easeInOutCubic(progress)
      setCameraState({
        pitch: interpolateNumber(from.pitch, to.pitch, eased),
        yaw: interpolateYaw(from.yaw, to.yaw, eased),
        hfov: interpolateNumber(from.hfov, to.hfov, eased),
      })

      if (progress >= 1) {
        finish(true)
        return
      }

      frameId = requestAnimationFrame(tick)
    }

    signal?.addEventListener('abort', handleAbort, { once: true })
    frameId = requestAnimationFrame(tick)
  })
}

function normaliseCameraState(state: CameraState): CameraState {
  return {
    pitch: clampInteractionPitch(state.pitch),
    yaw: normaliseYaw(state.yaw),
    hfov: clampHfov(state.hfov),
  }
}

function getZoomedOutHfov(startHfov: number, endHfov: number): number {
  return clampHfov(Math.max(startHfov, endHfov, MIN_ZOOMED_OUT_HFOV) + ZOOM_OUT_EXTRA_HFOV)
}
