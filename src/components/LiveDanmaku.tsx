'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import type { DanmakuItem } from '@/lib/danmaku'

// 弹幕轨道配置
const TRACK_COUNT = 8
const TRACK_HEIGHT = 28

interface DisplayDanmaku {
  id: string
  text: string
  track: number
  duration: number
  fontSize: number
  color: string
  createdAt: number
}

interface LiveDanmakuProps {
  danmakus: DanmakuItem[]
  currentTime: number
  isPlaying: boolean
  batchSize?: number
  interval?: number
}

const baseColors = ['#ffffff', '#ffffff', '#ffffff', '#ff6600', '#ffcc00', '#00ccff', '#ff69b4', '#66ff66']

function pickColor(likes: number): string {
  if (likes >= 10) return '#ffcc00'
  if (likes >= 5) return '#ff69b4'
  if (likes >= 2) return '#00ccff'
  return baseColors[Math.floor(Math.random() * baseColors.length)]
}

function pickFontSize(likes: number): number {
  if (likes >= 10) return 18
  if (likes >= 5) return 16
  return 14
}

export default function LiveDanmaku({
  danmakus,
  currentTime,
  isPlaying,
  batchSize = 4,
  interval = 1000,
}: LiveDanmakuProps) {
  const [displayed, setDisplayed] = useState<DisplayDanmaku[]>([])
  const trackOccupiedRef = useRef<Map<number, number>>(new Map())
  const idCounterRef = useRef(0)
  const lastPushTimeRef = useRef(0)
  const indexRef = useRef(0)

  const sortedDanmakus = useMemo(() => {
    return [...danmakus].sort((a, b) => a.time - b.time)
  }, [danmakus])

  // 获取当前时间附近的弹幕
  const nearbyDanmakus = useMemo(() => {
    if (sortedDanmakus.length === 0) return []
    const start = Math.max(0, currentTime - 1)
    const end = currentTime + 3
    return sortedDanmakus.filter(d => d.time >= start && d.time < end)
  }, [sortedDanmakus, currentTime])

  useEffect(() => {
    if (!isPlaying || sortedDanmakus.length === 0) return

    const timer = setInterval(() => {
      const now = Date.now()

      // 清理过期弹幕（超过 duration 秒）
      setDisplayed(prev => prev.filter(d => now - d.createdAt < d.duration * 1000 + 500))

      // 清理过期轨道
      const tracks = trackOccupiedRef.current
      for (const [t, end] of tracks) {
        if (now > end) tracks.delete(t)
      }

      // 控制推送节奏
      if (now - lastPushTimeRef.current < interval) return
      lastPushTimeRef.current = now

      const candidates = nearbyDanmakus.length > 0
        ? nearbyDanmakus
        : sortedDanmakus

      if (candidates.length === 0) return

      const newItems: DisplayDanmaku[] = []

      for (let i = 0; i < batchSize; i++) {
        const item = candidates[(indexRef.current + i) % candidates.length]
        if (!item) continue

        // 找空闲轨道
        let track = -1
        for (let t = 0; t < TRACK_COUNT; t++) {
          if (!tracks.has(t)) { track = t; break }
        }
        if (track === -1) track = Math.floor(Math.random() * TRACK_COUNT)

        const duration = 6 + Math.random() * 3

        tracks.set(track, now + duration * 1000 * 0.5)

        idCounterRef.current++
        newItems.push({
          id: `dm-${idCounterRef.current}-${now}`,
          text: item.content,
          track,
          duration,
          fontSize: pickFontSize(item.likes),
          color: pickColor(item.likes),
          createdAt: now,
        })
      }

      indexRef.current += batchSize

      if (newItems.length > 0) {
        setDisplayed(prev => [...prev, ...newItems])
      }
    }, 200)

    return () => clearInterval(timer)
  }, [isPlaying, sortedDanmakus, nearbyDanmakus, batchSize, interval])

  useEffect(() => {
    if (!isPlaying) {
      setDisplayed([])
      trackOccupiedRef.current.clear()
    }
  }, [isPlaying])

  if (!isPlaying || displayed.length === 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 15,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {displayed.map((d) => (
        <DanmakuLine key={d.id} item={d} />
      ))}
    </div>
  )
}

// 单条弹幕 — 用 requestAnimationFrame 驱动，避免 CSS 动画冲突
function DanmakuLine({ item }: { item: DisplayDanmaku }) {
  const ref = useRef<HTMLDivElement>(null)
  const startTimeRef = useRef(Date.now())

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let rafId: number
    const startTime = startTimeRef.current
    const containerWidth = el.parentElement?.clientWidth || 400

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000
      const progress = elapsed / item.duration

      if (progress >= 1) {
        el.style.display = 'none'
        return
      }

      // 从右侧外 → 左侧外
      const x = containerWidth - progress * (containerWidth + el.offsetWidth)
      el.style.transform = `translateX(${x}px)`

      // 淡入淡出
      let opacity = 1
      if (progress < 0.05) opacity = progress / 0.05
      else if (progress > 0.85) opacity = (1 - progress) / 0.15
      el.style.opacity = String(opacity)

      rafId = requestAnimationFrame(animate)
    }

    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
  }, [item.duration])

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: `${item.track * TRACK_HEIGHT + 8}px`,
        left: 0,
        whiteSpace: 'nowrap',
        fontWeight: 'bold',
        fontSize: `${item.fontSize}px`,
        color: item.color,
        textShadow: '1px 1px 2px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.5)',
        willChange: 'transform',
        pointerEvents: 'none',
      }}
    >
      {item.text}
    </div>
  )
}
