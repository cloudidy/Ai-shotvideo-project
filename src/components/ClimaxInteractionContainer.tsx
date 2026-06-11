'use client'

import { useState, useCallback } from 'react'
import ClimaxInteractionButton from './ClimaxInteractionButton'
import {
  episode1Interactions,
  EpisodeInteractionPoint,
  getInteractionStats,
} from '@/config/episode1-interactions'

interface ClimaxInteractionContainerProps {
  currentTime: number
  onInteractionComplete?: (point: EpisodeInteractionPoint, score: number) => void
}

export default function ClimaxInteractionContainer({
  currentTime,
  onInteractionComplete,
}: ClimaxInteractionContainerProps) {
  const [completedInteractions, setCompletedInteractions] = useState<Set<string>>(new Set())
  const [totalScore, setTotalScore] = useState(0)

  // 处理互动完成
  const handleComplete = useCallback(
    (point: EpisodeInteractionPoint) => {
      setCompletedInteractions((prev) => new Set(prev).add(point.id))
      setTotalScore((prev) => prev + point.reward.score)

      // 调用回调
      onInteractionComplete?.(point, point.reward.score)

      console.log(`✅ 完成互动: ${point.title} (+${point.reward.score}分)`)
    },
    [onInteractionComplete]
  )

  // 处理超时
  const handleTimeout = useCallback((point: EpisodeInteractionPoint) => {
    console.log(`⏰ 互动超时: ${point.title}`)
  }, [])

  // 获取统计信息
  const stats = getInteractionStats()

  return (
    <div className="relative">
      {/* 互动统计面板 */}
      <div className="fixed top-4 right-4 z-40 bg-black/70 backdrop-blur-sm rounded-xl p-4 text-white">
        <h3 className="text-sm font-bold mb-2 text-yellow-400">🎯 高潮互动</h3>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>已完成:</span>
            <span className="text-green-400">
              {completedInteractions.size}/{stats.total}
            </span>
          </div>
          <div className="flex justify-between">
            <span>总得分:</span>
            <span className="text-yellow-400">{totalScore}</span>
          </div>
          <div className="flex justify-between">
            <span>最高强度:</span>
            <span className="text-red-400">{stats.maxIntensity}/10</span>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mt-3">
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-yellow-500 rounded-full transition-all duration-500"
              style={{ width: `${(completedInteractions.size / stats.total) * 100}%` }}
            />
          </div>
          <div className="text-center mt-1 text-[10px] text-gray-400">
            {Math.round((completedInteractions.size / stats.total) * 100)}%
          </div>
        </div>
      </div>

      {/* 互动点列表 */}
      {episode1Interactions.map((point) => (
        <ClimaxInteractionButton
          key={point.id}
          point={point}
          currentTime={currentTime}
          onComplete={handleComplete}
          onTimeout={handleTimeout}
        />
      ))}

      {/* 高潮点提示 */}
      <div className="fixed bottom-4 left-4 z-40">
        <div className="bg-black/70 backdrop-blur-sm rounded-xl p-3 text-white">
          <div className="text-xs text-gray-400 mb-2">即将到来的高潮点:</div>
          {episode1Interactions
            .filter((p) => p.time > currentTime && !completedInteractions.has(p.id))
            .slice(0, 3)
            .map((point) => (
              <div
                key={point.id}
                className="flex items-center gap-2 text-xs mb-1"
              >
                <span className="text-yellow-400">{point.timeStr}</span>
                <span className="text-white">{point.type}</span>
                <span className="text-red-400">{'🔥'.repeat(Math.min(point.intensity - 5, 5))}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
