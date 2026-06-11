@echo off
chcp 65001 >nul

echo 🎬 剧智互动 - 项目初始化脚本
echo ================================

:: 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 未检测到 Node.js，请先安装 Node.js 18+
    echo    下载地址: https://nodejs.org/
    pause
    exit /b 1
)

:: 检查 npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 未检测到 npm，请先安装 npm
    pause
    exit /b 1
)

:: 显示版本信息
for /f "tokens=*" %%i in ('node -v') do echo ✅ Node.js 版本: %%i
for /f "tokens=*" %%i in ('npm -v') do echo ✅ npm 版本: %%i
echo.

:: 安装依赖
echo 📦 正在安装依赖...
call npm install

if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo ✅ 依赖安装完成
echo.

:: 检查测试视频
if not exist "public\test-video.mp4" (
    echo ⚠️  未检测到测试视频
    echo    请将视频文件放到 public\test-video.mp4
    echo.
)

:: 检查音效文件
if not exist "public\sounds\click.mp3" (
    echo ⚠️  未检测到音效文件
    echo    请将音效文件放到 public\sounds\ 目录
    echo    - click.mp3 (点击音效)
    echo    - hit.mp3 (打脸音效)
    echo    - power.mp3 (逆袭音效)
    echo.
)

echo 🚀 初始化完成！
echo.
echo 启动命令：
echo   npm run dev
echo.
echo 然后访问: http://localhost:3000
echo.
pause
