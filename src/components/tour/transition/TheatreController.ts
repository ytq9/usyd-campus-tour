'use client'

/**
 * Theatre.js Animation Controller
 * Theatre.js 动画控制器
 * 
 * 提供使用 Theatre.js 的高级动画控制功能
 * 这是一个可选模块，用于需要更精细动画控制的场景
 */

import { getProject, types } from '@theatre/core'
import theatreState from './theatreState.json'

// Theatre.js 项目和 sheet 的类型
type TheatreProject = ReturnType<typeof getProject>
type TheatreSheet = ReturnType<TheatreProject['sheet']>
type TheatreObject = ReturnType<TheatreSheet['object']>

// 动画值类型
interface TransitionValues {
  opacity: number
  scale: number
  blur: number
  brightness: number
  rotation: number
}

// Theatre.js 控制器类
class TheatreTransitionController {
  private project: TheatreProject | null = null
  private sheet: TheatreSheet | null = null
  private transitionObject: TheatreObject | null = null
  private isInitialized: boolean = false
  private listeners: Map<string, (values: TransitionValues) => void> = new Map()

  constructor() {
    // 延迟初始化，只在客户端执行
    if (typeof window !== 'undefined') {
      this.initialize()
    }
  }

  private async initialize() {
    if (this.isInitialized) return

    try {
      // 创建 Theatre.js 项目
      this.project = getProject('Campus Tour Transitions', {
        state: theatreState as any
      })

      // 获取过渡动画 sheet
      this.sheet = this.project.sheet('Scene Transition')

      // 创建过渡动画对象
      this.transitionObject = this.sheet.object('Transition', {
        opacity: types.number(0, { range: [0, 1] }),
        scale: types.number(1, { range: [0.5, 5] }),
        blur: types.number(0, { range: [0, 50] }),
        brightness: types.number(1, { range: [0.5, 2] }),
        rotation: types.number(0, { range: [-180, 180] })
      })

      // 监听值变化
      this.transitionObject.onValuesChange((values) => {
        this.notifyListeners(values as TransitionValues)
      })

      this.isInitialized = true
      console.log('Theatre.js controller initialized')
    } catch (error) {
      console.warn('Theatre.js initialization failed, using fallback animations:', error)
    }
  }

  // 播放过渡动画
  async playTransition(
    duration: number = 1200,
    onMidpoint?: () => void | Promise<void>
  ): Promise<void> {
    if (!this.sheet || !this.isInitialized) {
      console.warn('Theatre.js not initialized, skipping animation')
      // 回退：直接调用中点回调
      if (onMidpoint) {
        await new Promise(resolve => setTimeout(resolve, duration / 2))
        await onMidpoint()
        await new Promise(resolve => setTimeout(resolve, duration / 2))
      }
      return
    }

    const sequence = this.sheet.sequence

    // 设置动画范围和持续时间
    const durationInSeconds = duration / 1000

    return new Promise<void>(async (resolve) => {
      // 监听播放进度
      let midpointCalled = false
      const checkMidpoint = async () => {
        if (!midpointCalled && sequence.position >= durationInSeconds / 2) {
          midpointCalled = true
          if (onMidpoint) {
            await onMidpoint()
          }
        }
      }

      // 播放动画
      await this.project!.ready

      const playPromise = sequence.play({
        iterationCount: 1,
        range: [0, durationInSeconds],
        rate: 1
      })

      // 检查中点
      const interval = setInterval(checkMidpoint, 16) // ~60fps

      await playPromise

      clearInterval(interval)
      
      // 确保中点回调被调用
      if (!midpointCalled && onMidpoint) {
        await onMidpoint()
      }

      resolve()
    })
  }

  // 添加值变化监听器
  addListener(id: string, callback: (values: TransitionValues) => void) {
    this.listeners.set(id, callback)
  }

  // 移除监听器
  removeListener(id: string) {
    this.listeners.delete(id)
  }

  // 通知所有监听器
  private notifyListeners(values: TransitionValues) {
    this.listeners.forEach(callback => callback(values))
  }

  // 获取当前值
  getCurrentValues(): TransitionValues | null {
    if (!this.transitionObject) return null
    return this.transitionObject.value as TransitionValues
  }

  // 手动设置值（用于自定义控制）
  setValues(values: Partial<TransitionValues>) {
    if (!this.transitionObject) return
    // Theatre.js 不支持直接设置值，这里我们只记录意图
    console.log('Manual value set requested:', values)
  }

  // 检查是否已初始化
  get ready(): boolean {
    return this.isInitialized
  }
}

// 单例实例
let controllerInstance: TheatreTransitionController | null = null

export function getTheatreController(): TheatreTransitionController {
  if (!controllerInstance) {
    controllerInstance = new TheatreTransitionController()
  }
  return controllerInstance
}

// 初始化 Theatre.js Studio（仅开发环境）
export async function initTheatreStudio() {
  if (typeof window === 'undefined') return
  if (process.env.NODE_ENV !== 'development') return

  try {
    const studio = await import('@theatre/studio')
    studio.default.initialize()
    console.log('Theatre.js Studio initialized for development')
  } catch (error) {
    console.warn('Failed to initialize Theatre.js Studio:', error)
  }
}

export type { TransitionValues }
export default TheatreTransitionController
