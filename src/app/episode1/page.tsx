'use client'

import { useState, useEffect } from 'react'
import VideoPlayer from '@/components/VideoPlayer'
import HighlightTimeline from '@/components/HighlightTimeline'
import {
  fetchHighlights,
  type EpisodeHighlights,
  formatTime,
} from '@/lib/highlights'

export default function Episode1Page() {
  const [currentTime, setCurrentTime] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [highlightsData, setHighlightsData] = useState<EpisodeHighlights | null>(null)

  // 从 API 获取高光点数据
  useEffect(() => {
    fetchHighlights('tianxia', 1).then(setHighlightsData)
  }, [])

  // 互动完成回调
  const handleScoreUpdate = (score: number, type: string) => {
    setTotalScore((prev) => prev + score)
    setCompletedCount((prev) => prev + 1)
  }

  // 跳转到指定时间
  const handleSeek = (time: number) => {
    const video = document.querySelector('video')
    if (video) {
      video.currentTime = time
      video.play()
    }
  }

  // 视频配置
  const config = {
    url: '/video/天下第一纨绔/第1集.mp4',
    interactionPoints: [],
    hitEffect: {
      shakeIntensity: 10,
      flashColor: '#ff6600',
      duration: 500,
      soundUrl: '/sounds/hit.mp3',
    },
  }

  const totalInteractions = highlightsData?.highlights.length || 6
  const maxIntensity = highlightsData
    ? Math.max(...highlightsData.highlights.map(h => h.intensity))
    : 10

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 头部信息 */}
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-center mb-2">
          {highlightsData?.dramaName || '天下第一纨绔'} - 第1集
        </h1>
        <p className="text-center text-gray-400">
          {highlightsData?.analysisMethod || '基于深度分析的高潮点互动体验'}
        </p>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-4">
        <div className="relative max-w-4xl mx-auto">
          {/* 视频播放器 */}
          <VideoPlayer
            config={config}
            onScoreUpdate={handleScoreUpdate}
            onTimeUpdate={setCurrentTime}
            highlights={highlightsData?.highlights || []}
          />
        </div>

        {/* 高光点时间轴 */}
        {highlightsData && (
          <div className="max-w-4xl mx-auto mt-4">
            <HighlightTimeline
              highlights={highlightsData.highlights}
              currentTime={currentTime}
              onSeek={handleSeek}
            />
          </div>
        )}

        {/* 统计面板 */}
        <div className="max-w-4xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 得分卡片 */}
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-2xl font-bold text-yellow-400">{totalScore}</div>
            <div className="text-gray-400">总得分</div>
          </div>

          {/* 完成度卡片 */}
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-2xl font-bold text-green-400">
              {completedCount}/{totalInteractions}
            </div>
            <div className="text-gray-400">已完成互动</div>
          </div>

          {/* 强度卡片 */}
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <div className="text-4xl mb-2">🔥</div>
            <div className="text-2xl font-bold text-red-400">
              {maxIntensity}/10
            </div>
            <div className="text-gray-400">最高强度</div>
          </div>
        </div>

        {/* 高潮点列表 */}
        {highlightsData && (
          <div className="max-w-4xl mx-auto mt-8">
            <h2 className="text-xl font-bold mb-4">🎯 {totalInteractions}大高潮点</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {highlightsData.highlights.map((point, index) => (
                <div
                  key={point.id}
                  className="bg-gray-800 rounded-xl p-4 hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-sm text-gray-400">#{index + 1}</span>
                      <h3 className="font-bold text-lg">{point.emoji} {point.label}</h3>
                    </div>
                    <span className="text-yellow-400 font-mono">{formatTime(point.startTime)}</span>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{point.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-red-400">
                      强度: {'🔥'.repeat(point.intensity - 5)}
                    </span>
                    <span className="text-green-400">+{point.interaction.reward}分</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    <div>💬 {point.metadata.keyDialogue}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="max-w-4xl mx-auto mt-8 mb-12">
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">📖 玩法说明</h2>
            <ul className="space-y-2 text-gray-300">
              <li>🎬 视频播放到高潮点时，会自动弹出互动按钮</li>
              <li>👆 快速点击按钮完成互动任务</li>
              <li>⏱️ 在限定时间内达到目标点击数</li>
              <li>🎉 完成后获得分数和特效奖励</li>
              <li>🏆 挑战全部{totalInteractions}个高潮点，获得最高分！</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
