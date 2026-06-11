#!/usr/bin/env python3
"""
音频转字幕脚本 - 使用 GPT-4o 多模态模型
用法: python audio_to_subtitle.py <音频文件路径>
"""

import openai
import base64
import sys
import os
from pathlib import Path

# ============ 配置区域 ============
# 请在这里设置你的 OpenAI API Key
OPENAI_API_KEY = "你的API密钥"

# 或者从环境变量读取
# OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# 模型选择
MODEL = "gpt-4o-audio-preview"

# 音频切片时长（秒），GPT-4o 建议不超过 3 分钟
CHUNK_DURATION = 180  # 3 分钟
# ==================================


def split_audio(input_file, chunk_duration=180):
    """
    使用 ffmpeg 将长音频切分成小段
    返回切分后的文件列表
    """
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

    # 如果音频足够短，不需要切分
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
    """
    使用 GPT-4o 转录音频为字幕
    """
    client = openai.OpenAI(api_key=OPENAI_API_KEY)

    # 读取音频并编码
    with open(audio_file, "rb") as f:
        audio_data = base64.b64encode(f.read()).decode()

    # 调用 API
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
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
4. 识别说话人（如果可能）
5. 直接输出 SRT 内容，不要额外说明

示例格式：
1
00:00:01,000 --> 00:00:03,500
这是第一句话

2
00:00:03,500 --> 00:00:06,000
这是第二句话"""
                    },
                    {
                        "type": "input_audio",
                        "input_audio": {
                            "data": audio_data,
                            "format": "mp3"
                        }
                    }
                ]
            }
        ]
    )

    return response.choices[0].message.content


def merge_subtitles(srt_contents, chunk_duration):
    """
    合并多段字幕，调整时间戳
    """
    merged = []
    current_index = 1
    time_offset = 0

    for i, content in enumerate(srt_contents):
        lines = content.strip().split('\n')

        for line in lines:
            # 跳过序号行
            if line.strip().isdigit():
                continue

            # 处理时间戳行
            if '-->' in line:
                # 解析时间戳
                parts = line.split('-->')
                start = adjust_time(parts[0].strip(), time_offset)
                end = adjust_time(parts[1].strip(), time_offset)
                merged.append(f"{current_index}")
                merged.append(f"{start} --> {end}")
            else:
                # 字幕内容
                merged.append(line)
                merged.append("")
                current_index += 1

        time_offset += chunk_duration

    return '\n'.join(merged)


def adjust_time(time_str, offset_seconds):
    """
    调整时间戳
    """
    # 解析 HH:MM:SS,mmm
    h, m, s = time_str.replace(',', '.').split(':')
    total_seconds = int(h) * 3600 + int(m) * 60 + float(s)
    total_seconds += offset_seconds

    # 重新格式化
    h = int(total_seconds // 3600)
    m = int((total_seconds % 3600) // 60)
    s = total_seconds % 60
    return f"{h:02d}:{m:02d}:{s:06.3f}".replace('.', ',')


def main():
    if len(sys.argv) < 2:
        print("用法: python audio_to_subtitle.py <音频文件路径>")
        print("示例: python audio_to_subtitle.py ../audio/天下第一纨绔/第1集.mp3")
        sys.exit(1)

    audio_file = sys.argv[1]

    if not os.path.exists(audio_file):
        print(f"错误: 文件不存在 - {audio_file}")
        sys.exit(1)

    # 检查 API Key
    if OPENAI_API_KEY == "你的API密钥":
        print("错误: 请先设置 OPENAI_API_KEY")
        print("方法1: 修改脚本中的 OPENAI_API_KEY 变量")
        print("方法2: 设置环境变量 OPENAI_API_KEY")
        sys.exit(1)

    print("=" * 50)
    print("音频转字幕工具")
    print("=" * 50)

    # 1. 切分音频（如果需要）
    print("\n[1/3] 准备音频...")
    chunks = split_audio(audio_file, CHUNK_DURATION)

    # 2. 转录每一段
    print("\n[2/3] 开始转录...")
    srt_contents = []
    for i, chunk in enumerate(chunks):
        print(f"转录第 {i+1}/{len(chunks)} 段...")
        srt = transcribe_audio(chunk)
        srt_contents.append(srt)

        # 清理临时文件
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
