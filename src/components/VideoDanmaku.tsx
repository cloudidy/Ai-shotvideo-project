'use client'

import { useEffect, useRef } from 'react'

interface DanmakuItem {
  id: string
  time: number
  content: string
  likes: number
  color?: string
}

interface VideoDanmakuProps {
  danmakus: DanmakuItem[]
  currentTime: number
  isPlaying?: boolean
  visible?: boolean
}

const MAX_VISIBLE = 6
const WINDOW = 1.5
const FLY_DURATION = 10 // 秒
const TRACK_COUNT = 7

export default function VideoDanmaku({
  danmakus,
  currentTime,
  isPlaying = true,
  visible = true,
}: VideoDanmakuProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const shownRef = useRef<Set<string>>(new Set())
  const lastTimeRef = useRef(-1)
  const activeRef = useRef<Map<string, { el: HTMLSpanElement; bornAt: number; track: number }>>(new Map())
  const rafRef = useRef<number>(0)

  // 动画循环：直接移动 DOM 元素
  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(rafRef.current)
      return
    }

    const loop = () => {
      const now = performance.now()
      const active = activeRef.current

      active.forEach((item, id) => {
        const elapsed = (now - item.bornAt) / 1000
        if (elapsed >= FLY_DURATION) {
          // 飞完了，移除 DOM
          item.el.remove()
          active.delete(id)
          return
        }
        // 从 100% → -100%
        const progress = elapsed / FLY_DURATION
        const x = 100 - progress * 200
        item.el.style.left = `${x}%`
      })

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isPlaying])

  // 按时间匹配新弹幕，创建 DOM 元素
  useEffect(() => {
    if (!visible || !containerRef.current || danmakus.length === 0) return

    const rounded = Math.floor(currentTime * 2) / 2
    if (rounded === lastTimeRef.current) return
    lastTimeRef.current = rounded

    if (shownRef.current.size > 800) shownRef.current.clear()

    const candidates = danmakus.filter(
      (d) =>
        d.time >= currentTime - WINDOW &&
        d.time <= currentTime + WINDOW &&
        !shownRef.current.has(d.id)
    )
    if (candidates.length === 0) return

    const picked = candidates.sort((a, b) => b.likes - a.likes).slice(0, MAX_VISIBLE)
    const now = performance.now()

    // 统计每条轨道上、还在屏幕内的弹幕数量
    const trackCount = new Array(TRACK_COUNT).fill(0)
    activeRef.current.forEach((item) => {
      const elapsed = (now - item.bornAt) / 1000
      if (elapsed < FLY_DURATION) {
        trackCount[item.track]++
      }
    })

    picked.forEach((d) => {
      shownRef.current.add(d.id)

      // 找弹幕最少的轨道（负载均衡）
      let track = 0
      let minCount = Infinity
      for (let t = 0; t < TRACK_COUNT; t++) {
        if (trackCount[t] < minCount) {
          minCount = trackCount[t]
          track = t
        }
      }
      trackCount[track]++ // 标记该轨道已被占用

      // 创建 DOM 元素
      const el = document.createElement('span')
      el.textContent = d.content
      el.style.cssText = `
        position: absolute;
        white-space: nowrap;
        font-size: 18px;
        font-weight: bold;
        color: ${d.color || '#fff'};
        text-shadow: 1px 1px 2px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.6);
        top: ${6 + track * 12}%;
        left: 100%;
        pointer-events: none;
        will-change: left;
      `
      containerRef.current!.appendChild(el)
      activeRef.current.set(d.id, { el, bornAt: now, track })
    })
  }, [currentTime, danmakus, visible])

  // 清理：组件卸载时清空所有弹幕 DOM
  useEffect(() => {
    return () => {
      activeRef.current.forEach((item) => item.el.remove())
      activeRef.current.clear()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none z-10"
    />
  )
}
