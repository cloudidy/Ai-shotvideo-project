'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VideoConfig, InteractionPoint } from '@/types'
import { interactionEffects, generateInteractionPoints, generateInteractionPointsFromHighlights } from '@/config/interactions'
import AncientStyleButton from './AncientStyleButtons'
import SuperDanmakuButton from './SuperDanmakuButton'

// API类型 → 按钮类型映射
const typeToButton: Record<string, string> = {
  'emperor-rage': 'revenge',
  'challenge-accept': 'upgrade',
  'protagonist-reverse': 'hit-face',
  'liuyanru-entrance': 'sweet',
  'gold-ingot-hunt': 'system',
  'super-danmaku-liuyanru': 'super-danmaku-liuyanru',
  'hit-face': 'hit-face',
  'upgrade': 'upgrade',
  'revenge': 'revenge',
  'sweet': 'sweet',
  'justice': 'justice',
  'system': 'system',
}

// 从 API 高光点数据生成互动点
function interactionPointsFromHighlights(highlights: any[]): InteractionPoint[] {
  return highlights.map((h: any, index: number) => {
    const rawType = h.interactionType || 'system'
    const buttonType = typeToButton[rawType] || 'hit-face'
    return {
      id: h.id || `highlight-${index}`,
      time: h.startTime ?? h.time,
      type: buttonType as InteractionPoint['type'],
      title: h.title || `助力${h.label || ''}`,
      keyword: h.keyword,
      requiredClicks: Math.floor(Math.random() * 6) + 5,
      duration: h.interaction?.duration || 8,
      reward: {
        score: h.interaction?.reward || 100 + index * 20,
        effect: h.interaction?.effect || `${h.label || ''}特效`,
        sound: h.interaction?.sound || '/sounds/hit.mp3',
      },
    }
  })
}

interface VideoPlayerProps {
  config: VideoConfig
  onScoreUpdate: (score: number, type: string) => void
  onTimeUpdate?: (time: number) => void
  onEnded?: () => void
  dramaId?: string
  episodeName?: string
  highlights?: any[]  // API 高光点数据，优先使用
}

export default function VideoPlayer({ config, onScoreUpdate, onTimeUpdate, onEnded, dramaId, episodeName, highlights }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [interactionPoints, setInteractionPoints] = useState<InteractionPoint[]>([])
  const [activeInteraction, setActiveInteraction] = useState<InteractionPoint | null>(null)
  const [interactionProgress, setInteractionProgress] = useState(0)
  const [clickCount, setClickCount] = useState(0)
  const [triggeredPoints, setTriggeredPoints] = useState<Set<string>>(new Set())
  const [showEffect, setShowEffect] = useState(false)
  const [completedType, setCompletedType] = useState<string>('')
  const [completedKeyword, setCompletedKeyword] = useState<string>('')
  const [timeLeft, setTimeLeft] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const activeInteractionRef = useRef<InteractionPoint | null>(null)

  // 播放/暂停
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
    } else {
      videoRef.current.pause()
    }
  }, [])

  // 容器级全屏
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      containerRef.current.requestFullscreen()
    }
  }, [])

  // 点击进度条跳转
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percent = clickX / rect.width
    const newTime = percent * duration
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }, [duration])

  // 切换视频时重置所有状态
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    activeInteractionRef.current = null
    setCurrentTime(0)
    setDuration(0)
    setInteractionPoints([])
    setActiveInteraction(null)
    setInteractionProgress(0)
    setClickCount(0)
    setTriggeredPoints(new Set())
    setShowEffect(false)
    setCompletedType('')
    setTimeLeft(0)
  }, [config.url])

  // 根据高光点数据生成互动点
  const buildInteractionPoints = useCallback((highlightsData: any[], videoDuration: number) => {
    if (highlightsData && highlightsData.length > 0) {
      return interactionPointsFromHighlights(highlightsData)
    }
    if (dramaId && episodeName) {
      return generateInteractionPointsFromHighlights(dramaId, episodeName, videoDuration)
    }
    return generateInteractionPoints(videoDuration)
  }, [dramaId, episodeName])

  // 视频加载后根据时长生成互动点
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration
      setDuration(videoDuration)
      setInteractionPoints(buildInteractionPoints(highlights || [], videoDuration))
    }
  }

  // API 高光点数据到达后，重新生成互动点
  useEffect(() => {
    if (highlights && highlights.length > 0 && duration > 0) {
      setInteractionPoints(buildInteractionPoints(highlights, duration))
    }
  }, [highlights, duration, buildInteractionPoints])

  // 监听视频时间更新
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return
    const time = videoRef.current.currentTime
    setCurrentTime(time)
    if (onTimeUpdate) {
      onTimeUpdate(time)
    }
    if (!activeInteractionRef.current) {
      interactionPoints.forEach((point) => {
        if (
          !triggeredPoints.has(point.id) &&
          time >= point.time &&
          time < point.time + 0.5
        ) {
          activeInteractionRef.current = point
          setActiveInteraction(point)
          setClickCount(0)
          setInteractionProgress(0)
          setTimeLeft(point.duration)
          if (timerRef.current) clearInterval(timerRef.current)
          timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
              if (prev <= 1) {
                clearInterval(timerRef.current!)
                const current = activeInteractionRef.current
                if (current) {
                  setTriggeredPoints((prev) => new Set([...prev, current.id]))
                }
                activeInteractionRef.current = null
                setActiveInteraction(null)
                setClickCount(0)
                setInteractionProgress(0)
                return 0
              }
              return prev - 1
            })
          }, 1000)
        }
      })
    }
  }, [interactionPoints, triggeredPoints])

  // 超时处理
  const handleTimeout = useCallback(() => {
    const current = activeInteractionRef.current
    if (current) {
      setTriggeredPoints((prev) => new Set([...prev, current.id]))
      activeInteractionRef.current = null
      setActiveInteraction(null)
      setClickCount(0)
      setInteractionProgress(0)
      setTimeLeft(0)
    }
  }, [])

  // 处理点击
  const handleClick = useCallback(() => {
    if (!activeInteraction) return
    const newClickCount = clickCount + 1
    const newProgress = Math.min((newClickCount / activeInteraction.requiredClicks) * 100, 100)
    const isCompleted = newClickCount >= activeInteraction.requiredClicks
    setClickCount(newClickCount)
    setInteractionProgress(newProgress)

    const clickAudio = new Audio('/sounds/click.mp3')
    clickAudio.volume = 0.3
    clickAudio.play().catch(() => {})

    if (isCompleted) {
      if (timerRef.current) clearInterval(timerRef.current)
      setTriggeredPoints((prev) => new Set([...prev, activeInteraction.id]))
      setCompletedType(activeInteraction.type)
      setCompletedKeyword(activeInteraction.keyword || effect?.title || '')
      setShowEffect(true)
      const hitAudio = new Audio(activeInteraction.reward.sound)
      hitAudio.volume = 0.8
      hitAudio.play().catch(() => {})
      onScoreUpdate(activeInteraction.reward.score, activeInteraction.type)
      setTimeout(() => {
        activeInteractionRef.current = null
        setShowEffect(false)
        setActiveInteraction(null)
        setClickCount(0)
        setInteractionProgress(0)
        setTimeLeft(0)
      }, 1800)
    }
  }, [activeInteraction, clickCount, onScoreUpdate])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0
  const effect = activeInteraction ? interactionEffects[activeInteraction.type as keyof typeof interactionEffects] : null
  const timerProgress = activeInteraction ? (timeLeft / activeInteraction.duration) * 100 : 100

  // 判断是不是超级弹幕类型
  const isSuperDanmaku = activeInteraction?.type === 'super-danmaku-liuyanru'

  return (
    <div ref={containerRef} className="relative w-full aspect-[9/16] max-h-[80vh] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800 mx-auto">
      {/* 视频 */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        src={config.url}
        crossOrigin="anonymous"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false)
          if (onEnded) onEnded()
        }}
        playsInline
      />

      {/* 自定义控制栏 */}
      <div className="absolute bottom-24 left-0 right-0 z-40 flex items-center justify-between px-4 pointer-events-auto">
        <button
          onClick={togglePlay}
          className="w-10 h-10 flex items-center justify-center bg-black/50 backdrop-blur rounded-full text-white text-lg active:bg-black/70"
        >
          {isPlaying ? '⏸' : '▶️'}
        </button>
        <span className="text-white text-xs bg-black/50 backdrop-blur px-2 py-1 rounded">
          {Math.floor(currentTime)}s / {Math.floor(duration)}s
        </span>
        <button
          onClick={toggleFullscreen}
          className="w-10 h-10 flex items-center justify-center bg-black/50 backdrop-blur rounded-full text-white text-lg active:bg-black/70"
        >
          ⛶
        </button>
      </div>

      {/* 互动层 */}
      <AnimatePresence>
        {activeInteraction && !showEffect && effect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-20"
          >
            {/* 超级弹幕有专属的顶部提示！ */}
            {isSuperDanmaku ? (
              <motion.div
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute top-0 left-0 right-0 p-4 pointer-events-none"
                style={{
                  background: 'linear-gradient(to bottom, rgba(255,20,147,0.9), transparent)',
                }}
              >
                <div className="flex items-center justify-center">
                  <motion.div
                    className="bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-3 rounded-full border-2 border-yellow-400"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    <span className="text-white font-black text-lg drop-shadow-lg">
                      💖 万众期待！柳如烟大帝登场！💖
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              /* 普通互动提示 */
              <motion.div
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                className="absolute top-0 left-0 right-0 p-4 pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-red-900/80 to-transparent px-4 py-2 rounded-r-lg border-l-4 border-yellow-500">
                    <motion.span
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="text-2xl"
                    >
                      {effect.emoji}
                    </motion.span>
                    <span className="text-yellow-400 font-bold text-lg">
                      {activeInteraction.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative w-10 h-10">
                      <svg className="w-10 h-10 transform -rotate-90">
                        <circle cx="20" cy="20" r="16" stroke="rgba(255,255,255,0.2)" strokeWidth="3" fill="none" />
                        <motion.circle
                          cx="20" cy="20" r="16" stroke={timeLeft <= 3 ? '#ef4444' : '#f59e0b'}
                          strokeWidth="3" fill="none" strokeLinecap="round"
                          initial={{ strokeDasharray: '100' }}
                          animate={{ strokeDashoffset: 100 - timerProgress }}
                          transition={{ duration: 0.5 }}
                          style={{ strokeDasharray: '100' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-sm font-bold ${timeLeft <= 3 ? 'text-red-400' : 'text-white'}`}>
                          {timeLeft}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 中央互动区域 - 不覆盖底部进度条 */}
            <div className={`absolute top-0 left-0 right-0 bottom-20 flex items-center justify-center pointer-events-auto ${isSuperDanmaku ? '' : 'pt-20'}`}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex flex-col items-center gap-4"
              >
                {/* 🎉 超级弹幕专属柳如烟心形大按钮！ */}
                {isSuperDanmaku ? (
                  <SuperDanmakuButton
                    onClick={handleClick}
                    clickCount={clickCount}
                    maxClicks={activeInteraction.requiredClicks}
                    characterName={dramaId === 'naisui' ? '太奶奶' : '柳如烟'}
                    variant={dramaId === 'naisui' ? 'jade' : 'heart'}
                  />
                ) : (
                  <>
                    {/* 普通古风进度条 */}
                    <div className="bg-black/80 backdrop-blur-sm rounded-xl px-6 py-3 min-w-[200px] border border-yellow-600/50">
                      <div className="flex justify-between text-sm text-gray-300 mb-2">
                        <span>⚔️ 助力进度</span>
                        <span className="text-yellow-400 font-bold">{clickCount}/{activeInteraction.requiredClicks}</span>
                      </div>
                      <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden border border-yellow-700/30">
                        <motion.div
                          className="h-full"
                          style={{ background: `linear-gradient(90deg, #DC2626, #F59E0B)` }}
                          animate={{ width: `${interactionProgress}%` }}
                          transition={{ type: 'spring', stiffness: 200 }}
                        />
                      </div>
                    </div>

                    {/* 普通古风异形按钮 */}
                    <AncientStyleButton
                      onClick={handleClick}
                      clickCount={clickCount}
                      maxClicks={activeInteraction.requiredClicks}
                      type={activeInteraction.type as any}
                      keyword={activeInteraction.keyword}
                    />

                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-yellow-300 text-sm font-bold bg-black/60 px-4 py-2 rounded-full"
                    >
                      ⚡ 快速点击助力！{timeLeft}秒内完成 ⚡
                    </motion.div>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 特效叠加层 */}
      <AnimatePresence>
        {showEffect && <InteractionOverlay type={completedType} keyword={completedKeyword} />}
      </AnimatePresence>

      {/* 底部进度条 */}
      <div className="absolute bottom-16 left-0 right-0 z-10 px-2">
        <div
          className="relative h-4 bg-gray-800/80 rounded-full cursor-pointer group"
          onClick={handleProgressClick}
        >
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-yellow-500 transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {interactionPoints.map((point) => {
            const pointPercent = duration > 0 ? (point.time / duration) * 100 : 0
            const isTriggered = triggeredPoints.has(point.id)
            const isSuper = point.type === 'super-danmaku-liuyanru'
            return (
              <button
                key={point.id}
                className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-150 transition-transform z-10 ${
                  isTriggered ? 'bg-gray-500' : isSuper ? 'bg-pink-500 animate-pulse' : 'bg-yellow-400 animate-pulse'
                }`}
                style={{ left: `${pointPercent}%`, transform: 'translate(-50%, -50%)' }}
                onClick={(e) => {
                  e.stopPropagation()
                  if (videoRef.current) {
                    videoRef.current.currentTime = point.time
                    setCurrentTime(point.time)
                    // 重置已触发状态，让互动可以重新出现
                    setTriggeredPoints(prev => {
                      const next = new Set(prev)
                      next.delete(point.id)
                      return next
                    })
                  }
                }}
                title={`${Math.floor(point.time / 60)}:${String(Math.floor(point.time % 60)).padStart(2, '0')} - ${point.title}`}
              />
            )
          })}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${progressPercent}%`, transform: `translate(-50%, -50%)` }}
          />
        </div>

        <div className="flex justify-between mt-1 px-1">
          <span className="text-white text-[10px] bg-black/50 px-1.5 py-0.5 rounded">
            {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
          </span>
          <span className="text-white text-[10px] bg-black/50 px-1.5 py-0.5 rounded">
            {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
          </span>
        </div>
      </div>

      {interactionPoints.length > 0 && (
        <div className="absolute bottom-36 left-2 right-2 z-10 pointer-events-none">
          <div className="flex items-center justify-center gap-3 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5">
            {interactionPoints.slice(0, 6).map((point) => {
              const isTriggered = triggeredPoints.has(point.id)
              const isActive = activeInteraction?.id === point.id
              const isSuper = point.type === 'super-danmaku-liuyanru'
              return (
                <div
                  key={point.id}
                  className={`text-[10px] ${
                    isActive ? 'text-pink-400 font-bold' : isTriggered ? 'text-gray-600' : isSuper ? 'text-pink-300' : 'text-gray-400'
                  }`}
                >
                  {isTriggered ? '✅' : isActive ? '💖' : isSuper ? '💕' : '⏳'}
                </div>
              )
            })}
            {interactionPoints.length > 6 && (
              <span className="text-[10px] text-gray-500">+{interactionPoints.length - 6}</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function InteractionOverlay({ type, keyword }: { type: string; keyword?: string }) {
  const isSuperDanmaku = type === 'super-danmaku-liuyanru'

  const colorKey: Record<string, string> = {
    'hit-face': '#DC2626', 'upgrade': '#F59E0B', 'revenge': '#7F1D1D',
    'sweet': '#EC4899', 'justice': '#FBBF24', 'system': '#0891B2',
    'super-danmaku-liuyanru': '#FF69B4',
  }
  const bgColor = colorKey[type] || '#DC2626'

  // 要显示的文字：优先用关键词
  const displayText = keyword || '成功'

  // 超级弹幕完成特效
  if (isSuperDanmaku) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 pointer-events-none z-30"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0] }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(255,105,180,0.8), rgba(255,20,147,0.8))' }}
        />
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1, 8, 6], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.5, times: [0, 0.2, 0.7, 1] }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="text-7xl font-black text-white drop-shadow-2xl" style={{ textShadow: '0 0 40px rgba(255,105,180,1), 0 0 80px rgba(255,20,147,0.8)' }}>
            {displayText}
          </span>
        </motion.div>
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: '50%', y: '50%', scale: 0 }}
            animate={{
              x: `${50 + (Math.random() - 0.5) * 160}%`,
              y: `${50 + (Math.random() - 0.5) * 160}%`,
              scale: [0, 2 + Math.random() * 2, 0],
              opacity: [1, 1, 0],
              rotate: Math.random() * 360
            }}
            transition={{ duration: 1.2, delay: Math.random() * 0.5, ease: 'easeOut' }}
            className="absolute text-2xl font-bold"
            style={{ color: ['#FF69B4', '#FFB6C1', '#FFD700', '#FFFFFF', '#FF1493'][i % 5] }}
          >
            💖
          </motion.div>
        ))}
      </motion.div>
    )
  }

  // 普通特效 — 关键词从小变大
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 pointer-events-none z-30"
    >
      {/* 背景闪光 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0] }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0"
        style={{ backgroundColor: bgColor }}
      />
      {/* 关键词从小变大 */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1, 7, 5], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.5, times: [0, 0.15, 0.6, 1] }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <span
          className="text-6xl font-black text-white drop-shadow-2xl"
          style={{ textShadow: `0 0 30px ${bgColor}, 0 0 60px ${bgColor}` }}
        >
          {displayText}
        </span>
      </motion.div>
      {/* 粒子爆炸 */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: '50%', y: '50%', scale: 0 }}
          animate={{
            x: `${50 + (Math.random() - 0.5) * 100}%`,
            y: `${50 + (Math.random() - 0.5) * 100}%`,
            scale: [0, 2, 0],
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 0.7, delay: Math.random() * 0.3 }}
          className="absolute w-5 h-5 rounded-full"
          style={{ backgroundColor: bgColor }}
        />
      ))}
    </motion.div>
  )
}
