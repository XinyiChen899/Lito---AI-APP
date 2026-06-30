# Lito - AI情感伴宠APP

🌐 **在线访问**: [https://XinyiChen899.github.io/Lito---AI-APP/](https://XinyiChen899.github.io/Lito---AI-APP/)

Lito是一款软硬件一体的AI情感陪伴宠物，通过可爱的实体宠物与APP联动，为用户提供深度情感支持、智能互动和独特的梦境体验。

## 特性

- **虚拟宠物Lito**：可爱的毛茸茸形象，支持多种情绪表达
- **情感互动**：陪伴、倾听、玩耍、冥想（替代传统喂食喝水）
- **AI聊天**：智能情绪分析和温暖的情感回应
- **梦境系统**：探索梦境世界，收集记忆碎片
- **心情日记**：记录每日心情，生成情感报告
- **硬件联动**：与实体Lito设备同步状态

## 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite
- **样式**：TailwindCSS 3
- **状态管理**：Zustand
- **图标**：Lucide React

## 安装

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

## 项目结构

```
src/
├── components/     # 组件
│   ├── LitoPet.tsx     # Lito虚拟宠物
│   ├── LitoLogo.tsx    # Logo组件
│   └── BottomNav.tsx   # 底部导航
├── pages/          # 页面
│   ├── Home.tsx        # 主页
│   ├── Chat.tsx        # 聊天页
│   ├── Care.tsx        # 养成页
│   ├── Dream.tsx       # 梦境页
│   └── Diary.tsx       # 日记页
├── store/          # 状态管理
│   └── litoStore.ts
├── api/            # API服务
│   └── mockData.ts
├── types/          # 类型定义
│   └── index.ts
└── App.tsx         # 应用入口
```

## 设计理念

Lito不是传统意义上的生物宠物，不需要喂食、喝水等生物照料，而是一个能够感知情绪、建立情感连接的AI伙伴。梦境系统是Lito的核心特色功能，为用户提供独特的情感体验。

## License

MIT