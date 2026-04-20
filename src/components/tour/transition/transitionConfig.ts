/**
 * Scene Transition Configuration
 * 场景过渡动画配置
 * 
 * 使用 Theatre.js 理念设计的过渡效果配置系统
 */

export type TransitionType = 
  | 'fade'           // 淡入淡出
  | 'zoom'           // 缩放进入
  | 'zoomRotate'     // 缩放+旋转
  | 'blur'           // 模糊过渡
  | 'slide'          // 滑动过渡
  | 'wipe'           // 擦除过渡
  | 'flash'          // 闪白过渡
  | 'portal'         // 传送门效果（推荐用于Portal热点）

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
  duration: number          // 过渡持续时间（毫秒）
  easing: EasingType
  delay?: number            // 延迟开始时间（毫秒）
  
  // 特定效果的参数
  zoomScale?: number        // zoom效果的缩放倍数
  rotationDeg?: number      // 旋转角度
  blurAmount?: number       // 模糊程度（像素）
  flashColor?: string       // 闪光颜色
  direction?: 'left' | 'right' | 'up' | 'down'  // 滑动/擦除方向
}

// 预设的过渡效果配置
export const TRANSITION_PRESETS: Record<string, TransitionConfig> = {
  // 默认淡入淡出
  default: {
    type: 'fade',
    duration: 800,
    easing: 'easeInOutCubic'
  },
  
  // 快速淡入淡出
  quickFade: {
    type: 'fade',
    duration: 400,
    easing: 'easeOut'
  },
  
  // 传送门效果 - 适用于Portal热点点击
  portal: {
    type: 'portal',
    duration: 1200,
    easing: 'easeInOutExpo',
    zoomScale: 3,
    blurAmount: 20
  },
  
  // 缩放进入效果
  zoomIn: {
    type: 'zoom',
    duration: 1000,
    easing: 'easeInOutCubic',
    zoomScale: 2.5
  },
  
  // 缩放+旋转效果
  zoomRotate: {
    type: 'zoomRotate',
    duration: 1200,
    easing: 'easeInOutCubic',
    zoomScale: 2,
    rotationDeg: 15
  },
  
  // 模糊过渡
  blur: {
    type: 'blur',
    duration: 800,
    easing: 'easeInOut',
    blurAmount: 30
  },
  
  // 闪白过渡
  flash: {
    type: 'flash',
    duration: 600,
    easing: 'easeInOutQuad',
    flashColor: 'rgba(255, 255, 255, 0.9)'
  },
  
  // 向左滑动
  slideLeft: {
    type: 'slide',
    duration: 800,
    easing: 'easeInOutCubic',
    direction: 'left'
  },
  
  // 向右滑动
  slideRight: {
    type: 'slide',
    duration: 800,
    easing: 'easeInOutCubic',
    direction: 'right'
  },
  
  // 擦除效果
  wipeLeft: {
    type: 'wipe',
    duration: 1000,
    easing: 'easeInOutQuad',
    direction: 'left'
  }
}

// Easing 函数映射（用于CSS和JS动画）
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
  easeInOutExpo: 'cubic-bezier(0.87, 0, 0.13, 1)'
}

// 根据场景切换类型获取推荐的过渡效果
export function getRecommendedTransition(
  isSameFloor: boolean,
  isPortalClick: boolean
): TransitionConfig {
  if (isPortalClick) {
    return TRANSITION_PRESETS.portal
  }
  if (isSameFloor) {
    return TRANSITION_PRESETS.default
  }
  // 跨楼层使用更明显的过渡
  return TRANSITION_PRESETS.zoomIn
}

// 获取CSS easing值
export function getCSSEasing(easing: EasingType): string {
  return EASING_FUNCTIONS[easing] || 'ease-in-out'
}
