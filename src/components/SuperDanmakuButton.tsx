'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface SuperDanmakuProps {
  onClick: () => void
  clickCount: number
  maxClicks: number
  characterName?: string
  variant?: 'heart' | 'jade'
}

export default function SuperDanmakuButton({
  onClick,
  clickCount,
  maxClicks,
  characterName = '柳如烟',
  variant = 'heart',
}: SuperDanmakuProps) {
  const progress = Math.min((clickCount / maxClicks) * 100, 100)
  const currentScale = 1 + (progress / 100) * 2.5

  // 颜色配置
  const colors = variant === 'jade'
    ? { primary: '#FFD700', secondary: '#FFA500', glow: 'rgba(255,215,0,0.6)', glow2: 'rgba(255,165,0,0.4)', border: '#FFD700', text: '#FFF8DC', subtitle: '✨ 太奶奶驾到 ✨', barFrom: '#FFD700', barTo: '#FF8C00', label: '🔥 气场值' }
    : { primary: '#FF69B4', secondary: '#FF1493', glow: 'rgba(255,105,180,0.6)', glow2: 'rgba(255,182,193,0.4)', border: '#FFD700', text: '#FFFFFF', subtitle: '💕 女神登场 💕', barFrom: '#FF69B4', barTo: '#FFD700', label: '💖 粉丝激动值' }

  // 心形 clipPath
  const heartClip = 'polygon(50% 15%, 65% 0%, 85% 5%, 100% 20%, 100% 50%, 50% 100%, 0% 50%, 0% 20%, 15% 5%, 35% 0%)'

  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    angle: (i * Math.PI * 2) / 24,
    delay: Math.random() * 0.3,
    text: variant === 'jade'
      ? ['太奶奶！', '霸气！', '威武！', '驾到！', '厉害！', '牛！', '服了！', '女王！'][i % 8]
      : ['啊啊啊！', '柳如烟！', '我爱你！', '女神！', '如烟！', '太美了！', '啊啊啊！', '登场！'][i % 8],
  }))

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      {/* 飞散粒子 */}
      <AnimatePresence>
        {clickCount > 0 && (
          <>
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute whitespace-nowrap font-bold pointer-events-none"
                style={{
                  top: '50%', left: '50%',
                  color: variant === 'jade'
                    ? ['#FFD700', '#FFA500', '#FFFFFF', '#FF8C00'][p.id % 4]
                    : ['#FF69B4', '#FFB6C1', '#FFD700', '#FF6347'][p.id % 4],
                  fontSize: '18px',
                  textShadow: `0 0 10px ${colors.glow}`,
                }}
                initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                animate={{
                  x: Math.cos(p.angle) * (120 + progress * 1.5),
                  y: Math.sin(p.angle) * (120 + progress * 1.5),
                  scale: 1 + Math.random(),
                  opacity: 1,
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.8, delay: p.delay, type: 'spring' }}
              >
                {p.text}
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* 主按钮 */}
      <motion.button
        onClick={onClick}
        whileTap={{ scale: 0.92 }}
        className="relative cursor-pointer select-none"
        style={{ width: 160 * currentScale, height: 160 * currentScale }}
      >
        {/* 光晕1 */}
        <motion.div
          className="absolute inset-[-20px] rounded-full"
          style={{ background: `radial-gradient(circle, ${colors.glow}, transparent)` }}
          animate={{ scale: [1, 1 + progress * 0.015, 1], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        {/* 光晕2 */}
        <motion.div
          className="absolute inset-[-40px] rounded-full"
          style={{ background: `radial-gradient(circle, ${colors.glow2}, transparent)` }}
          animate={{ scale: [1, 1.2 + progress * 0.008, 1], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: 0.4 }}
        />

        {/* 按钮主体 */}
        {variant === 'jade' ? (
          /* 玉佩造型 - 圆形金盘 */
          <>
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary}, #B8860B)`,
                boxShadow: `0 0 ${40 + progress}px rgba(255,215,0,0.8), 0 0 ${80 + progress * 2}px rgba(255,165,0,0.4)`,
                border: '4px solid #FFD700',
              }}
              animate={{ rotate: [0, -3, 3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {/* 龙纹装饰圈 */}
            <motion.div
              className="absolute inset-4 rounded-full"
              style={{ border: '3px solid rgba(255,255,255,0.4)' }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-8 rounded-full"
              style={{ border: '2px solid rgba(255,255,255,0.2)' }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          </>
        ) : (
          /* 心形造型 */
          <>
            <motion.div
              className="absolute inset-0"
              style={{
                clipPath: heartClip,
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary}, #FFB6C1, ${colors.primary})`,
                boxShadow: `0 0 ${40 + progress}px rgba(255,105,180,0.8), 0 0 ${80 + progress * 2}px rgba(255,182,193,0.4)`,
              }}
              animate={{ rotate: [0, -3, 3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-3"
              style={{ clipPath: heartClip, border: `3px solid ${colors.border}` }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </>
        )}

        {/* 中心文字 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-black drop-shadow-2xl"
            style={{
              fontSize: 24 + (progress / 100) * 30,
              color: colors.text,
              textShadow: `0 0 20px rgba(255,255,255,0.8), 0 0 40px ${colors.glow}`,
            }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            {characterName}
          </motion.span>
          {progress > 30 && (
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-bold mt-2"
              style={{ fontSize: 12 + (progress / 100) * 8, color: variant === 'jade' ? '#FFF8DC' : '#FFFFE0' }}
            >
              {colors.subtitle}
            </motion.span>
          )}
        </div>
      </motion.button>

      {/* 底部进度条 */}
      <motion.div
        className="mt-4 bg-black/70 backdrop-blur-sm rounded-xl px-6 py-3"
        style={{ border: `1px solid ${variant === 'jade' ? 'rgba(255,215,0,0.5)' : 'rgba(255,105,180,0.5)'}` }}
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-sm font-bold text-center" style={{ color: variant === 'jade' ? '#FFD700' : '#FF69B4' }}>
          {colors.label}: {Math.floor(progress)}%
        </p>
        <div className="w-full h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${colors.barFrom}, ${colors.barTo})` }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}
