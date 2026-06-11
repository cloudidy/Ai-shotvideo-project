import { create } from 'zustand'
import { UITheme, generateThemeFromAnalysis } from '@/lib/theme-generator'
import { ImageAnalysisResult } from '@/lib/doubao'

interface ThemeState {
  currentTheme: UITheme
  analysisHistory: ImageAnalysisResult[]
  setTheme: (theme: UITheme) => void
  applyAnalysis: (analysis: ImageAnalysisResult) => void
  addToHistory: (analysis: ImageAnalysisResult) => void
  resetTheme: () => void
}

const defaultTheme: UITheme = {
  name: '默认主题',
  style: '古风',
  mood: '热血',
  colors: {
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
  },
  gradients: {
    primary: 'linear-gradient(135deg, #f97316, #ef4444)',
    secondary: 'linear-gradient(135deg, #ef4444, #fbbf24)',
    button: 'linear-gradient(135deg, #fdba74, #f97316)'
  },
  animations: {
    pulseColor: '#f97316',
    shakeColor: '#ef4444'
  },
  cssVars: {
    '--theme-primary': '#f97316',
    '--theme-primary-light': '#fdba74',
    '--theme-primary-dark': '#c2410c',
    '--theme-secondary': '#ef4444',
    '--theme-accent': '#fbbf24',
    '--theme-accent-glow': 'rgba(249, 115, 22, 0.5)',
    '--theme-bg': '#0f0f0f',
    '--theme-text': '#ffffff'
  }
}

export const useThemeStore = create<ThemeState>((set) => ({
  currentTheme: defaultTheme,
  analysisHistory: [],
  setTheme: (theme: UITheme) => set({ currentTheme: theme }),
  applyAnalysis: (analysis: ImageAnalysisResult) => {
    const theme = generateThemeFromAnalysis(analysis)
    set({ currentTheme: theme })
  },
  addToHistory: (analysis: ImageAnalysisResult) => {
    set((state) => ({
      analysisHistory: [...state.analysisHistory, analysis]
    }))
  },
  resetTheme: () => set({ currentTheme: defaultTheme })
}))
