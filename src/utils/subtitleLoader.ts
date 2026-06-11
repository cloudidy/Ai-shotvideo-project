// 字幕加载工具 - 支持多部剧集
export interface SubtitleSegment {
  id: number
  start: number
  end: number
  text: string
}

export interface SubtitleData {
  text: string
  segments: SubtitleSegment[]
  language: string
}

// 剧集 ID → 字幕目录名映射
const DRAMA_SUBTITLE_MAP: Record<string, string> = {
  tianxia: '天下第一纨绔',
  naisui: '十八岁太奶奶驾到',
  lihun: '幸得相遇离婚时',
  beipai: '北派寻宝日记',
}

// 获取字幕基础路径
function getSubtitleBasePath(dramaId: string): string {
  const dirName = DRAMA_SUBTITLE_MAP[dramaId]
  if (!dirName) {
    console.warn(`未知的剧集 ID: ${dramaId}，使用默认路径`)
    return `/subtitles/${dramaId}`
  }
  return `/subtitles/${dirName}`
}

// 加载字幕JSON文件
export async function loadSubtitle(dramaId: string, episode: string): Promise<SubtitleData> {
  const basePath = getSubtitleBasePath(dramaId)
  const response = await fetch(`${basePath}/${episode}.json`)
  if (!response.ok) {
    throw new Error(`Failed to load subtitle for ${dramaId} ${episode}`)
  }
  return response.json()
}

// 加载SRT文件并解析
export async function loadSRT(dramaId: string, episode: string): Promise<SubtitleSegment[]> {
  const basePath = getSubtitleBasePath(dramaId)
  const response = await fetch(`${basePath}/${episode}.srt`)
  if (!response.ok) {
    throw new Error(`Failed to load SRT for ${dramaId} ${episode}`)
  }

  const text = await response.text()
  return parseSRT(text)
}

// 解析SRT格式
function parseSRT(srtContent: string): SubtitleSegment[] {
  const segments: SubtitleSegment[] = []
  const blocks = srtContent.trim().split('\n\n')

  for (const block of blocks) {
    const lines = block.split('\n')
    if (lines.length >= 3) {
      const id = parseInt(lines[0])
      const timeMatch = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/)

      if (timeMatch) {
        const start = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + parseInt(timeMatch[3]) + parseInt(timeMatch[4]) / 1000
        const end = parseInt(timeMatch[5]) * 3600 + parseInt(timeMatch[6]) * 60 + parseInt(timeMatch[7]) + parseInt(timeMatch[8]) / 1000
        const text = lines.slice(2).join(' ').trim()

        segments.push({ id, start, end, text })
      }
    }
  }

  return segments
}

// 获取指定时间点的字幕
export function getSubtitleAtTime(segments: SubtitleSegment[], time: number): SubtitleSegment | null {
  return segments.find(seg => time >= seg.start && time <= seg.end) || null
}

// 获取时间范围内的字幕
export function getSubtitlesInRange(segments: SubtitleSegment[], startTime: number, endTime: number): SubtitleSegment[] {
  return segments.filter(seg => seg.end >= startTime && seg.start <= endTime)
}

// 搜索字幕内容
export function searchSubtitle(segments: SubtitleSegment[], keyword: string): SubtitleSegment[] {
  return segments.filter(seg => seg.text.includes(keyword))
}

// 获取所有字幕文本
export function getFullText(segments: SubtitleSegment[]): string {
  return segments.map(seg => seg.text).join('')
}
