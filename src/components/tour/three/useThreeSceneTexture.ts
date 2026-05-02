'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

type TextureState = {
  texture: THREE.Texture | null
  isLoading: boolean
  error: Error | null
}

export function useThreeSceneTexture(panoramaUrl: string | null | undefined): TextureState {
  const [state, setState] = useState<TextureState>({
    texture: null,
    isLoading: false,
    error: null,
  })
  const textureRef = useRef<THREE.Texture | null>(null)

  useEffect(() => {
    if (!panoramaUrl) {
      textureRef.current?.dispose()
      textureRef.current = null
      setState({ texture: null, isLoading: false, error: null })
      return
    }

    let isActive = true
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    setState((current) => ({ ...current, isLoading: true, error: null }))

    loader.load(
      panoramaUrl,
      (texture) => {
        if (!isActive) {
          texture.dispose()
          return
        }

        texture.colorSpace = THREE.SRGBColorSpace
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter

        textureRef.current?.dispose()
        textureRef.current = texture
        setState({ texture, isLoading: false, error: null })
      },
      undefined,
      (event) => {
        if (!isActive) return

        const message = event instanceof ErrorEvent
          ? event.message
          : `Unable to load panorama texture: ${panoramaUrl}`
        setState((current) => ({
          texture: current.texture,
          isLoading: false,
          error: new Error(message),
        }))
      },
    )

    return () => {
      isActive = false
    }
  }, [panoramaUrl])

  useEffect(() => {
    return () => {
      textureRef.current?.dispose()
      textureRef.current = null
    }
  }, [])

  return state
}
