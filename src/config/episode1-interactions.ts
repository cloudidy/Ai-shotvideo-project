// 第1集互动配置 - 基于深度分析的6大高潮点

export interface EpisodeInteractionPoint {
  id: string
  time: number
  timeStr: string
  type: string
  title: string
  description: string
  intensity: number  // 1-10
  requiredClicks: number
  duration: number
  reward: {
    score: number
    effect: string
    sound: string
  }
  metadata: {
    keyDialogue: string
    climaxType: string
  }
}

// 第1集互动点配置
export const episode1Interactions: EpisodeInteractionPoint[] = [
  {
    id: 'ep1-climax-1-liuyanru',
    time: 76,  // 对应 01:16
    timeStr: '1:16',
    type: '柳如烟出场',
    title: '助力柳如烟登场',
    description: '柳如烟身着月白锦裙登场，掏出祖传婚书当众退婚',
    intensity: 8,
    requiredClicks: 15,
    duration: 10,
    reward: {
      score: 200,
      effect: '柳如烟登场特效',
      sound: '/sounds/liuyanru.mp3',
    },
    metadata: {
      keyDialogue: '今日我要和苏尘解除婚约',
      climaxType: '人物登场高潮',
    },
  },
  {
    id: 'ep1-climax-2-protagonist',
    time: 118,  // 对应 01:58
    timeStr: '1:58',
    type: '主角逆袭',
    title: '助力苏尘逆袭',
    description: '苏尘撕毁退婚书，当众宣布休了柳如烟',
    intensity: 9,
    requiredClicks: 20,
    duration: 12,
    reward: {
      score: 300,
      effect: '主角逆袭特效',
      sound: '/sounds/protagonist.mp3',
    },
    metadata: {
      keyDialogue: '今日不是你柳如烟休我，是我苏尘休了你',
      climaxType: '人设反转爽点',
    },
  },
  {
    id: 'ep1-climax-3-emperor',
    time: 190,  // 对应 03:10
    timeStr: '3:10',
    type: '帝王震怒',
    title: '助力皇帝震怒',
    description: '边关八百里加急，三万边军覆没，皇帝掀翻御案',
    intensity: 9,
    requiredClicks: 18,
    duration: 10,
    reward: {
      score: 250,
      effect: '帝王震怒特效',
      sound: '/sounds/emperor.mp3',
    },
    metadata: {
      keyDialogue: '满朝公卿全是吃空饷的废物',
      climaxType: '朝堂冲突高潮',
    },
  },
  {
    id: 'ep1-climax-4-announcement',
    time: 220,  // 对应 03:40
    timeStr: '3:40',
    type: '系统',
    title: '助力公主招婿',
    description: '大内总管宣读圣旨，永安公主公开招婿，不限身份',
    intensity: 7,
    requiredClicks: 12,
    duration: 8,
    reward: {
      score: 180,
      effect: '圣旨特效',
      sound: '/sounds/imperial.mp3',
    },
    metadata: {
      keyDialogue: '不限身份品级，通过三道考核即可迎娶公主',
      climaxType: '剧情转折高潮',
    },
  },
  {
    id: 'ep1-climax-5-barbarian',
    time: 260,  // 对应 04:20
    timeStr: '4:20',
    type: '复仇',
    title: '助力反击蛮夷',
    description: '北蛮使团闯入长安，展出边军尸首挑衅，扔下生死挑战书',
    intensity: 9,
    requiredClicks: 20,
    duration: 12,
    reward: {
      score: 280,
      effect: '民族情绪特效',
      sound: '/sounds/barbarian.mp3',
    },
    metadata: {
      keyDialogue: '三月之后铁蹄踏平大靖都城',
      climaxType: '外部民族矛盾高潮',
    },
  },
  {
    id: 'ep1-climax-6-finale',
    time: 295,  // 对应 04:55
    timeStr: '4:55',
    type: '接受挑战',
    title: '助力苏尘接战',
    description: '苏尘签下挑战书，放话将使团人头挂在城门示众',
    intensity: 10,
    requiredClicks: 25,
    duration: 15,
    reward: {
      score: 500,
      effect: '终极悬念特效',
      sound: '/sounds/finale.mp3',
    },
    metadata: {
      keyDialogue: '要把所有使团的人头挂在长安城门示众',
      climaxType: '第一集收尾悬念高潮',
    },
  },
]

// 导出配置
export const episode1Config = {
  episode: '第1集',
  dramaId: 'tianxia',
  dramaName: '天下第一纨绔',
  totalInteractions: episode1Interactions.length,
  totalIntensity: episode1Interactions.reduce((sum, p) => sum + p.intensity, 0),
  averageIntensity: episode1Interactions.reduce((sum, p) => sum + p.intensity, 0) / episode1Interactions.length,
  interactions: episode1Interactions,
}

// 获取指定时间的互动点
export function getInteractionAtTime(time: number): EpisodeInteractionPoint | null {
  return episode1Interactions.find(point => {
    const endTime = point.time + point.duration
    return time >= point.time && time <= endTime
  }) || null
}

// 获取下一个互动点
export function getNextInteraction(currentTime: number): EpisodeInteractionPoint | null {
  return episode1Interactions.find(point => point.time > currentTime) || null
}

// 获取所有互动点的时间列表
export function getInteractionTimes(): number[] {
  return episode1Interactions.map(point => point.time)
}

// 获取互动点统计
export function getInteractionStats() {
  const types = episode1Interactions.reduce((acc, point) => {
    acc[point.type] = (acc[point.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    total: episode1Interactions.length,
    types,
    maxIntensity: Math.max(...episode1Interactions.map(p => p.intensity)),
    minIntensity: Math.min(...episode1Interactions.map(p => p.intensity)),
    totalRewardScore: episode1Interactions.reduce((sum, p) => sum + p.reward.score, 0),
  }
}
