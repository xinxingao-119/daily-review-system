# 每日复盘系统 - 技术设计

Feature Name: daily-review-system
Updated: 2026-05-06

## 描述

本系统是一个面向个人用户的复盘与知识管理 Web 应用，整合每日复盘日志、碎片化笔记、任务提醒和长期目标管理四大核心功能，并提供统计数据与图表展示。系统采用全栈架构，支持通过云服务一键部署。

## 架构

```mermaid
graph TB
    Client["浏览器客户端 (PC/Mobile)"]
    NextJS["Next.js 14 全栈应用"]
    API["API Routes (Serverless)"]
    Auth["用户认证模块"]
    Review["复盘模块"]
    Note["笔记模块"]
    Reminder["提醒模块"]
    Goal["目标模块"]
    Stats["统计模块"]
    DB["SQLite 数据库"]
    Cache["内存缓存"]

    Client --> NextJS
    NextJS --> API
    API --> Auth
    API --> Review
    API --> Note
    API --> Reminder
    API --> Goal
    API --> Stats
    Auth --> DB
    Review --> DB
    Note --> DB
    Reminder --> DB
    Reminder --> Cache
    Goal --> DB
    Stats --> DB
    Stats --> Cache
```

**技术栈选型：**
- **全栈框架**: Next.js 14 (App Router)
- **前端 UI**: TailwindCSS + shadcn/ui 组件库
- **图表库**: Chart.js + react-chartjs-2
- **后端**: Next.js API Routes (Serverless Functions)
- **数据库**: SQLite (开发) / PostgreSQL (生产，通过 Supabase/Neon)
- **ORM**: Prisma
- **认证**: NextAuth.js (支持邮箱/密码登录)
- **状态管理**: Zustand (轻量级)
- **部署**: Vercel (全栈一体化部署)

## 组件与接口

### 前端组件结构

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 认证路由组
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/              # 主应用路由组
│   │   ├── layout.tsx            # 仪表盘布局
│   │   ├── page.tsx              # 首页（概览）
│   │   ├── review/               # 复盘模块
│   │   │   ├── page.tsx          # 复盘列表
│   │   │   ├── new/page.tsx      # 新建复盘
│   │   │   └── [id]/page.tsx     # 复盘详情/编辑
│   │   ├── notes/                # 笔记模块
│   │   │   ├── page.tsx          # 笔记列表
│   │   │   └── [id]/page.tsx     # 笔记详情/编辑
│   │   ├── reminders/            # 提醒模块
│   │   │   └── page.tsx
│   │   ├── goals/                # 目标模块
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── stats/                # 统计模块
│   │       └── page.tsx
│   ├── api/                      # API Routes
│   │   ├── auth/[...nextauth]/
│   │   ├── reviews/
│   │   ├── notes/
│   │   ├── reminders/
│   │   └── goals/
│   └── layout.tsx
├── components/
│   ├── ui/                       # shadcn/ui 基础组件
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── mobile-nav.tsx
│   ├── review/
│   │   ├── review-form.tsx
│   │   ├── review-card.tsx
│   │   └── review-list.tsx
│   ├── note/
│   │   ├── note-input.tsx
│   │   ├── note-card.tsx
│   │   └── note-list.tsx
│   ├── reminder/
│   │   ├── reminder-form.tsx
│   │   └── reminder-list.tsx
│   ├── goal/
│   │   ├── goal-form.tsx
│   │   ├── goal-card.tsx
│   │   └── goal-progress.tsx
│   ├── stats/
│   │   ├── stats-overview.tsx
│   │   ├── review-chart.tsx
│   │   ├── note-chart.tsx
│   │   ├── goal-chart.tsx
│   │   └── heatmap.tsx
│   └── shared/
│       ├── search-bar.tsx
│       ├── tag-selector.tsx
│       └── date-picker.tsx
├── lib/
│   ├── db.ts                     # Prisma 客户端
│   ├── auth.ts                   # NextAuth 配置
│   └── utils.ts                  # 工具函数
├── hooks/
│   ├── use-reviews.ts
│   ├── use-notes.ts
│   ├── use-reminders.ts
│   └── use-goals.ts
└── store/
    └── app-store.ts              # Zustand 全局状态
```

### API 接口设计

#### 认证模块

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |
| POST | /api/auth/logout | 用户登出 |
| GET | /api/auth/session | 获取当前会话 |

#### 复盘模块

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/reviews | 获取复盘列表（支持分页、搜索） |
| GET | /api/reviews/:id | 获取单个复盘详情 |
| POST | /api/reviews | 创建新复盘 |
| PUT | /api/reviews/:id | 更新复盘内容 |
| DELETE | /api/reviews/:id | 删除复盘 |
| GET | /api/reviews/today | 检查今日复盘状态 |

#### 笔记模块

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/notes | 获取笔记列表（支持分页、标签筛选、搜索） |
| GET | /api/notes/:id | 获取单个笔记详情（含编辑历史） |
| POST | /api/notes | 创建新笔记 |
| PUT | /api/notes/:id | 更新笔记内容 |
| DELETE | /api/notes/:id | 删除笔记 |
| GET | /api/notes/tags | 获取所有标签列表 |

#### 提醒模块

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/reminders | 获取提醒列表（支持状态筛选） |
| POST | /api/reminders | 创建新提醒 |
| PUT | /api/reminders/:id | 更新提醒状态 |
| DELETE | /api/reminders/:id | 删除提醒 |
| POST | /api/reminders/:id/dismiss | 确认/忽略提醒 |

#### 目标模块

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/goals | 获取目标列表 |
| GET | /api/goals/:id | 获取目标详情（含关联笔记/复盘） |
| POST | /api/goals | 创建新目标 |
| PUT | /api/goals/:id | 更新目标信息/进度 |
| DELETE | /api/goals/:id | 删除目标 |
| POST | /api/goals/:id/link | 关联笔记到目标 |

#### 统计模块

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/stats/overview | 获取统计概览数据 |
| GET | /api/stats/reviews | 获取复盘趋势数据 |
| GET | /api/stats/notes | 获取笔记趋势数据 |
| GET | /api/stats/goals | 获取目标分布数据 |
| GET | /api/stats/tags | 获取标签使用统计 |
| GET | /api/stats/heatmap | 获取热力图数据 |

## 数据模型

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  name          String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  reviews       Review[]
  notes         Note[]
  reminders     Reminder[]
  goals         Goal[]
}

model Review {
  id              String    @id @default(cuid())
  userId          String
  date            DateTime  // 复盘日期
  workCompleted   String    @default("")  // 今日完成的工作
  problems        String    @default("")  // 遇到的问题
  tomorrowPlan    String    @default("")  // 明日计划
  reflections     String    @default("")  // 反思/感悟
  status          String    @default("draft")  // draft, completed
  wordCount       Int       @default(0)
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  user            User      @relation(fields: [userId], references: [id])
  
  @@unique([userId, date])
  @@index([userId, date])
}

model Note {
  id              String    @id @default(cuid())
  userId          String
  content         String    // 笔记内容
  tags            String[]  // 标签数组
  goalId          String?   // 关联的目标
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  user            User      @relation(fields: [userId], references: [id])
  goal            Goal?     @relation(fields: [goalId], references: [id])
  editHistory     EditHistory[]
  
  @@index([userId, createdAt])
  @@index([userId, tags])
}

model EditHistory {
  id              String    @id @default(cuid())
  noteId          String
  content         String    // 历史版本内容
  createdAt       DateTime  @default(now())
  
  note            Note      @relation(fields: [noteId], references: [id])
  
  @@index([noteId, createdAt])
}

model Reminder {
  id              String    @id @default(cuid())
  userId          String
  content         String    // 提醒内容
  remindAt        DateTime  // 提醒时间
  recurrence      String?   // null, daily, weekly, monthly
  status          String    @default("pending")  // pending, triggered, completed, expired
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  user            User      @relation(fields: [userId], references: [id])
  
  @@index([userId, remindAt])
  @@index([userId, status])
}

model Goal {
  id              String    @id @default(cuid())
  userId          String
  name            String    // 目标名称
  description     String    @default("")  // 目标描述
  deadline        DateTime? // 截止日期
  priority        String    @default("medium")  // low, medium, high
  progress        Int       @default(0)  // 0-100
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  user            User      @relation(fields: [userId], references: [id])
  notes           Note[]
  
  @@index([userId, deadline])
  @@index([userId, priority])
}
```

## 正确性属性

### 数据库约束
1. 每个用户每天只能有一条复盘记录（通过 `@@unique([userId, date])` 保证）
2. 笔记编辑历史与笔记存在级联关系，删除笔记时自动清理历史
3. 提醒时间必须大于创建时间
4. 目标进度必须在 0-100 范围内

### 业务规则
1. 复盘自动保存间隔为 30 秒
2. 提醒状态流转: pending → triggered → completed/expired
3. 目标截止日期前 7 天触发提醒
4. 笔记标签数量上限为 10 个

## 错误处理

### 错误场景与处理策略

| 场景 | 处理策略 |
|------|----------|
| 用户未认证访问受保护路由 | 重定向到登录页，返回 401 |
| 创建重复日期的复盘 | 返回 409，提示用户编辑已有复盘 |
| 笔记内容超过长度限制 | 返回 400，提示最大字符数 |
| 数据库连接失败 | 返回 500，显示友好错误页面 |
| 提醒创建时间无效 | 返回 400，提示时间必须在未来 |
| 目标进度超出范围 | 返回 400，限制 0-100 |

### 前端错误边界
- 使用 React Error Boundary 捕获组件级错误
- 全局错误处理显示 Toast 通知
- 网络请求失败自动重试（最多 3 次）

## 测试策略

### 单元测试
- **工具函数测试**: 日期格式化、字数统计、标签解析
- **数据验证测试**: 表单输入验证、API 参数校验

### 集成测试
- **API 路由测试**: 使用 Next.js 测试工具模拟请求
- **数据库操作测试**: CRUD 操作验证、约束检查

### 端到端测试
- **关键用户流程**: 注册 → 登录 → 创建复盘 → 查看统计
- **响应式布局测试**: 移动端/桌面端 UI 验证

### 测试工具
- **单元测试**: Vitest
- **E2E 测试**: Playwright
- **API 测试**: Next.js API Route Testing

## 部署方案

### Vercel 部署配置

```json
{
  "buildCommand": "prisma generate && next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

### 环境变量

```env
# 数据库
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# NextAuth
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-secret-key"

# 应用配置
NEXT_PUBLIC_APP_NAME="每日复盘系统"
```

### 部署步骤
1. 推送代码到 GitHub 仓库
2. 在 Vercel 导入项目
3. 配置环境变量（DATABASE_URL、NEXTAUTH_SECRET）
4. 触发自动构建和部署
5. 数据库迁移: `npx prisma db push`

## 参考文献

[^1]: (Website) - [Next.js 官方文档](https://nextjs.org/docs)
[^2]: (Website) - [Prisma ORM 文档](https://www.prisma.io/docs)
[^3]: (Website) - [NextAuth.js 文档](https://next-auth.js.org/)
[^4]: (Website) - [Chart.js 官方文档](https://www.chartjs.org/docs/)
[^5]: (Website) - [TailwindCSS 文档](https://tailwindcss.com/docs)
[^6]: (Website) - [shadcn/ui 组件库](https://ui.shadcn.com/)
