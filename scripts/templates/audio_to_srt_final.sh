#!/bin/bash
# 音频转字幕脚本 - 使用豆包 API
# 用法: bash audio_to_srt_final.sh <音频文件>

# 配置
API_KEY="YOUR_API_KEY_HERE"
ENDPOINT="ep-20260514111117-s7m8b"
API_URL="https://ark.cn-beijing.volces.com/api/v3/chat/completions"
FFPROBE="./ffmpeg/ffmpeg-8.1.1-essentials_build/bin/ffprobe.exe"
FFMPEG="./ffmpeg.exe"

# 检查参数
if [ -z "$1" ]; then
    echo "用法: bash audio_to_srt_final.sh <音频文件>"
    echo "示例: bash audio_to_srt_final.sh audio/天下第一纨绔/第1集.mp3"
    exit 1
fi

AUDIO_FILE="$1"
if [ ! -f "$AUDIO_FILE" ]; then
    echo "错误: 文件不存在 - $AUDIO_FILE"
    exit 1
fi

echo "=========================================="
echo "音频转字幕工具 (豆包版)"
echo "=========================================="

# 获取音频时长
DURATION=$("$FFPROBE" -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$AUDIO_FILE" 2>/dev/null)
DURATION_INT=${DURATION%.*}
echo "音频时长: ${DURATION_INT}秒"

# 切分音频（每段3分钟）
CHUNK_DURATION=180
CHUNK_DIR="/tmp/audio_chunks_$$"
mkdir -p "$CHUNK_DIR"

echo ""
echo "[1/3] 切分音频..."

NUM_CHUNKS=$(( (DURATION_INT + CHUNK_DURATION - 1) / CHUNK_DURATION ))
for i in $(seq 0 $((NUM_CHUNKS - 1))); do
    START=$((i * CHUNK_DURATION))
    CHUNK_FILE="$CHUNK_DIR/chunk_$(printf '%03d' $i).mp3"
    "$FFMPEG" -i "$AUDIO_FILE" -ss $START -t $CHUNK_DURATION -acodec libmp3lame -q:a 2 "$CHUNK_FILE" -y 2>/dev/null
    echo "  切分第 $((i+1))/$NUM_CHUNKS 段"
done

# 转录每一段
echo ""
echo "[2/3] 开始转录..."
SRT_FILE="${AUDIO_FILE%.*}.srt"
> "$SRT_FILE"

SRT_INDEX=1

for CHUNK in "$CHUNK_DIR"/chunk_*.mp3; do
    CHUNK_NAME=$(basename "$CHUNK")
    echo "  转录 $CHUNK_NAME..."

    # Base64 编码
    AUDIO_B64=$(base64 -w 0 "$CHUNK")

    # 构建请求
    cat > /tmp/request_$$.json << EOF
{
  "model": "$ENDPOINT",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "请将这段音频转录成 SRT 字幕格式。要求：1.每条字幕包含序号、时间戳、文字；2.时间戳格式：HH:MM:SS,mmm --> HH:MM:SS,mmm；3.每条字幕不超过20个字；4.直接输出SRT内容，不要额外说明，不要用代码块包裹。"
        },
        {
          "type": "input_audio",
          "input_audio": {
            "data": "$AUDIO_B64",
            "format": "mp3"
          }
        }
      ]
    }
  ]
}
EOF

    # 调用 API
    RESPONSE=$(curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $API_KEY" \
        -d @/tmp/request_$$.json)

    # 提取字幕内容并格式化
    echo "$RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
content = data['choices'][0]['message']['content']
# 处理转义的换行符
content = content.replace('\\\\n', '\n').replace('\\n', '\n')
print(content)
" >> "$SRT_FILE" 2>/dev/null

    # 如果 python3 失败，用 sed 处理
    if [ $? -ne 0 ]; then
        echo "$RESPONSE" | grep -o '"content":"[^"]*"' | head -1 | \
            sed 's/"content":"//;s/"$//;s/\\n/\n/g;s/\\u003e/>/g' >> "$SRT_FILE"
    fi

    echo "" >> "$SRT_FILE"
done

# 清理临时文件
rm -rf "$CHUNK_DIR"
rm -f /tmp/request_$$.json

echo ""
echo "[3/3] 完成！"
echo "=========================================="
echo "✅ 字幕已保存到: $SRT_FILE"
echo "=========================================="
echo ""
echo "预览前 10 行:"
head -20 "$SRT_FILE"
