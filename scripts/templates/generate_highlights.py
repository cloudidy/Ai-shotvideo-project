#!/usr/bin/env python3
"""
高光点自动生成算法 v2
用法: python scripts/generate_highlights.py <dramaId> <episodeNumber>
示例: python scripts/generate_highlights.py tianxia 1

流程:
  1. 读取 Whisper 字幕 (subtitles/{dramaId}/第N集.srt)
  2. AI 语义分析 (豆包 API) → 候选高潮点     [权重 70%]
  3. 弹幕数据分析 → 热度得分                 [权重 30%]
  4. 校验 AI 结果 (关键台词必须在字幕中存在)
  5. 加权合并 → 选出 Top 5 高光点
  6. 输出 JSON → data/highlights/{dramaId}/{episodeId}.json

存储结构:
  data/
  ├── highlights/{dramaId}/{episodeId}.json   ← 最终结果
  └── analysis/{dramaId}/{episodeId}.json     ← AI 分析缓存
"""

import json
import os
import re
import sys
import time
from pathlib import Path

# ========== 配置 ==========

DOUBAO_API_KEY = "YOUR_API_KEY_HERE"
DOUBAO_ENDPOINT = "ep-20260514111117-s7m8b"
DOUBAO_API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions"

AI_WEIGHT = 0.7
DANMAKU_WEIGHT = 0.3
TARGET_HIGHLIGHTS = 5
DANMAKU_WINDOW = 30

PROJECT_DIR = Path(__file__).parent.parent
DATA_DIR = PROJECT_DIR / "data"
SUBTITLES_DIR = PROJECT_DIR / "subtitles"
VIDEO_DIR = PROJECT_DIR / "video"

DRAMA_NAMES = {
    "tianxia": "天下第一纨绔",
    "beipai": "北派寻宝日记",
    "naisui": "十八岁太奶奶驾到",
    "lihun": "幸得相遇离婚时",
}

EMOTION_KEYWORDS = {
    "high": ["爽", "帅", "牛", "燃", "霸气", "好看", "神剧", "大制作", "炸了", "绝了", "无敌", "太强了"],
    "medium": ["哈哈", "笑死", "搞笑", "有意思", "不错", "可以"],
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

def format_time(seconds):
    m = int(seconds) // 60
    s = int(seconds) % 60
    return f"{m}:{s:02d}"


# ========== Step 1: 读取 Whisper 字幕 ==========

def parse_srt(srt_path):
    """
    解析 SRT 字幕文件，返回 [(start_sec, end_sec, text), ...]
    """
    content = srt_path.read_text(encoding="utf-8")
    entries = []
    seen = set()

    blocks = re.split(r"\n\s*\n", content.strip())
    for block in blocks:
        lines = block.strip().split("\n")
        if len(lines) < 3:
            continue

        # 找时间戳行
        time_match = re.search(
            r"(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})",
            lines[1]
        )
        if not time_match:
            continue

        h1, m1, s1, ms1, h2, m2, s2, ms2 = [int(x) for x in time_match.groups()]
        start_sec = h1 * 3600 + m1 * 60 + s1 + ms1 / 1000
        end_sec = h2 * 3600 + m2 * 60 + s2 + ms2 / 1000
        text = " ".join(lines[2:]).strip()

        if not text or text in seen or len(text) < 2:
            continue

        seen.add(text)
        entries.append((start_sec, end_sec, text))

    return entries


# ========== Step 2: AI 语义分析 (70%) ==========

def ai_analyze_highlights(srt_entries, analysis_path, duration):
    """使用豆包 API 分析字幕，识别高潮点"""
    if analysis_path.exists():
        log_ok(f"AI 分析已缓存: {analysis_path.name}")
        return json.loads(analysis_path.read_text(encoding="utf-8"))

    log_ok("正在进行 AI 语义分析 (豆包 API)...")

    import requests

    # 构建字幕文本（只用前200条，避免 token 超限）
    subtitle_text = "\n".join([
        f"[{format_time(s)}-{format_time(e)}] {t}"
        for s, e, t in srt_entries[:200]
    ])

    prompt = f"""你是一个专业的短剧分析师。请分析以下字幕内容，找出剧情高潮点。

重要规则：
1. 你给出的 keyDialogue 必须是字幕中的原文，一字不差
2. 不要编造任何不存在的台词
3. 如果不确定具体台词，keyDialogue 可以留空

字幕内容（带时间戳）：
{subtitle_text}

视频总时长：{duration}秒

请找出大约 {TARGET_HIGHLIGHTS} 个最重要的高潮点，严格按照以下 JSON 格式输出：

{{
  "highlights": [
    {{
      "startTime": 开始秒数,
      "endTime": 结束秒数,
      "type": "climax 或 opening 或 closing",
      "label": "简短标签（4-8个字）",
      "description": "一句话描述发生了什么",
      "intensity": 1到10的整数,
      "keyDialogue": "字幕中的原文台词（必须与字幕完全一致）"
    }}
  ]
}}

判断标准（按重要性排序）：
1. 情感爆发点（愤怒、震惊、感动）
2. 剧情转折点（身份揭露、背叛、反转）
3. 冲突升级点（对峙、挑战、宣战）
4. 悬念设置点（结尾钩子、未解之谜）"""

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {DOUBAO_API_KEY}"
    }

    payload = {
        "model": DOUBAO_ENDPOINT,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3
    }

    try:
        resp = requests.post(DOUBAO_API_URL, json=payload, headers=headers, timeout=120)
        resp.raise_for_status()
        content = resp.json()["choices"][0]["message"]["content"]

        json_match = re.search(r"\{[\s\S]*\}", content)
        if json_match:
            result = json.loads(json_match.group())
        else:
            log_err("AI 返回格式错误")
            result = {"highlights": []}

    except Exception as e:
        log_err(f"AI 分析失败: {e}")
        result = {"highlights": []}

    # 缓存
    analysis_path.parent.mkdir(parents=True, exist_ok=True)
    analysis_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    log_ok(f"AI 分析已保存: {analysis_path.name}")
    return result


# ========== Step 3: 弹幕数据分析 (30%) ==========

def parse_danmaku(danmaku_csv_path, episode_name, duration):
    """解析弹幕 CSV，按时间窗口计算热度得分"""
    log_ok("正在分析弹幕数据...")

    lines = danmaku_csv_path.read_text(encoding="utf-8-sig").strip().split("\n")
    danmaku = []

    for line in lines[1:]:
        parts = line.split(",", 4)
        if len(parts) < 5:
            continue

        drama_name, group, time_ms, likes, content = parts
        if group.strip() != episode_name:
            continue

        try:
            time_sec = int(time_ms) / 1000
            likes = int(likes)
        except ValueError:
            continue

        danmaku.append({
            "time": time_sec,
            "likes": likes,
            "content": content.strip()
        })

    if not danmaku:
        log_warn("未找到该集的弹幕数据")
        return []

    log_ok(f"  找到 {len(danmaku)} 条弹幕")

    # 按时间窗口统计
    windows = {}
    for d in danmaku:
        window_start = int(d["time"] // DANMAKU_WINDOW) * DANMAKU_WINDOW
        if window_start not in windows:
            windows[window_start] = {"count": 0, "likes": 0, "contents": []}
        windows[window_start]["count"] += 1
        windows[window_start]["likes"] += d["likes"]
        windows[window_start]["contents"].append(d["content"])

    # 计算热度得分
    scores = []
    for window_start, stats in windows.items():
        base_score = stats["count"] * 2 + stats["likes"] * 3

        emotion_bonus = 0
        for content in stats["contents"]:
            for keyword in EMOTION_KEYWORDS["high"]:
                if keyword in content:
                    emotion_bonus += 5
            for keyword in EMOTION_KEYWORDS["medium"]:
                if keyword in content:
                    emotion_bonus += 2

        total_score = base_score + emotion_bonus
        top_contents = sorted(stats["contents"], key=lambda c: len(c), reverse=True)[:5]

        scores.append({
            "windowStart": window_start,
            "windowEnd": window_start + DANMAKU_WINDOW,
            "score": total_score,
            "count": stats["count"],
            "likes": stats["likes"],
            "topContents": top_contents
        })

    # 归一化
    if scores:
        max_score = max(s["score"] for s in scores)
        if max_score > 0:
            for s in scores:
                s["normalizedScore"] = round(s["score"] / max_score * 100, 1)

    scores.sort(key=lambda x: x["score"], reverse=True)
    log_ok(f"  分析了 {len(scores)} 个时间窗口，Top 3: {[format_time(s['windowStart']) for s in scores[:3]]}")

    return scores


# ========== Step 4: 校验 AI 结果 ==========

def validate_ai_result(ai_result, srt_entries):
    """校验 AI 分析结果：检查关键台词是否在字幕中真实存在"""
    log_ok("正在校验 AI 分析结果...")

    all_subtitle_text = " ".join([text for _, _, text in srt_entries])

    valid = []
    invalid = 0

    for h in ai_result.get("highlights", []):
        key_dialogue = h.get("keyDialogue", "")

        if not key_dialogue:
            # 没有关键台词，用描述做模糊匹配
            description = h.get("description", "")
            desc_words = re.findall(r"[一-鿿]{2,}", description)
            match_count = sum(1 for w in desc_words if w in all_subtitle_text)
            if match_count >= 2:
                valid.append(h)
                log_ok(f"  [PASS] 描述关键词匹配 {match_count} 个")
            else:
                invalid += 1
                log_warn(f"  [FAIL] 描述关键词不匹配，已剔除")
        elif key_dialogue in all_subtitle_text:
            valid.append(h)
            log_ok(f"  [PASS] '{key_dialogue[:20]}...' 存在于字幕中")
        else:
            # 模糊匹配：检查关键台词的子串
            substrings = re.findall(r"[一-鿿]{4,}", key_dialogue)
            match_count = sum(1 for s in substrings if s in all_subtitle_text)
            if match_count >= 2:
                valid.append(h)
                log_ok(f"  [PASS] 关键台词部分匹配 ({match_count}/{len(substrings)})")
            else:
                invalid += 1
                log_warn(f"  [FAIL] '{key_dialogue[:20]}...' 未在字幕中找到，已剔除")

    if invalid > 0:
        log_warn(f"  校验完成: {len(valid)} 个通过, {invalid} 个被剔除")
    else:
        log_ok(f"  校验完成: 全部 {len(valid)} 个通过")

    return valid, invalid


# ========== Step 5: 加权合并 ==========

def merge_highlights(ai_highlights, danmaku_scores, duration):
    """将 AI 分析结果和弹幕分析结果加权合并"""
    log_ok("正在加权合并...")

    ai_weight = AI_WEIGHT
    danmaku_weight = DANMAKU_WEIGHT

    if len(ai_highlights) < 3:
        ai_weight = 0.4
        danmaku_weight = 0.6
        log_warn(f"  AI 有效结果不足，调整权重: AI {int(ai_weight * 100)}% + 弹幕 {int(danmaku_weight * 100)}%")
    else:
        log_ok(f"  权重: AI {int(ai_weight * 100)}% + 弹幕 {int(danmaku_weight * 100)}%")

    merged = []
    for h in ai_highlights:
        start = h.get("startTime", 0)
        end = h.get("endTime", start + 15)

        # 找匹配的弹幕窗口
        matching_danmaku = []
        for ds in danmaku_scores:
            if ds["windowStart"] < end and ds["windowEnd"] > start:
                matching_danmaku.append(ds)

        danmaku_score = 0
        if matching_danmaku:
            danmaku_score = max(ds.get("normalizedScore", 0) for ds in matching_danmaku)

        ai_score = h.get("intensity", 5) * 10
        weighted_score = ai_score * ai_weight + danmaku_score * danmaku_weight

        total_danmaku = sum(ds["count"] for ds in matching_danmaku)
        total_likes = sum(ds["likes"] for ds in matching_danmaku)

        merged.append({
            **h,
            "danmakuCount": total_danmaku,
            "likesCount": total_likes,
            "aiScore": round(ai_score, 1),
            "danmakuScore": round(danmaku_score, 1),
            "weightedScore": round(weighted_score, 1),
        })

    merged.sort(key=lambda x: x["weightedScore"], reverse=True)

    # 去重：20秒内不重叠
    selected = []
    for h in merged:
        overlap = any(abs(h["startTime"] - s["startTime"]) < 20 for s in selected)
        if not overlap:
            selected.append(h)
        if len(selected) >= TARGET_HIGHLIGHTS:
            break

    # 补充：检查是否有弹幕峰值被遗漏（Top 2 弹幕窗口必须保留）
    if danmaku_scores:
        top2_danmaku = danmaku_scores[:2]
        for ds in top2_danmaku:
            already_in = any(
                abs(h["startTime"] - ds["windowStart"]) < 20
                for h in selected
            )
            if not already_in and ds.get("normalizedScore", 0) > 80:
                # 弹幕峰值被遗漏，强制加入
                window_texts = []
                for h in ai_highlights:
                    if abs(h.get("startTime", 0) - ds["windowStart"]) < 30:
                        window_texts.append(h.get("keyDialogue", ""))

                # 从字幕中找该窗口的内容
                log_ok(f"    补充弹幕峰值: {format_time(ds['windowStart'])} ({ds['count']}条弹幕)")

                # 根据弹幕内容生成标签
                peak_label = "弹幕巅峰"
                top_contents = ds.get("topContents", [])
                all_danmaku = " ".join(top_contents)
                if "如烟" in all_danmaku:
                    peak_label = "柳如烟出场"
                elif "苏尘" in all_danmaku or "苏羽" in all_danmaku:
                    peak_label = "主角高光"
                elif "皇帝" in all_danmaku or "陛下" in all_danmaku:
                    peak_label = "帝王戏份"

                selected.append({
                    "startTime": ds["windowStart"],
                    "endTime": ds["windowEnd"],
                    "type": "climax",
                    "label": peak_label,
                    "description": f"弹幕密度最高的时刻 ({ds['count']}条弹幕)",
                    "intensity": min(10, max(7, ds.get("normalizedScore", 50) // 10)),
                    "keyDialogue": "",
                    "danmakuCount": ds["count"],
                    "likesCount": ds["likes"],
                    "aiScore": 0,
                    "danmakuScore": ds.get("normalizedScore", 0),
                    "weightedScore": ds.get("normalizedScore", 0) * DANMAKU_WEIGHT,
                })

    selected.sort(key=lambda x: x["startTime"])
    selected = selected[:TARGET_HIGHLIGHTS]  # 限制数量

    log_ok(f"  最终选出 {len(selected)} 个高光点")
    for i, h in enumerate(selected):
        log_ok(f"    #{i + 1} {format_time(h['startTime'])} {h.get('label', '')} "
               f"(AI:{h['aiScore']} 弹幕:{h['danmakuScore']} 加权:{h['weightedScore']})")

    return selected


# ========== 纯弹幕兜底 ==========

def generate_from_danmaku_only(danmaku_scores, srt_entries, duration):
    """当 AI 分析失败时，纯用弹幕数据生成高光点"""
    log_ok("使用弹幕数据兜底生成高光点...")

    top_windows = []
    for ds in danmaku_scores:
        overlap = any(abs(ds["windowStart"] - tw["windowStart"]) < 30 for tw in top_windows)
        if not overlap:
            top_windows.append(ds)
        if len(top_windows) >= TARGET_HIGHLIGHTS + 2:
            break

    highlights = []
    for i, ds in enumerate(top_windows[:TARGET_HIGHLIGHTS]):
        window_start = ds["windowStart"]
        window_end = ds["windowEnd"]

        window_texts = [text for s, e, text in srt_entries if s >= window_start and s < window_end]
        combined_text = " ".join(window_texts)[:100]

        label = generate_label(ds, combined_text, i, window_start, duration)
        description = combined_text[:50] if combined_text else f"弹幕热度高峰 ({ds['count']}条弹幕)"
        intensity = min(10, max(5, ds.get("normalizedScore", 50) // 10))

        highlights.append({
            "startTime": window_start,
            "endTime": window_end,
            "type": "opening" if window_start < 15 else "closing" if window_start > duration - 30 else "climax",
            "label": label,
            "description": description,
            "intensity": intensity,
            "keyDialogue": window_texts[0] if window_texts else "",
            "danmakuCount": ds["count"],
            "likesCount": ds["likes"],
            "aiScore": 0,
            "danmakuScore": ds.get("normalizedScore", 0),
            "weightedScore": ds.get("normalizedScore", 0) * DANMAKU_WEIGHT,
        })

    highlights.sort(key=lambda x: x["startTime"])
    log_ok(f"  从弹幕数据生成了 {len(highlights)} 个高光点")
    return highlights


def generate_label(ds, text, index, time_sec, duration):
    if time_sec < 15:
        return "开场爆发"
    if time_sec > duration - 30:
        return "结尾悬念"

    top_contents = ds.get("topContents", [])
    all_danmaku = " ".join(top_contents)

    # 角色相关（优先级最高）
    if "如烟" in all_danmaku or "如烟" in text:
        return "柳如烟出场"
    elif "苏尘" in all_danmaku or "苏羽" in all_danmaku:
        return "主角高光"
    elif "皇帝" in all_danmaku or "陛下" in all_danmaku:
        return "帝王戏份"

    # 情绪相关
    if any(w in all_danmaku for w in ["怒", "暴", "气"]):
        return "情绪爆发"
    elif any(w in all_danmaku for w in ["帅", "牛", "爽", "燃"]):
        return "高燃场面"
    elif any(w in all_danmaku for w in ["笑", "哈", "搞笑"]):
        return "搞笑桥段"
    elif any(w in all_danmaku for w in ["蛮", "夷", "战"]):
        return "冲突升级"

    labels = ["剧情高潮", "情感爆发", "名场面", "观众热议", "弹幕高峰"]
    return labels[index % len(labels)]


# ========== 输出 JSON ==========

def build_output(drama_id, episode_num, duration, video_url, highlights):
    return {
        "dramaId": drama_id,
        "dramaName": DRAMA_NAMES.get(drama_id, drama_id),
        "episodeId": episode_num,
        "episodeName": f"第{episode_num}集",
        "duration": duration,
        "videoUrl": video_url,
        "generatedAt": time.strftime("%Y-%m-%d %H:%M:%S"),
        "analysisMethod": f"Whisper字幕 + AI语义分析({int(AI_WEIGHT * 100)}%) + 弹幕数据分析({int(DANMAKU_WEIGHT * 100)}%)",
        "highlights": [
            {
                "id": f"ep{episode_num}-h{i + 1}",
                "startTime": h["startTime"],
                "endTime": h.get("endTime", h["startTime"] + 15),
                "type": h.get("type", "climax"),
                "interactionType": classify_interaction(h),
                "emoji": get_emoji(h),
                "label": h.get("label", "高潮点"),
                "title": f"助力{h.get('label', '高潮')}",
                "description": h.get("description", ""),
                "intensity": h.get("intensity", 7),
                "interaction": {
                    "requiredClicks": max(10, min(30, h.get("intensity", 7) * 2 + 3)),
                    "duration": max(8, min(20, h.get("intensity", 7) + 2)),
                    "reward": max(100, min(500, h.get("intensity", 7) * 50)),
                    "effect": f"{h.get('label', '高潮')}特效",
                    "sound": "/sounds/hit.mp3"
                },
                "metadata": {
                    "danmakuCount": h.get("danmakuCount", 0),
                    "likesCount": h.get("likesCount", 0),
                    "keyDialogue": h.get("keyDialogue", ""),
                    "climaxType": h.get("label", ""),
                    "aiScore": h.get("aiScore", 0),
                    "danmakuScore": h.get("danmakuScore", 0),
                    "weightedScore": h.get("weightedScore", 0)
                }
            }
            for i, h in enumerate(highlights)
        ]
    }


def classify_interaction(h):
    label = h.get("label", "")
    if "出场" in label or "登场" in label or "如烟" in label:
        return "liuyanru-entrance"
    elif "逆袭" in label or "撕" in label or "打脸" in label:
        return "protagonist-reverse"
    elif "怒" in label or "暴怒" in label or "帝王" in label:
        return "emperor-rage"
    elif "挑战" in label or "战" in label or "冲突" in label:
        return "challenge-accept"
    elif "系统" in label or "招婿" in label:
        return "system"
    else:
        return "challenge-accept"


def get_emoji(h):
    t = classify_interaction(h)
    return {"liuyanru-entrance": "👸", "protagonist-reverse": "😤", "emperor-rage": "👑",
            "challenge-accept": "⚔️", "system": "💻"}.get(t, "🔥")


# ========== 主流程 ==========

def main():
    if len(sys.argv) < 3:
        print("用法: python scripts/generate_highlights.py <dramaId> <episodeNumber>")
        print("示例: python scripts/generate_highlights.py tianxia 1")
        sys.exit(1)

    drama_id = sys.argv[1]
    episode_num = int(sys.argv[2])

    if drama_id not in DRAMA_NAMES:
        print(f"不支持的剧集: {drama_id}，支持: {', '.join(DRAMA_NAMES.keys())}")
        sys.exit(1)

    drama_name = DRAMA_NAMES[drama_id]
    episode_name = f"第{episode_num}集"

    # 路径
    srt_path = SUBTITLES_DIR / drama_name / f"{episode_name}.srt"
    danmaku_path = VIDEO_DIR / f"{drama_name}_弹幕_已过滤.csv"
    analysis_path = DATA_DIR / "analysis" / drama_id / f"{episode_num}.json"
    output_path = DATA_DIR / "highlights" / drama_id / f"{episode_num}.json"
    video_url = f"/video/{drama_name}/{episode_name}.mp4"

    print()
    print("=" * 50)
    print("  高光点自动生成算法 v2")
    print("=" * 50)
    print(f"  剧集: {drama_name} ({drama_id})")
    print(f"  集数: {episode_name}")
    print(f"  字幕: Whisper 生成")
    print(f"  算法: AI语义分析 {int(AI_WEIGHT * 100)}% + 弹幕分析 {int(DANMAKU_WEIGHT * 100)}%")
    print("=" * 50)

    # 检查字幕文件
    if not srt_path.exists():
        log_err(f"字幕文件不存在: {srt_path}")
        log_err("请先运行 Whisper 生成字幕: python scripts/transcribe_all.py")
        sys.exit(1)

    # 获取视频时长
    video_path = PROJECT_DIR / "video" / drama_name / f"{episode_name}.mp4"
    if video_path.exists():
        import subprocess
        ffprobe = PROJECT_DIR / "ffmpeg" / "ffmpeg-8.1.1-essentials_build" / "bin" / "ffprobe.exe"
        result = subprocess.run(
            [str(ffprobe), "-v", "error", "-show_entries", "format=duration",
             "-of", "default=noprint_wrappers=1:nokey=1", str(video_path)],
            capture_output=True, text=True
        )
        duration = int(float(result.stdout.strip()))
    else:
        duration = 300  # 默认

    log_ok(f"视频时长: {duration}秒")

    # Step 1: 读取字幕
    log("1/4", "读取 Whisper 字幕")
    srt_entries = parse_srt(srt_path)
    log_ok(f"解析了 {len(srt_entries)} 条字幕")

    # Step 2: AI 语义分析
    log("2/4", f"AI 语义分析 (权重 {int(AI_WEIGHT * 100)}%)")
    ai_result = ai_analyze_highlights(srt_entries, analysis_path, duration)

    # 校验
    valid_highlights, invalid_count = validate_ai_result(ai_result, srt_entries)

    if len(valid_highlights) < 3:
        log_warn(f"有效高光点不足 ({len(valid_highlights)} 个)，将重新分析...")
        if analysis_path.exists():
            analysis_path.unlink()
        ai_result = ai_analyze_highlights(srt_entries, analysis_path, duration)
        valid_highlights, _ = validate_ai_result(ai_result, srt_entries)

    # Step 3: 弹幕分析
    log("3/4", f"弹幕数据分析 (权重 {int(DANMAKU_WEIGHT * 100)}%)")
    if danmaku_path.exists():
        danmaku_scores = parse_danmaku(danmaku_path, episode_name, duration)
    else:
        log_warn(f"弹幕文件不存在: {danmaku_path}")
        danmaku_scores = []

    # Step 4: 合并
    log("4/4", "加权合并，选出 Top 5")
    if valid_highlights:
        highlights = merge_highlights(valid_highlights, danmaku_scores, duration)
    elif danmaku_scores:
        highlights = generate_from_danmaku_only(danmaku_scores, srt_entries, duration)
    else:
        log_err("无数据可用")
        sys.exit(1)

    # 输出
    output = build_output(drama_id, episode_num, duration, video_url, highlights)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")

    print()
    print("=" * 50)
    print("  DONE!")
    print(f"  输出: {output_path}")
    print(f"  高光点: {len(highlights)} 个")
    print("=" * 50)


if __name__ == "__main__":
    main()
