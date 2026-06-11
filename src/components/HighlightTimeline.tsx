'use client'

import { useState } from 'react'
import { type HighlightPoint, interactionEmojis, typeLabels, formatTime } from '@/lib/highlights'

interface HighlightTimelineProps {
  highlights: HighlightPoint[]
  currentTime: number
  onSeek: (time: number) => void
}

export default function HighlightTimeline({ highlights, currentTime, onSeek }: HighlightTimelineProps) {
  const [expanded, setExpanded] = useState(false)

  if (highlights.length === 0) return null

  const getNearestHighlight = () => {
    let nearest = highlights[0]
    let minDiff = Math.abs(currentTime - nearest.startTime)
    highlights.forEach(h => {
      const diff = Math.abs(currentTime - h.startTime)
      if (diff < minDiff) { minDiff = diff; nearest = h }
    })
    return minDiff < 15 ? nearest : null
  }

  const nearest = getNearestHighlight()
  const lastTime = highlights[highlights.length - 1]?.startTime || 1

  return (
    <div className="mt-1">
      {/* 高光点进度条 */}
      <div className="relative h-6 glass rounded-lg overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 transition-all"
          style={{ width: `${(currentTime / lastTime) * 100}%`, background: 'linear-gradient(to right, rgba(249,115,22,0.2), rgba(239,68,68,0.2))' }}
        />
        {highlights.map((h, i) => {
          const position = (h.startTime / lastTime) * 100
          const isActive = nearest?.startTime === h.startTime
          return (
            <button
              key={i}
              onClick={() => onSeek(h.startTime)}
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full transition-all z-10 ${
                isActive ? 'bg-orange-400 scale-150' : h.type === 'opening' ? 'bg-green-400 hover:scale-125' : h.type === 'closing' ? 'bg-purple-400 hover:scale-125' : 'bg-yellow-400 hover:scale-125'
              }`}
              style={{ left: `${position}%` }}
              title={`${formatTime(h.startTime)} - ${h.label}`}
            />
          )
        })}
      </div>

      {/* 展开/收起按钮 */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full mt-1.5 flex items-center justify-between px-3 py-2 glass rounded-lg glass-hover transition-all duration-200"
      >
        <span className="text-gray-500 text-xs">高光点 · {highlights.length}个</span>
        <svg className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 高光点列表 */}
      {expanded && (
        <div className="mt-1.5 space-y-1 max-h-48 overflow-y-auto scrollbar-hide animate-fade-in">
          {highlights.map((h, i) => {
            const isNearest = nearest?.startTime === h.startTime
            const emoji = interactionEmojis[h.interactionType] || '·'
            const typeLabel = typeLabels[h.type] || h.type
            return (
              <button
                key={i}
                onClick={() => onSeek(h.startTime)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all duration-200 ${isNearest ? 'glass border border-orange-500' : 'glass glass-hover'}`}
                style={isNearest ? { borderColor: 'rgba(249,115,22,0.3)' } : {}}
              >
                <span className="text-orange-400 font-mono text-xs w-10 flex-shrink-0">{formatTime(h.startTime)}</span>
                <span className="text-xs px-1.5 py-0.5 rounded text-gray-500 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.04)' }}>{typeLabel}</span>
                <span className="text-gray-400 text-xs truncate">{emoji} {h.interactionType}</span>
                <span className="ml-auto text-gray-500 text-xs flex-shrink-0">+{h.interaction.reward}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* 当前高光点提示 */}
      {nearest && (
        <div className="mt-1.5 px-3 py-2 glass rounded-lg" style={{ borderColor: 'rgba(249,115,22,0.15)' }}>
          <div className="flex items-center gap-2">
            <span className="text-sm flex-shrink-0">{interactionEmojis[nearest.interactionType] || '·'}</span>
            <div className="min-w-0">
              <p className="text-xs text-white font-medium truncate">{nearest.label}</p>
              <p className="text-gray-500 truncate" style={{ fontSize: '10px' }}>
                {formatTime(nearest.startTime)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
