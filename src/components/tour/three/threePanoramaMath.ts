'use client'

import * as THREE from 'three'
import type { PitchYaw } from './types'

export const MIN_HFOV = 50
export const MAX_HFOV = 120
export const CONTROL_MIN_PITCH = -89.9
export const CONTROL_MAX_PITCH = 89.9

const DEG_TO_RAD = Math.PI / 180
const RAD_TO_DEG = 180 / Math.PI

/**
 * Coordinate convention used by stored CMS panorama data:
 *
 * - pitch is vertical angle in degrees: +90 is up, -90 is down.
 * - yaw is horizontal direction in degrees.
 * - yaw 0 looks along Three.js negative Z, matching the default camera forward vector.
 * - positive yaw rotates toward positive X.
 *
 * Stored CMS values stay in their original pitch/yaw coordinate space.
 * Some camera paths may apply the scene `rotation` field as an image yaw offset
 * with:
 *
 *   displayYaw = storedYaw + scene.rotation
 *
 * Hotspots use stored raw coordinates. The public viewer renders, focuses, and
 * transitions toward hotspots using those values until a broader rotation
 * strategy is confirmed.
 */
export function pitchYawToVector3(pitch: number, yaw: number): THREE.Vector3 {
  const clampedPitch = clampPitch(pitch)
  const normalizedYaw = normaliseYaw(yaw)
  const pitchRad = clampedPitch * DEG_TO_RAD
  const yawRad = normalizedYaw * DEG_TO_RAD
  const cosPitch = Math.cos(pitchRad)

  return new THREE.Vector3(
    Math.sin(yawRad) * cosPitch,
    Math.sin(pitchRad),
    -Math.cos(yawRad) * cosPitch,
  ).normalize()
}

export function vector3ToPitchYaw(vector: THREE.Vector3): PitchYaw {
  const normalized = vector.clone().normalize()
  const pitch = Math.asin(THREE.MathUtils.clamp(normalized.y, -1, 1)) * RAD_TO_DEG
  const yaw = Math.atan2(normalized.x, -normalized.z) * RAD_TO_DEG

  return {
    pitch: clampPitch(pitch),
    yaw: normaliseYaw(yaw),
  }
}

export function applySceneRotationToYaw(yaw: number, sceneRotation: number | null | undefined): number {
  const safeRotation = Number.isFinite(Number(sceneRotation)) ? Number(sceneRotation) : 0
  return normaliseYaw(yaw + safeRotation)
}

export function toThreeDisplayPitchYaw(
  pitch: number,
  yaw: number,
  sceneRotation: number | null | undefined,
): PitchYaw {
  return {
    pitch: clampPitch(pitch),
    yaw: applySceneRotationToYaw(yaw, sceneRotation),
  }
}

export function getStoredPitchYaw(pitch: number, yaw: number): PitchYaw {
  return {
    pitch: clampPitch(pitch),
    yaw: normaliseYaw(yaw),
  }
}

export function projectPitchYawToScreen(
  pitch: number,
  yaw: number,
  camera: THREE.PerspectiveCamera,
  container: HTMLElement,
) {
  const direction = pitchYawToVector3(pitch, yaw)
  const cameraForward = new THREE.Vector3()
  camera.getWorldDirection(cameraForward)

  const isInFrontOfCamera = cameraForward.dot(direction) > 0
  const projected = direction.clone().project(camera)
  const width = container.clientWidth
  const height = container.clientHeight
  const x = (projected.x + 1) * width * 0.5
  const y = (-projected.y + 1) * height * 0.5
  const isInsideClipSpace =
    projected.x >= -1 &&
    projected.x <= 1 &&
    projected.y >= -1 &&
    projected.y <= 1 &&
    projected.z >= -1 &&
    projected.z <= 1

  return {
    x,
    y,
    visible: isInFrontOfCamera && isInsideClipSpace,
  }
}

/**
 * Converts a normalized screen point to stored pitch/yaw coordinates.
 *
 * x and y are normalized device coordinates, not pixels:
 * - x: -1 left, +1 right
 * - y: -1 bottom, +1 top
 *
 * The helper intentionally has no container argument because the requested API
 * matches Three.js Raycaster's `setFromCamera` contract. Callers with pixel
 * coordinates should convert them to NDC before calling this function.
 */
export function screenPointToPitchYaw(
  x: number,
  y: number,
  camera: THREE.PerspectiveCamera,
  sphere: THREE.Mesh,
): PitchYaw | null {
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(new THREE.Vector2(x, y), camera)

  const hit = raycaster.intersectObject(sphere, false)[0]
  if (!hit) return null

  return vector3ToPitchYaw(hit.point)
}

export function normaliseYaw(yaw: number): number {
  if (!Number.isFinite(yaw)) return 0

  const normalized = ((((yaw + 180) % 360) + 360) % 360) - 180
  return normalized === -180 ? 180 : normalized
}

export function clampPitch(pitch: number): number {
  if (!Number.isFinite(pitch)) return 0
  return THREE.MathUtils.clamp(pitch, -90, 90)
}

export function clampInteractionPitch(pitch: number): number {
  return THREE.MathUtils.clamp(clampPitch(pitch), CONTROL_MIN_PITCH, CONTROL_MAX_PITCH)
}

export function clampHfov(hfov: number): number {
  if (!Number.isFinite(hfov)) return MAX_HFOV
  return THREE.MathUtils.clamp(hfov, MIN_HFOV, MAX_HFOV)
}

export function horizontalFovToVerticalFov(hfov: number, aspect: number): number {
  const safeAspect = aspect > 0 ? aspect : 1
  const hRadians = clampHfov(hfov) * DEG_TO_RAD
  return 2 * Math.atan(Math.tan(hRadians * 0.5) / safeAspect) * RAD_TO_DEG
}
