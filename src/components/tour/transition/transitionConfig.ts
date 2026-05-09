export type TransitionType =
  | 'fade'
  | 'zoom'
  | 'zoomRotate'
  | 'blur'
  | 'slide'
  | 'wipe'
  | 'flash'
  | 'portal'

export type EasingType =
  | 'linear'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic'
  | 'easeInExpo'
  | 'easeOutExpo'
  | 'easeInOutExpo'

export interface TransitionConfig {
  type: TransitionType
  duration: number
  easing: EasingType
  delay?: number
  zoomScale?: number
  rotationDeg?: number
  blurAmount?: number
  flashColor?: string
  direction?: 'left' | 'right' | 'up' | 'down'
}

export const TRANSITION_PRESETS: Record<string, TransitionConfig> = {
  default: {
    type: 'fade',
    duration: 800,
    easing: 'easeInOutCubic',
  },

  quickFade: {
    type: 'fade',
    duration: 400,
    easing: 'easeOut',
  },

  portal: {
    type: 'portal',
    duration: 1200,
    easing: 'easeInOutExpo',
    zoomScale: 3,
    blurAmount: 20,
  },

  zoomIn: {
    type: 'zoom',
    duration: 1000,
    easing: 'easeInOutCubic',
    zoomScale: 2.5,
  },

  zoomRotate: {
    type: 'zoomRotate',
    duration: 1200,
    easing: 'easeInOutCubic',
    zoomScale: 2,
    rotationDeg: 15,
  },

  blur: {
    type: 'blur',
    duration: 800,
    easing: 'easeInOut',
    blurAmount: 30,
  },

  flash: {
    type: 'flash',
    duration: 600,
    easing: 'easeInOutQuad',
    flashColor: 'rgba(255, 255, 255, 0.9)',
  },

  slideLeft: {
    type: 'slide',
    duration: 800,
    easing: 'easeInOutCubic',
    direction: 'left',
  },

  slideRight: {
    type: 'slide',
    duration: 800,
    easing: 'easeInOutCubic',
    direction: 'right',
  },

  wipeLeft: {
    type: 'wipe',
    duration: 1000,
    easing: 'easeInOutQuad',
    direction: 'left',
  },
}

export const EASING_FUNCTIONS: Record<EasingType, string> = {
  linear: 'linear',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  easeInQuad: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeInOutQuad: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
  easeInCubic: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  easeOutCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  easeInExpo: 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
  easeOutExpo: 'cubic-bezier(0.19, 1, 0.22, 1)',
  easeInOutExpo: 'cubic-bezier(0.87, 0, 0.13, 1)',
}

export function getRecommendedTransition(
  isSameFloor: boolean,
  isPortalClick: boolean,
): TransitionConfig {
  if (isPortalClick) {
    return TRANSITION_PRESETS.portal
  }
  if (isSameFloor) {
    return TRANSITION_PRESETS.default
  }

  // Cross-floor movement needs a stronger cue than a same-floor portal hop.
  return TRANSITION_PRESETS.zoomIn
}

export function getDefaultTransitionConfig(isSameFloor: boolean): TransitionConfig {
  return isSameFloor ? TRANSITION_PRESETS.portal : TRANSITION_PRESETS.zoomIn
}

export function getCSSEasing(easing: EasingType): string {
  return EASING_FUNCTIONS[easing] || 'ease-in-out'
}
