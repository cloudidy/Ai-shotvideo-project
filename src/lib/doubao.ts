/**
 * 豆包多模态API服务
 * 用于分析视频帧图片，提取视觉特征用于UI设计
 */

export interface ImageAnalysisResult {
  mainColors: string[]
  style: '古风' | '现代都市' | '玄幻' | '甜宠' | '悬疑' | '武侠'
  mood: '热血' | '甜蜜' | '紧张' | '温馨' | '霸气'
  sceneType: '室内' | '室外' | '战斗场景' | '情感场景'
  recommendedTheme: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  description: string
}

const DOUBAO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'

/**
 * 将图片转换为base64编码
 */
export async function imageToBase64(filePath: string): Promise<string> {
  const fs = await import('fs/promises')
  const buffer = await fs.readFile(filePath)
  return buffer.toString('base64')
}

/**
 * 使用豆包多模态模型分析图片
 */
export async function analyzeImageWithDoubao(
  imageBase64: string,
  apiKey?: string
): Promise<ImageAnalysisResult> {
  const key = apiKey || process.env.DOUBAO_API_KEY

  if (!key) {
    console.warn('未配置豆包API密钥，返回默认分析结果')
    return getDefaultAnalysis()
  }

  try {
    const response = await fetch(DOUBAO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'doubao-vision-pro-32k',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `请分析这张短剧视频帧图片，提取以下信息并以严格的JSON格式返回：
1. mainColors: 从画面中提取3-5个主色调的十六进制颜色码
2. style: 短剧风格，只能是"古风"、"现代都市"、"玄幻"、"甜宠"、"悬疑"、"武侠"其中之一
3. mood: 画面情绪氛围，只能是"热血"、"甜蜜"、"紧张"、"温馨"、"霸气"其中之一
4. sceneType: 场景类型，只能是"室内"、"室外"、"战斗场景"、"情感场景"其中之一
5. recommendedTheme: 基于画面生成推荐的配色方案，包含以下字段：
   - primary: 主色调（按钮、标题等重点元素）
   - secondary: 次要色（辅助元素）
   - accent: 强调色（高亮、特效）
   - background: 背景色
   - text: 文字颜色
6. description: 简要描述这张画面的内容（50字以内）

只返回纯JSON，不要有任何其他文字说明。`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      })
    })

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''
    
    // 尝试解析JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return { ...getDefaultAnalysis(), ...parsed }
    }
    
    return getDefaultAnalysis()
  } catch (error) {
    console.error('豆包API分析失败:', error)
    return getDefaultAnalysis()
  }
}

/**
 * 默认分析结果（当API不可用时使用）
 */
function getDefaultAnalysis(): ImageAnalysisResult {
  return {
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
    description: '古风短剧场景'
  }
}

/**
 * 批量分析多张图片
 */
export async function batchAnalyzeImages(
  imagePaths: string[],
  apiKey?: string
): Promise<ImageAnalysisResult[]> {
  const results: ImageAnalysisResult[] = []
  
  for (const path of imagePaths) {
    try {
      const base64 = await imageToBase64(path)
      const result = await analyzeImageWithDoubao(base64, apiKey)
      results.push(result)
    } catch (error) {
      console.error(`分析图片 ${path} 失败:`, error)
      results.push(getDefaultAnalysis())
    }
  }
  
  return results
}
