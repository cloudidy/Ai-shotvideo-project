'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useMemo } from 'react'

interface AncientButtonProps {
  onClick: () => void
  clickCount: number
  maxClicks: number
  type: 'hit-face' | 'upgrade' | 'revenge' | 'sweet' | 'justice' | 'system'
  keyword?: string
}

// 点击时文字粒子飞出效果
function KeywordParticles({ keyword, clickCount }: { keyword: string; clickCount: number }) {
  // 每次 clickCount 变化时生成新粒子
  const particles = useMemo(() => {
    if (clickCount <= 0) return []
    return Array.from({ length: 12 }, (_, i) => ({
      id: `${clickCount}-${i}`,
      angle: (i * Math.PI * 2) / 12,
      delay: Math.random() * 0.2,
    }))
  }, [clickCount])

  if (!keyword || clickCount <= 0) return null

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-50">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute whitespace-nowrap font-bold pointer-events-none"
            style={{
              top: '50%',
              left: '50%',
              color: ['#FFD700', '#FF6B6B', '#FFFFFF', '#FF69B4'][p.id.charCodeAt(p.id.length - 1) % 4],
              fontSize: '16px',
              textShadow: '0 0 10px rgba(255,215,0,0.8)',
            }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            animate={{
              x: Math.cos(p.angle) * (100 + Math.random() * 60),
              y: Math.sin(p.angle) * (100 + Math.random() * 60),
              scale: [0, 1.3, 0],
              opacity: [0, 1, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: p.delay, ease: 'easeOut' }}
          >
            {keyword}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// 打脸按钮 - 铁拳/虎头盾牌形状
export const HitFaceButton = ({ onClick, clickCount, maxClicks, keyword }: AncientButtonProps) => {
  const progress = (clickCount / maxClicks) * 100
  return (
    <div className="relative">
      <KeywordParticles keyword={keyword || '打脸'} clickCount={clickCount} />
      <motion.button
        onClick={onClick}
        whileTap={{ scale: 0.85 }}
        className="relative w-36 h-36 cursor-pointer select-none"
        style={{
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          background: 'linear-gradient(135deg, #DC2626, #7F1D1D, #B91C1C)',
        }}
      >
        <motion.div className="absolute inset-2" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', border: '3px solid #F59E0B' }} animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.8, repeat: Infinity }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span className="text-5xl" animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 0.3, repeat: Infinity }}>👊</motion.span>
          <span className="text-white text-lg font-black mt-1 drop-shadow-lg">{keyword || '打脸'}</span>
        </div>
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="72" cy="72" r="60" stroke="#374151" strokeWidth="4" fill="none" />
          <motion.circle cx="72" cy="72" r="60" stroke="#EF4444" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray={`${progress * 3.77} 377`} />
        </svg>
      </motion.button>
    </div>
  )
}

// 升级按钮 - 古剑/宝剑形状
export const UpgradeButton = ({ onClick, clickCount, maxClicks, keyword }: AncientButtonProps) => {
  const progress = (clickCount / maxClicks) * 100
  return (
    <div className="relative">
      <KeywordParticles keyword={keyword || '升级'} clickCount={clickCount} />
      <motion.button
        onClick={onClick}
        whileTap={{ scale: 0.85, rotate: 5 }}
        className="relative w-32 h-40 cursor-pointer select-none"
        style={{ clipPath: 'polygon(50% 0%, 70% 15%, 70% 60%, 85% 70%, 70% 75%, 70% 100%, 30% 100%, 30% 75%, 15% 70%, 30% 60%, 30% 15%)', background: 'linear-gradient(180deg, #F59E0B, #D97706, #92400E)' }}
      >
        <motion.div className="absolute inset-2" style={{ clipPath: 'polygon(50% 0%, 70% 15%, 70% 60%, 85% 70%, 70% 75%, 70% 100%, 30% 100%, 30% 75%, 15% 70%, 30% 60%, 30% 15%)', border: '2px solid #FCD34D' }} animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 1, repeat: Infinity }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
          <motion.span className="text-4xl" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>⚔️</motion.span>
          <span className="text-black text-lg font-black mt-1">{keyword || '升级'}</span>
        </div>
      </motion.button>
    </div>
  )
}

// 复仇按钮 - 玉玺/虎符形状
export const RevengeButton = ({ onClick, clickCount, maxClicks, keyword }: AncientButtonProps) => {
  return (
    <div className="relative">
      <KeywordParticles keyword={keyword || '复仇'} clickCount={clickCount} />
      <motion.button
        onClick={onClick}
        whileTap={{ scale: 0.85 }}
        className="relative w-36 h-32 cursor-pointer select-none rounded-lg"
        style={{ background: 'linear-gradient(135deg, #7F1D1D, #991B1B, #B91C1C)', border: '4px solid #F59E0B' }}
      >
        <motion.div className="absolute inset-1 rounded-md" animate={{ boxShadow: ['0 0 20px #DC2626', '0 0 50px #EF4444', '0 0 20px #DC2626'] }} transition={{ duration: 0.8, repeat: Infinity }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span className="text-5xl" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.4, repeat: Infinity }}>🔥</motion.span>
          <span className="text-yellow-300 text-lg font-black mt-1 drop-shadow-lg">{keyword || '复仇'}</span>
        </div>
      </motion.button>
    </div>
  )
}

// 甜宠按钮 - 玉佩/花朵形状
export const SweetButton = ({ onClick, clickCount, maxClicks, keyword }: AncientButtonProps) => {
  return (
    <div className="relative">
      <KeywordParticles keyword={keyword || '甜宠'} clickCount={clickCount} />
      <motion.button
        onClick={onClick}
        whileTap={{ scale: 0.85 }}
        className="relative w-36 h-36 cursor-pointer select-none"
        style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', background: 'linear-gradient(135deg, #EC4899, #F472B6, #FBCFE8)' }}
      >
        <motion.div className="absolute inset-3" style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', border: '2px solid #F9A8D4' }} animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.9, repeat: Infinity }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span className="text-5xl" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.7, repeat: Infinity }}>💕</motion.span>
          <span className="text-white text-lg font-black mt-1">{keyword || '甜宠'}</span>
        </div>
      </motion.button>
    </div>
  )
}

// 审判按钮 - 古代铜镜/圆形令牌
export const JusticeButton = ({ onClick, clickCount, maxClicks, keyword }: AncientButtonProps) => {
  return (
    <div className="relative">
      <KeywordParticles keyword={keyword || '审判'} clickCount={clickCount} />
      <motion.button
        onClick={onClick}
        whileTap={{ scale: 0.85, rotate: 3 }}
        className="relative w-36 h-36 cursor-pointer select-none"
        style={{ borderRadius: '50%', background: 'radial-gradient(circle, #FCD34D, #F59E0B, #B45309)', border: '6px solid #92400E' }}
      >
        <motion.div className="absolute top-3 left-3 w-12 h-12 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.8), transparent)' }} animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span className="text-5xl" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1, repeat: Infinity }}>⚖️</motion.span>
          <span className="text-black text-lg font-black mt-1">{keyword || '审判'}</span>
        </div>
      </motion.button>
    </div>
  )
}

// 系统按钮 - 龙纹令牌形状
export const SystemButton = ({ onClick, clickCount, maxClicks, keyword }: AncientButtonProps) => {
  const progress = (clickCount / maxClicks) * 100
  return (
    <div className="relative">
      <KeywordParticles keyword={keyword || '系统'} clickCount={clickCount} />
      <motion.button
        onClick={onClick}
        whileTap={{ scale: 0.85 }}
        className="relative w-28 h-40 cursor-pointer select-none"
        style={{ borderRadius: '8px 8px 0 0', background: 'linear-gradient(180deg, #0891B2, #0E7490, #155E75)', border: '3px solid #22D3EE' }}
      >
        <motion.div className="absolute bottom-0 left-0 right-0" style={{ backgroundColor: '#22D3EE', height: `${progress}%` }} animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span className="text-5xl" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity }}>💻</motion.span>
          <span className="text-cyan-100 text-lg font-black mt-1">{keyword || '系统'}</span>
        </div>
      </motion.button>
    </div>
  )
}

// 主组件 - 根据类型自动选择对应的异形按钮
export default function AncientStyleButton(props: AncientButtonProps) {
  const { type } = props
  switch (type) {
    case 'hit-face': return <HitFaceButton {...props} />
    case 'upgrade': return <UpgradeButton {...props} />
    case 'revenge': return <RevengeButton {...props} />
    case 'sweet': return <SweetButton {...props} />
    case 'justice': return <JusticeButton {...props} />
    case 'system': return <SystemButton {...props} />
    default: return <HitFaceButton {...props} />
  }
}
