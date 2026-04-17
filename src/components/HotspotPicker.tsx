'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useField, useFormFields } from '@payloadcms/ui'

declare global {
  interface Window {
    pannellum: any
  }
}

type Props = {
  path: string
  [key: string]: any
}

export default function HotspotPicker({ path }: Props) {
  // "hotspots.0.visualPicker" → "hotspots.0"
  const basePath = path.replace(/\.visualPicker$/, '')

  const { value: pitch, setValue: setPitch } = useField<number>({ path: `${basePath}.pitch` })
  const { value: yaw, setValue: setYaw } = useField<number>({ path: `${basePath}.yaw` })

  const panoramaFieldValue = useFormFields(([fields]) => fields['panorama']?.value as any)

  const [isOpen, setIsOpen] = useState(false)
  const [panoramaUrl, setPanoramaUrl] = useState<string | null>(null)

  const viewerRef = useRef<HTMLDivElement>(null)
  const pannellumRef = useRef<any>(null)
  const hasMarkerRef = useRef(false)
  const overlayRef = useRef<HTMLDivElement>(null)       // 拖拽时显示的自定义 overlay marker
  const suppressNextClickRef = useRef(false)            // 拖拽结束后阻止 click 再次触发放置
  const skipNextEffectRef = useRef(false)               // 阻止 useEffect 重复调用 placeMarker
  const statusSpanRef = useRef<HTMLSpanElement>(null)   // 直接写 DOM，避免拖拽中 setState

  // 解析 panorama URL（可能是带 url 的对象，也可能只是 ID）
  useEffect(() => {
    if (!panoramaFieldValue) { setPanoramaUrl(null); return }
    if (typeof panoramaFieldValue === 'object' && panoramaFieldValue?.url) {
      setPanoramaUrl(panoramaFieldValue.url); return
    }
    const id = typeof panoramaFieldValue === 'object' ? panoramaFieldValue?.id : panoramaFieldValue
    if (id) {
      fetch(`/api/media/${id}`)
        .then(r => r.json())
        .then(doc => { if (doc?.url) setPanoramaUrl(doc.url) })
        .catch(() => {})
    }
  }, [panoramaFieldValue])

  // 放置或更新 Pannellum hotspot（不可拖拽，只做视觉定位用）
  const placeMarker = useCallback((p: number, y: number, afterPlace?: () => void) => {
    const viewer = pannellumRef.current
    if (!viewer) return
    if (hasMarkerRef.current) {
      try { viewer.removeHotSpot('picker-marker') } catch {}
    }
    try {
      viewer.addHotSpot({
        id: 'picker-marker',
        pitch: p,
        yaw: y,
        type: 'info',
        text: `${p.toFixed(1)}° / ${y.toFixed(1)}°`,
        cssClass: 'hs-picker-marker',
      })
      hasMarkerRef.current = true
      if (afterPlace) setTimeout(afterPlace, 60)
    } catch {}
  }, [])

  // 给 Pannellum hotspot DOM 元素绑定拖拽逻辑
  // 关键：拖拽时不移动 Pannellum hotspot（Pannellum 会强制复位），而是显示 overlay div
  const setupMarkerDrag = useCallback((markerEl: Element) => {
    const viewer = pannellumRef.current
    if (!viewer || !markerEl) return

    // 阻止点击 marker 本身时冒泡到 viewer 的 click handler（否则会重新放置）
    markerEl.addEventListener('click', e => e.stopPropagation())

    markerEl.addEventListener('mousedown', (e: Event) => {
      const me = e as MouseEvent
      me.stopPropagation() // 防止 Pannellum 接收到 mousedown 并开始拖转视角
      me.preventDefault()

      const viewerEl = viewerRef.current
      if (!viewerEl) return
      const viewerRect = viewerEl.getBoundingClientRect()

      // 计算 Pannellum marker 的当前屏幕位置，作为 overlay 的起始位置
      const markerRect = (markerEl as HTMLElement).getBoundingClientRect()
      const startX = markerRect.left - viewerRect.left + markerRect.width / 2
      const startY = markerRect.top - viewerRect.top + markerRect.height / 2

      // 显示 overlay，隐藏 Pannellum hotspot
      if (overlayRef.current) {
        overlayRef.current.style.left = `${startX}px`
        overlayRef.current.style.top = `${startY}px`
        overlayRef.current.style.display = 'block'
      }
      ;(markerEl as HTMLElement).style.opacity = '0'

      // 持续记录 onMove 里最后一次有效坐标
      // 避免在 onUp 里直接用 document mouseup event 算坐标（可能受页面滚动/嵌套影响不准）
      let lastCoords: [number, number] | null = null

      const onMove = (moveEvent: MouseEvent) => {
        // 直接更新 overlay 位置——完全绕开 Pannellum 渲染
        if (overlayRef.current) {
          // 用实时 getBoundingClientRect 而不是 mousedown 时的快照，兼容页面滚动
          const currentRect = viewerEl.getBoundingClientRect()
          overlayRef.current.style.left = `${moveEvent.clientX - currentRect.left}px`
          overlayRef.current.style.top = `${moveEvent.clientY - currentRect.top}px`
        }
        // 实时换算坐标并缓存，直接写 DOM 避免 setState 重渲染
        const coords = viewer.mouseEventToCoords(moveEvent)
        if (coords && !isNaN(coords[0]) && !isNaN(coords[1])) {
          lastCoords = [coords[0], coords[1]]
          if (statusSpanRef.current) {
            statusSpanRef.current.textContent =
              `拖拽中 → Pitch: ${coords[0].toFixed(1)}°  Yaw: ${coords[1].toFixed(1)}°`
          }
        }
      }

      const onUp = () => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)

        // 隐藏 overlay；注意：不在这里恢复 markerEl.opacity，
        // 留到 placeMarker afterPlace 里做，确保新位置渲染完再显示
        if (overlayRef.current) overlayRef.current.style.display = 'none'
        if (statusSpanRef.current) statusSpanRef.current.textContent = ''

        // 优先用 onMove 过程中缓存的最后坐标（更可靠）
        if (!lastCoords) {
          // 没有拖动过，直接恢复 marker 可见性退出
          ;(markerEl as HTMLElement).style.opacity = '1'
          return
        }
        const newPitch = Math.round(lastCoords[0] * 100) / 100
        const newYaw = Math.round(lastCoords[1] * 100) / 100

        // mouseup 之后浏览器会触发 click，提前设 flag 阻止 click handler 误触发放置逻辑
        suppressNextClickRef.current = true
        // 阻止 useEffect([pitch, yaw]) 在 setPitch/setYaw 后重复调用 placeMarker
        skipNextEffectRef.current = true
        setPitch(newPitch)
        setYaw(newYaw)

        // 将 Pannellum hotspot 移到新位置；afterPlace 里再恢复 marker 可见性
        placeMarker(newPitch, newYaw, () => {
          const el = viewerRef.current?.querySelector('.hs-picker-marker')
          if (el) {
            // 新 DOM 元素已经在正确位置，现在才让它可见
            ;(el as HTMLElement).style.opacity = '1'
            setupMarkerDrag(el)
          }
        })
      }

      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    })
  }, [setPitch, setYaw, placeMarker])

  // 初始化 Pannellum
  useEffect(() => {
    if (!isOpen || !viewerRef.current || !panoramaUrl) return

    const init = async () => {
      await import('pannellum/build/pannellum.css')
      await import('pannellum/build/pannellum.js')
      if (!window.pannellum || !viewerRef.current) return

      const initP = pitch !== undefined ? Number(pitch) : 0
      const initY = yaw !== undefined ? Number(yaw) : 0
      const hasCoords = pitch !== undefined && yaw !== undefined

      const viewer = window.pannellum.viewer(viewerRef.current, {
        type: 'equirectangular',
        panorama: panoramaUrl,
        autoLoad: true,
        showControls: false,
        hotSpots: hasCoords ? [{
          id: 'picker-marker',
          pitch: initP,
          yaw: initY,
          type: 'info',
          text: `${initP.toFixed(1)}° / ${initY.toFixed(1)}°`,
          cssClass: 'hs-picker-marker',
        }] : [],
      })

      pannellumRef.current = viewer
      hasMarkerRef.current = hasCoords

      if (hasCoords) {
        setTimeout(() => {
          const el = viewerRef.current?.querySelector('.hs-picker-marker')
          if (el) setupMarkerDrag(el)
        }, 600)
      }

      // 点击全景图放置 hotspot
      viewerRef.current.addEventListener('click', (e: MouseEvent) => {
        // 如果是拖拽结束后触发的 click，跳过
        if (suppressNextClickRef.current) {
          suppressNextClickRef.current = false
          return
        }
        const coords = viewer.mouseEventToCoords(e)
        if (!coords) return
        const newPitch = Math.round(coords[0] * 100) / 100
        const newYaw = Math.round(coords[1] * 100) / 100
        skipNextEffectRef.current = true
        setPitch(newPitch)
        setYaw(newYaw)
        placeMarker(newPitch, newYaw, () => {
          const el = viewerRef.current?.querySelector('.hs-picker-marker')
          if (el) setupMarkerDrag(el)
        })
      })
    }

    init()

    return () => {
      if (pannellumRef.current) {
        pannellumRef.current.destroy()
        pannellumRef.current = null
        hasMarkerRef.current = false
      }
    }
  }, [isOpen, panoramaUrl]) // eslint-disable-line react-hooks/exhaustive-deps

  // 用户手动修改数字输入框时同步 marker 位置
  useEffect(() => {
    if (skipNextEffectRef.current) {
      skipNextEffectRef.current = false
      return
    }
    if (!pannellumRef.current || pitch === undefined || yaw === undefined) return
    placeMarker(Number(pitch), Number(yaw), () => {
      const el = viewerRef.current?.querySelector('.hs-picker-marker')
      if (el) setupMarkerDrag(el)
    })
  }, [pitch, yaw]) // eslint-disable-line react-hooks/exhaustive-deps

  const pitchDisplay = pitch !== undefined ? Number(pitch).toFixed(1) : '—'
  const yawDisplay = yaw !== undefined ? Number(yaw).toFixed(1) : '—'

  return (
    <div style={{ margin: '8px 0' }}>
      <style>{`
        .hs-picker-marker {
          width: 22px !important;
          height: 22px !important;
          background: radial-gradient(circle at 35% 35%, #ff8080, #cc0000) !important;
          border: 3px solid #fff !important;
          border-radius: 50% !important;
          box-shadow: 0 0 0 2px #ff4444, 0 2px 8px rgba(0,0,0,0.5) !important;
          cursor: grab !important;
          transform: translate(-50%, -50%) !important;
        }
        .hs-picker-marker:active { cursor: grabbing !important; }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setIsOpen(v => !v)}
          style={{
            padding: '5px 14px',
            background: isOpen ? '#444' : '#1a6ef5',
            color: '#fff', border: 'none', borderRadius: 4,
            cursor: 'pointer', fontSize: 13, fontWeight: 500,
          }}
        >
          {isOpen ? '▲ 关闭放置工具' : '◎ 打开可视化放置工具'}
        </button>
        {/* 拖拽时直接写 DOM，不走 React state */}
        <span ref={statusSpanRef} style={{ fontSize: 12, color: '#f90', fontWeight: 600 }} />
        <span style={{ fontSize: 12, color: '#999' }}>
          Pitch: <strong>{pitchDisplay}°</strong> · Yaw: <strong>{yawDisplay}°</strong>
        </span>
      </div>

      {isOpen && (
        <div style={{ marginTop: 8, border: '1px solid #333', borderRadius: 6, overflow: 'hidden' }}>
          {!panoramaUrl ? (
            <div style={{ padding: 16, background: '#1a1a1a', color: '#888', fontSize: 13 }}>
              ⚠ 请先在上方的 <strong>Panorama</strong> 字段上传全景图，再打开此工具。
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', top: 8, left: 8, zIndex: 10,
                background: 'rgba(0,0,0,0.65)', color: '#fff',
                padding: '4px 10px', borderRadius: 4, fontSize: 12,
                pointerEvents: 'none', userSelect: 'none',
              }}>
                点击放置 · 拖动红色标记调整位置 · 拖拽视角可旋转全景
              </div>

              <div ref={viewerRef} style={{ width: '100%', height: 380 }} />

              {/* 拖拽专用 overlay marker，完全独立于 Pannellum 渲染 */}
              <div
                ref={overlayRef}
                style={{
                  display: 'none',
                  position: 'absolute',
                  width: 22,
                  height: 22,
                  background: 'radial-gradient(circle at 35% 35%, #ff8080, #cc0000)',
                  border: '3px solid #fff',
                  borderRadius: '50%',
                  boxShadow: '0 0 0 2px #ff4444, 0 2px 8px rgba(0,0,0,0.5)',
                  transform: 'translate(-50%, -50%)',
                  cursor: 'grabbing',
                  pointerEvents: 'none',
                  zIndex: 100,
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
