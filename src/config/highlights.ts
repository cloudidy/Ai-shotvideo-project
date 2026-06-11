// 高光点配置 - 基于弹幕数据分析自动生成
export interface HighlightPoint {
  time: number        // 时间点（秒）
  timeStr: string     // 时间字符串
  type: 'opening' | 'climax' | 'closing'  // 位置类型
  interactionType: string  // 互动类型
  score: number       // 综合得分
  likesCount: number      // 点赞数量
  label: string       // 标签说明
  keyword: string     // 场景关键词（2-4字，显示在按钮上）
}

export interface EpisodeHighlights {
  episode: string
  duration: number
  highlights: HighlightPoint[]
}

// 天下第一纨绔 前5集高光点配置
export const tianxiaHighlights: EpisodeHighlights[] = [
  {
    episode: '第1集',
    duration: 309,
    highlights: [
      {
        time: 76,
        timeStr: '1:16',
        type: 'climax',
        interactionType: '超级弹幕-柳如烟',
        score: 1500,
        likesCount: 200,
        label: '柳如烟出场 - 退婚宣言引爆舆论',
        keyword: '退婚'
      },
      {
        time: 118,
        timeStr: '1:58',
        type: 'climax',
        interactionType: '打脸',
        score: 1800,
        likesCount: 280,
        label: '苏尘撕毁退婚书 - 人设反转爽点',
        keyword: '撕书'
      },
      {
        time: 190,
        timeStr: '3:10',
        type: 'climax',
        interactionType: '复仇',
        score: 1600,
        likesCount: 250,
        label: '皇帝暴怒 - 边军覆没朝堂震动',
        keyword: '暴怒'
      },
      {
        time: 220,
        timeStr: '3:40',
        type: 'climax',
        interactionType: '系统',
        score: 1200,
        likesCount: 180,
        label: '公主招婿公告 - 不限身份公开招婿',
        keyword: '招婿'
      },
      {
        time: 260,
        timeStr: '4:20',
        type: 'climax',
        interactionType: '复仇',
        score: 1700,
        likesCount: 260,
        label: '蛮夷挑衅 - 北蛮使团当众羞辱',
        keyword: '挑衅'
      },
      {
        time: 295,
        timeStr: '4:55',
        type: 'closing',
        interactionType: '升级',
        score: 2000,
        likesCount: 350,
        label: '苏尘接下挑战 - 第一集终极悬念',
        keyword: '接战'
      }
    ]
  },
  {
    episode: '第2集',
    duration: 76,
    highlights: [
      {
        time: 4,
        timeStr: '0:04',
        type: 'opening',
        interactionType: '升级',
        score: 412,
        likesCount: 72,
        label: '高手坦言遇强敌',
        keyword: '强敌'
      },
      {
        time: 49,
        timeStr: '0:49',
        type: 'climax',
        interactionType: '系统',
        score: 460,
        likesCount: 64,
        label: '下令测试权贵子弟',
        keyword: '测试'
      },
      {
        time: 40,
        timeStr: '0:40',
        type: 'climax',
        interactionType: '撒糖',
        score: 344,
        likesCount: 34,
        label: '角色讨论 - 青楼侠',
        keyword: '侠客'
      },
      {
        time: 50,
        timeStr: '0:50',
        type: 'closing',
        interactionType: '撒糖',
        score: 154,
        likesCount: 8,
        label: '结尾悬念 - 弹指神通',
        keyword: '悬念'
      }
    ]
  },
  {
    episode: '第3集',
    duration: 184,
    highlights: [
      {
        time: 5,
        timeStr: '0:05',
        type: 'opening',
        interactionType: '复仇',
        score: 325,
        likesCount: 65,
        label: '侯爷怒斥孽子',
        keyword: '怒斥'
      },
      {
        time: 30,
        timeStr: '0:30',
        type: 'climax',
        interactionType: '撒糖',
        score: 1258,
        likesCount: 188,
        label: '捧杀揭露 - 后娘捧杀曝光',
        keyword: '捧杀'
      },
      {
        time: 60,
        timeStr: '1:00',
        type: 'climax',
        interactionType: '升级',
        score: 1509,
        likesCount: 279,
        label: '全剧最高潮 - 你就宠着他吧',
        keyword: '宠他'
      },
      {
        time: 105,
        timeStr: '1:45',
        type: 'climax',
        interactionType: '审判',
        score: 1167,
        likesCount: 203,
        label: '男主戳穿伪装',
        keyword: '戳穿'
      },
      {
        time: 136,
        timeStr: '2:16',
        type: 'climax',
        interactionType: '复仇',
        score: 1500,
        likesCount: 300,
        label: '揭露弑母真相',
        keyword: '弑母'
      }
    ]
  },
  {
    episode: '第4集',
    duration: 183,
    highlights: [
      {
        time: 0,
        timeStr: '0:00',
        type: 'opening',
        interactionType: '系统',
        score: 346,
        likesCount: 76,
        label: '开场爆发 - 卧薪尝胆',
        keyword: '尝胆'
      },
      {
        time: 100,
        timeStr: '1:40',
        type: 'climax',
        interactionType: '升级',
        score: 328,
        likesCount: 42,
        label: '剧情讨论 - 反面人物在家',
        keyword: '反派'
      },
      {
        time: 140,
        timeStr: '2:20',
        type: 'climax',
        interactionType: '升级',
        score: 312,
        likesCount: 68,
        label: '角色对比 - 小秦氏心机',
        keyword: '心机'
      },
      {
        time: 150,
        timeStr: '2:30',
        type: 'climax',
        interactionType: '其他',
        score: 519,
        likesCount: 147,
        label: '搞笑吐槽 - 年龄大记忆力不好',
        keyword: '搞笑'
      },
      {
        time: 160,
        timeStr: '2:40',
        type: 'closing',
        interactionType: '系统',
        score: 434,
        likesCount: 48,
        label: '结尾悬念 - 哎呀',
        keyword: '哎呀'
      }
    ]
  },
  {
    episode: '第5集',
    duration: 108,
    highlights: [
      {
        time: 0,
        timeStr: '0:00',
        type: 'opening',
        interactionType: '复仇',
        score: 547,
        likesCount: 119,
        label: '开场爆发 - 不测就没戏看了',
        keyword: '测试'
      },
      {
        time: 30,
        timeStr: '0:30',
        type: 'climax',
        interactionType: '升级',
        score: 175,
        likesCount: 29,
        label: '角色演绎 - 纨绔样子太像',
        keyword: '纨绔'
      },
      {
        time: 50,
        timeStr: '0:50',
        type: 'climax',
        interactionType: '撒糖',
        score: 174,
        likesCount: 18,
        label: '剧情讨论 - 其实他知道',
        keyword: '知情'
      },
      {
        time: 60,
        timeStr: '1:00',
        type: 'climax',
        interactionType: '打脸',
        score: 210,
        likesCount: 50,
        label: '高光时刻 - 好帅落地',
        keyword: '帅!'
      },
      {
        time: 80,
        timeStr: '1:20',
        type: 'closing',
        interactionType: '撒糖',
        score: 493,
        likesCount: 135,
        label: '结尾悬念 - 让你走了吗',
        keyword: '别走'
      }
    ]
  }
]

// 获取指定剧集的高光点配置
export function getHighlights(dramaId: string, episodeName: string): HighlightPoint[] {
  if (dramaId === 'tianxia') {
    const episode = tianxiaHighlights.find(e => e.episode === episodeName)
    return episode?.highlights || []
  }
  return []
}

// 互动类型对应的emoji
export const interactionEmojis: Record<string, string> = {
  '打脸': '👊',
  '升级': '⬆️',
  '复仇': '🔥',
  '撒糖': '💕',
  '审判': '⚖️',
  '系统': '💻',
  '其他': '🎭'
}

// 位置类型对应的标签
export const typeLabels: Record<string, string> = {
  'opening': '🎬 开场',
  'climax': '🔥 高潮',
  'closing': '🔚 结尾'
}
