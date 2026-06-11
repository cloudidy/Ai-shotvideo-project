#!/usr/bin/env python3
"""
音频转字幕脚本 - 使用豆包多模态模型
用法: python audio_to_subtitle_doubao.py <音频文件路径>
"""

import requests
import base64
import sys
import os
import json
from pathlib import Path

# ============ 配置区域 ============
# 豆包 API Key（从火山引擎控制台获取）
DOUBAO_API_KEY = "YOUR_API_KEY_HERE"

# 豆包 API 地址
API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions"

# 模型端点 ID（需要在火山引擎创建）
# 在"模型推理"页面创建接入点，获取 endpoint ID
ENDPOINT_ID = "ep-20260514111117-s7m8b"

# 音频切片时长（秒）
CHUNK_DURATION = 180  # 3 分钟
# ==================================


def split_audio(input_file, chunk_duration=180):
    """使用 ffmpeg 将长音频切分成小段"""
    import subprocess

    # 获取音频总时长
    cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        input_file
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    total_duration = float(result.stdout.strip())
    print(f"音频总时长: {total_duration:.1f} 秒")

    if total_duration <= chunk_duration:
        return [input_file]

    # 切分音频
    chunks = []
    num_chunks = int(total_duration / chunk_duration) + 1

    for i in range(num_chunks):
        start_time = i * chunk_duration
        chunk_file = f"chunk_{i:03d}.mp3"

        cmd = [
            "ffmpeg", "-i", input_file,
            "-ss", str(start_time),
            "-t", str(chunk_duration),
            "-acodec", "libmp3lame",
            "-q:a", "2",
            chunk_file, "-y"
        ]
        subprocess.run(cmd, capture_output=True)
        chunks.append(chunk_file)
        print(f"切分第 {i+1}/{num_chunks} 段: {chunk_file}")

    return chunks


def transcribe_audio(audio_file):
    """使用豆包转录音频为字幕"""

    # 读取音频并编码
    with open(audio_file, "rb") as f:
        audio_data = base64.b64encode(f.read()).decode()

    # 构建请求
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {DOUBAO_API_KEY}"
    }

    payload = {
        "model": ENDPOINT_ID,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": """请将这段音频转录成 SRT 字幕格式。

要求：
1. 每条字幕包含序号、时间戳、文字
2. 时间戳格式：HH:MM:SS,mmm --> HH:MM:SS,mmm
3. 每条字幕不超过 20 个字
4. 直接输出 SRT 内容，不要额外说明

示例格式：
1
00:00:01,000 --> 00:00:03,500
这是第一句话

2
00:00:03,500 --> 00:00:06,000
这是第二句话"""
                    },
                    {
                        "type": "audio_url",
                        "audio_url": {
                            "url": f"data:audio/mp3;base64,{audio_data}"
                        }
                    }
                ]
            }
        ]
    }

    # 发送请求
    response = requests.post(API_URL, headers=headers, json=payload)

    if response.status_code != 200:
        print(f"API 错误: {response.status_code}")
        print(response.text)
        return None

    result = response.json()
    return result["choices"][0]["message"]["content"]


def merge_subtitles(srt_contents, chunk_duration):
    """合并多段字幕，调整时间戳"""
    merged = []
    current_index = 1
    time_offset = 0

    for i, content in enumerate(srt_contents):
        lines = content.strip().split('\n')

        for line in lines:
            if line.strip().isdigit():
                continue

            if '-->' in line:
                parts = line.split('-->')
                start = adjust_time(parts[0].strip(), time_offset)
                end = adjust_time(parts[1].strip(), time_offset)
                merged.append(f"{current_index}")
                merged.append(f"{start} --> {end}")
            else:
                merged.append(line)
                merged.append("")
                current_index += 1

        time_offset += chunk_duration

    return '\n'.join(merged)


def adjust_time(time_str, offset_seconds):
    """调整时间戳"""
    h, m, s = time_str.replace(',', '.').split(':')
    total_seconds = int(h) * 3600 + int(m) * 60 + float(s)
    total_seconds += offset_seconds

    h = int(total_seconds // 3600)
    m = int((total_seconds % 3600) // 60)
    s = total_seconds % 60
    return f"{h:02d}:{m:02d}:{s:06.3f}".replace('.', ',')


def main():
    if len(sys.argv) < 2:
        print("用法: python audio_to_subtitle_doubao.py <音频文件路径>")
        print("示例: python audio_to_subtitle_doubao.py ../audio/天下第一纨绔/第1集.mp3")
        sys.exit(1)

    audio_file = sys.argv[1]

    if not os.path.exists(audio_file):
        print(f"错误: 文件不存在 - {audio_file}")
        sys.exit(1)

    # 检查配置
    if DOUBAO_API_KEY == "你的API Key":
        print("错误: 请先设置 DOUBAO_API_KEY")
        print("1. 登录 https://console.volcengine.com/")
        print("2. 找到豆包大模型，创建 API Key")
        print("3. 修改脚本中的 DOUBAO_API_KEY 变量")
        sys.exit(1)

    if ENDPOINT_ID == "你的端点ID":
        print("错误: 请先设置 ENDPOINT_ID")
        print("1. 在火山引擎控制台创建模型推理接入点")
        print("2. 修改脚本中的 ENDPOINT_ID 变量")
        sys.exit(1)

    print("=" * 50)
    print("音频转字幕工具 (豆包版)")
    print("=" * 50)

    # 1. 切分音频
    print("\n[1/3] 准备音频...")
    chunks = split_audio(audio_file, CHUNK_DURATION)

    # 2. 转录
    print("\n[2/3] 开始转录...")
    srt_contents = []
    for i, chunk in enumerate(chunks):
        print(f"转录第 {i+1}/{len(chunks)} 段...")
        srt = transcribe_audio(chunk)
        if srt:
            srt_contents.append(srt)
        else:
            print(f"警告: 第 {i+1} 段转录失败")

        if chunk != audio_file:
            os.remove(chunk)

    # 3. 合并字幕
    print("\n[3/3] 合并字幕...")
    if len(srt_contents) == 1:
        final_srt = srt_contents[0]
    else:
        final_srt = merge_subtitles(srt_contents, CHUNK_DURATION)

    # 保存结果
    output_file = Path(audio_file).stem + ".srt"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(final_srt)

    print(f"\n✅ 字幕已保存到: {output_file}")
    print("=" * 50)


if __name__ == "__main__":
    main()
