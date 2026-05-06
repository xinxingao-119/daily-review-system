# 每日复盘系统

个人复盘与知识管理 Web 应用，整合每日复盘日志、碎片化笔记、任务提醒和长期目标管理四大核心功能。

## 功能特性

- **每日复盘日志** - 记录每日工作完成情况、遇到的问题、明日计划和反思感悟
- **碎片化笔记** - 快速记录灵感、资料，支持标签分类和搜索
- **提醒功能** - 设置一次性或重复提醒，管理待办事项
- **长期目标管理** - 设定目标、追踪进度，关联笔记和复盘
- **统计图表** - 可视化复盘频率、笔记趋势、目标分布等数据
- **响应式设计** - 支持桌面端和移动端访问

## 技术栈

- **全栈框架**: Next.js 14 (App Router)
- **前端 UI**: TailwindCSS
- **图表库**: Chart.js + react-chartjs-2
- **后端**: Next.js API Routes (Serverless Functions)
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **ORM**: Prisma
- **认证**: NextAuth.js

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env

# 执行数据库迁移
npm run db:push

# 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| DATABASE_URL | 数据库连接字符串 | file:./dev.db |
| NEXTAUTH_URL | NextAuth 回调 URL | http://localhost:3000 |
| NEXTAUTH_SECRET | NextAuth 密钥 | your-secret-key |

## 部署

### Vercel 部署

1. 推送代码到 GitHub 仓库
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量
4. 触发自动构建和部署

### 数据库迁移

部署后执行数据库迁移：

```bash
npx prisma db push
```

## 可用脚本

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run start    # 启动生产服务器
npm run lint     # 运行 ESLint
npm run db:generate  # 生成 Prisma 客户端
npm run db:push      # 推送数据库变更
npm run db:studio    # 打开 Prisma Studio
```

## 项目结构

```
src/
├── app/              # Next.js App Router
│   ├── (auth)/       # 认证页面
│   ├── (dashboard)/  # 主应用页面
│   └── api/          # API 路由
├── components/       # React 组件
├── lib/              # 工具库
└── types/            # TypeScript 类型定义
```

## 许可证

MIT
