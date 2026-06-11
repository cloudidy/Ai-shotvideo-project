// 视频互动时间点配置
export interface InteractionPoint {
  id: string;
  time: number; // 触发时间（秒）
  type: 'hit-face' | 'upgrade' | 'revenge' | 'sweet' | 'justice' | 'system' | 'super-danmaku-liuyanru' | 'gold-ingot-hunt' | 'liuyanru-entrance' | 'protagonist-reverse' | 'emperor-rage' | 'challenge-accept';
  title: string;
  requiredClicks: number; // 需要点击次数
  duration: number; // 按钮持续时间（秒）
  reward: {
    score: number;
    effect: string;
    sound: string;
  };
}

// 互动状态
export interface InteractionState {
  isActive: boolean;
  currentPoint: InteractionPoint | null;
  clickCount: number;
  progress: number; // 0-100
  isCompleted: boolean;
  totalScore: number;
}

// 打脸特效配置
export interface HitEffectConfig {
  shakeIntensity: number;
  flashColor: string;
  duration: number;
  soundUrl: string;
}

// 视频配置
export interface VideoConfig {
  url: string;
  interactionPoints: InteractionPoint[];
  hitEffect: HitEffectConfig;
}
