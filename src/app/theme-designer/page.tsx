'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useThemeStore } from '@/store/themeStore'
import { ImageAnalysisResult } from '@/lib/doubao'

export default function ThemeDesignerPage() {
  const { currentTheme, setTheme, applyAnalysis } = useThemeStore()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null)
  const [apiKey, setApiKey] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile) return

    setIsAnalyzing(true)
    try {
      const formData = new FormData()
      formData.append('image', selectedFile)
      if (apiKey) {
        formData.append('apiKey', apiKey)
      }

      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      if (result.success || result.data) {
        const data = result.data
        setAnalysisResult(data)
        applyAnalysis(data)
      }
    } catch (error) {
      console.error('分析失败:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
          🎨 AI UI主题设计师
        </h1>
        <p className="text-gray-400 mb-8">上传你的短剧视频帧，让豆包AI分析画面，自动生成贴合风格的UI主题</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：上传和分析 */}
          <div className="space-y-6">
            {/* API Key设置 */}
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                豆包API Key (可选，也可在.env中配置)
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="输入你的豆包API Key..."
                className="w-full px-4 py-2 bg-gray-800 rounded-lg text-white border border-gray-700 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* 图片上传区 */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-orange-500 transition-colors"
            >
              {selectedImage ? (
                <img src={selectedImage} alt="Selected" className="max-h-80 mx-auto rounded-lg object-contain" />
              ) : (
                <div className="py-12">
                  <div className="text-6xl mb-4">🖼️</div>
                  <p className="text-gray-400">点击上传视频帧图片</p>
                  <p className="text-gray-500 text-sm mt-2">支持 JPG, PNG 格式</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            {/* 分析按钮 */}
            <button
              onClick={handleAnalyze}
              disabled={!selectedFile || isAnalyzing}
              className="w-full py-4 rounded-xl font-bold text-lg transition-all bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  >
                    ⏳
                  </motion.div>
                  豆包AI正在分析画面...
                </span>
              ) : (
                '🚀 用豆包AI分析图片生成主题'
              )}
            </button>
          </div>

          {/* 右侧：分析结果和主题预览 */}
          <div className="space-y-6">
            {analysisResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/50 rounded-xl p-5 border border-gray-800"
              >
                <h3 className="text-lg font-bold mb-4">📊 AI分析结果</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">画面风格:</span>
                    <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium">
                      {analysisResult.style}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">情绪氛围:</span>
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">
                      {analysisResult.mood}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">场景类型:</span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                      {analysisResult.sceneType}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">画面描述:</span>
                    <span className="text-gray-300">{analysisResult.description}</span>
                  </div>
                  
                  {/* 主色调展示 */}
                  <div>
                    <span className="text-gray-400 block mb-2">提取的主色调:</span>
                    <div className="flex gap-2">
                      {analysisResult.mainColors.map((color, i) => (
                        <div
                          key={i}
                          className="w-12 h-12 rounded-lg border border-gray-700"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 主题预览 */}
            <div className="bg-gray-900/50 rounded-xl p-5 border border-gray-800">
              <h3 className="text-lg font-bold mb-4">🎨 当前主题: {currentTheme.name}</h3>
              
              {/* 颜色预览 */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">配色方案:</p>
                  <div className="grid grid-cols-5 gap-2">
                    <div>
                      <div className="h-12 rounded-lg" style={{ backgroundColor: currentTheme.colors.primary }} />
                      <p className="text-xs text-gray-500 mt-1 text-center">主色</p>
                    </div>
                    <div>
                      <div className="h-12 rounded-lg" style={{ backgroundColor: currentTheme.colors.primaryLight }} />
                      <p className="text-xs text-gray-500 mt-1 text-center">主色浅</p>
                    </div>
                    <div>
                      <div className="h-12 rounded-lg" style={{ backgroundColor: currentTheme.colors.secondary }} />
                      <p className="text-xs text-gray-500 mt-1 text-center">次色</p>
                    </div>
                    <div>
                      <div className="h-12 rounded-lg" style={{ backgroundColor: currentTheme.colors.accent }} />
                      <p className="text-xs text-gray-500 mt-1 text-center">强调</p>
                    </div>
                    <div>
                      <div className="h-12 rounded-lg border border-gray-700" style={{ backgroundColor: currentTheme.colors.background }} />
                      <p className="text-xs text-gray-500 mt-1 text-center">背景</p>
                    </div>
                  </div>
                </div>

                {/* UI组件预览 */}
                <div className="pt-4 border-t border-gray-800">
                  <p className="text-sm text-gray-400 mb-3">组件预览:</p>
                  <div className="space-y-3">
                    <button
                      className="w-full py-3 rounded-lg text-white font-bold"
                      style={{ background: currentTheme.gradients.button }}
                    >
                      主要按钮
                    </button>
                    <button
                      className="w-full py-3 rounded-lg font-bold border"
                      style={{
                        backgroundColor: 'transparent',
                        borderColor: currentTheme.colors.primary,
                        color: currentTheme.colors.primary
                      }}
                    >
                      次要按钮
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
