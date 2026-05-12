import type { ThreeViewerApi } from '@/components/tour/three/types'

declare global {
  interface Window {
    threePanoramaViewer?: ThreeViewerApi
  }
}

export {}
