export { default as SceneTransition } from './SceneTransition'

export {
  useSceneTransition,
  type TransitionPhase,
  type TransitionState,
  type UseSceneTransitionReturn,
  type StartTransitionParams,
} from './useSceneTransition'

export {
  type TransitionType,
  type TransitionConfig,
  type EasingType,
  TRANSITION_PRESETS,
  EASING_FUNCTIONS,
  getRecommendedTransition,
  getDefaultTransitionConfig,
  getCSSEasing,
} from './transitionConfig'

export {
  getTheatreController,
  initTheatreStudio,
  type TransitionValues,
} from './TheatreController'
