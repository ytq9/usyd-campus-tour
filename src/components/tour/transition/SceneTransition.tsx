'use client'

/**
 * Scene Transition Component
 * 场景过渡动画组件
 * 
 * 使用 Theatre.js 设计理念实现平滑的镜头切换过渡效果
 * 支持多种过渡动画类型：淡入淡出、缩放、旋转、模糊、传送门效果等
 */

import React, { useMemo } from 'react'
import { TransitionState, TransitionPhase } from './useSceneTransition'
import { TransitionType, getCSSEasing } from './transitionConfig'

interface SceneTransitionProps {
  state: TransitionState
  children?: React.ReactNode
}

export default function SceneTransition({ state, children }: SceneTransitionProps) {
  const { phase, config, progress, originPosition } = state

  // 计算过渡样式
  const overlayStyle = useMemo(() => {
    if (phase === 'idle') return {}

    const easing = getCSSEasing(config.easing)
    const isExiting = phase === 'exiting' || phase === 'switching'
    const currentProgress = isExiting ? progress : 1 - progress

    return getTransitionStyle(config.type, currentProgress, config, originPosition, easing)
  }, [phase, config, progress, originPosition])

  // 不在过渡中时不渲染
  if (phase === 'idle') {
    return <>{children}</>
  }

  return (
    <>
      {children}
      
      {/* 主过渡层 */}
      <div 
        className="scene-transition-overlay"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          pointerEvents: 'all',
          ...overlayStyle
        }}
      >
        {/* 传送门效果的额外元素 */}
        {config.type === 'portal' && (
          <PortalEffect 
            progress={progress} 
            phase={phase}
            originPosition={originPosition}
          />
        )}

        {/* 闪光效果 */}
        {config.type === 'flash' && (
          <FlashEffect 
            progress={progress}
            phase={phase}
            color={config.flashColor || 'rgba(255, 255, 255, 0.9)'}
          />
        )}

        {/* 擦除效果 */}
        {config.type === 'wipe' && (
          <WipeEffect
            progress={progress}
            phase={phase}
            direction={config.direction || 'left'}
          />
        )}
      </div>

      {/* 加载指示器 */}
      {(phase === 'switching' || phase === 'entering') && (
        <LoadingIndicator />
      )}
    </>
  )
}

// 获取过渡样式
function getTransitionStyle(
  type: TransitionType,
  progress: number,
  config: any,
  originPosition: { x: number; y: number } | null,
  easing: string
): React.CSSProperties {
  const baseStyle: React.CSSProperties = {
    transition: `all ${config.duration / 2}ms ${easing}`
  }

  switch (type) {
    case 'fade':
      return {
        ...baseStyle,
        backgroundColor: 'rgba(0, 0, 0, 1)',
        opacity: progress
      }

    case 'zoom':
      const zoomScale = config.zoomScale || 2.5
      const scale = 1 + (zoomScale - 1) * progress
      return {
        ...baseStyle,
        backgroundColor: 'rgba(0, 0, 0, 1)',
        opacity: progress,
        transform: `scale(${scale})`,
        transformOrigin: originPosition 
          ? `${originPosition.x}px ${originPosition.y}px`
          : 'center center'
      }

    case 'zoomRotate':
      const zrScale = config.zoomScale || 2
      const rotation = config.rotationDeg || 15
      const zrScaleVal = 1 + (zrScale - 1) * progress
      const rotateVal = rotation * progress
      return {
        ...baseStyle,
        backgroundColor: 'rgba(0, 0, 0, 1)',
        opacity: progress,
        transform: `scale(${zrScaleVal}) rotate(${rotateVal}deg)`,
        transformOrigin: originPosition 
          ? `${originPosition.x}px ${originPosition.y}px`
          : 'center center'
      }

    case 'blur':
      const blurAmount = config.blurAmount || 30
      return {
        ...baseStyle,
        backgroundColor: `rgba(0, 0, 0, ${progress * 0.7})`,
        backdropFilter: `blur(${blurAmount * progress}px)`,
        WebkitBackdropFilter: `blur(${blurAmount * progress}px)`
      }

    case 'portal':
      const portalScale = config.zoomScale || 3
      const portalBlur = config.blurAmount || 20
      const pScale = 1 + (portalScale - 1) * progress
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        transform: `scale(${pScale})`,
        transformOrigin: originPosition 
          ? `${originPosition.x}px ${originPosition.y}px`
          : 'center center',
        backdropFilter: `blur(${portalBlur * progress}px) brightness(${1 + progress * 0.5})`,
        WebkitBackdropFilter: `blur(${portalBlur * progress}px) brightness(${1 + progress * 0.5})`
      }

    case 'slide':
      const direction = config.direction || 'left'
      const slideOffset = getSlideOffset(direction, progress)
      return {
        ...baseStyle,
        backgroundColor: 'rgba(0, 0, 0, 1)',
        transform: slideOffset,
        opacity: 1
      }

    case 'flash':
    case 'wipe':
      return {
        ...baseStyle,
        backgroundColor: 'transparent'
      }

    default:
      return {
        ...baseStyle,
        backgroundColor: 'rgba(0, 0, 0, 1)',
        opacity: progress
      }
  }
}

function getSlideOffset(direction: string, progress: number): string {
  const offset = (1 - progress) * 100
  switch (direction) {
    case 'left': return `translateX(${-offset}%)`
    case 'right': return `translateX(${offset}%)`
    case 'up': return `translateY(${-offset}%)`
    case 'down': return `translateY(${offset}%)`
    default: return `translateX(${-offset}%)`
  }
}

// 传送门效果组件
function PortalEffect({ 
  progress, 
  phase,
  originPosition 
}: { 
  progress: number
  phase: TransitionPhase
  originPosition: { x: number; y: number } | null
}) {
  const isExiting = phase === 'exiting' || phase === 'switching'
  const effectProgress = isExiting ? progress : 1 - progress

  // 传送门光环效果
  const ringStyle: React.CSSProperties = {
    position: 'absolute',
    left: originPosition ? originPosition.x : '50%',
    top: originPosition ? originPosition.y : '50%',
    transform: 'translate(-50%, -50%)',
    width: `${100 + effectProgress * 300}vmax`,
    height: `${100 + effectProgress * 300}vmax`,
    borderRadius: '50%',
    background: `radial-gradient(
      circle,
      rgba(230, 70, 38, ${0.8 * effectProgress}) 0%,
      rgba(230, 70, 38, ${0.4 * effectProgress}) 30%,
      rgba(230, 70, 38, ${0.1 * effectProgress}) 60%,
      transparent 100%
    )`,
    opacity: effectProgress,
    pointerEvents: 'none'
  }

  // 内部光点
  const coreStyle: React.CSSProperties = {
    position: 'absolute',
    left: originPosition ? originPosition.x : '50%',
    top: originPosition ? originPosition.y : '50%',
    transform: 'translate(-50%, -50%)',
    width: `${20 + effectProgress * 100}px`,
    height: `${20 + effectProgress * 100}px`,
    borderRadius: '50%',
    background: 'radial-gradient(circle, white 0%, rgba(255,255,255,0.8) 40%, transparent 70%)',
    opacity: effectProgress,
    boxShadow: `0 0 ${60 * effectProgress}px ${30 * effectProgress}px rgba(255, 255, 255, 0.5)`,
    pointerEvents: 'none'
  }

  // 旋转光线效果
  const raysStyle: React.CSSProperties = {
    position: 'absolute',
    left: originPosition ? originPosition.x : '50%',
    top: originPosition ? originPosition.y : '50%',
    transform: `translate(-50%, -50%) rotate(${effectProgress * 180}deg)`,
    width: `${200 + effectProgress * 400}px`,
    height: `${200 + effectProgress * 400}px`,
    background: `conic-gradient(
      from 0deg,
      transparent 0deg,
      rgba(255, 255, 255, ${0.3 * effectProgress}) 20deg,
      transparent 40deg,
      rgba(255, 255, 255, ${0.3 * effectProgress}) 60deg,
      transparent 80deg,
      rgba(255, 255, 255, ${0.3 * effectProgress}) 100deg,
      transparent 120deg,
      rgba(255, 255, 255, ${0.3 * effectProgress}) 140deg,
      transparent 160deg,
      rgba(255, 255, 255, ${0.3 * effectProgress}) 180deg,
      transparent 200deg,
      rgba(255, 255, 255, ${0.3 * effectProgress}) 220deg,
      transparent 240deg,
      rgba(255, 255, 255, ${0.3 * effectProgress}) 260deg,
      transparent 280deg,
      rgba(255, 255, 255, ${0.3 * effectProgress}) 300deg,
      transparent 320deg,
      rgba(255, 255, 255, ${0.3 * effectProgress}) 340deg,
      transparent 360deg
    )`,
    borderRadius: '50%',
    opacity: effectProgress * 0.8,
    pointerEvents: 'none'
  }

  return (
    <>
      <div style={ringStyle} />
      <div style={raysStyle} />
      <div style={coreStyle} />
    </>
  )
}

// 闪光效果组件
function FlashEffect({ 
  progress, 
  phase,
  color 
}: { 
  progress: number
  phase: TransitionPhase
  color: string
}) {
  const isExiting = phase === 'exiting' || phase === 'switching'
  
  // 闪光在中点最亮
  let opacity: number
  if (isExiting) {
    opacity = progress * 2  // 0 -> 1 (实际会超过1但被限制)
  } else {
    opacity = (1 - progress) * 2
  }
  opacity = Math.min(opacity, 1)

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: color,
        opacity,
        pointerEvents: 'none'
      }}
    />
  )
}

// 擦除效果组件
function WipeEffect({ 
  progress, 
  phase,
  direction
}: { 
  progress: number
  phase: TransitionPhase
  direction: 'left' | 'right' | 'up' | 'down'
}) {
  const isExiting = phase === 'exiting' || phase === 'switching'
  const wipeProgress = isExiting ? progress : 1 - progress

  const getClipPath = () => {
    switch (direction) {
      case 'left':
        return `inset(0 ${100 - wipeProgress * 100}% 0 0)`
      case 'right':
        return `inset(0 0 0 ${100 - wipeProgress * 100}%)`
      case 'up':
        return `inset(0 0 ${100 - wipeProgress * 100}% 0)`
      case 'down':
        return `inset(${100 - wipeProgress * 100}% 0 0 0)`
      default:
        return `inset(0 ${100 - wipeProgress * 100}% 0 0)`
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 1)',
        clipPath: getClipPath(),
        pointerEvents: 'none'
      }}
    />
  )
}

// 加载指示器
function LoadingIndicator() {
  return (
    <div
      className="scene-transition-loading"
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1001,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px'
      }}
    >
      {/* 旋转加载圈 */}
      <div
        style={{
          width: '48px',
          height: '48px',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTopColor: '#E64626',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      <span
        style={{
          color: 'white',
          fontSize: '14px',
          fontWeight: 500,
          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
        }}
      >
        Loading scene...
      </span>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export { SceneTransition }
