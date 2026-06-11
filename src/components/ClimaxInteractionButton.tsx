'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EpisodeInteractionPoint } from '@/config/episode1-interactions'

interface ClimaxInteractionButtonProps {
  point: EpisodeInteractionPoint
  currentTime: number
  onComplete: (point: EpisodeInteractionPoint) => void
  onTimeout: (point: EpisodeInteractionPoint) => void
}

export default function ClimaxInteractionButton({
  point,
  currentTime,
  onComplete,
  onTimeout,
}: ClimaxInteractionButtonProps) {
  const [clicks, setClicks] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(point.duration)
  const [showEffect, setShowEffect] = useState(false)

  const shouldShow = currentTime >= point.time && currentTime <= point.time + point.duration

  useEffect(() => {
    if (shouldShow && !isActive && !isCompleted) {
      setIsActive(true)
      setTimeLeft(point.duration)
      setClicks(0)
    }
  }, [shouldShow, isActive, isCompleted, point.duration])

  useEffect(() => {
    if (!isActive || isCompleted) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onTimeout(point)
          setIsActive(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isActive, isCompleted, point, onTimeout])

  const handleClick = useCallback(() => {
    if (!isActive || isCompleted) return
    const newClicks = clicks + 1
    setClicks(newClicks)
    if (newClicks >= point.requiredClicks) {
      setIsCompleted(true)
      setIsActive(false)
      setShowEffect(true)
      onComplete(point)
      setTimeout(() => setShowEffect(false), 3000)
    }
  }, [clicks, isActive, isCompleted, point, onComplete])

  const progress = (clicks / point.requiredClicks) * 100

  const getIntensityColor = () => {
    const intensity = point.intensity
    if (intensity >= 9) return { bg: 'linear-gradient(135deg, #dc2626, #ea580c)', border: '#ef4444', glow: 'rgba(239,68,68,0.4)' }
    if (intensity >= 7) return { bg: 'linear-gradient(135deg, #ea580c, #ca8a04)', border: '#f97316', glow: 'rgba(234,88,12,0.4)' }
    return { bg: 'linear-gradient(135deg, #ca8a04, #16a34a)', border: '#eab308', glow: 'rgba(202,138,4,0.4)' }
  }

  const colors = getIntensityColor()

  if (!shouldShow && !showEffect) return null

  return (
    <>
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="fixed bottom-24 left-1/2 z-50"
            style={{ transform: 'translateX(-50%)' }}
          >
            {/* 倒计时 */}
            <div className="text-center mb-2">
              <span className="text-white text-xs font-mono px-2 py-1 rounded" style={{ background: 'rgba(0,0,0,0.5)' }}>
                {timeLeft}s
              </span>
            </div>

            {/* 进度条 */}
            <div className="w-48 h-1 rounded-full mb-3 overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: colors.bg }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            {/* 点击按钮 */}
            <motion.button
              onClick={handleClick}
              whileTap={{ scale: 0.95 }}
              className="relative w-40 h-14 rounded-xl text-white font-bold text-base cursor-pointer overflow-hidden"
              style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                boxShadow: `0 0 20px ${colors.glow}`,
              }}
            >
              <div className="relative z-10 flex flex-col items-center justify-center">
                <span className="text-sm">{point.type}</span>
                <span className="text-xs opacity-70">{clicks}/{point.requiredClicks}</span>
              </div>
            </motion.button>

            {/* 提示 */}
            <div className="text-center mt-2">
              <span className="text-gray-400 text-xs">{point.title}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 完成特效 */}
      <AnimatePresence>
        {showEffect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none"
          >
            <motion.div
              className="absolute inset-0"
              style={{ background: 'rgba(255,255,255,0.2)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.4 }}
            />
            <motion.div
              className="absolute top-1/3 left-1/2"
              style={{ transform: 'translate(-50%, -50%)' }}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="text-center">
                <div className="text-4xl mb-2">🎉</div>
                <div className="text-yellow-400 text-2xl font-bold">+{point.reward.score}</div>
                <div className="text-white text-base mt-1">{point.reward.effect}</div>
              </div>
            </motion.div>
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{ background: colors.border }}
                initial={{ x: '50%', y: '50%', scale: 0 }}
                animate={{
                  x: `${50 + (Math.random() - 0.5) * 80}%`,
                  y: `${50 + (Math.random() - 0.5) * 80}%`,
                  scale: [0, 1.5, 0],
                }}
                transition={{ duration: 0.8, delay: Math.random() * 0.2 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
