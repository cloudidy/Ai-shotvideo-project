#!/bin/bash
# 第1集深度分析脚本 - 弹幕与字幕交叉验证
# 找出多个高潮点，包括柳如烟出场

# 配置
API_KEY="YOUR_API_KEY_HERE"
ENDPOINT="ep-20260514111117-s7m8b"
API_URL="https://ark.cn-beijing.volces.com/api/v3/chat/completions"

echo "=========================================="
echo "第1集深度分析 - 弹幕与字幕交叉验证"
echo "=========================================="

# 创建分析目录
mkdir -p analysis/天下第一纨绔/第1集

# 步骤1：提取第1集弹幕
echo ""
echo "[1/5] 提取第1集弹幕..."
grep "第1集" video/天下第一纨绔_弹幕_已过滤.csv > analysis/天下第一纨绔/第1集/弹幕_第1集.csv
DANMAKU_COUNT=$(wc -l < analysis/天下第一纨绔/第1集/弹幕_第1集.csv)
echo "  共提取 $DANMAKU_COUNT 条弹幕"

# 步骤2：分析弹幕时间分布
echo ""
echo "[2/5] 分析弹幕时间分布..."
cat > analysis/天下第一纨绔/第1集/弹幕时间分布.txt << 'EOF'
# 弹幕时间分布分析
# 时间单位：毫秒（1秒 = 1000毫秒）

EOF

# 按时间段统计弹幕数量（每30秒一个区间）
cat analysis/天下第一纨绔/第1集/弹幕_第1集.csv | \
awk -F',' '{
    time = $3 / 1000  # 转换为秒
    interval = int(time / 30) * 30
    count[interval]++
}
END {
    for (i in count) {
        printf "%d秒-%d秒: %d条弹幕\n", i, i+30, count[i]
    }
}' | sort -n >> analysis/天下第一纨绔/第1集/弹幕时间分布.txt

echo "  弹幕时间分布已生成"

# 步骤3：提取高频弹幕词
echo ""
echo "[3/5] 提取高频弹幕词..."
cat analysis/天下第一纨绔/第1集/弹幕_第1集.csv | \
awk -F',' '{print $5}' | \
sed 's/[^a-zA-Z0-9一-龥]//g' | \
grep -o '[\x{4e00}-\x{9fa5}]\+' | \
sort | uniq -c | sort -rn | head -20 > analysis/天下第一纨绔/第1集/高频词汇.txt

echo "  高频词汇已提取"

# 步骤4：提取柳如烟相关弹幕
echo ""
echo "[4/5] 提取柳如烟相关弹幕..."
grep -i "如烟\|柳如烟" analysis/天下第一纨绔/第1集/弹幕_第1集.csv > analysis/天下第一纨绔/第1集/弹幕_柳如烟.txt 2>/dev/null || true
LIUYANYAN_COUNT=$(wc -l < analysis/天下第一纨绔/第1集/弹幕_柳如烟.txt 2>/dev/null || echo "0")
echo "  找到 $LIUYANYAN_COUNT 条柳如烟相关弹幕"

# 步骤5：使用豆包AI进行深度分析
echo ""
echo "[5/5] 使用AI进行深度分析..."

# 读取第1集字幕
SUBTITLE=$(cat audio/天下第一纨绔/第1集.srt)

# 读取弹幕样本（取前50条）
DANMAKU_SAMPLE=$(head -50 analysis/天下第一纨绔/第1集/弹幕_第1集.csv | cut -d',' -f3,5)

# 读取柳如烟弹幕
LIUYANYAN_DANMAKU=$(cat analysis/天下第一纨绔/第1集/弹幕_柳如烟.txt 2>/dev/null | head -20)

# 构建分析请求
cat > /tmp/episode1_analysis.json << EOF
{
  "model": "$ENDPOINT",
  "messages": [
    {
      "role": "user",
      "content": "你是一位专业的影视分析师和弹幕文化研究专家。请对《天下第一纨绔》第1集进行深度分析。\n\n## 字幕内容\n$SUBTITLE\n\n## 弹幕样本（时间戳为毫秒）\n$DANMAKU_SAMPLE\n\n## 柳如烟相关弹幕\n$LIUYANYAN_DANMAKU\n\n请从以下维度分析：\n\n### 1. 多高潮点识别\n找出本集所有的剧情高潮点，至少包括：\n- 柳如烟出场时间点\n- 皇帝暴怒场景\n- 公主招婿公告\n- 蛮夷介入冲突\n- 其他情感爆发点\n\n### 2. 弹幕热度分析\n- 弹幕密度最高的时间段\n- 观众情绪最激动的时刻\n- 弹幕内容的情感倾向\n\n### 3. 交叉验证\n对比字幕和弹幕，找出：\n- 剧情高潮与弹幕高峰是否一致\n- 柳如烟出场对应的弹幕反应\n- 观众最关注的情节\n\n### 4. 最佳剪辑点推荐\n基于剧情和弹幕分析，推荐：\n- 最适合做短视频的片段\n- 最能引发讨论的台词\n- 最具传播力的名场面\n\n请用JSON格式输出，结构如下：\n{\n  \"episode\": 1,\n  \"climax_points\": [\n    {\n      \"time_range\": \"开始-结束\",\n      \"type\": \"高潮类型\",\n      \"description\": \"描述\",\n      \"key_dialogue\": \"关键台词\",\n      \"danmaku_reaction\": \"弹幕反应\",\n      \"intensity\": \"强度1-10\"\n    }\n  ],\n  \"danmaku_analysis\": {\n    \"peak_times\": [\"时间1\", \"时间2\"],\n    \"hot_words\": [\"词1\", \"词2\"],\n    \"emotion_trend\": \"情感趋势\"\n  },\n  \"liuyanyan_moment\": {\n    \"appear_time\": \"出场时间\",\n    \"danmaku_count\": \"弹幕数量\",\n    \"audience_reaction\": \"观众反应\",\n    \"significance\": \"剧情意义\"\n  },\n  \"best_clips\": [\n    {\n      \"time_range\": \"时间范围\",\n      \"reason\": \"推荐理由\",\n      \"potential_viral\": \"传播潜力\"\n    }\n  ]\n}"
    }
  ]
}
EOF

# 调用API
echo "  正在调用AI分析..."
RESPONSE=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $API_KEY" \
    -d @/tmp/episode1_analysis.json)

# 提取并保存结果
echo "$RESPONSE" | grep -o '"content":"[^"]*"' | head -1 | \
    sed 's/"content":"//;s/"$//;s/\\n/\n/g;s/\\u003e/>/g' > analysis/天下第一纨绔/第1集/深度分析结果.txt

# 清理临时文件
rm -f /tmp/episode1_analysis.json

echo ""
echo "=========================================="
echo "✅ 分析完成！"
echo "=========================================="
echo ""
echo "📁 分析结果保存在: analysis/天下第一纨绔/第1集/"
echo ""
echo "📊 文件列表:"
ls -lh analysis/天下第一纨绔/第1集/
echo ""
echo "📋 预览深度分析结果:"
echo "------------------------------------------"
head -50 analysis/天下第一纨绔/第1集/深度分析结果.txt
