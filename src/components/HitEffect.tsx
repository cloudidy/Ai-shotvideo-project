'use client'

import { motion } from 'framer-motion'
import { HitEffectConfig } from '@/types'

interface HitEffectProps {
  config: HitEffectConfig
}

export default function HitEffect({ config }: HitEffectProps) {
  return (
    <>
      {/* 全屏闪光 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.8, 0] }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 z-50 pointer-events-none"
        style={{ backgroundColor: config.flashColor }}
      />

      {/* 屏幕震动容器 */}
      <motion.div
        className="absolute inset-0 z-40 pointer-events-none"
        animate={{
          x: [0, -10, 10, -5, 5, 0],
          y: [0, -5, 5, -10, 10, 0],
        }}
        transition={{ duration: 0.4 }}
      >
        {/* 打脸文字 */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 2, 1.5], opacity: [0, 1, 0] }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="text-8xl font-black text-white drop-shadow-2xl">
            💥 打脸！💥
          </div>
        </motion.div>

        {/* 碎片粒子效果 */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: '50%',
              y: '50%',
              scale: 0,
              opacity: 1,
            }}
            animate={{
              x: `${50 + (Math.random() - 0.5) * 100}%`,
              y: `${50 + (Math.random() - 0.5) * 100}%`,
              scale: [0, 1, 0],
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 0.6,
              delay: Math.random() * 0.2,
            }}
            className="absolute w-4 h-4 rounded-full"
            style={{
              backgroundColor: ['#ff6600', '#ff0000', '#ffcc00', '#ff3366'][i % 4],
            }}
          />
        ))}

        {/* 光环效果 */}
        <motion.div
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-4 border-orange-400"
        />
        <motion.div
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-4 border-yellow-400"
        />
      </motion.div>
    </>
  )
}
