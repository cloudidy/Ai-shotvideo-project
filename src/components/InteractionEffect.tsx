'use client'

import { motion } from 'framer-motion'
import { interactionEffects } from '@/config/interactions'

interface InteractionEffectProps {
  type: keyof typeof interactionEffects
  score: number
}

export default function InteractionEffect({ type, score }: InteractionEffectProps) {
  const effect = interactionEffects[type]

  return (
    <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
      {/* 全屏闪光 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.6, 0] }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0"
        style={{ backgroundColor: effect.flashColor }}
      />

      {/* 屏幕震动 */}
      <motion.div
        className="absolute inset-0"
        animate={{
          x: [0, -15, 15, -10, 10, -5, 5, 0],
          y: [0, -10, 10, -15, 15, -5, 5, 0],
        }}
        transition={{ duration: 0.5 }}
      >
        {/* 中心大字 */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 2.5, 2], opacity: [0, 1, 0] }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="text-9xl font-black text-white drop-shadow-2xl">
            {effect.emoji} {effect.title}！{effect.emoji}
          </div>
        </motion.div>
      </motion.div>

      {/* 粒子爆炸 */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: '50%',
            y: '50%',
            scale: 0,
            opacity: 1,
          }}
          animate={{
            x: `${50 + (Math.random() - 0.5) * 120}%`,
            y: `${50 + (Math.random() - 0.5) * 120}%`,
            scale: [0, 1.5, 0],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 0.7,
            delay: Math.random() * 0.3,
          }}
          className="absolute w-6 h-6 rounded-full"
          style={{
            backgroundColor: effect.colors[i % effect.colors.length],
          }}
        />
      ))}

      {/* 光环扩散 */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 3 + i, opacity: 0 }}
          transition={{ duration: 0.6, delay: i * 0.1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-4"
          style={{ borderColor: effect.colors[0] }}
        />
      ))}

      {/* 积分弹出 */}
      <motion.div
        initial={{ y: '60%', opacity: 0, scale: 0.5 }}
        animate={{ y: '25%', opacity: [0, 1, 1, 0], scale: [0.5, 1.3, 1.3, 1] }}
        transition={{ duration: 1.2, delay: 0.3 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div
          className="text-5xl font-black"
          style={{ color: effect.colors[0] }}
        >
          +{score} ⭐
        </div>
      </motion.div>

      {/* 成就解锁提示 */}
      <motion.div
        initial={{ y: '80%', opacity: 0 }}
        animate={{ y: '70%', opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.5, delay: 0.6 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="bg-black/70 px-6 py-3 rounded-full border-2"
          style={{ borderColor: effect.colors[0] }}
        >
          <span className="text-white text-lg font-bold">
            🏆 成就解锁：{effect.title}大师
          </span>
        </div>
      </motion.div>
    </div>
  )
}
