import { NextRequest, NextResponse } from 'next/server'
import { analyzeImageWithDoubao } from '@/lib/doubao'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image') as File | null
    const apiKey = formData.get('apiKey') as string | undefined

    if (!imageFile) {
      return NextResponse.json(
        { error: '未提供图片文件' },
        { status: 400 }
      )
    }

    // 将图片转换为base64
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')

    // 使用豆包分析图片
    const result = await analyzeImageWithDoubao(base64, apiKey)

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('分析图片失败:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '图片分析失败',
        data: {
          mainColors: ['#f97316', '#ef4444', '#000000'],
          style: '古风',
          mood: '热血',
          sceneType: '战斗场景',
          recommendedTheme: {
            primary: '#f97316',
            secondary: '#ef4444',
            accent: '#fbbf24',
            background: '#0f0f0f',
            text: '#ffffff'
          },
          description: '默认古风场景'
        }
      },
      { status: 200 }
    )
  }
}
