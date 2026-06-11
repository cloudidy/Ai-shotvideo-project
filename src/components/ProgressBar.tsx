'use client'

import { motion } from 'framer-motion'

interface ProgressBarProps {
  progress: number
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  // 根据进度改变颜色
  const getProgressGradient = () => {
    if (progress < 30) return 'linear-gradient(90deg, #ef4444, #f97316)'
    if (progress < 60) return 'linear-gradient(90deg, #f97316, #eab308)'
    if (progress < 90) return 'linear-gradient(90deg, #eab308, #22c55e)'
    return 'linear-gradient(90deg, #22c55e, #10b981)'
  }

  // 进度条发光效果
  const getGlowColor = () => {
    if (progress < 30) return '#ef4444'
    if (progress < 60) return '#f97316'
    if (progress < 90) return '#eab308'
    return '#22c55e'
  }

  return (
    <div className="relative w-full h-6 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
      {/* 进度条背景 */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800" />

      {/* 进度条填充 */}
      <motion.div
        className="h-full rounded-full relative"
        style={{ background: getProgressGradient() }}
        initial={{ width: '0%' }}
        animate={{ width: `${progress}%` }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        {/* 进度条光泽 */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        {/* 顶部高光 */}
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent rounded-t-full" />
      </motion.div>

      {/* 闪光点 */}
      {progress > 5 && (
        <motion.div
          className="absolute top-0 h-full w-12"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
          }}
          animate={{
            left: ['-10%', '110%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}

      {/* 进度百分比 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white text-xs font-bold drop-shadow-lg">
          {Math.round(progress)}%
        </span>
      </div>

      {/* 满进度爆炸效果 */}
      {progress >= 100 && (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: [0, 0.5, 0], scale: [1, 1.5, 2] }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: getGlowColor() }}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.3, repeat: 2 }}
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: `0 0 20px ${getGlowColor()}, 0 0 40px ${getGlowColor()}`,
            }}
          />
        </>
      )}
    </div>
  )
}
