'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { useThemeStore } from '@/store/themeStore'
import { useEffect } from 'react'

export default function GameHUD() {
  const { totalScore, comboCount, maxCombo, level, updateLevel } = useGameStore()
  const { currentTheme } = useThemeStore()

  // 更新等级
  useEffect(() => {
    updateLevel()
  }, [totalScore, updateLevel])

  // 等级经验值计算
  const getExpForNextLevel = (lvl: number) => {
    return Math.pow(lvl - 1, 2) * 100
  }

  const currentLevelExp = getExpForNextLevel(level)
  const nextLevelExp = getExpForNextLevel(level + 1)
  const expProgress = ((totalScore - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100

  return (
    <div className="fixed top-4 left-4 z-50 flex flex-col gap-3">
      {/* 等级和积分 */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="backdrop-blur-sm rounded-xl p-4 border shadow-lg"
        style={{
          background: `linear-gradient(to right, ${currentTheme.colors.primaryDark}90, ${currentTheme.colors.secondary}90)`,
          borderColor: `${currentTheme.colors.primary}40`
        }}
      >
        {/* 等级 */}
        <div className="flex items-center gap-3 mb-2">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-black font-bold text-xl"
            style={{
              background: `linear-gradient(to bottom right, ${currentTheme.colors.accent}, ${currentTheme.colors.primary})`
            }}
          >
            {level}
          </div>
          <div>
            <div className="font-bold" style={{ color: currentTheme.colors.accent }}>Lv.{level}</div>
            <div className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
              距离下一级还需 {nextLevelExp - totalScore} 积分
            </div>
          </div>
        </div>

        {/* 经验条 */}
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full"
            style={{
              background: `linear-gradient(to right, ${currentTheme.colors.accent}, ${currentTheme.colors.primary})`
            }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(expProgress, 100)}%` }}
            transition={{ type: 'spring', stiffness: 100 }}
          />
        </div>

        {/* 积分 */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>积分</span>
          <motion.span
            key={totalScore}
            initial={{ scale: 1.3, color: currentTheme.colors.accent }}
            animate={{ scale: 1, color: currentTheme.colors.text }}
            className="font-bold text-lg"
          >
            ⭐ {totalScore.toLocaleString()}
          </motion.span>
        </div>
      </motion.div>

      {/* 连击显示 */}
      <AnimatePresence>
        {comboCount > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="backdrop-blur-sm rounded-xl p-4 border shadow-lg"
            style={{
              background: `linear-gradient(to right, ${currentTheme.colors.secondary}90, ${currentTheme.colors.primary}90)`,
              borderColor: `${currentTheme.colors.secondary}40`
            }}
          >
            <div className="text-center">
              <motion.div
                key={comboCount}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                className="text-4xl font-black"
                style={{ color: currentTheme.colors.text }}
              >
                {comboCount}
              </motion.div>
              <div className="font-bold text-sm mt-1" style={{ color: currentTheme.colors.secondary }}>
                🔥 连击！
              </div>
              {comboCount >= 10 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="text-xs mt-1"
                  style={{ color: currentTheme.colors.accent }}
                >
                  超神连击！
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 最高连击记录 */}
      {maxCombo > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-900/80 backdrop-blur-sm rounded-lg px-3 py-2 text-center text-sm"
        >
          <span style={{ color: currentTheme.colors.textSecondary }}>最高连击: </span>
          <span className="font-bold" style={{ color: currentTheme.colors.primary }}>{maxCombo}</span>
        </motion.div>
      )}
    </div>
  )
}
