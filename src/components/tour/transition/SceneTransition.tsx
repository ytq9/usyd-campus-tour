'use client'

/**
 * Scene Transition Component
 * 场景过渡动画组件
 * 
 * 使用模糊效果实现平滑的场景切换
 */

import React, { useMemo } from 'react'
import { TransitionState } from './useSceneTransition'

interface SceneTransitionProps {
  state: TransitionState
  children?: React.ReactNode
}

export default function SceneTransition({ state, children }: SceneTransitionProps) {
  const { phase, config, progress } = state

  // Calculate blur transition style
  const overlayStyle = useMemo(() => {
    if (phase === 'idle') return {}

    const isExiting = phase === 'exiting' || phase === 'switching'
    const currentProgress = isExiting ? progress : 1 - progress
    const blurAmount = config.blurAmount || 30

    return {
      transition: `all ${config.duration / 2}ms ease-in-out`,
      backgroundColor: `rgba(0, 0, 0, ${currentProgress * 0.7})`,
      backdropFilter: `blur(${blurAmount * currentProgress}px)`,
      WebkitBackdropFilter: `blur(${blurAmount * currentProgress}px)`
    }
  }, [phase, config, progress])

  // Don't render when idle
  if (phase === 'idle') {
    return <>{children}</>
  }

  return (
    <>
      {children}
      
      {/* Blur transition overlay */}
      <div 
        className="scene-transition-overlay"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          pointerEvents: phase !== 'idle' ? 'all' : 'none',
          ...overlayStyle
        }}
      />

      {/* Loading indicator during scene switch */}
      {(phase === 'switching' || phase === 'entering') && (
        <LoadingIndicator />
      )}
    </>
  )
}

// Loading indicator component
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
