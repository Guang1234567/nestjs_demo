# 登录注销模块实现计划书 (基于 Cookie)

本计划书旨在 NestJS 项目中实现一个基础的身份验证模块，主要功能包括登录（Login）和登出（Logout），并利用 Cookie 进行会话管理。

## 1. 技术选型与依赖
- **核心框架**: NestJS
- **Cookie 解析**: `cookie-parser` (中间件)
- **类型支持**: `@types/cookie-parser`
- **数据传输**: DTO (使用 Class 定义)

## 2. 核心功能设计

### A. 登录 (Login)
- **端点**: `POST /auth/login`
- **逻辑**:
  1. 验证用户凭据 (Username/Password)。
  2. 验证通过后，生成会话标识（如简单的 UserID 或加密 Token）。
  3. 通过 `res.cookie()` 将标识写入客户端 Cookie，建议名称为 `__session__`。
  4. 设置 Cookie 属性：`httpOnly: true` (防止 XSS), `secure: true` (HTTPS 专用), `maxAge` (过期时间)。
- **返回**: 登录成功消息。

### B. 登出 (Logout)
- **端点**: `POST /auth/logout`
- **逻辑**:
  1. 清除客户端名为 `__session__` 的 Cookie。
  2. 调用 `res.clearCookie()`。
- **返回**: 登出成功消息。

## 3. 目录结构预览
```text
src/auth/
├── dto/
│   └── login.dto.ts      # 登录请求数据结构
├── auth.controller.ts    # 处理登录、登出请求
├── auth.service.ts       # 验证逻辑
└── auth.module.ts        # 模块配置
```

## 4. 实施步骤
1. **环境准备**:
   - 使用 `pnpm add cookie-parser` 安装依赖。
   - 在 `main.ts` 中通过 `app.use(cookieParser())` 启用中间件。
2. **定义 DTO**:
   - 创建 `LoginDto` 类，包含 `username` 和 `password` 字段。
3. **实现 AuthService**:
   - 编写 `validateUser(username, password)` 方法。
4. **实现 AuthController**:
   - 使用 `@Res()` 装饰器注入响应对象以操作 Cookie。
   - 实现 `@Post('login')` 和 `@Post('logout')`。
5. **模块注册**:
   - 在 `AppModule` 中引入 `AuthModule`。

## 5. 安全建议
- 密码必须加密存储 (使用 `bcrypt`)。
- 生产环境必须开启 `secure: true`。
- 考虑引入 `passport` 或 `jwt` 增强安全性。
