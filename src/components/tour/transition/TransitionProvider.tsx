'use client'

/**
 * Transition Provider
 * 过渡效果配置提供者
 * 
 * 提供全局过渡效果配置管理
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { TransitionConfig, TransitionType, TRANSITION_PRESETS } from './transitionConfig'

interface TransitionSettings {
  enabled: boolean                    // 是否启用过渡动画
  defaultPreset: keyof typeof TRANSITION_PRESETS  // 默认预设
  sameFloorPreset: keyof typeof TRANSITION_PRESETS   // 同楼层切换预设
  crossFloorPreset: keyof typeof TRANSITION_PRESETS  // 跨楼层切换预设
  customConfig?: Partial<TransitionConfig>  // 自定义配置覆盖
}

interface TransitionContextValue {
  settings: TransitionSettings
  updateSettings: (newSettings: Partial<TransitionSettings>) => void
  getConfig: (isSameFloor: boolean) => TransitionConfig
  presets: typeof TRANSITION_PRESETS
}

const defaultSettings: TransitionSettings = {
  enabled: true,
  defaultPreset: 'portal',
  sameFloorPreset: 'portal',
  crossFloorPreset: 'zoomIn'
}

const TransitionContext = createContext<TransitionContextValue | null>(null)

export function TransitionProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<TransitionSettings>(defaultSettings)

  const updateSettings = useCallback((newSettings: Partial<TransitionSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }, [])

  const getConfig = useCallback((isSameFloor: boolean): TransitionConfig => {
    if (!settings.enabled) {
      // 如果禁用，使用最快的淡入淡出
      return { ...TRANSITION_PRESETS.quickFade, duration: 100 }
    }

    const presetKey = isSameFloor ? settings.sameFloorPreset : settings.crossFloorPreset
    const baseConfig = TRANSITION_PRESETS[presetKey] || TRANSITION_PRESETS.default

    // 合并自定义配置
    return {
      ...baseConfig,
      ...settings.customConfig
    }
  }, [settings])

  const value: TransitionContextValue = {
    settings,
    updateSettings,
    getConfig,
    presets: TRANSITION_PRESETS
  }

  return (
    <TransitionContext.Provider value={value}>
      {children}
    </TransitionContext.Provider>
  )
}

export function useTransitionSettings() {
  const context = useContext(TransitionContext)
  if (!context) {
    throw new Error('useTransitionSettings must be used within a TransitionProvider')
  }
  return context
}

// 过渡效果选择器组件（可选，用于设置界面）
export function TransitionSelector() {
  const { settings, updateSettings, presets } = useTransitionSettings()
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [previewType, setPreviewType] = useState<string>('portal')

  const presetOptions = Object.keys(presets) as (keyof typeof TRANSITION_PRESETS)[]

  // 预览效果
  const handlePreview = (preset: string) => {
    setPreviewType(preset)
    setIsPreviewing(true)
    
    // 动画结束后关闭预览
    const duration = presets[preset as keyof typeof TRANSITION_PRESETS]?.duration || 1000
    setTimeout(() => {
      setIsPreviewing(false)
    }, duration)
  }

  return (
    <>
      <div className="transition-selector p-4 bg-white rounded-lg shadow-lg max-w-xs">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">过渡动画设置</h3>
        
        {/* 启用/禁用开关 */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-700">启用过渡动画</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => updateSettings({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
              peer-focus:ring-ochre/20 rounded-full peer peer-checked:after:translate-x-full 
              peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] 
              after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full 
              after:h-5 after:w-5 after:transition-all peer-checked:bg-ochre" />
          </label>
        </div>

        {settings.enabled && (
          <>
            {/* 同楼层过渡预设 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                同楼层切换效果
              </label>
              <div className="flex gap-2">
                <select
                  value={settings.sameFloorPreset}
                  onChange={(e) => updateSettings({ 
                    sameFloorPreset: e.target.value as keyof typeof TRANSITION_PRESETS 
                  })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                    focus:outline-none focus:ring-ochre focus:border-ochre text-sm"
                >
                  {presetOptions.map(preset => (
                    <option key={preset} value={preset}>
                      {getPresetLabel(preset)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handlePreview(settings.sameFloorPreset)}
                  className="px-3 py-2 bg-ochre text-white rounded-md text-sm hover:bg-ochre/90"
                >
                  预览
                </button>
              </div>
            </div>

            {/* 跨楼层过渡预设 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                跨楼层切换效果
              </label>
              <div className="flex gap-2">
                <select
                  value={settings.crossFloorPreset}
                  onChange={(e) => updateSettings({ 
                    crossFloorPreset: e.target.value as keyof typeof TRANSITION_PRESETS 
                  })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                    focus:outline-none focus:ring-ochre focus:border-ochre text-sm"
                >
                  {presetOptions.map(preset => (
                    <option key={preset} value={preset}>
                      {getPresetLabel(preset)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handlePreview(settings.crossFloorPreset)}
                  className="px-3 py-2 bg-ochre text-white rounded-md text-sm hover:bg-ochre/90"
                >
                  预览
                </button>
              </div>
            </div>

            {/* 快速预览所有效果 */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">快速预览所有效果：</p>
              <div className="grid grid-cols-2 gap-2">
                {['portal', 'fade', 'zoomIn', 'zoomRotate', 'blur', 'flash', 'wipeLeft'].map(preset => (
                  <button
                    key={preset}
                    onClick={() => handlePreview(preset)}
                    disabled={isPreviewing}
                    className="px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded 
                      disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {getPresetLabel(preset)}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 预览动画层 */}
      {isPreviewing && (
        <PreviewOverlay type={previewType as any} presets={presets} />
      )}
    </>
  )
}

// 预览效果组件
function PreviewOverlay({ type, presets }: { type: string; presets: typeof TRANSITION_PRESETS }) {
  const config = presets[type as keyof typeof TRANSITION_PRESETS] || presets.default
  const duration = config.duration

  return (
    <>
      <style>{`
        @keyframes preview-fade {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes preview-portal-ring {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.5); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
        }
        @keyframes preview-portal-core {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          30% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          70% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
        }
        @keyframes preview-zoomIn-expand {
          0% { transform: translate(-50%, -50%) scale(0); }
          50% { transform: translate(-50%, -50%) scale(1); }
          100% { transform: translate(-50%, -50%) scale(0); }
        }
        @keyframes preview-blur {
          0% { backdrop-filter: blur(0); background: rgba(0,0,0,0); }
          50% { backdrop-filter: blur(30px); background: rgba(0,0,0,0.5); }
          100% { backdrop-filter: blur(0); background: rgba(0,0,0,0); }
        }
        @keyframes preview-flash {
          0% { opacity: 0; }
          25% { opacity: 1; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes preview-wipeLeft {
          0% { clip-path: inset(0 100% 0 0); }
          50% { clip-path: inset(0 0 0 0); }
          100% { clip-path: inset(0 0 0 100%); }
        }
        @keyframes preview-zoomRotate-box {
          0% { transform: translate(-50%, -50%) scale(0) rotate(0deg); }
          50% { transform: translate(-50%, -50%) scale(1.2) rotate(180deg); }
          100% { transform: translate(-50%, -50%) scale(0) rotate(360deg); }
        }
      `}</style>
      
      {/* fade - 纯黑色淡入淡出 */}
      {type === 'fade' && (
        <div 
          style={{
            position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none',
            backgroundColor: 'black',
            animation: `preview-fade ${duration}ms ease-in-out forwards`
          }} 
        />
      )}
      
      {/* portal - 橙色光晕扩散 */}
      {type === 'portal' && (
        <>
          <div 
            style={{
              position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none',
              background: 'radial-gradient(circle at center, rgba(230,70,38,0.6) 0%, rgba(230,70,38,0.2) 40%, transparent 70%)',
              animation: `preview-portal-ring ${duration}ms ease-in-out forwards`
            }} 
          />
          <div 
            style={{
              position: 'fixed', left: '50%', top: '50%', zIndex: 10000, pointerEvents: 'none',
              width: '100px', height: '100px', borderRadius: '50%',
              background: 'radial-gradient(circle, white 0%, rgba(255,255,255,0.5) 50%, transparent 70%)',
              boxShadow: '0 0 60px 30px rgba(230,70,38,0.5)',
              animation: `preview-portal-core ${duration}ms ease-in-out forwards`
            }} 
          />
        </>
      )}
      
      {/* zoomIn - 从中心扩散的圆形 */}
      {type === 'zoomIn' && (
        <div 
          style={{
            position: 'fixed', left: '50%', top: '50%', zIndex: 9999, pointerEvents: 'none',
            width: '200vmax', height: '200vmax',
            borderRadius: '50%',
            backgroundColor: 'black',
            transformOrigin: 'center center',
            animation: `preview-zoomIn-expand ${duration}ms ease-in-out forwards`
          }} 
        />
      )}
      
      {/* zoomRotate - 旋转的方形遮罩 */}
      {type === 'zoomRotate' && (
        <>
          <div 
            style={{
              position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none',
              backgroundColor: 'rgba(0,0,0,0.3)',
              animation: `preview-fade ${duration}ms ease-in-out forwards`
            }} 
          />
          <div 
            style={{
              position: 'fixed', left: '50%', top: '50%', zIndex: 10000, pointerEvents: 'none',
              width: '150vmax', height: '150vmax',
              backgroundColor: 'black',
              transformOrigin: 'center center',
              animation: `preview-zoomRotate-box ${duration}ms ease-in-out forwards`
            }} 
          />
        </>
      )}
      
      {/* blur - 模糊效果 */}
      {type === 'blur' && (
        <div 
          style={{
            position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none',
            animation: `preview-blur ${duration}ms ease-in-out forwards`
          }} 
        />
      )}
      
      {/* flash - 白光闪烁 */}
      {type === 'flash' && (
        <div 
          style={{
            position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none',
            backgroundColor: 'rgba(255,255,255,0.95)',
            animation: `preview-flash ${duration}ms ease-in-out forwards`
          }} 
        />
      )}
      
      {/* wipeLeft - 从右向左擦除 */}
      {type === 'wipeLeft' && (
        <div 
          style={{
            position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none',
            backgroundColor: 'black',
            animation: `preview-wipeLeft ${duration}ms ease-in-out forwards`
          }} 
        />
      )}
      
      {/* default/其他 */}
      {!['fade', 'portal', 'zoomIn', 'zoomRotate', 'blur', 'flash', 'wipeLeft'].includes(type) && (
        <div 
          style={{
            position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none',
            backgroundColor: 'black',
            animation: `preview-fade ${duration}ms ease-in-out forwards`
          }} 
        />
      )}
    </>
  )
}

// 预设名称映射
function getPresetLabel(preset: string): string {
  const labels: Record<string, string> = {
    default: '默认淡入淡出',
    quickFade: '快速淡入淡出',
    portal: '传送门效果 ✨',
    zoomIn: '缩放进入',
    zoomRotate: '缩放旋转',
    blur: '模糊过渡',
    flash: '闪白过渡',
    slideLeft: '向左滑动',
    slideRight: '向右滑动',
    wipeLeft: '擦除效果'
  }
  return labels[preset] || preset
}

export default TransitionProvider
