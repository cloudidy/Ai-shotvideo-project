'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { useState } from 'react'

export default function AchievementPanel() {
  const { achievements } = useGameStore()
  const [isOpen, setIsOpen] = useState(false)
  const unlockedCount = achievements.filter((a) => a.unlocked).length

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-3 z-50 glass rounded-full px-3 py-1.5 flex items-center gap-1.5 transition-all duration-200 hover:opacity-80"
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-sm">🏆</span>
        <span className="text-xs font-medium text-white">{unlockedCount}/{achievements.length}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: 100, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl p-5 max-w-lg w-full max-h-80 overflow-y-auto scrollbar-hide"
              style={{ background: '#0c0c10', border: '1px solid rgba(255,255,255,0.06)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-5">
                <h2 className="text-lg font-semibold text-white">成就系统</h2>
                <p className="text-gray-500 text-xs mt-1">已解锁 {unlockedCount} / {achievements.length}</p>
              </div>

              <div className="w-full h-1 rounded-full mb-5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(to right, #f97316, #ef4444)' }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {achievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-xl border transition-all ${
                      achievement.unlocked ? 'glass' : 'opacity-50'
                    }`}
                    style={achievement.unlocked ? { borderColor: 'rgba(249,115,22,0.15)' } : { background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)' }}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`text-xl flex-shrink-0 ${achievement.unlocked ? '' : 'grayscale'}`}>{achievement.emoji}</div>
                      <div className="min-w-0">
                        <h3 className={`text-xs font-semibold truncate ${achievement.unlocked ? 'text-orange-400' : 'text-gray-500'}`}>{achievement.title}</h3>
                        <p className="text-gray-500 mt-0.5 line-clamp-2" style={{ fontSize: '10px' }}>{achievement.description}</p>
                        {achievement.unlocked && achievement.unlockedAt && (
                          <p className="text-orange-400 mt-1" style={{ fontSize: '10px', opacity: 0.5 }}>✓ {new Date(achievement.unlockedAt).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-5">
                <button onClick={() => setIsOpen(false)} className="glass glass-hover text-gray-300 px-5 py-2 rounded-xl text-xs transition-all duration-200">
                  关闭
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
