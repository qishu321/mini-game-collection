# 游艺小馆 · 小游戏集合

一个持续扩展的网页小游戏集合。游戏以独立目录组织，静态内容可以直接部署到 GitHub Pages。

## 已有游戏

### 绮局：中国象棋

- 完整象棋棋规与将军、将死判定
- 简单和噩梦两档纯浏览器 AI
- Q 版合成音效、炮击提示与战斗演出
- 随机匹配、服务器权威判定、计时、认输、再战和断线重连

噩梦 AI 在 Web Worker 中运行，使用紧凑 90 格棋盘、增量 Zobrist 哈希、跨回合置换表、PVS、Alpha-Beta、静态延伸、空着裁剪、后期着法缩减、杀手着法和历史启发。无需模型文件或 AI 接口。

### 星盘：五子棋

- 标准 15×15 星盘与自由五子棋规则
- 简单、噩梦两档浏览器 AI，计算过程运行在 Web Worker
- 本地双人、悔棋、键盘落子、胜利连线与 Q 版合成音效

## 计划加入

- 2048
- 贪吃蛇

## 项目结构

```text
dist/
├─ index.html                # 游戏集合首页
├─ collection.css
└─ games/
   ├─ xiangqi/              # 中国象棋
   └─ gomoku/               # 五子棋
server.mjs                  # 静态服务与联网匹配服务器
tests/                      # 棋规和 AI 测试
```

后续游戏建议统一放在 `dist/games/<game-name>/`，并在集合首页增加入口卡片。

## 本地启动

```powershell
npm start
```

打开 <http://127.0.0.1:4173/>。联网模式可用两个分别新开的浏览器标签页测试。

```powershell
npm test
```

## GitHub Pages

仓库自带 `.github/workflows/pages.yml`。推送到 `main` 后，GitHub Actions 会发布 `dist`。

人机模式和单机内容在 GitHub Pages 上可以直接运行。随机联网匹配依赖 WebSocket 服务，正式上线时需要单独部署 `server.mjs`，再让前端连接该服务。

## 局域网对战

```powershell
npm run start:lan
```

另一台设备访问 `http://这台电脑的局域网IP:4173/`。联网房间保存在内存中，重启服务会清空排队与对局。
