'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import type { DanmakuItem } from '@/lib/danmaku'

const danmakuColors = ['#ff6600', '#ff0000', '#ffcc00', '#00ff00', '#00ffff', '#ff00ff', '#ffffff']

interface DanmakuDisplay {
  id: number
  text: string
  x: number
  y: number
  speed: number
  color: string
  fontSize: number
}

interface DanmakuStormProps {
  /** 真实弹幕数据 */
  danmakus?: DanmakuItem[]
  /** 当前播放时间（秒） */
  currentTime?: number
  /** 是否可见 */
  isVisible?: boolean
  /** 弹幕数量上限 */
  maxCount?: number
  /** 显示中心爆炸文字 */
  showExplosion?: boolean
  /** 积分弹出 */
  scorePopup?: number
  /** 高潮点相关的弹幕文本（优先使用） */
  highlightTexts?: string[]
}

export default function DanmakuStorm({
  danmakus = [],
  currentTime = 0,
  isVisible = true,
  maxCount = 30,
  showExplosion = true,
  scorePopup,
  highlightTexts,
}: DanmakuStormProps) {
  const [displayDanmakus, setDisplayDanmakus] = useState<DanmakuDisplay[]>([])

  useEffect(() => {
    if (!isVisible) {
      setDisplayDanmakus([])
      return
    }

    // 构建弹幕文本池：优先用高潮点相关文本
    let textPool: string[] = []

    if (highlightTexts && highlightTexts.length > 0) {
      textPool = highlightTexts
    } else if (danmakus.length > 0) {
      // 从真实弹幕中取当前时间附近的
      const windowStart = Math.max(0, currentTime - 3)
      const windowEnd = currentTime + 3
      const nearby = danmakus.filter(d => d.time >= windowStart && d.time < windowEnd)
      textPool = nearby.length > 0 ? nearby.map(d => d.content) : danmakus.slice(0, 30).map(d => d.content)
    }

    if (textPool.length === 0) {
      textPool = ['爽！', '打得好！', '牛逼！', '666', '绝了！', '干得漂亮！']
    }

    const count = Math.min(maxCount, textPool.length)
    const items: DanmakuDisplay[] = []

    for (let i = 0; i < count; i++) {
      items.push({
        id: i,
        text: textPool[i % textPool.length],
        x: 100 + Math.random() * 20,
        y: 5 + Math.random() * 85,
        speed: 2 + Math.random() * 3,
        color: danmakuColors[Math.floor(Math.random() * danmakuColors.length)],
        fontSize: 16 + Math.floor(Math.random() * 10),
      })
    }

    setDisplayDanmakus(items)
  }, [isVisible, highlightTexts, danmakus, currentTime, maxCount])

  if (!isVisible) return null

  return (
    <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
      {/* 弹幕 */}
      {displayDanmakus.map((danmaku) => (
        <motion.div
          key={danmaku.id}
          initial={{ x: `${danmaku.x}%`, opacity: 0 }}
          animate={{
            x: '-100%',
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: danmaku.speed,
            delay: danmaku.id * 0.05,
            ease: 'linear',
          }}
          className="absolute"
          style={{
            top: `${danmaku.y}%`,
            color: danmaku.color,
            fontSize: `${danmaku.fontSize}px`,
            whiteSpace: 'nowrap',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            pointerEvents: 'none',
          }}
        >
          {danmaku.text}
        </motion.div>
      ))}

      {/* 中心爆炸文字 */}
      {showExplosion && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
          transition={{ duration: 1, delay: 0.3 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="text-6xl font-black text-yellow-400 drop-shadow-lg">
            🔥 爽感爆发 🔥
          </div>
        </motion.div>
      )}

      {/* 积分弹出 */}
      {scorePopup !== undefined && (
        <motion.div
          initial={{ y: '50%', opacity: 0, scale: 0.5 }}
          animate={{ y: '20%', opacity: [0, 1, 0], scale: [0.5, 1.2, 1] }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="text-4xl font-bold text-yellow-300">
            +{scorePopup} ⭐
          </div>
        </motion.div>
      )}
    </div>
  )
}
