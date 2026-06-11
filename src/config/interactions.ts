import { VideoConfig, InteractionPoint } from '@/types'
import { getHighlights, interactionEmojis } from './highlights'

// 各类型互动的特效配置
export const interactionEffects = {
  'hit-face': {
    emoji: '👊',
    title: '打脸',
    colors: ['#ff6600', '#ff0000', '#ff3300'],
    flashColor: '#ff0000',
  },
  'upgrade': {
    emoji: '⬆️',
    title: '升级',
    colors: ['#00ff00', '#00cc00', '#00ff66'],
    flashColor: '#00ff00',
  },
  'revenge': {
    emoji: '🔥',
    title: '复仇',
    colors: ['#ff0000', '#cc0000', '#ff3366'],
    flashColor: '#ff0000',
  },
  'sweet': {
    emoji: '💕',
    title: '撒糖',
    colors: ['#ff69b4', '#ff1493', '#ff69b4'],
    flashColor: '#ff69b4',
  },
  'justice': {
    emoji: '⚖️',
    title: '审判',
    colors: ['#ffd700', '#ffaa00', '#ff8800'],
    flashColor: '#ffd700',
  },
  'system': {
    emoji: '💻',
    title: '系统',
    colors: ['#00ffff', '#0088ff', '#00ccff'],
    flashColor: '#00ffff',
  },
  'super-danmaku-liuyanru': {
    emoji: '💖',
    title: '柳如烟登场',
    colors: ['#FF69B4', '#FF1493', '#FFD700'],
    flashColor: '#FF69B4',
    characterName: '柳如烟',
  },
  'gold-ingot-hunt': {
    emoji: '💰',
    title: '元宝大寻宝',
    colors: ['#FFD700', '#FFA500', '#FFD700'],
    flashColor: '#FFD700',
  },
  'liuyanru-entrance': {
    emoji: '👸',
    title: '柳如烟出场',
    colors: ['#FF69B4', '#FF1493', '#FFD700', '#FF69B4'],
    flashColor: '#FF69B4',
    characterName: '柳如烟',
  },
  'protagonist-reverse': {
    emoji: '😤',
    title: '主角逆袭',
    colors: ['#FF4500', '#FF6347', '#FFD700'],
    flashColor: '#FF4500',
  },
  'emperor-rage': {
    emoji: '👑',
    title: '帝王震怒',
    colors: ['#8B0000', '#DC143C', '#FFD700'],
    flashColor: '#8B0000',
  },
  'challenge-accept': {
    emoji: '⚔️',
    title: '接受挑战',
    colors: ['#FF4500', '#FF0000', '#FFD700'],
    flashColor: '#FF4500',
  },
}

// 互动类型列表
const interactionTypes: Array<keyof typeof interactionEffects> = [
  'hit-face', 'upgrade', 'revenge', 'sweet', 'justice', 'system'
]

// 根据视频时长自动生成互动点（通用版本）
export function generateInteractionPoints(duration: number): InteractionPoint[] {
  const points: InteractionPoint[] = []

  // 每30秒出现一个按钮，第一个在10秒后
  const interval = 30 // 30秒间隔
  const firstPoint = 10 // 第一个在10秒
  const buttonDuration = 8 // 按钮持续8秒

  let time = firstPoint
  let index = 0

  while (time < duration - 10) { // 距离结尾10秒内不触发
    const type = interactionTypes[index % interactionTypes.length]
    const effect = interactionEffects[type]

    points.push({
      id: `interaction-${index}`,
      time: time,
      type: type,
      title: `助力${effect.title}`,
      requiredClicks: 12, // 8秒内轻松完成
      duration: buttonDuration, // 按钮持续时间
      reward: {
        score: 100 + (index * 20),
        effect: `${effect.title}特效`,
        sound: '/sounds/hit.mp3',
      },
    })

    time += interval
    index++
  }

  return points
}

// 互动类型映射到系统类型
export const interactionTypeMap: Record<string, keyof typeof interactionEffects> = {
  '打脸': 'hit-face',
  '升级': 'upgrade',
  '复仇': 'revenge',
  '撒糖': 'sweet',
  '审判': 'justice',
  '系统': 'system',
  '其他': 'system',  // 默认用系统类型
  '超级弹幕-柳如烟': 'super-danmaku-liuyanru', // 柳如烟超级弹幕专属类型
  '元宝寻宝': 'gold-ingot-hunt', // 元宝大寻宝类型
  '柳如烟出场': 'liuyanru-entrance', // 柳如烟出场专属类型
  '主角逆袭': 'protagonist-reverse', // 主角逆袭类型
  '帝王震怒': 'emperor-rage', // 帝王震怒类型
  '接受挑战': 'challenge-accept', // 接受挑战类型
}

// 根据高光点配置生成互动点
export function generateInteractionPointsFromHighlights(
  dramaId: string,
  episodeName: string,
  duration: number
): InteractionPoint[] {
  const highlights = getHighlights(dramaId, episodeName)

  // 如果没有高光点配置，使用默认的每30秒生成
  if (highlights.length === 0) {
    return generateInteractionPoints(duration)
  }

  const buttonDuration = 8 // 按钮持续8秒

  return highlights.map((h, index) => {
    const type = interactionTypeMap[h.interactionType] || 'system'
    const effect = interactionEffects[type]

    return {
      id: `highlight-${index}`,
      time: h.time,
      type: type,
      title: `助力${effect.title}`,
      requiredClicks: 12,
      duration: buttonDuration,
      reward: {
        score: 100 + (index * 20),
        effect: `${effect.title}特效`,
        sound: '/sounds/hit.mp3',
      },
    }
  })
}

// 默认配置（会根据实际视频时长动态生成）
export const defaultInteractionConfig: VideoConfig = {
  url: '/video/北派寻宝日记/第63集.mp4',
  interactionPoints: [], // 空数组，运行时根据视频时长生成
  hitEffect: {
    shakeIntensity: 10,
    flashColor: '#ff6600',
    duration: 500,
    soundUrl: '/sounds/hit.mp3',
  },
}
