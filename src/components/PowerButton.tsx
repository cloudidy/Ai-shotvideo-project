'use client'

import { motion } from 'framer-motion'
import { interactionEffects } from '@/config/interactions'

interface PowerButtonProps {
  onClick: () => void
  clickCount: number
  type?: keyof typeof interactionEffects
}

export default function PowerButton({ onClick, clickCount, type = 'hit-face' }: PowerButtonProps) {
  const effect = interactionEffects[type]

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.85 }}
      className="relative w-36 h-36 rounded-full text-white font-bold text-xl cursor-pointer select-none"
      style={{
        background: `linear-gradient(135deg, ${effect.colors[0]}, ${effect.colors[1]})`,
      }}
    >
      {/* 外圈光晕 */}
      <motion.div
        className="absolute inset-[-10px] rounded-full"
        style={{ backgroundColor: `${effect.colors[0]}33` }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 0.1, 0.5],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 第二层光晕 */}
      <motion.div
        className="absolute inset-[-5px] rounded-full"
        style={{ backgroundColor: `${effect.colors[0]}22` }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.1, 0.3],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.3,
        }}
      />

      {/* 按钮主体 */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <motion.span
          className="text-5xl"
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
        >
          {effect.emoji}
        </motion.span>
        <span className="text-sm mt-2 font-black">助力{effect.title}</span>
      </div>

      {/* 点击计数气泡 */}
      {clickCount > 0 && (
        <motion.div
          key={clickCount}
          initial={{ scale: 0, opacity: 0, y: 0 }}
          animate={{ scale: 1, opacity: 1, y: -10 }}
          className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold shadow-lg"
        >
          +{clickCount}
        </motion.div>
      )}

      {/* 点击波纹效果 */}
      <motion.div
        key={`ripple-${clickCount}`}
        initial={{ scale: 0.8, opacity: 0.6 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 rounded-full border-2"
        style={{ borderColor: effect.colors[0] }}
      />

      {/* 火花效果 */}
      {clickCount > 0 && clickCount % 5 === 0 && (
        <>
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={`spark-${i}`}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: Math.cos((i * Math.PI * 2) / 8) * 80,
                y: Math.sin((i * Math.PI * 2) / 8) * 80,
                opacity: 0,
                scale: 0,
              }}
              transition={{ duration: 0.5 }}
              className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full"
              style={{ backgroundColor: effect.colors[2] || effect.colors[0] }}
            />
          ))}
        </>
      )}

      {/* 阴影 */}
      <div
        className="absolute inset-0 rounded-full shadow-2xl"
        style={{
          boxShadow: `0 0 30px ${effect.colors[0]}66, 0 0 60px ${effect.colors[0]}33`,
        }}
      />
    </motion.button>
  )
}
