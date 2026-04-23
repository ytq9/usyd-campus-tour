/**
 * Scene Transition Configuration
 * 场景过渡动画配置
 * 
 * 使用模糊过渡效果实现平滑的场景切换
 */

export type TransitionType = 'blur'

export type EasingType = 'easeInOut'

export interface TransitionConfig {
  type: TransitionType
  duration: number
  easing: EasingType
  blurAmount: number
}

// 模糊过渡效果配置
export const TRANSITION_PRESETS: Record<string, TransitionConfig> = {
  blur: {
    type: 'blur',
    duration: 800,
    easing: 'easeInOut',
    blurAmount: 30
  }
}

// CSS easing 值
export function getCSSEasing(easing: EasingType): string {
  return 'ease-in-out'
}
