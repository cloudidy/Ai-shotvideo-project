// 弹幕数据加载工具
// 从 API 获取真实弹幕数据，用于视频播放时的弹幕展示

// ========== 类型定义 ==========

export interface DanmakuItem {
  id: string
  time: number   // 秒
  content: string
  likes: number
}

export interface DanmakuResponse {
  danmakus: DanmakuItem[]
  total: number
  dramaId: string
  episodeId: number
}

// ========== API 请求 ==========

// 缓存已加载的数据
const cache = new Map<string, DanmakuItem[]>()

/**
 * 从 API 获取弹幕数据
 * @param dramaId 剧集 ID（如 'tianxia'）
 * @param episodeId 集数（如 1）
 * @returns 弹幕数据数组，失败返回空数组
 */
export async function fetchDanmaku(
  dramaId: string,
  episodeId: number
): Promise<DanmakuItem[]> {
  const cacheKey = `${dramaId}/${episodeId}`

  // 检查缓存
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!
  }

  try {
    const response = await fetch(`/api/danmaku/${dramaId}/${episodeId}`)

    if (!response.ok) {
      console.warn(`获取弹幕数据失败: ${response.status} ${response.statusText}`)
      return []
    }

    const data: DanmakuResponse = await response.json()
    const danmakus: DanmakuItem[] = (data.danmakus || []).map((d: any, i: number) => ({
      id: `dm-${dramaId}-${episodeId}-${i}`,
      time: d.time,
      content: d.text ?? d.content ?? '',
      likes: d.likes ?? 0,
    }))

    // 存入缓存
    cache.set(cacheKey, danmakus)

    return danmakus
  } catch (error) {
    console.error('请求弹幕数据出错:', error)
    return []
  }
}

/**
 * 清除缓存
 */
export function clearDanmakuCache() {
  cache.clear()
}

/**
 * 获取指定时间窗口内的弹幕
 * @param danmakus 全部弹幕数据
 * @param currentTime 当前播放时间（秒）
 * @param windowSize 窗口大小（秒），默认 3 秒
 * @returns 窗口内的弹幕
 */
export function getDanmakusInWindow(
  danmakus: DanmakuItem[],
  currentTime: number,
  windowSize: number = 3
): DanmakuItem[] {
  const start = currentTime - windowSize / 2
  const end = currentTime + windowSize / 2
  return danmakus.filter(d => d.time >= start && d.time < end)
}

/**
 * 获取弹幕密度最高的时间窗口（用于定位高潮点）
 * @param danmakus 全部弹幕数据
 * @param windowSize 窗口大小（秒），默认 30 秒
 * @param topN 返回前 N 个热点
 * @returns 按弹幕数量排序的时间窗口
 */
export function getDanmakuHotspots(
  danmakus: DanmakuItem[],
  windowSize: number = 30,
  topN: number = 5
): Array<{ startTime: number; endTime: number; count: number; topTexts: string[] }> {
  if (danmakus.length === 0) return []

  const maxTime = Math.max(...danmakus.map(d => d.time))
  const windows: Map<number, DanmakuItem[]> = new Map()

  // 按窗口分组
  for (const d of danmakus) {
    const windowStart = Math.floor(d.time / windowSize) * windowSize
    if (!windows.has(windowStart)) {
      windows.set(windowStart, [])
    }
    windows.get(windowStart)!.push(d)
  }

  // 排序取 Top N
  const results = Array.from(windows.entries())
    .map(([start, items]) => ({
      startTime: start,
      endTime: start + windowSize,
      count: items.length,
      topTexts: items
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 5)
        .map(d => d.content),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN)

  return results
}
