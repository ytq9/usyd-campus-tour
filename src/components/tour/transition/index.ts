/**
 * Scene Transition Module
 * 场景过渡动画模块导出
 * 
 * 使用 Theatre.js 设计理念实现的平滑镜头切换过渡系统
 * 
 * @module tour/transition
 * @description 提供校园导览项目的场景切换过渡动画功能
 * 
 * 主要功能：
 * - 多种过渡效果预设（淡入淡出、缩放、传送门、模糊等）
 * - Theatre.js 高级动画控制（可选）
 * - 响应式配置系统
 * - 移动端触摸优化
 */

// 核心组件
export { default as SceneTransition } from './SceneTransition'

// Hooks
export { 
  useSceneTransition, 
  type TransitionPhase, 
  type TransitionState,
  type UseSceneTransitionReturn,
  type StartTransitionParams 
} from './useSceneTransition'

// 配置和工具
export {
  type TransitionType,
  type TransitionConfig,
  type EasingType,
  TRANSITION_PRESETS,
  EASING_FUNCTIONS,
  getRecommendedTransition,
  getDefaultTransitionConfig,
  getCSSEasing
} from './transitionConfig'

// Theatre.js 高级控制器（可选）
export {
  getTheatreController,
  initTheatreStudio,
  type TransitionValues
} from './TheatreController'
