# 🎬 剧智互动 - AI短剧即时互动平台

> 助力打脸，爽感爆发！体验前所未有的互动快感

## ✨ 核心功能

### 六大爽感互动

| 互动类型 | 图标 | 说明 | 积分奖励 |
|---------|------|------|---------|
| 🎯 逆袭打脸 | 👊 | 助力主角反击，打脸反派 | 100分 |
| ⬆️ 升级爽文 | ⬆️ | 助力主角突破，实力飙升 | 150分 |
| 🔥 重生复仇 | 🔥 | 助力主角复仇，大快人心 | 200分 |
| 💕 甜宠偏爱 | 💕 | 助力主角撒糖，甜蜜暴击 | 120分 |
| ⚖️ 道德审判 | ⚖️ | 助力正义审判，伸张正义 | 250分 |
| 💻 系统脑洞 | 💻 | 激活金手指，开挂人生 | 300分 |

### 特效系统

- 🎯 **屏幕震动** - 打脸瞬间的震撼反馈
- ✨ **闪光效果** - 高光时刻的视觉冲击
- 💥 **弹幕风暴** - "爽！""打得好！"的集体狂欢
- 🔊 **音效反馈** - 沉浸式的听觉体验
- ⭐ **积分弹出** - 成就感的即时反馈

### 成就系统

- 🏆 **12种成就** - 从"初出茅庐"到"全能玩家"
- 📊 **等级系统** - 根据积分自动升级
- 🔥 **连击系统** - 越快点击，连击越高

---

## 🚀 快速开始

### 方式一：使用脚本（推荐）

**Windows:**
```bash
scripts\setup.bat
```

**Mac/Linux:**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 方式二：手动安装

```bash
# 1. 安装依赖
npm install

# 2. 准备测试视频
# 把你的视频放到 public/test-video.mp4

# 3. 准备音效文件（可选）
# 把音效放到 public/sounds/ 目录
# - click.mp3 (点击音效)
# - hit.mp3 (打脸音效)
# - power.mp3 (逆袭音效)

# 4. 启动开发服务器
npm run dev
```

### 访问应用

打开浏览器访问: http://localhost:3000

---

## 📁 项目结构

```
Ai-shotvideo-project/
├── public/                      # 静态资源
│   ├── sounds/                 # 音效文件
│   │   ├── click.mp3          # 点击音效
│   │   ├── hit.mp3            # 打脸音效
│   │   └── power.mp3          # 逆袭音效
│   └── test-video.mp4         # 测试视频
│
├── scripts/                     # 脚本工具
│   ├── setup.bat              # Windows初始化脚本
│   └── setup.sh               # Mac/Linux初始化脚本
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css        # 全局样式
│   │   ├── layout.tsx         # 根布局
│   │   └── page.tsx           # 主页面
│   │
│   ├── components/             # React组件
│   │   ├── VideoPlayer.tsx    # 视频播放器（核心）
│   │   ├── PowerButton.tsx    # 助力按钮（带脉冲动画）
│   │   ├── ProgressBar.tsx    # 进度条（带增长效果）
│   │   ├── InteractionEffect.tsx # 互动特效（震动+闪光+弹幕）
│   │   ├── GameHUD.tsx        # 游戏状态显示
│   │   ├── AchievementPanel.tsx # 成就面板
│   │   └── AchievementToast.tsx # 成就提示
│   │
│   ├── config/                 # 配置文件
│   │   └── interactions.ts    # 互动配置
│   │
│   ├── store/                  # 状态管理
│   │   └── gameStore.ts       # 游戏状态（积分/成就/连击）
│   │
│   └── types/                  # TypeScript类型
│       └── index.ts           # 类型定义
│
├── package.json                # 项目配置
├── tsconfig.json              # TypeScript配置
├── tailwind.config.js         # Tailwind CSS配置
├── next.config.js             # Next.js配置
├── .env.example               # 环境变量示例
└── .env.local                 # 本地环境变量
```

---

## 🎮 使用说明

### 互动流程

1. **播放视频** - 视频会自动播放
2. **触发互动** - 到达特定时间点时，视频暂停，弹出互动按钮
3. **疯狂点击** - 快速点击按钮，进度条逐渐增长
4. **触发特效** - 进度条满后，触发炫酷的打脸特效
5. **获得奖励** - 获得积分、解锁成就、提升等级

### 连击系统

- 快速点击可以触发连击
- 连击数越高，特效越炫酷
- 间隔超过1秒会重置连击

### 成就系统

- 完成特定条件解锁成就
- 点击右上角🏆查看成就列表
- 成就会弹出提示通知

---

## ⚙️ 配置说明

### 修改互动时间点

编辑 `src/config/interactions.ts` 文件：

```typescript
{
  id: 'hit-face-1',
  time: 15,  // 修改这个时间（秒）
  type: 'hit-face',
  title: '助力打脸',
  requiredClicks: 20,  // 修改需要点击的次数
  reward: {
    score: 100,  // 修改积分奖励
    effect: '打脸特效',
    sound: '/sounds/hit.mp3',
  },
}
```

### 修改特效样式

编辑 `src/config/interactions.ts` 文件中的 `interactionEffects` 对象。

---

## 🛠️ 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **动画**: Framer Motion
- **状态管理**: Zustand

---

## 📈 后续规划

- [ ] 添加更多互动类型
- [ ] 实现多人实时互动
- [ ] AI识别互动时间点
- [ ] 数字人对话系统
- [ ] 社交分享功能
- [ ] 排行榜系统

---

## 📄 许可证

私有项目

---

## 🎯 开始体验

```bash
npm run dev
```

然后访问 http://localhost:3000 开始体验！
