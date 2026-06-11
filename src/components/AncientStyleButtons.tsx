'use client'

import { motion } from 'framer-motion'

interface AncientButtonProps {
  onClick: () => void
  clickCount: number
  maxClicks: number
  type: 'hit-face' | 'upgrade' | 'revenge' | 'sweet' | 'justice' | 'system'
}

// 打脸按钮 - 铁拳/虎头盾牌形状
export const HitFaceButton = ({ onClick, clickCount, maxClicks }: AncientButtonProps) => {
  const progress = (clickCount / maxClicks) * 100
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.85 }}
      className="relative w-36 h-36 cursor-pointer select-none"
      style={{
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        background: 'linear-gradient(135deg, #DC2626, #7F1D1D, #B91C1C)',
      }}
    >
      {/* 金色边框光晕 */}
      <motion.div
        className="absolute inset-2"
        style={{
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          border: '3px solid #F59E0B',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="text-5xl" animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 0.3, repeat: Infinity }}>
          👊
        </motion.span>
        <span className="text-white text-sm font-black mt-1 drop-shadow-lg">打脸</span>
      </div>

      {/* 进度指示环 */}
      <svg className="absolute inset-0 w-full h-full -rotate-90">
        <circle cx="72" cy="72" r="60" stroke="#374151" strokeWidth="4" fill="none" />
        <motion.circle
          cx="72" cy="72" r="60" stroke="#EF4444" strokeWidth="4" fill="none"
          strokeLinecap="round"
          strokeDasharray={`${progress * 3.77} 377`}
        />
      </svg>
    </motion.button>
  )
}

// 升级按钮 - 古剑/宝剑形状
export const UpgradeButton = ({ onClick, clickCount, maxClicks }: AncientButtonProps) => {
  const progress = (clickCount / maxClicks) * 100
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.85, rotate: 5 }}
      className="relative w-32 h-40 cursor-pointer select-none"
      style={{
        clipPath: 'polygon(50% 0%, 70% 15%, 70% 60%, 85% 70%, 70% 75%, 70% 100%, 30% 100%, 30% 75%, 15% 70%, 30% 60%, 30% 15%)',
        background: 'linear-gradient(180deg, #F59E0B, #D97706, #92400E)',
      }}
    >
      <motion.div
        className="absolute inset-2"
        style={{
          clipPath: 'polygon(50% 0%, 70% 15%, 70% 60%, 85% 70%, 70% 75%, 70% 100%, 30% 100%, 30% 75%, 15% 70%, 30% 60%, 30% 15%)',
          border: '2px solid #FCD34D',
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
        <motion.span className="text-4xl" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>
          ⚔️
        </motion.span>
        <span className="text-black text-sm font-black mt-1">升级</span>
      </div>
    </motion.button>
  )
}

// 复仇按钮 - 玉玺/虎符形状
export const RevengeButton = ({ onClick, clickCount, maxClicks }: AncientButtonProps) => {
  const progress = (clickCount / maxClicks) * 100
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.85 }}
      className="relative w-36 h-32 cursor-pointer select-none rounded-lg"
      style={{
        background: 'linear-gradient(135deg, #7F1D1D, #991B1B, #B91C1C)',
        border: '4px solid #F59E0B',
      }}
    >
      {/* 龙纹边框 */}
      <motion.div
        className="absolute inset-1 rounded-md"
        animate={{ boxShadow: ['0 0 20px #DC2626', '0 0 50px #EF4444', '0 0 20px #DC2626'] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="text-5xl" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.4, repeat: Infinity }}>
          🔥
        </motion.span>
        <span className="text-yellow-300 text-sm font-black mt-1 drop-shadow-lg">复仇</span>
      </div>
    </motion.button>
  )
}

// 甜宠按钮 - 玉佩/花朵形状
export const SweetButton = ({ onClick, clickCount, maxClicks }: AncientButtonProps) => {
  const progress = (clickCount / maxClicks) * 100
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.85 }}
      className="relative w-36 h-36 cursor-pointer select-none"
      style={{
        clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
        background: 'linear-gradient(135deg, #EC4899, #F472B6, #FBCFE8)',
      }}
    >
      <motion.div
        className="absolute inset-3"
        style={{
          clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
          border: '2px solid #F9A8D4',
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 0.9, repeat: Infinity }}
      />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="text-5xl" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.7, repeat: Infinity }}>
          💕
        </motion.span>
        <span className="text-white text-sm font-black mt-1">甜宠</span>
      </div>
    </motion.button>
  )
}

// 审判按钮 - 古代铜镜/圆形令牌
export const JusticeButton = ({ onClick, clickCount, maxClicks }: AncientButtonProps) => {
  const progress = (clickCount / maxClicks) * 100
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.85, rotate: 3 }}
      className="relative w-36 h-36 cursor-pointer select-none"
      style={{
        borderRadius: '50%',
        background: 'radial-gradient(circle, #FCD34D, #F59E0B, #B45309)',
        border: '6px solid #92400E',
      }}
    >
      {/* 铜镜反光效果 */}
      <motion.div
        className="absolute top-3 left-3 w-12 h-12 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.8), transparent)' }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="text-5xl" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1, repeat: Infinity }}>
          ⚖️
        </motion.span>
        <span className="text-black text-sm font-black mt-1">审判</span>
      </div>
    </motion.button>
  )
}

// 系统按钮 - 龙纹令牌形状
export const SystemButton = ({ onClick, clickCount, maxClicks }: AncientButtonProps) => {
  const progress = (clickCount / maxClicks) * 100
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.85 }}
      className="relative w-28 h-40 cursor-pointer select-none"
      style={{
        borderRadius: '8px 8px 0 0',
        background: 'linear-gradient(180deg, #0891B2, #0E7490, #155E75)',
        border: '3px solid #22D3EE',
      }}
    >
      {/* 光效从下往上 */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        style={{ backgroundColor: '#22D3EE', height: `${progress}%` }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="text-5xl" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity }}>
          💻
        </motion.span>
        <span className="text-cyan-100 text-sm font-black mt-1">系统</span>
      </div>
    </motion.button>
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
