# 字幕文件说明

## 📁 目录结构

```
subtitles/
└── 天下第一纨绔/
    ├── 第1集.json    # 完整识别结果（含置信度）
    ├── 第1集.srt     # SRT字幕格式（带时间戳）
    ├── 第1集.txt     # 纯文本（无时间戳）
    ├── 第2集.json
    ├── 第2集.srt
    ├── 第2集.txt
    ├── ...
    └── summary.json  # 汇总信息
```

## 📊 转录统计

| 集数 | 文本长度 | 片段数 | 说明 |
|------|----------|--------|------|
| 第1集 | 809字 | 134个 | 最长 |
| 第2集 | 229字 | 35个 | 最短 |
| 第3集 | 560字 | 88个 | |
| 第4集 | 350字 | 65个 | |
| 第5集 | 173字 | 33个 | |

**总耗时：324.8秒（约5.4分钟）**
**平均每个文件：65秒**

## 🎯 文件格式说明

### JSON格式（完整信息）
```json
{
  "text": "完整文本内容",
  "segments": [
    {
      "id": 0,
      "start": 0.0,
      "end": 2.0,
      "text": "你别跑啊",
      "tokens": [...],
      "temperature": 0.0,
      "avg_logprob": -0.42,
      "compression_ratio": 1.23,
      "no_speech_prob": 0.19
    }
  ],
  "language": "zh"
}
```

### SRT格式（标准字幕）
```
1
00:00:00,000 --> 00:00:02,000
你别跑啊

2
00:00:02,000 --> 00:00:04,000
好
```

### TXT格式（纯文本）
```
你别跑啊好好好好好这妖嫁女儿...
```

## 💻 使用方法

### 1. 直接加载JSON
```javascript
const response = await fetch('/subtitles/天下第一纨绔/第1集.json')
const subtitle = await response.json()
```

### 2. 使用工具函数
```typescript
import { loadSubtitle, getSubtitleAtTime, searchSubtitle } from '@/utils/subtitleLoader'

// 加载字幕
const subtitle = await loadSubtitle('第1集')

// 获取当前时间点的字幕
const current = getSubtitleAtTime(subtitle.segments, 30.5)

// 搜索关键词
const results = searchSubtitle(subtitle.segments, '陛下')
```

### 3. 分析剧情高光点
```typescript
// 结合弹幕数据和字幕分析
const subtitle = await loadSubtitle('第1集')
const highDensitySegments = subtitle.segments.filter(seg => {
  // 找到对白密集的片段
  return seg.text.length > 10
})
```

## 🔧 重新转录

如果需要重新转录，运行：
```bash
python scripts/transcribe_all.py
```

## 📝 注意事项

1. **识别准确率**：Whisper small模型对中文识别效果不错，但可能有少量错误
2. **时间戳精度**：时间戳精确到秒级
3. **文件大小**：JSON文件较大（含完整信息），SRT和TXT较小
4. **编码格式**：所有文件使用UTF-8编码

## 🚀 下一步

可以结合字幕数据进行：
1. **剧情高光点分析** - 找到对白密集、情感强烈的片段
2. **互动时间点匹配** - 将字幕与弹幕数据交叉验证
3. **关键词提取** - 自动提取剧情关键词
4. **情感分析** - 分析对白的情感倾向
