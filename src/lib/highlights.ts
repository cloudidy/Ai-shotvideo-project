// 高光点数据加载工具
// 统一从 API 获取高光点数据，替代之前的静态 import 方式

// ========== 类型定义 ==========

export interface HighlightMetadata {
  likesCount: number
  keyDialogue: string
  climaxType: string
}

export interface HighlightInteraction {
  requiredClicks: number
  duration: number
  reward: number
  effect: string
  sound: string
}

export interface HighlightPoint {
  id: string
  startTime: number
  endTime: number
  type: 'opening' | 'climax' | 'closing'
  interactionType: string
  emoji: string
  label: string
  title: string
  description: string
  intensity: number
  interaction: HighlightInteraction
  metadata: HighlightMetadata
}

export interface EpisodeHighlights {
  dramaId: string
  dramaName: string
  episodeId: number
  episodeName: string
  duration: number
  videoUrl: string
  generatedAt: string
  analysisMethod: string
  highlights: HighlightPoint[]
}

// ========== API 请求 ==========

// 缓存已加载的数据，避免重复请求
const cache = new Map<string, EpisodeHighlights>()

/**
 * 从 API 获取高光点数据
 * @param dramaId 剧集 ID（如 'tianxia'）
 * @param episodeId 集数（如 1）
 * @returns 高光点数据，失败返回 null
 */
export async function fetchHighlights(
  dramaId: string,
  episodeId: number
): Promise<EpisodeHighlights | null> {
  const cacheKey = `${dramaId}/${episodeId}`

  // 检查缓存
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!
  }

  try {
    const response = await fetch(`/api/highlights/${dramaId}/${episodeId}`)

    if (!response.ok) {
      console.warn(`获取高光点数据失败: ${response.status} ${response.statusText}`)
      return null
    }

    const data: EpisodeHighlights = await response.json()

    // 存入缓存
    cache.set(cacheKey, data)

    return data
  } catch (error) {
    console.error('请求高光点数据出错:', error)
    return null
  }
}

/**
 * 清除缓存（用于刷新数据）
 */
export function clearHighlightsCache() {
  cache.clear()
}

// ========== 工具函数 ==========

/**
 * 格式化秒数为 mm:ss
 */
export function formatTime(seconds: number): string {
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min}:${sec.toString().padStart(2, '0')}`
}

/**
 * 获取互动类型对应的 emoji
 */
export const interactionEmojis: Record<string, string> = {
  'liuyanru-entrance': '👸',
  'protagonist-reverse': '😤',
  'emperor-rage': '👑',
  'system': '💻',
  'challenge-accept': '⚔️',
  'hit-face': '👊',
  'upgrade': '⬆️',
  'revenge': '🔥',
  'sweet': '💕',
  'justice': '⚖️',
  'super-danmaku-liuyanru': '💖',
  'gold-ingot-hunt': '💰',
}

/**
 * 获取位置类型对应的标签
 */
export const typeLabels: Record<string, string> = {
  'opening': '🎬 开场',
  'climax': '🔥 高潮',
  'closing': '🔚 结尾',
}

/**
 * 获取强度对应的颜色
 */
export function getIntensityColor(intensity: number): string {
  if (intensity >= 9) return '#ef4444' // red
  if (intensity >= 7) return '#f97316' // orange
  if (intensity >= 5) return '#eab308' // yellow
  return '#22c55e' // green
}

/**
 * 将 API 返回的高光点数据转换为 VideoPlayer 需要的 InteractionPoint 格式
 * 保留特殊互动类型（不再折叠为通用类型）
 */
export function toInteractionPoints(highlights: HighlightPoint[]) {
  return highlights.map((h) => ({
    id: h.id,
    time: h.startTime,
    type: h.interactionType as any, // 保留原始类型，InteractionPoint 已支持所有类型
    title: h.title,
    requiredClicks: h.interaction.requiredClicks,
    duration: h.interaction.duration,
    reward: {
      score: h.interaction.reward,
      effect: h.interaction.effect,
      sound: h.interaction.sound,
    },
  }))
}
