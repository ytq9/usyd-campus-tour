/**
 * Scene Transition Module
 * 场景过渡动画模块
 * 
 * 使用模糊效果实现平滑的场景切换
 */

// Core component
export { default as SceneTransition } from './SceneTransition'

// Hook
export { 
  useSceneTransition, 
  type TransitionPhase, 
  type TransitionState,
  type UseSceneTransitionReturn,
  type StartTransitionParams 
} from './useSceneTransition'

// Config
export {
  type TransitionType,
  type TransitionConfig,
  TRANSITION_PRESETS
} from './transitionConfig'
