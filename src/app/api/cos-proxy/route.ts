import { NextRequest, NextResponse } from 'next/server'

const COS_BASE = 'https://ai-video-demo-1442345125.cos.ap-guangzhou.myqcloud.com'

export async function GET(request: NextRequest) {
  try {
    const path = request.nextUrl.searchParams.get('path')

    if (!path) {
      return new NextResponse('Missing path parameter', { status: 400 })
    }

    // 防止路径遍历攻击
    if (path.includes('..') || path.includes('\0')) {
      return new NextResponse('Invalid path', { status: 400 })
    }

    const cosUrl = `${COS_BASE}/${path}`

    // 从腾讯云COS获取视频
    const response = await fetch(cosUrl, {
      headers: {
        'Accept': 'video/mp4,video/*,*/*',
      },
    })

    if (!response.ok) {
      return new NextResponse('Video not found', { status: 404 })
    }

    // 转发视频流，设置正确的Content-Type
    return new NextResponse(response.body, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Cache-Control': 'public, max-age=86400',
        'Accept-Ranges': 'bytes',
      },
    })
  } catch (error) {
    console.error('COS proxy error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
