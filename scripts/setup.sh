#!/bin/bash

echo "🎬 剧智互动 - 项目初始化脚本"
echo "================================"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装 Node.js 18+"
    echo "   下载地址: https://nodejs.org/"
    exit 1
fi

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ 未检测到 npm，请先安装 npm"
    exit 1
fi

# 显示版本信息
echo "✅ Node.js 版本: $(node -v)"
echo "✅ npm 版本: $(npm -v)"
echo ""

# 安装依赖
echo "📦 正在安装依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装完成"
echo ""

# 检查测试视频
if [ ! -f "public/test-video.mp4" ]; then
    echo "⚠️  未检测到测试视频"
    echo "   请将视频文件放到 public/test-video.mp4"
    echo ""
fi

# 检查音效文件
if [ ! -f "public/sounds/click.mp3" ]; then
    echo "⚠️  未检测到音效文件"
    echo "   请将音效文件放到 public/sounds/ 目录"
    echo "   - click.mp3 (点击音效)"
    echo "   - hit.mp3 (打脸音效)"
    echo "   - power.mp3 (逆袭音效)"
    echo ""
fi

echo "🚀 初始化完成！"
echo ""
echo "启动命令："
echo "  npm run dev"
echo ""
echo "然后访问: http://localhost:3000"
echo ""
