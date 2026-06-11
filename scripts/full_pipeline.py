#!/usr/bin/env python3
"""
全流程 Pipeline：视频 → 音频 → 字幕 → 高光点
用法: python scripts/full_pipeline.py <dramaId>
示例: python scripts/full_pipeline.py naisui

支持的剧集:
  tianxia  - 天下第一纨绔
  naisui   - 十八岁太奶奶驾到
  lihun    - 幸得相遇离婚时
"""

import json
import os
import subprocess
import sys
import time
from pathlib import Path

# ========== 配置 ==========

PROJECT_DIR = Path(__file__).parent.parent
VIDEO_DIR = PROJECT_DIR / "video"
SUBTITLES_DIR = PROJECT_DIR / "subtitles"
FFMPEG = PROJECT_DIR / "ffmpeg.exe"
FFPROBE = PROJECT_DIR / "ffmpeg" / "ffmpeg-8.1.1-essentials_build" / "bin" / "ffprobe.exe"

# 设置 ffmpeg 路径到环境变量（Whisper 需要）
os.environ['PATH'] = str(PROJECT_DIR) + os.pathsep + os.environ.get('PATH', '')

# Whisper 配置
WHISPER_MODEL = "small"
WHISPER_LANGUAGE = "zh"

# 剧集映射
DRAMA_MAP = {
    "tianxia": "天下第一纨绔",
    "naisui": "十八岁太奶奶驾到",
    "lihun": "幸得相遇离婚时",
}


# ========== 工具函数 ==========

def log(step, msg):
    print(f"[Step {step}] {msg}")

def log_ok(msg):
    print(f"  [OK] {msg}")

def log_warn(msg):
    print(f"  [WARN] {msg}")

def log_err(msg):
    print(f"  [ERR] {msg}")


def get_video_duration(video_path):
    """获取视频时长（秒）"""
    result = subprocess.run(
        [str(FFPROBE), "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(video_path)],
        capture_output=True, text=True
    )
    return int(float(result.stdout.strip()))


def extract_audio(video_path, audio_path):
    """从视频提取音频"""
    if audio_path.exists():
        log_ok(f"音频已存在: {audio_path.name}")
        return True

    log_ok("正在提取音频...")
    result = subprocess.run(
        [str(FFMPEG), "-i", str(video_path), "-vn", "-acodec", "libmp3lame",
         "-q:a", "2", str(audio_path), "-y", "-loglevel", "error"],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        log_err(f"音频提取失败: {result.stderr}")
        return False
    log_ok(f"音频已保存: {audio_path.name}")
    return True


def generate_subtitle_whisper(audio_path, srt_path):
    """使用 Whisper 生成字幕"""
    if srt_path.exists():
        log_ok(f"字幕已存在: {srt_path.name}")
        return True

    log_ok("正在使用 Whisper 生成字幕...")

    import whisper

    model = whisper.load_model(WHISPER_MODEL)
    result = model.transcribe(
        str(audio_path),
        language=WHISPER_LANGUAGE,
        verbose=False
    )

    # 保存 SRT
    with open(srt_path, 'w', encoding='utf-8') as f:
        for i, seg in enumerate(result['segments'], 1):
            start = seg['start']
            end = seg['end']
            text = seg['text'].strip()

            start_h = int(start // 3600)
            start_m = int((start % 3600) // 60)
            start_s = int(start % 60)
            start_ms = int((start % 1) * 1000)

            end_h = int(end // 3600)
            end_m = int((end % 3600) // 60)
            end_s = int(end % 60)
            end_ms = int((end % 1) * 1000)

            f.write(f'{i}\n')
            f.write(f'{start_h:02d}:{start_m:02d}:{start_s:02d},{start_ms:03d} --> {end_h:02d}:{end_m:02d}:{end_s:02d},{end_ms:03d}\n')
            f.write(f'{text}\n\n')

    log_ok(f"字幕已保存: {srt_path.name} ({len(result['segments'])} 条)")
    return True


def run_highlight_algorithm(drama_id, episode_num):
    """运行高光点生成算法"""
    script = PROJECT_DIR / "scripts" / "generate_highlights.py"
    result = subprocess.run(
        [sys.executable, str(script), drama_id, str(episode_num)],
        capture_output=True, text=True, encoding='utf-8'
    )
    if result.returncode != 0:
        log_err(f"高光点生成失败: {result.stderr}")
        return False
    return True


# ========== 主流程 ==========

def main():
    if len(sys.argv) < 2:
        print("用法: python scripts/full_pipeline.py <dramaId>")
        print(f"支持的剧集: {', '.join(DRAMA_MAP.keys())}")
        sys.exit(1)

    drama_id = sys.argv[1]
    if drama_id not in DRAMA_MAP:
        print(f"不支持的剧集: {drama_id}")
        print(f"支持的剧集: {', '.join(DRAMA_MAP.keys())}")
        sys.exit(1)

    drama_name = DRAMA_MAP[drama_id]
    video_dir = VIDEO_DIR / drama_name
    subtitle_dir = SUBTITLES_DIR / drama_name

    print()
    print("=" * 60)
    print("  全流程 Pipeline：视频 → 音频 → 字幕 → 高光点")
    print("=" * 60)
    print(f"  剧集: {drama_name} ({drama_id})")
    print("=" * 60)

    # 检查视频目录
    if not video_dir.exists():
        log_err(f"视频目录不存在: {video_dir}")
        sys.exit(1)

    # 获取所有视频文件
    video_files = sorted(video_dir.glob("*.mp4"))
    if not video_files:
        log_err("未找到视频文件")
        sys.exit(1)

    log_ok(f"找到 {len(video_files)} 个视频文件")

    # 创建目录
    subtitle_dir.mkdir(parents=True, exist_ok=True)
    audio_dir = PROJECT_DIR / "data" / "subtitles" / drama_id
    audio_dir.mkdir(parents=True, exist_ok=True)

    # 加载 Whisper 模型（只加载一次）
    log("1/4", "加载 Whisper 模型")
    import whisper
    model = whisper.load_model(WHISPER_MODEL)
    log_ok("模型加载完成")

    # 逐集处理
    total_start = time.time()

    for i, video_path in enumerate(video_files, 1):
        episode_name = video_path.stem  # "第1集"
        episode_num = int(episode_name.replace("第", "").replace("集", ""))

        print()
        print(f"{'=' * 50}")
        print(f"  {episode_name}")
        print(f"{'=' * 50}")

        audio_path = audio_dir / f"{episode_name}.mp3"
        srt_path = subtitle_dir / f"{episode_name}.srt"

        # Step 1: 提取音频
        log("1/3", f"提取音频 ({episode_name})")
        if not extract_audio(video_path, audio_path):
            continue

        # Step 2: 生成字幕
        log("2/3", f"生成字幕 ({episode_name})")
        if srt_path.exists():
            log_ok(f"字幕已存在: {srt_path.name}")
        else:
            log_ok("正在使用 Whisper 生成字幕...")
            result = model.transcribe(
                str(audio_path),
                language=WHISPER_LANGUAGE,
                verbose=False
            )

            with open(srt_path, 'w', encoding='utf-8') as f:
                for j, seg in enumerate(result['segments'], 1):
                    start = seg['start']
                    end = seg['end']
                    text = seg['text'].strip()

                    start_h = int(start // 3600)
                    start_m = int((start % 3600) // 60)
                    start_s = int(start % 60)
                    start_ms = int((start % 1) * 1000)

                    end_h = int(end // 3600)
                    end_m = int((end % 3600) // 60)
                    end_s = int(end % 60)
                    end_ms = int((end % 1) * 1000)

                    f.write(f'{j}\n')
                    f.write(f'{start_h:02d}:{start_m:02d}:{start_s:02d},{start_ms:03d} --> {end_h:02d}:{end_m:02d}:{end_s:02d},{end_ms:03d}\n')
                    f.write(f'{text}\n\n')

            log_ok(f"字幕已保存: {srt_path.name} ({len(result['segments'])} 条)")

        # Step 3: 生成高光点
        log("3/3", f"生成高光点 ({episode_name})")
        if run_highlight_algorithm(drama_id, episode_num):
            log_ok(f"高光点生成完成")
        else:
            log_warn(f"高光点生成失败")

    total_elapsed = time.time() - total_start

    print()
    print("=" * 60)
    print(f"  全流程完成！")
    print(f"  总耗时: {total_elapsed:.0f} 秒 ({total_elapsed/60:.1f} 分钟)")
    print(f"  平均每集: {total_elapsed/len(video_files):.0f} 秒")
    print("=" * 60)


if __name__ == "__main__":
    main()
