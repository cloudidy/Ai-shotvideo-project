/**
 * 动态UI主题生成器
 * 基于豆包图片分析结果生成完整的UI主题配置
 */

import { ImageAnalysisResult } from './doubao'
export type { ImageAnalysisResult }

export interface UITheme {
  name: string
  style: string
  mood: string
  colors: {
    primary: string
    primaryLight: string
    primaryDark: string
    secondary: string
    accent: string
    accentGlow: string
    background: string
    backgroundDark: string
    surface: string
    text: string
    textSecondary: string
    border: string
  }
  gradients: {
    primary: string
    secondary: string
    button: string
  }
  animations: {
    pulseColor: string
    shakeColor: string
  }
  cssVars: Record<string, string>
}

/**
 * 从图片分析结果生成完整的UI主题
 */
export function generateThemeFromAnalysis(analysis: ImageAnalysisResult): UITheme {
  const { recommendedTheme, style, mood, mainColors } = analysis
  
  const primary = recommendedTheme.primary
  const secondary = recommendedTheme.secondary
  const accent = recommendedTheme.accent
  
  // 生成颜色的深浅变体
  const primaryLight = adjustColorBrightness(primary, 30)
  const primaryDark = adjustColorBrightness(primary, -20)
  
  // 生成发光效果颜色
  const accentGlow = hexToRgba(accent, 0.5)
  
  // 生成渐变
  const gradientPrimary = `linear-gradient(135deg, ${primary}, ${secondary})`
  const gradientButton = `linear-gradient(135deg, ${primaryLight}, ${primary})`
  
  // 根据风格和情绪选择不同的预设主题增强
  const styleEnhancement = getStyleEnhancement(style, mood)
  
  return {
    name: `${style} - ${mood}`,
    style,
    mood,
    colors: {
      primary,
      primaryLight,
      primaryDark,
      secondary,
      accent,
      accentGlow,
      background: recommendedTheme.background,
      backgroundDark: adjustColorBrightness(recommendedTheme.background, -15),
      surface: 'rgba(255, 255, 255, 0.05)',
      text: recommendedTheme.text,
      textSecondary: 'rgba(255, 255, 255, 0.6)',
      border: `${primary}30`
    },
    gradients: {
      primary: gradientPrimary,
      secondary: `linear-gradient(135deg, ${secondary}, ${accent})`,
      button: gradientButton
    },
    animations: {
      pulseColor: primary,
      shakeColor: secondary
    },
    cssVars: {
      '--theme-primary': primary,
      '--theme-primary-light': primaryLight,
      '--theme-primary-dark': primaryDark,
      '--theme-secondary': secondary,
      '--theme-accent': accent,
      '--theme-accent-glow': accentGlow,
      '--theme-bg': recommendedTheme.background,
      '--theme-text': recommendedTheme.text
    },
    ...styleEnhancement
  }
}

/**
 * 根据风格和情绪获取预设增强配置
 */
function getStyleEnhancement(style: string, mood: string): Partial<UITheme> {
  const enhancements: Record<string, Partial<UITheme>> = {
    '古风-热血': {
      colors: {
        ...getDefaultColors(),
        primary: '#dc2626',
        secondary: '#f97316',
        accent: '#fbbf24'
      },
      name: '古风热血'
    },
    '甜宠-甜蜜': {
      colors: {
        ...getDefaultColors(),
        primary: '#ec4899',
        secondary: '#f472b6',
        accent: '#fbbf24'
      },
      name: '甜宠浪漫'
    },
    '现代都市-紧张': {
      colors: {
        ...getDefaultColors(),
        primary: '#2563eb',
        secondary: '#3b82f6',
        accent: '#ef4444'
      },
      name: '都市悬疑'
    },
    '玄幻-霸气': {
      colors: {
        ...getDefaultColors(),
        primary: '#7c3aed',
        secondary: '#a855f7',
        accent: '#fbbf24'
      },
      name: '玄幻仙侠'
    },
    '武侠-热血': {
      colors: {
        ...getDefaultColors(),
        primary: '#b91c1c',
        secondary: '#ea580c',
        accent: '#facc15'
      },
      name: '武侠江湖'
    }
  }
  
  const key = `${style}-${mood}`
  return enhancements[key] || {}
}

/**
 * 调整颜色亮度
 */
function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = (num >> 8 & 0x00FF) + amt
  const B = (num & 0x0000FF) + amt
  
  return '#' + (
    0x1000000 +
    (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)
  ).toString(16).slice(1)
}

/**
 * HEX转RGBA
 */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * 获取默认颜色配置
 */
function getDefaultColors() {
  return {
    primary: '#f97316',
    primaryLight: '#fdba74',
    primaryDark: '#c2410c',
    secondary: '#ef4444',
    accent: '#fbbf24',
    accentGlow: 'rgba(249, 115, 22, 0.5)',
    background: '#0f0f0f',
    backgroundDark: '#000000',
    surface: 'rgba(255, 255, 255, 0.05)',
    text: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.6)',
    border: 'rgba(249, 115, 22, 0.2)'
  }
}

/**
 * 聚合多张图片的分析结果生成综合主题
 */
export function aggregateThemes(analyses: ImageAnalysisResult[]): UITheme {
  if (analyses.length === 0) {
    return generateThemeFromAnalysis(getDefaultAnalysisResult())
  }
  
  // 统计出现最多的风格和情绪
  const styleCounts: Record<string, number> = {}
  const moodCounts: Record<string, number> = {}
  
  analyses.forEach(a => {
    styleCounts[a.style] = (styleCounts[a.style] || 0) + 1
    moodCounts[a.mood] = (moodCounts[a.mood] || 0) + 1
  })
  
  const topStyle = Object.entries(styleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as any
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as any
  
  // 聚合所有主色调
  const allColors = analyses.flatMap(a => a.mainColors)
  const uniqueColors = [...new Set(allColors)].slice(0, 5)
  
  // 生成综合推荐主题
  const aggregated: ImageAnalysisResult = {
    style: topStyle || '古风',
    mood: topMood || '热血',
    mainColors: uniqueColors,
    sceneType: analyses[0]?.sceneType || '战斗场景',
    recommendedTheme: {
      primary: uniqueColors[0] || '#f97316',
      secondary: uniqueColors[1] || '#ef4444',
      accent: uniqueColors[2] || '#fbbf24',
      background: '#0f0f0f',
      text: '#ffffff'
    },
    description: '综合短剧场景'
  }
  
  return generateThemeFromAnalysis(aggregated)
}

function getDefaultAnalysisResult(): ImageAnalysisResult {
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
    description: '默认短剧场景'
  }
}
