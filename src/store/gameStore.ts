import { create } from 'zustand'

interface Achievement {
  id: string
  title: string
  description: string
  emoji: string
  unlocked: boolean
  unlockedAt?: number
}

interface GameState {
  // 积分
  totalScore: number
  addScore: (score: number) => void

  // 互动统计
  interactionCount: Record<string, number>
  incrementInteraction: (type: string) => void

  // 成就系统
  achievements: Achievement[]
  unlockAchievement: (id: string) => void

  // 连击系统
  comboCount: number
  maxCombo: number
  lastClickTime: number
  incrementCombo: () => void
  resetCombo: () => void

  // 等级系统
  level: number
  updateLevel: () => void

  // 重置
  resetGame: () => void
}

// 成就列表
const defaultAchievements: Achievement[] = [
  {
    id: 'first-hit',
    title: '初出茅庐',
    description: '第一次完成打脸',
    emoji: '👊',
    unlocked: false,
  },
  {
    id: 'hit-master',
    title: '打脸大师',
    description: '完成10次打脸',
    emoji: '🏆',
    unlocked: false,
  },
  {
    id: 'upgrade-king',
    title: '升级之王',
    description: '完成5次升级',
    emoji: '👑',
    unlocked: false,
  },
  {
    id: 'revenge-angel',
    title: '复仇天使',
    description: '完成3次复仇',
    emoji: '😈',
    unlocked: false,
  },
  {
    id: 'sweet-lover',
    title: '甜蜜恋人',
    description: '完成5次撒糖',
    emoji: '💑',
    unlocked: false,
  },
  {
    id: 'justice-judge',
    title: '正义法官',
    description: '完成3次审判',
    emoji: '⚖️',
    unlocked: false,
  },
  {
    id: 'system-master',
    title: '系统掌控者',
    description: '激活3次系统',
    emoji: '💻',
    unlocked: false,
  },
  {
    id: 'combo-10',
    title: '连击新手',
    description: '达到10连击',
    emoji: '🔥',
    unlocked: false,
  },
  {
    id: 'combo-50',
    title: '连击大师',
    description: '达到50连击',
    emoji: '💥',
    unlocked: false,
  },
  {
    id: 'score-1000',
    title: '积分破千',
    description: '累计获得1000积分',
    emoji: '⭐',
    unlocked: false,
  },
  {
    id: 'score-10000',
    title: '积分破万',
    description: '累计获得10000积分',
    emoji: '🌟',
    unlocked: false,
  },
  {
    id: 'all-types',
    title: '全能玩家',
    description: '体验所有类型的互动',
    emoji: '🎯',
    unlocked: false,
  },
]

const initialState = {
  totalScore: 0,
  interactionCount: {},
  achievements: defaultAchievements,
  comboCount: 0,
  maxCombo: 0,
  lastClickTime: 0,
  level: 1,
}

export const useGameStore = create<GameState>()((set, get) => ({
  ...initialState,

  addScore: (score: number) => {
    set((state) => {
      const newTotal = state.totalScore + score
      const newLevel = Math.floor(Math.sqrt(newTotal / 100)) + 1
      return { totalScore: newTotal, level: newLevel }
    })
    const newTotal = get().totalScore
    if (newTotal >= 1000) get().unlockAchievement('score-1000')
    if (newTotal >= 10000) get().unlockAchievement('score-10000')
  },

  incrementInteraction: (type: string) => {
    let newCount = 0
    set((state) => {
      newCount = (state.interactionCount[type] || 0) + 1
      return { interactionCount: { ...state.interactionCount, [type]: newCount } }
    })
    if (type === 'hit-face') {
      if (newCount >= 1) get().unlockAchievement('first-hit')
      if (newCount >= 10) get().unlockAchievement('hit-master')
    }
    if (type === 'upgrade' && newCount >= 5) get().unlockAchievement('upgrade-king')
    if (type === 'revenge' && newCount >= 3) get().unlockAchievement('revenge-angel')
    if (type === 'sweet' && newCount >= 5) get().unlockAchievement('sweet-lover')
    if (type === 'justice' && newCount >= 3) get().unlockAchievement('justice-judge')
    if (type === 'system' && newCount >= 3) get().unlockAchievement('system-master')
    const types = Object.keys(get().interactionCount)
    if (types.length >= 6) get().unlockAchievement('all-types')
  },

  achievements: defaultAchievements,
  unlockAchievement: (id: string) => {
    set((state) => ({
      achievements: state.achievements.map((a) =>
        a.id === id && !a.unlocked ? { ...a, unlocked: true, unlockedAt: Date.now() } : a
      ),
    }))
  },

  comboCount: 0,
  maxCombo: 0,
  lastClickTime: 0,
  incrementCombo: () => {
    const now = Date.now()
    const timeDiff = now - get().lastClickTime
    if (timeDiff > 1000) {
      set({ comboCount: 1, lastClickTime: now })
    } else {
      set((state) => {
        const newCombo = state.comboCount + 1
        const newMax = Math.max(newCombo, state.maxCombo)
        if (newCombo >= 10) get().unlockAchievement('combo-10')
        if (newCombo >= 50) get().unlockAchievement('combo-50')
        return { comboCount: newCombo, maxCombo: newMax, lastClickTime: now }
      })
    }
  },
  resetCombo: () => set({ comboCount: 0 }),

  level: 1,
  updateLevel: () => {
    const score = get().totalScore
    set({ level: Math.floor(Math.sqrt(score / 100)) + 1 })
  },

  resetGame: () => set(initialState),
}))
