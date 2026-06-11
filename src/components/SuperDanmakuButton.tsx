'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface SuperDanmakuProps {
  onClick: () => void
  clickCount: number
  maxClicks: number
  characterName?: string
}

export default function SuperDanmakuButton({ 
  onClick, 
  clickCount, 
  maxClicks, 
  characterName = '柳如烟' 
}: SuperDanmakuProps) {
  const progress = Math.min((clickCount / maxClicks) * 100, 100)
  
  // 计算当前按钮大小 (从 1 倍放大到 3.5 倍)
  const currentScale = 1 + (progress / 100) * 2.5
  
  // 生成从中心向外爆炸的随机弹幕粒子
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    angle: (i * Math.PI * 2) / 24,
    delay: Math.random() * 0.3,
    text: ['啊啊啊！', '柳如烟！', '我爱你！', '女神！', '如烟！', '太美了！', '啊啊啊！', '登场！'][i % 8]
  }))

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      {/* 从中心向外飞散的弹幕粒子 */}
      <AnimatePresence>
        {clickCount > 0 && (
          <>
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute whitespace-nowrap font-bold pointer-events-none"
                style={{
                  top: '50%',
                  left: '50%',
                  color: ['#FF69B4', '#FFB6C1', '#FFD700', '#FF6347'][p.id % 4],
                  fontSize: '18px',
                  textShadow: '0 0 10px rgba(255,105,180,0.8)'
                }}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  scale: 0, 
                  opacity: 0 
                }}
                animate={{ 
                  x: Math.cos(p.angle) * (120 + progress * 1.5),
                  y: Math.sin(p.angle) * (120 + progress * 1.5),
                  scale: 1 + Math.random(),
                  opacity: 1
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: p.delay,
                  type: 'spring'
                }}
              >
                {p.text}
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* 超级弹幕主按钮 - 粉色琉璃心形玉佩形状 */}
      <motion.button
        onClick={onClick}
        whileTap={{ scale: 0.92 }}
        className="relative cursor-pointer select-none"
        style={{
          width: 160 * currentScale,
          height: 160 * currentScale,
        }}
      >
        {/* 多层光晕，随着点击越来越强 */}
        <motion.div
          className="absolute inset-[-20px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,105,180,0.6), transparent)',
          }}
          animate={{
            scale: [1, 1 + progress * 0.015, 1],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        
        {/* 第二层光晕 */}
        <motion.div
          className="absolute inset-[-40px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,182,193,0.4), transparent)',
          }}
          animate={{
            scale: [1, 1.2 + progress * 0.008, 1],
            opacity: [0.2, 0.6, 0.2]
          }}
          transition={{ duration: 1.8, repeat: Infinity, delay: 0.4 }}
        />

        {/* 心形按钮主体 */}
        <motion.div
          className="absolute inset-0"
          style={{
            clipPath: 'polygon(50% 15%, 65% 0%, 85% 5%, 100% 20%, 100% 50%, 50% 100%, 0% 50%, 0% 20%, 15% 5%, 35% 0%)',
            background: 'linear-gradient(135deg, #FF69B4, #FF1493, #FFB6C1, #FF69B4)',
            boxShadow: `0 0 ${40 + progress}px rgba(255,105,180,0.8), 0 0 ${80 + progress * 2}px rgba(255,182,193,0.4)`,
          }}
          animate={{
            rotate: [0, -3, 3, 0]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* 金色琉璃边框 */}
        <motion.div
          className="absolute inset-3"
          style={{
            clipPath: 'polygon(50% 15%, 65% 0%, 85% 5%, 100% 20%, 100% 50%, 50% 100%, 0% 50%, 0% 20%, 15% 5%, 35% 0%)',
            border: '3px solid #FFD700',
          }}
          animate={{
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 1, repeat: Infinity }}
        />

        {/* 中心文字 柳如烟 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-black text-white drop-shadow-2xl"
            style={{
              fontSize: 24 + (progress / 100) * 30,
              textShadow: '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,105,180,1)'
            }}
            animate={{
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            {characterName}
          </motion.span>
          
          {progress > 30 && (
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-yellow-200 font-bold mt-2"
              style={{ fontSize: 12 + (progress / 100) * 8 }}
            >
              💕 女神登场 💕
            </motion.span>
          )}
        </div>
      </motion.button>

      {/* 底部进度提示 */}
      <motion.div 
        className="mt-4 bg-black/70 backdrop-blur-sm rounded-xl px-6 py-3 border border-pink-500/50"
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-pink-300 text-sm font-bold text-center">
          💖 粉丝激动值: {Math.floor(progress)}% 💖
        </p>
        <div className="w-full h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
          <motion.div 
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #FF69B4, #FFD700)' }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}
