# 任务列表 - 每日复盘系统

## 任务 1: 项目初始化与基础配置

- [x] 1.1 初始化 Next.js 14 项目（App Router）
- [x] 1.2 配置 TailwindCSS
- [x] 1.3 安装并配置 Prisma ORM
- [x] 1.4 配置环境变量模板（.env.example）
- [x] 1.5 配置 TypeScript 严格模式
- [x] 1.6 安装基础依赖（zustand, bcrypt, next-auth）

## 任务 2: 数据库模型与迁移

- [x] 2.1 定义 Prisma Schema（User, Review, Note, Reminder, Goal, EditHistory）
- [x] 2.2 执行数据库迁移（SQLite 开发环境）
- [x] 2.3 创建 Prisma 客户端单例
- [x] 2.4 编写数据库连接测试

## 任务 3: 用户认证模块

- [x] 3.1 配置 NextAuth.js（Credentials Provider）
- [x] 3.2 实现用户注册 API（/api/auth/register）
- [x] 3.3 实现用户登录 API（/api/auth/login）
- [x] 3.4 创建登录页面（/login）
- [x] 3.5 创建注册页面（/register）
- [x] 3.6 实现会话中间件保护路由
- [x] 3.7 编写认证单元测试

## 任务 4: 复盘模块

- [x] 4.1 实现复盘 CRUD API（/api/reviews）
- [x] 4.2 实现今日复盘状态检查 API（/api/reviews/today）
- [x] 4.3 创建复盘列表页面（/review）
- [x] 4.4 创建复盘表单组件（含自动保存）
- [x] 4.5 创建复盘详情/编辑页面（/review/[id]）
- [x] 4.6 实现复盘搜索功能
- [x] 4.7 编写复盘模块测试

## 任务 5: 笔记模块

- [x] 5.1 实现笔记 CRUD API（/api/notes）
- [x] 5.2 实现笔记编辑历史 API
- [x] 5.3 实现标签列表 API（/api/notes/tags）
- [x] 5.4 创建笔记列表页面（/notes）
- [x] 5.5 创建笔记快速输入组件
- [x] 5.6 创建笔记详情/编辑页面（/notes/[id]）
- [x] 5.7 实现笔记搜索和标签筛选
- [x] 5.8 编写笔记模块测试

## 任务 6: 提醒模块

- [x] 6.1 实现提醒 CRUD API（/api/reminders）
- [x] 6.2 实现提醒状态更新 API（dismiss）
- [x] 6.3 创建提醒列表页面（/reminders）
- [x] 6.4 创建提醒表单组件（含重复设置）
- [x] 6.5 实现浏览器通知推送
- [x] 6.6 编写提醒模块测试

## 任务 7: 目标模块

- [x] 7.1 实现目标 CRUD API（/api/goals）
- [x] 7.2 实现目标关联笔记 API（/api/goals/:id/link）
- [x] 7.3 创建目标列表页面（/goals）
- [x] 7.4 创建目标表单组件（含进度条）
- [x] 7.5 创建目标详情页面（/goals/[id]）
- [x] 7.6 实现目标关联笔记/复盘展示
- [x] 7.7 编写目标模块测试

## 任务 8: 统计模块

- [x] 8.1 实现统计概览 API（/api/stats/overview）
- [x] 8.2 实现复盘趋势 API（/api/stats/reviews）
- [x] 8.3 实现笔记趋势 API（/api/stats/notes）
- [x] 8.4 实现目标分布 API（/api/stats/goals）
- [x] 8.5 实现标签统计 API（/api/stats/tags）
- [x] 8.6 实现热力图 API（/api/stats/heatmap）
- [x] 8.7 创建统计页面（/stats）
- [x] 8.8 集成 Chart.js 图表组件
- [x] 8.9 编写统计模块测试

## 任务 9: 响应式布局与 UI 优化

- [x] 9.1 创建仪表盘布局（header + sidebar）
- [x] 9.2 创建移动端导航组件
- [x] 9.3 优化各模块移动端 UI
- [x] 9.4 实现全局搜索组件
- [x] 9.5 添加 Toast 通知组件
- [x] 9.6 实现错误边界处理

## 任务 10: 集成测试与部署准备

- [x] 10.1 编写端到端测试（关键流程）
- [x] 10.2 配置 Vercel 部署文件
- [x] 10.3 更新 README.md（部署说明）
- [x] 10.4 执行完整构建测试
- [x] 10.5 验证所有 API 路由
