'use client'

import { useState, useRef, useEffect } from 'react'
import VideoPlayer from '@/components/VideoPlayer'
import GameHUD from '@/components/GameHUD'
import AchievementPanel from '@/components/AchievementPanel'
import AchievementToast from '@/components/AchievementToast'
import HighlightTimeline from '@/components/HighlightTimeline'
import { useGameStore } from '@/store/gameStore'
import {
  fetchHighlights,
  type EpisodeHighlights,
  type HighlightPoint,
} from '@/lib/highlights'

// 腾讯云COS视频基础URL（桶已配置公开读+跨域，可直接访问）
const COS_BASE = 'https://ai-video-demo-1442345125.cos.ap-guangzhou.myqcloud.com'
const COS_DIR = '短剧视频/天下第一纨绔'

// 短剧数据配置（直接访问腾讯云COS视频，无需代理）
const dramaList = [
  {
    id: 'tianxia',
    name: '天下第一纨绔',
    emoji: '👑',
    episodes: [
      { id: 1, name: '第1集', path: `${COS_BASE}/${COS_DIR}/第1集.mp4` },
      { id: 2, name: '第2集', path: `${COS_BASE}/${COS_DIR}/第2集.mp4` },
      { id: 3, name: '第3集', path: `${COS_BASE}/${COS_DIR}/第3集.mp4` },
      { id: 4, name: '第4集', path: `${COS_BASE}/${COS_DIR}/第4集.mp4` },
      { id: 5, name: '第5集', path: `${COS_BASE}/${COS_DIR}/第5集.mp4` },
    ],
  },
  // 后续上传更多视频后可添加其他剧集
  // {
  //   id: 'naisui',
  //   name: '十八岁太奶奶驾到',
  //   emoji: '👵',
  //   episodes: [...],
  // },
]

export default function Home() {
  const { addScore, incrementInteraction, incrementCombo } = useGameStore()
  const [selectedDrama, setSelectedDrama] = useState(dramaList[0])
  const [selectedVideo, setSelectedVideo] = useState(dramaList[0].episodes[0])
  const [showEpisodes, setShowEpisodes] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [highlightsData, setHighlightsData] = useState<EpisodeHighlights | null>(null)
  const [highlightsLoading, setHighlightsLoading] = useState(false)
  const videoPlayerRef = useRef<any>(null)

  // 当剧集或集数变化时，从 API 获取高光点数据
  useEffect(() => {
    let cancelled = false
    const loadData = async () => {
      setHighlightsLoading(true)
      setHighlightsData(null)

      const highlights = await fetchHighlights(selectedDrama.id, selectedVideo.id)

      if (!cancelled) {
        setHighlightsData(highlights)
        setHighlightsLoading(false)
      }
    }
    loadData()
    return () => { cancelled = true }
  }, [selectedDrama.id, selectedVideo.id])

  // 切换短剧时重置选集并关闭集数面板
  const handleDramaChange = (drama: typeof dramaList[0]) => {
    setSelectedDrama(drama)
    setSelectedVideo(drama.episodes[0])
    setShowEpisodes(false)
  }

  const handleScoreUpdate = (score: number, type: string) => {
    addScore(score)
    incrementInteraction(type)
    incrementCombo()
  }

  // 切换到下一集
  const handleNextEpisode = () => {
    const currentIndex = selectedDrama.episodes.findIndex(ep => ep.id === selectedVideo.id)
    if (currentIndex < selectedDrama.episodes.length - 1) {
      const nextEpisode = selectedDrama.episodes[currentIndex + 1]
      setSelectedVideo(nextEpisode)
    }
  }

  // 切换到上一集
  const handlePrevEpisode = () => {
    const currentIndex = selectedDrama.episodes.findIndex(ep => ep.id === selectedVideo.id)
    if (currentIndex > 0) {
      const prevEpisode = selectedDrama.episodes[currentIndex - 1]
      setSelectedVideo(prevEpisode)
    }
  }

  // 从 API 获取的高光点数据（用于 HighlightTimeline）
  const currentHighlights: HighlightPoint[] = highlightsData?.highlights || []

  // 跳转到指定时间
  const handleSeek = (time: number) => {
    const video = document.querySelector('video')
    if (video) {
      video.currentTime = time
      video.play()
    }
  }

  // 配置只需要URL，互动点会根据视频时长自动生成
  const currentConfig = {
    url: selectedVideo.path,
    interactionPoints: [],
    hitEffect: {
      shakeIntensity: 10,
      flashColor: '#ff6600',
      duration: 500,
      soundUrl: '/sounds/hit.mp3',
    },
  }

  return (
    <main className="min-h-screen bg-black flex flex-col items-center">
      <GameHUD />
      <AchievementPanel />
      <AchievementToast />

      {/* 手机竖屏布局 */}
      <div className="w-full max-w-md mx-auto flex flex-col min-h-screen">

        {/* 顶部标题栏 */}
        <div className="text-center py-3 sticky top-0 z-40" style={{ background: 'linear-gradient(to bottom, #08080c, transparent)' }}>
          <h1 className="text-xl font-bold gradient-text">
            剧智互动
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">边看边互动，爽感不停歇</p>
        </div>

        {/* 短剧切换 */}
        <div className="px-4 py-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {dramaList.map((drama) => (
              <button
                key={drama.id}
                onClick={() => handleDramaChange(drama)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  selectedDrama.id === drama.id
                    ? 'text-white border border-orange-500'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
                style={selectedDrama.id === drama.id ? { background: 'rgba(249, 115, 22, 0.15)' } : {}}
              >
                {drama.emoji} {drama.name}
              </button>
            ))}
          </div>
        </div>

        {/* 当前集数 + 展开按钮 */}
        <div className="px-4 mb-1">
          <button
            onClick={() => setShowEpisodes(!showEpisodes)}
            className="w-full flex items-center justify-between px-4 py-2.5 glass rounded-xl transition-all duration-200 glass-hover"
          >
            <span className="text-white text-sm">
              {selectedDrama.name} · {selectedVideo.name}
            </span>
            <svg
              className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${showEpisodes ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* 集数网格（可收起） */}
        {showEpisodes && (
          <div className="px-4 mb-2 relative z-30 animate-fade-in">
            <div className="flex flex-wrap gap-2 p-3 glass rounded-xl">
              {selectedDrama.episodes.map((video) => (
                <button
                  key={video.id}
                  onClick={() => {
                    setSelectedVideo(video)
                    setShowEpisodes(false)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all duration-200 ${
                    selectedVideo.id === video.id
                      ? 'text-white font-medium border border-orange-500'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                  style={selectedVideo.id === video.id ? { background: 'rgba(249, 115, 22, 0.15)' } : {}}
                >
                  {video.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 视频播放器 */}
        <div className="flex-1 px-3 min-h-0">
          <VideoPlayer
            config={currentConfig}
            onScoreUpdate={handleScoreUpdate}
            onTimeUpdate={setCurrentTime}
            onEnded={handleNextEpisode}
            dramaId={selectedDrama.id}
            episodeName={selectedVideo.name}
            highlights={highlightsData?.highlights}
          />
        </div>

        {/* 上一集/下一集按钮 */}
        <div className="px-4 py-2 flex gap-3">
          <button
            onClick={handlePrevEpisode}
            disabled={selectedVideo.id === 1}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
              selectedVideo.id === 1
                ? 'text-gray-700 cursor-not-allowed'
                : 'glass glass-hover text-gray-300'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            上一集
          </button>
          <button
            onClick={handleNextEpisode}
            disabled={selectedVideo.id === selectedDrama.episodes.length}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
              selectedVideo.id === selectedDrama.episodes.length
                ? 'text-gray-700 cursor-not-allowed'
                : 'text-white border border-orange-500 hover:bg-orange-500 hover:bg-opacity-20'
            }`}
            style={selectedVideo.id !== selectedDrama.episodes.length ? { background: 'rgba(249, 115, 22, 0.1)' } : {}}
          >
            下一集
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 高光点时间轴 */}
        {currentHighlights.length > 0 && (
          <div className="px-4 py-1">
            <HighlightTimeline
              highlights={currentHighlights}
              currentTime={currentTime}
              onSeek={handleSeek}
            />
          </div>
        )}

        {/* 底部互动类型 */}
        <div className="px-4 py-3 mt-auto">
          <div className="flex justify-center gap-4">
            {[
              { emoji: '👊', label: '打脸' },
              { emoji: '⬆️', label: '升级' },
              { emoji: '🔥', label: '复仇' },
              { emoji: '💕', label: '撒糖' },
              { emoji: '⚖️', label: '审判' },
              { emoji: '💻', label: '系统' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-0.5">
                <span className="text-sm">{item.emoji}</span>
                <span className="text-gray-500 text-xs">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
