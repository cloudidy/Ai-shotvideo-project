import { NextRequest, NextResponse } from 'next/server'
import { createReadStream, existsSync, statSync } from 'fs'
import { join, extname } from 'path'
import { Readable } from 'stream'

// MIME 类型映射
const MIME_TYPES: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.mkv': 'video/x-matroska',
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const videoPath = params.path.join('/')

    // 路径遍历防护
    if (videoPath.includes('..') || videoPath.includes('\0')) {
      return new NextResponse('Invalid path', { status: 400 })
    }

    const fullPath = join(process.cwd(), 'video', videoPath)

    // 检查文件是否存在
    if (!existsSync(fullPath)) {
      return new NextResponse('Video not found', { status: 404 })
    }

    const stat = statSync(fullPath)
    const fileSize = stat.size
    const ext = extname(fullPath).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'video/mp4'

    // 解析 Range 请求头
    const range = request.headers.get('range')

    if (range) {
      // 解析 Range: bytes=start-end
      const parts = range.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1

      // 校验范围
      if (start >= fileSize || end >= fileSize || start > end) {
        return new NextResponse('Range Not Satisfiable', {
          status: 416,
          headers: {
            'Content-Range': `bytes */${fileSize}`,
          },
        })
      }

      const chunkSize = end - start + 1

      // 使用 createReadStream 流式读取指定范围
      const stream = createReadStream(fullPath, { start, end })
      const webStream = Readable.toWeb(stream) as ReadableStream

      return new NextResponse(webStream, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600',
        },
      })
    }

    // 无 Range 请求 — 流式返回完整文件
    const stream = createReadStream(fullPath)
    const webStream = Readable.toWeb(stream) as ReadableStream

    return new NextResponse(webStream, {
      headers: {
        'Content-Length': fileSize.toString(),
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error serving video:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
