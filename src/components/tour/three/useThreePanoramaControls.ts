'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import type { PerspectiveCamera } from 'three'
import type { CameraState } from './types'
import {
  clampHfov,
  clampInteractionPitch,
  horizontalFovToVerticalFov,
  normaliseYaw,
  pitchYawToVector3,
} from './threePanoramaMath'

type Args = {
  cameraRef: RefObject<PerspectiveCamera | null>
  containerRef: RefObject<HTMLElement | null>
  initialPitch: number
  initialYaw: number
  initialHfov: number
}

const DRAG_DEGREES_PER_SCREEN = 1
const WHEEL_HFOV_SENSITIVITY = 0.05

export function useThreePanoramaControls({
  cameraRef,
  containerRef,
  initialPitch,
  initialYaw,
  initialHfov,
}: Args) {
  const cameraStateRef = useRef<CameraState>({
    pitch: clampInteractionPitch(initialPitch),
    yaw: normaliseYaw(initialYaw),
    hfov: clampHfov(initialHfov),
  })

  const applyCameraState = useCallback(() => {
    const camera = cameraRef.current
    const container = containerRef.current
    if (!camera || !container) return

    const state = cameraStateRef.current
    const width = Math.max(container.clientWidth, 1)
    const height = Math.max(container.clientHeight, 1)
    camera.aspect = width / height
    camera.fov = horizontalFovToVerticalFov(state.hfov, camera.aspect)
    camera.position.set(0, 0, 0)
    camera.lookAt(pitchYawToVector3(state.pitch, state.yaw))
    camera.updateProjectionMatrix()
  }, [cameraRef, containerRef])

  const setCameraState = useCallback((nextState: Partial<CameraState>) => {
    cameraStateRef.current = {
      pitch: clampInteractionPitch(nextState.pitch ?? cameraStateRef.current.pitch),
      yaw: normaliseYaw(nextState.yaw ?? cameraStateRef.current.yaw),
      hfov: clampHfov(nextState.hfov ?? cameraStateRef.current.hfov),
    }
    applyCameraState()
  }, [applyCameraState])

  const getCameraState = useCallback(() => cameraStateRef.current, [])

  const lookAt = useCallback((pitch: number, yaw: number, hfov?: number) => {
    setCameraState({ pitch, yaw, hfov })
  }, [setCameraState])

  useEffect(() => {
    setCameraState({
      pitch: initialPitch,
      yaw: initialYaw,
      hfov: initialHfov,
    })
  }, [initialPitch, initialYaw, initialHfov, setCameraState])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let isDragging = false
    let activePointerId: number | null = null
    let lastX = 0
    let lastY = 0

    const getSensitivity = () => {
      const width = Math.max(container.clientWidth, 1)
      return (cameraStateRef.current.hfov / width) * DRAG_DEGREES_PER_SCREEN
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return

      isDragging = true
      activePointerId = event.pointerId
      lastX = event.clientX
      lastY = event.clientY
      container.setPointerCapture?.(event.pointerId)
      event.preventDefault()
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging || event.pointerId !== activePointerId) return

      const deltaX = event.clientX - lastX
      const deltaY = event.clientY - lastY
      lastX = event.clientX
      lastY = event.clientY

      const sensitivity = getSensitivity()
      setCameraState({
        yaw: cameraStateRef.current.yaw - deltaX * sensitivity,
        pitch: cameraStateRef.current.pitch + deltaY * sensitivity,
      })
      event.preventDefault()
    }

    const endDrag = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId) return

      isDragging = false
      activePointerId = null
      container.releasePointerCapture?.(event.pointerId)
    }

    const handleWheel = (event: WheelEvent) => {
      setCameraState({
        hfov: cameraStateRef.current.hfov + event.deltaY * WHEEL_HFOV_SENSITIVITY,
      })
      event.preventDefault()
    }

    container.addEventListener('pointerdown', handlePointerDown)
    container.addEventListener('pointermove', handlePointerMove)
    container.addEventListener('pointerup', endDrag)
    container.addEventListener('pointercancel', endDrag)
    container.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      container.removeEventListener('pointerdown', handlePointerDown)
      container.removeEventListener('pointermove', handlePointerMove)
      container.removeEventListener('pointerup', endDrag)
      container.removeEventListener('pointercancel', endDrag)
      container.removeEventListener('wheel', handleWheel)
    }
  }, [containerRef, setCameraState])

  return {
    applyCameraState,
    getCameraState,
    lookAt,
    setCameraState,
  }
}
