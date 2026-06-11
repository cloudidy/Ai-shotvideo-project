'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { useState, useEffect } from 'react'

export default function AchievementToast() {
  const { achievements } = useGameStore()
  const [showQueue, setShowQueue] = useState<string[]>([])
  const [currentAchievement, setCurrentAchievement] = useState<any>(null)

  useEffect(() => {
    const unlocked = achievements.filter((a) => a.unlocked)
    const latestUnlocked = unlocked[unlocked.length - 1]
    if (latestUnlocked && !showQueue.includes(latestUnlocked.id)) {
      setShowQueue((prev) => [...prev, latestUnlocked.id])
    }
  }, [achievements])

  useEffect(() => {
    if (showQueue.length > 0 && !currentAchievement) {
      const latestId = showQueue[showQueue.length - 1]
      const achievement = achievements.find((a) => a.id === latestId)
      if (achievement) {
        setCurrentAchievement(achievement)
        setTimeout(() => {
          setCurrentAchievement(null)
          setShowQueue((prev) => prev.filter((id) => id !== latestId))
        }, 3000)
      }
    }
  }, [showQueue, currentAchievement, achievements])

  return (
    <AnimatePresence>
      {currentAchievement && (
        <motion.div
          initial={{ x: 200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 200, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="fixed bottom-8 right-4 glass rounded-xl px-4 py-3"
          style={{ zIndex: 200, maxWidth: '260px', borderColor: 'rgba(249,115,22,0.15)' }}
        >
          <div className="flex items-center gap-3">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10, delay: 0.1 }} className="text-2xl flex-shrink-0">
              {currentAchievement.emoji}
            </motion.div>
            <div className="min-w-0">
              <div className="text-orange-400" style={{ fontSize: '10px' }}>成就解锁</div>
              <div className="text-sm font-semibold text-white truncate">{currentAchievement.title}</div>
              <div className="text-gray-500 truncate" style={{ fontSize: '10px' }}>{currentAchievement.description}</div>
            </div>
          </div>
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 3, ease: 'linear' }}
            className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl origin-left"
            style={{ background: 'rgba(249,115,22,0.4)' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
