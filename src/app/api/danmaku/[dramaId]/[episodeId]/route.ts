import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

// 剧集 ID → CSV 文件名映射
const DRAMA_CSV_MAP: Record<string, string> = {
  tianxia: '天下第一纨绔_弹幕_已过滤.csv',
  naisui: '十八岁太奶奶驾到_弹幕_已过滤.csv',
  lihun: '幸得相遇离婚时_弹幕_已过滤.csv',
}

// 剧集 ID → CSV 中的剧名映射
const DRAMA_NAME_MAP: Record<string, string> = {
  tianxia: '天下第一纨绔',
  naisui: '十八岁太奶奶驾到，重整家族荣耀第三部',
  lihun: '幸得相遇离婚时',
}

interface DanmakuItem {
  time: number   // 秒
  text: string
  likes: number
}

/**
 * 解析 CSV 行（处理含逗号的弹幕内容）
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

/**
 * 从 CSV 内容中解析弹幕数据，按集数筛选
 */
function parseDanmakuCSV(
  csvContent: string,
  dramaName: string,
  episodeName: string
): DanmakuItem[] {
  const lines = csvContent.split('\n')
  const result: DanmakuItem[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line || line.startsWith('﻿')) continue // 跳过空行和 BOM

    const fields = parseCSVLine(line)
    if (fields.length < 5) continue

    const [colDrama, colEpisode, colTime, colLikes, ...rest] = fields
    const content = rest.length > 0 ? [colTime, colLikes, ...rest].join(',') : fields[4]

    // 匹配剧名（CSV 中的剧名可能比 dramaName 更长）
    if (!colDrama.includes(dramaName) && dramaName !== colDrama) continue
    // 匹配集数
    if (colEpisode !== episodeName) continue

    const timeMs = parseInt(colTime, 10)
    const likes = parseInt(colLikes, 10) || 0
    const text = fields.length >= 5 ? fields.slice(4).join(',').trim() : ''

    if (isNaN(timeMs) || !text) continue

    result.push({
      time: timeMs / 1000, // 毫秒转秒
      text,
      likes,
    })
  }

  // 按时间排序
  result.sort((a, b) => a.time - b.time)
  return result
}

export async function GET(
  request: NextRequest,
  { params }: { params: { dramaId: string; episodeId: string } }
) {
  const { dramaId, episodeId } = params

  // 校验参数
  if (!dramaId || !episodeId) {
    return NextResponse.json(
      { error: '缺少 dramaId 或 episodeId 参数' },
      { status: 400 }
    )
  }

  // 校验是否有弹幕数据
  if (!DRAMA_CSV_MAP[dramaId]) {
    return NextResponse.json(
      { danmakus: [], total: 0, message: `剧集 ${dramaId} 暂无弹幕数据` },
      { status: 200 }
    )
  }

  const csvFileName = DRAMA_CSV_MAP[dramaId]
  const dramaName = DRAMA_NAME_MAP[dramaId]
  const episodeName = `第${episodeId}集`
  const filePath = join(process.cwd(), 'video', csvFileName)

  try {
    const csvContent = await readFile(filePath, 'utf-8')
    const danmakus = parseDanmakuCSV(csvContent, dramaName, episodeName)

    return NextResponse.json(
      {
        danmakus,
        total: danmakus.length,
        dramaId,
        episodeId: parseInt(episodeId, 10),
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600',
        },
      }
    )
  } catch (error) {
    console.error('读取弹幕数据失败:', error)
    return NextResponse.json(
      { error: '读取弹幕数据失败', danmakus: [], total: 0 },
      { status: 500 }
    )
  }
}
