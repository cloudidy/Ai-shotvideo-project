import { ImageAnalysisResult, generateThemeFromAnalysis, UITheme } from '@/lib/theme-generator'

// 《天下第一纨绔》古风短剧专属主题 - 基于视频帧画面分析
export const tianxiaWanKuTheme: ImageAnalysisResult = {
  mainColors: ['#8B0000', '#DC2626', '#F59E0B', '#000000', '#1a1a1a'],
  style: '古风',
  mood: '热血',
  sceneType: '战斗场景',
  recommendedTheme: {
    primary: '#DC2626',
    secondary: '#B91C1C',
    accent: '#F59E0B',
    background: '#0A0A0A',
    text: '#FFFFFF'
  },
  description: '古风纨绔，热血打脸，王侯将相宁有种乎'
}

// 北派寻宝日记主题
export const beipaiXunBaoTheme: ImageAnalysisResult = {
  mainColors: ['#1E40AF', '#0EA5E9', '#F59E0B', '#0F172A', '#1E293B'],
  style: '现代都市',
  mood: '紧张',
  sceneType: '室外',
  recommendedTheme: {
    primary: '#2563EB',
    secondary: '#0EA5E9',
    accent: '#F59E0B',
    background: '#0F172A',
    text: '#FFFFFF'
  },
  description: '盗墓探险，寻宝奇遇，紧张刺激'
}

// 预设主题列表
export const presetThemes: Record<string, UITheme> = {
  'tianxia': generateThemeFromAnalysis(tianxiaWanKuTheme),
  'beipai': generateThemeFromAnalysis(beipaiXunBaoTheme)
}
