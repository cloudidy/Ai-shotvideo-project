'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface GoldIngotHunterProps {
  onCollect: (points: number) => void
  duration?: number
}

interface Ingot {
  id: number
  x: number
  y: number
  points: number
  size: number
  delay: number
  rotation: number
}

export default function GoldIngotHunter({ onCollect, duration = 12 }: GoldIngotHunterProps) {
  // 一次性生成15个金元宝，随机分布
  const ingots: Ingot[] = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: 10 + Math.random() * 80,
    y: 15 + Math.random() * 65,
    points: [10, 20, 30, 50, 100][Math.floor(Math.random() * 5)],
    size: 60 + Math.random() * 40,
    delay: Math.random() * 1.5,
    rotation: Math.random() * 360,
  }))

  const collectedIds = new Set<number>()

  const handleIngotClick = (ingot: Ingot) => {
    if (collectedIds.has(ingot.id)) return
    collectedIds.add(ingot.id)
    onCollect(ingot.points)
  }

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none z-25"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 顶部横幅提示 */}
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-0 left-0 right-0 p-4"
        style={{ background: 'linear-gradient(to bottom, rgba(245,158,11,0.95), transparent)' }}
      >
        <div className="flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 0.7, repeat: Infinity }}
            className="bg-gradient-to-r from-yellow-400 to-amber-500 px-8 py-3 rounded-full border-3 border-yellow-300 shadow-2xl"
          >
            <span className="text-black font-black text-xl drop-shadow">
              💰 元宝大寻宝！疯狂点击收集橘子！💰
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* 15个随机飘的金元宝！ */}
      <AnimatePresence>
        {ingots.map((ingot) => (
          <motion.div
            key={ingot.id}
            className="absolute pointer-events-auto cursor-pointer"
            style={{
              left: `${ingot.x}%`,
              top: `${ingot.y}%`,
            }}
            initial={{ scale: 0, opacity: 0, y: -50 }}
            animate={{
              scale: [0, 1, 1.1, 1],
              opacity: 1,
              y: 0,
              rotate: [ingot.rotation, ingot.rotation + 15, ingot.rotation - 10, ingot.rotation],
            }}
            transition={{
              duration: 2.5,
              delay: ingot.delay,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            whileTap={{ scale: 0 }}
            onClick={() => handleIngotClick(ingot)}
          >
            {/* 元宝本体 - 传统古代金元宝形状 */}
            <div
              className="relative"
              style={{
                width: ingot.size,
                height: ingot.size * 0.7,
                background: 'linear-gradient(135deg, #FFD700, #FFA500, #FFD700, #FFC107)',
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                border: '4px solid #FFB800',
                boxShadow: `
                  0 0 20px rgba(255,215,0,0.9),
                  0 0 40px rgba(255,165,0,0.6),
                  inset 0 -8px 20px rgba(180,120,0,0.6),
                  inset 0 8px 20px rgba(255,255,200,0.8)
                `,
              }}
            >
              {/* 元宝上的刻字 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span 
                  className="text-black font-black text-shadow"
                  style={{ 
                    fontSize: ingot.size * 0.3,
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  }}
                >
                  元宝
                </span>
              </div>
              
              {/* 显示这个元宝多少橘子 */}
              <motion.div
                className="absolute -top-5 left-1/2 -translate-x-1/2 bg-red-600 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-lg border border-yellow-300"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: ingot.delay }}
              >
                +{ingot.points}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

// 元宝收集完成后的爆炸特效
export function IngotCollectEffect({ collectedPoints }: { collectedPoints: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 pointer-events-none z-40"
    >
      {/* 金光万丈全屏闪 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.8, 0] }}
        transition={{ duration: 0.7 }}
        className="absolute inset-0"
        style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.8), transparent 70%)' }}
      />

      {/* 中央大字！ */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 3, 2.3], opacity: [0, 1, 0] }}
        transition={{ duration: 1.2 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="text-center">
          <div className="text-9xl">💰</div>
          <div className="text-6xl font-black text-yellow-300 drop-shadow-2xl mt-4">
            橘子大丰收！！
          </div>
          <div className="text-3xl text-yellow-100 font-bold mt-2">
            总共获得 +{collectedPoints} 橘子！🍊
          </div>
        </div>
      </motion.div>

      {/* 全屏幕撒金元宝粒子！80个！ */}
      {Array.from({ length: 80 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: '50%',
            y: '50%',
            scale: 0,
            opacity: 0,
            rotate: 0,
          }}
          animate={{
            x: `${50 + (Math.random() - 0.5) * 170}%`,
            y: `${50 + (Math.random() - 0.5) * 170}%`,
            scale: [0, 1.5, 0.8, 0],
            opacity: [1, 1, 0.5, 0],
            rotate: Math.random() * 720 - 360,
          }}
          transition={{
            duration: 1.5,
            delay: Math.random() * 0.6,
            ease: 'easeOut',
          }}
          className="absolute text-4xl"
        >
          💰
        </motion.div>
      ))}
    </motion.div>
  )
}
