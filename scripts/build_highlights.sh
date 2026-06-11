#!/bin/bash
# 全流程 Pipeline 脚本
# 用法: bash scripts/build_highlights.sh [dramaId] [episodeNumber]
# 示例: bash scripts/build_highlights.sh tianxia 1
#
# 流程:
# 1. 检查视频是否存在
# 2. 提取音频（如果不存在）
# 3. 生成字幕（如果不存在）
# 4. AI 语义分析（如果不存在）
# 5. 弹幕密度分析
# 6. 交叉验证生成最终 JSON

set -e

# 配置
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
VIDEO_DIR="$PROJECT_DIR/video"
AUDIO_DIR="$PROJECT_DIR/audio"
ANALYSIS_DIR="$PROJECT_DIR/analysis"
DATA_DIR="$PROJECT_DIR/data/highlights"

# 豆包 API 配置
DOUBAO_API_KEY="${DOUBAO_API_KEY:-}"
DOUBAO_ENDPOINT="${DOUBAO_ENDPOINT:-ep-20260514111117-s7m8b}"
DOUBAO_BASE_URL="https://ark.cn-beijing.volces.com/api/v3"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 参数校验
DRAMA_ID="${1:-tianxia}"
EPISODE_NUM="${2:-1}"

# 剧集名称映射
case "$DRAMA_ID" in
  tianxia) DRAMA_NAME="天下第一纨绔" ;;
  beipai)  DRAMA_NAME="北派寻宝日记" ;;
  *)       log_error "不支持的剧集 ID: $DRAMA_ID"; exit 1 ;;
esac

EPISODE_NAME="第${EPISODE_NUM}集"
VIDEO_FILE="$VIDEO_DIR/$DRAMA_NAME/$EPISODE_NAME.mp4"
AUDIO_FILE="$AUDIO_DIR/$DRAMA_NAME/$EPISODE_NAME.mp3"
SUBTITLE_FILE="$AUDIO_DIR/$DRAMA_NAME/$EPISODE_NAME.srt"
OUTPUT_FILE="$DATA_DIR/$DRAMA_ID/$EPISODE_NUM.json"

echo ""
echo "=========================================="
echo "  高光点生成 Pipeline"
echo "=========================================="
echo "  剧集: $DRAMA_NAME ($DRAMA_ID)"
echo "  集数: $EPISODE_NAME"
echo "  输出: $OUTPUT_FILE"
echo "=========================================="
echo ""

# ========== Step 1: 检查视频 ==========
log_info "Step 1: 检查视频文件..."
if [ ! -f "$VIDEO_FILE" ]; then
  log_error "视频文件不存在: $VIDEO_FILE"
  exit 1
fi
VIDEO_SIZE=$(du -h "$VIDEO_FILE" | cut -f1)
log_success "视频文件存在 ($VIDEO_SIZE)"

# ========== Step 2: 提取音频 ==========
log_info "Step 2: 检查音频文件..."
if [ ! -f "$AUDIO_FILE" ]; then
  log_warn "音频文件不存在，开始提取..."
  mkdir -p "$AUDIO_DIR/$DRAMA_NAME"
  ffmpeg -i "$VIDEO_FILE" -vn -acodec libmp3lame -q:a 2 "$AUDIO_FILE" -y -loglevel error
  log_success "音频提取完成"
else
  log_success "音频文件已存在"
fi

# ========== Step 3: 生成字幕 ==========
log_info "Step 3: 检查字幕文件..."
if [ ! -f "$SUBTITLE_FILE" ]; then
  log_warn "字幕文件不存在，需要手动生成"
  log_warn "请运行: bash scripts/audio_to_srt_final.sh $AUDIO_FILE"
  log_warn "或使用 Whisper: python scripts/transcribe_all.py"
  # 如果有 API key，可以自动调用
  if [ -n "$DOUBAO_API_KEY" ]; then
    log_info "检测到豆包 API Key，尝试自动生成字幕..."
    bash "$PROJECT_DIR/scripts/audio_to_srt_final.sh" "$AUDIO_FILE"
  else
    log_error "请先生成字幕文件"
    exit 1
  fi
else
  log_success "字幕文件已存在"
fi

# ========== Step 4: AI 语义分析 ==========
log_info "Step 4: 检查语义分析结果..."
ANALYSIS_FILE="$ANALYSIS_DIR/$DRAMA_NAME/${EPISODE_NAME}_多高潮点分析.md"
if [ ! -f "$ANALYSIS_FILE" ]; then
  log_warn "语义分析文件不存在: $ANALYSIS_FILE"
  log_warn "请先运行分析脚本或手动创建"
  # TODO: 自动调用豆包 API 进行分析
else
  log_success "语义分析文件已存在"
fi

# ========== Step 5: 弹幕密度分析 ==========
log_info "Step 5: 弹幕密度分析..."
DANMAKU_FILE="$VIDEO_DIR/${DRAMA_NAME}_弹幕_已过滤.csv"
if [ -f "$DANMAKU_FILE" ]; then
  log_success "弹幕数据文件已存在"

  # 统计第 N 集的弹幕数量
  # 弹幕格式: 剧名,集数,时间戳ms,点赞数,内容
  EPISODE_DANMAKU_COUNT=$(grep -c ",第${EPISODE_NUM}集," "$DANMAKU_FILE" 2>/dev/null || echo "0")
  log_info "第${EPISODE_NUM}集弹幕数量: $EPISODE_DANMAKU_COUNT"
else
  log_warn "弹幕数据文件不存在，跳过弹幕分析"
fi

# ========== Step 6: 检查输出文件 ==========
log_info "Step 6: 检查输出文件..."
if [ -f "$OUTPUT_FILE" ]; then
  log_success "高光点 JSON 已存在: $OUTPUT_FILE"
  log_info "如需重新生成，请先删除该文件"
  echo ""
  echo "当前高光点数据:"
  cat "$OUTPUT_FILE" | python -m json.tool 2>/dev/null || cat "$OUTPUT_FILE"
  exit 0
fi

# ========== Step 7: 生成 JSON ==========
log_info "Step 7: 生成高光点 JSON..."
mkdir -p "$DATA_DIR/$DRAMA_ID"

log_warn "自动 JSON 生成功能尚未实现"
log_warn "请手动创建: $OUTPUT_FILE"
log_info "参考格式: data/highlights/tianxia/1.json"

echo ""
echo "=========================================="
echo "  Pipeline 完成"
echo "=========================================="
