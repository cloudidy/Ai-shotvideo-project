# -*- coding: utf-8 -*-
"""
批量转录音频脚本
使用 Whisper 将音频文件转为字幕
"""

import whisper
import os
import subprocess
import json
import time
from pathlib import Path

# ============ 配置 ============
FFMPEG_PATH = 'E:/Ai-shotvideo-project/ffmpeg/ffmpeg-8.1.1-essentials_build/bin/ffmpeg.exe'
AUDIO_DIR = 'E:/Ai-shotvideo-project/audio/天下第一纨绔'
OUTPUT_DIR = 'E:/Ai-shotvideo-project/subtitles/天下第一纨绔'
MODEL_SIZE = 'small'  # tiny/base/small/medium/large
LANGUAGE = 'zh'

# ============ 初始化 ============
def init():
    """初始化环境"""
    # 设置 FFmpeg 路径
    os.environ['PATH'] = os.path.dirname(FFMPEG_PATH) + os.pathsep + os.environ.get('PATH', '')

    # 创建输出目录
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # 加载模型
    print(f'正在加载 Whisper {MODEL_SIZE} 模型...')
    model = whisper.load_model(MODEL_SIZE)
    print('模型加载完成！')

    return model

# ============ 转录单个文件 ============
def transcribe_file(model, audio_path, output_name):
    """转录单个音频文件"""
    print(f'\n正在转录: {os.path.basename(audio_path)}')
    start_time = time.time()

    # 转录
    result = model.transcribe(
        audio_path,
        language=LANGUAGE,
        verbose=False
    )

    # 计算耗时
    elapsed = time.time() - start_time
    print(f'  转录完成，耗时: {elapsed:.1f}秒')
    print(f'  识别文本: {len(result["text"])}字')

    # 保存 JSON
    json_path = os.path.join(OUTPUT_DIR, f'{output_name}.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    # 保存 SRT
    srt_path = os.path.join(OUTPUT_DIR, f'{output_name}.srt')
    save_srt(result['segments'], srt_path)

    # 保存纯文本
    txt_path = os.path.join(OUTPUT_DIR, f'{output_name}.txt')
    with open(txt_path, 'w', encoding='utf-8') as f:
        f.write(result['text'])

    return result

# ============ 保存SRT ============
def save_srt(segments, srt_path):
    """保存为SRT格式"""
    with open(srt_path, 'w', encoding='utf-8') as f:
        for i, seg in enumerate(segments, 1):
            start = seg['start']
            end = seg['end']
            text = seg['text'].strip()

            # 转换为SRT时间格式
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

# ============ 主函数 ============
def main():
    """主函数"""
    print('=' * 60)
    print('Whisper 批量转录脚本')
    print('=' * 60)

    # 初始化
    model = init()

    # 获取所有音频文件
    audio_files = sorted(Path(AUDIO_DIR).glob('*.mp3'))
    print(f'\n找到 {len(audio_files)} 个音频文件')

    # 批量转录
    total_start = time.time()
    results = []

    for i, audio_path in enumerate(audio_files, 1):
        print(f'\n[{i}/{len(audio_files)}]', end='')
        output_name = audio_path.stem  # 文件名（不含扩展名）
        result = transcribe_file(model, str(audio_path), output_name)
        results.append({
            'file': audio_path.name,
            'text_length': len(result['text']),
            'segments_count': len(result['segments'])
        })

    # 统计
    total_elapsed = time.time() - total_start
    print('\n' + '=' * 60)
    print('转录完成！')
    print(f'总耗时: {total_elapsed:.1f}秒')
    print(f'平均每个文件: {total_elapsed/len(audio_files):.1f}秒')
    print(f'\n输出目录: {OUTPUT_DIR}')
    print('\n生成的文件:')

    for r in results:
        print(f'  {r["file"]}: {r["text_length"]}字, {r["segments_count"]}个片段')

    # 保存汇总信息
    summary_path = os.path.join(OUTPUT_DIR, 'summary.json')
    with open(summary_path, 'w', encoding='utf-8') as f:
        json.dump({
            'model': MODEL_SIZE,
            'language': LANGUAGE,
            'total_files': len(audio_files),
            'total_elapsed': total_elapsed,
            'results': results
        }, f, ensure_ascii=False, indent=2)

    print(f'\n汇总信息已保存到: summary_path')

if __name__ == '__main__':
    main()
