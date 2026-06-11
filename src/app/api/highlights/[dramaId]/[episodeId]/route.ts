import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import { join } from 'path'

// 支持的剧集 ID 映射
const DRAMA_MAP: Record<string, string> = {
  tianxia: '天下第一纨绔',
  beipai: '北派寻宝日记',
  naisui: '十八岁太奶奶驾到',
  lihun: '幸得相遇离婚时',
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

  // 校验剧集 ID
  if (!DRAMA_MAP[dramaId]) {
    return NextResponse.json(
      { error: `不支持的剧集: ${dramaId}，支持的剧集: ${Object.keys(DRAMA_MAP).join(', ')}` },
      { status: 404 }
    )
  }

  // 构建文件路径
  const filePath = join(process.cwd(), 'data', 'highlights', dramaId, `${episodeId}.json`)

  try {
    // 检查文件是否存在（异步）
    await stat(filePath)
  } catch {
    return NextResponse.json(
      {
        error: `未找到 ${DRAMA_MAP[dramaId]} 第${episodeId}集的高光点数据`,
        hint: '请先运行 scripts/build_highlights.sh 生成数据',
      },
      { status: 404 }
    )
  }

  try {
    // 异步读取并返回 JSON
    const data = await readFile(filePath, 'utf-8')
    const highlights = JSON.parse(data)

    return NextResponse.json(highlights, {
      headers: {
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('读取高光点数据失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
