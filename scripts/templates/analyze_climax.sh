#!/bin/bash
# 字幕语义分析脚本 - 找出每集高潮点
# 用法: bash analyze_climax.sh

# 配置
API_KEY="YOUR_API_KEY_HERE"
ENDPOINT="ep-20260514111117-s7m8b"
API_URL="https://ark.cn-beijing.volces.com/api/v3/chat/completions"

echo "=========================================="
echo "剧集高潮点分析工具"
echo "=========================================="

# 创建输出目录
mkdir -p analysis/天下第一纨绔

# 分析每一集
for i in 1 2 3 4 5; do
    SRT_FILE="audio/天下第一纨绔/第${i}集.srt"

    if [ ! -f "$SRT_FILE" ]; then
        echo "跳过第${i}集：字幕文件不存在"
        continue
    fi

    echo ""
    echo "分析第 ${i} 集..."
    echo "------------------------------------------"

    # 读取字幕内容
    SUBTITLE_CONTENT=$(cat "$SRT_FILE")

    # 构建分析请求
    cat > /tmp/analysis_$$.json << EOF
{
  "model": "$ENDPOINT",
  "messages": [
    {
      "role": "user",
      "content": "你是一位专业的影视编剧分析师。请分析以下短剧第${i}集的字幕内容，找出本集的**高潮点**。\n\n字幕内容：\n${SUBTITLE_CONTENT}\n\n请从以下几个维度分析：\n\n1. **情感高潮**：情感最激烈的片段（愤怒、悲伤、惊喜等）\n2. **剧情转折**：情节发生重大变化的时刻\n3. **冲突爆发**：矛盾最尖锐的场景\n4. **悬念设置**：最吸引观众继续观看的悬念\n\n请给出：\n- **高潮时间段**（根据字幕时间戳）\n- **高潮类型**（情感/转折/冲突/悬念）\n- **具体台词**（最精彩的对白）\n- **分析说明**（为什么这是高潮）\n\n请用 JSON 格式输出，格式如下：\n{\n  \"episode\": ${i},\n  \"climax\": {\n    \"time_range\": \"00:00 - 00:00\",\n    \"type\": \"类型\",\n    \"dialogue\": \"关键台词\",\n    \"analysis\": \"分析说明\"\n  },\n  \"highlights\": [\n    {\n      \"time\": \"00:00\",\n      \"type\": \"类型\",\n      \"content\": \"内容\"\n    }\n  ]\n}"
    }
  ]
}
EOF

    # 调用 API
    RESPONSE=$(curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $API_KEY" \
        -d @/tmp/analysis_$$.json)

    # 提取分析结果
    ANALYSIS=$(echo "$RESPONSE" | grep -o '"content":"[^"]*"' | head -1 | sed 's/"content":"//;s/"$//')

    # 保存分析结果
    OUTPUT_FILE="analysis/天下第一纨绔/第${i}集_分析.txt"
    echo "$ANALYSIS" | sed 's/\\n/\n/g;s/\\u003e/>/g' > "$OUTPUT_FILE"

    echo "✅ 第${i}集分析完成"
    echo "结果保存到: $OUTPUT_FILE"
    echo ""
    echo "预览:"
    head -20 "$OUTPUT_FILE"
    echo "..."
done

# 清理临时文件
rm -f /tmp/analysis_$$.json

echo ""
echo "=========================================="
echo "✅ 全部分析完成！"
echo "=========================================="
echo "分析结果保存在: analysis/天下第一纨绔/"
