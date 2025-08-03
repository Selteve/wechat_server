# WechatServer

一个用于微信公众平台开发的TypeScript服务器库，提供了完整的微信服务器验证、Access Token管理和JS-SDK Ticket管理功能。

## 功能特性

- ✅ **框架无关** - 核心功能不依赖任何特定框架
- ✅ **微信服务器验证** - 自动验证来自微信服务器的请求
- ✅ **Access Token管理** - 自动获取、缓存和刷新Access Token
- ✅ **JS-SDK Ticket管理** - 自动获取、缓存和刷新JS-SDK Ticket
- ✅ **TypeScript支持** - 完整的类型定义和智能提示
- ✅ **文件缓存** - 自动将Token保存到本地文件，避免重复请求
- ✅ **过期处理** - 智能检测Token过期并自动刷新
- ✅ **Express适配器** - 内置Express框架适配器
- ✅ **轻量级** - 核心包不包含框架依赖，按需安装

## 安装

### 核心包（框架无关）
```bash
npm install wechat_server
```

### 使用Express框架
```bash
npm install wechat_server express
```

## 快速开始

### 1. 通用使用（框架无关）

```typescript
import { WechatServer } from 'wechat_server';

// 创建WechatServer实例
const wechat = new WechatServer({
    appID: "your_app_id",
    appsecret: "your_app_secret",
    Token: "your_token"
});

// 获取验证中间件
const verifyMiddleware = wechat.verify();

// 在你的框架中使用
// verifyMiddleware(req, res, next)
```

### 2. Express框架使用

```typescript
import express from 'express';
import { createExpressWechatServer } from 'wechat_server';

const app = express();

// 创建Express适配的WechatServer实例
const wechat = createExpressWechatServer({
    appID: "your_app_id",
    appsecret: "your_app_secret",
    Token: "your_token"
});

// 设置微信服务器验证路由
app.use('/wechat', wechat.verify());

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
```

### 3. 其他框架使用

```typescript
import { WechatServer } from 'wechat_server';

const wechat = new WechatServer({
    appID: "your_app_id",
    appsecret: "your_app_secret",
    Token: "your_token"
});

// 获取验证中间件
const verifyMiddleware = wechat.verify();

// 在你的框架中适配使用
// 例如：Fastify, Hapi, Koa等
```

### 2. 获取Access Token

```typescript
// 获取有效的Access Token（会自动处理缓存和刷新）
const tokenData = await wechat.fetchAccessToken();
console.log(tokenData.access_token);
```

### 3. 获取JS-SDK Ticket

```typescript
// 获取有效的JS-SDK Ticket（会自动处理缓存和刷新）
const ticketData = await wechat.fetchTicket();
console.log(ticketData.ticket);
```

## API 文档

### WechatServer 构造函数

```typescript
new WechatServer(options: WechatServerOptions)
```

#### WechatServerOptions

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| appID | string | ✅ | 微信公众号的AppID |
| appsecret | string | ✅ | 微信公众号的AppSecret |
| Token | string | ✅ | 微信公众号的Token |

### 方法

#### verify()

验证来自微信服务器的请求。

```typescript
verify(): WechatMiddleware
```

**使用示例：**
```typescript
// 通用使用
const middleware = wechat.verify();
middleware(req, res, next);

// Express使用
app.use('/wechat', wechat.verify());
```

#### fetchAccessToken()

获取有效的Access Token，如果本地缓存有效则直接返回，否则重新获取。

```typescript
fetchAccessToken(): Promise<AccessTokenData>
```

**返回值：**
```typescript
interface AccessTokenData {
    access_token: string;
    expires_in: number; // 过期时间戳
}
```

#### fetchTicket()

获取有效的JS-SDK Ticket，如果本地缓存有效则直接返回，否则重新获取。

```typescript
fetchTicket(): Promise<TicketData>
```

**返回值：**
```typescript
interface TicketData {
    ticket: string;
    expires_in: number; // 过期时间戳
}
```

#### getAccessToken()

直接获取新的Access Token（不检查缓存）。

```typescript
getAccessToken(): Promise<AccessTokenData>
```

#### getTicket()

直接获取新的JS-SDK Ticket（不检查缓存）。

```typescript
getTicket(): Promise<TicketData>
```

#### saveAccessToken(tokenData: AccessTokenData)

保存Access Token到本地文件。

```typescript
saveAccessToken(tokenData: AccessTokenData): Promise<unknown>
```

#### readAccessToken()

从本地文件读取Access Token。

```typescript
readAccessToken(): Promise<AccessTokenData>
```

#### saveTicket(ticketData: TicketData)

保存JS-SDK Ticket到本地文件。

```typescript
saveTicket(ticketData: TicketData): Promise<unknown>
```

#### readTicket()

从本地文件读取JS-SDK Ticket。

```typescript
readTicket(): Promise<TicketData>
```

#### isValidAccessToken(tokenData: AccessTokenData)

检查Access Token是否有效。

```typescript
isValidAccessToken(tokenData: AccessTokenData): boolean
```

#### isValidTicket(ticketData: TicketData)

检查JS-SDK Ticket是否有效。

```typescript
isValidTicket(ticketData: TicketData): boolean
```

## 适配器

### Express适配器

```typescript
import { createExpressWechatServer } from 'wechat_server';

const wechat = createExpressWechatServer({
    appID: "your_app_id",
    appsecret: "your_app_secret",
    Token: "your_token"
});

app.use('/wechat', wechat.verify());
```

### 自定义适配器

你可以为任何框架创建自定义适配器：

```typescript
import { WechatServer } from 'wechat_server';

const wechat = new WechatServer(options);
const verifyMiddleware = wechat.verify();

// 在你的框架中适配
function myFrameworkAdapter(req, res, next) {
    const wechatReq = {
        method: req.method,
        query: req.query,
        body: req.body
    };
    
    const wechatRes = {
        set: (header, value) => res.setHeader(header, value),
        send: (data) => res.end(data),
        end: (data) => res.end(data)
    };
    
    return verifyMiddleware(wechatReq, wechatRes, next);
}
```

## 类型定义

```typescript
interface WechatServerOptions {
    appID: string;
    appsecret: string;
    Token: string;
}

interface WechatRequest {
    method: string;
    query: Record<string, any>;
    body?: any;
}

interface WechatResponse {
    set(header: string, value: string): void;
    send(data: any): void;
    end(data?: any): void;
}

interface WechatMiddleware {
    (req: WechatRequest, res: WechatResponse, next?: () => void): Promise<void> | void;
}

interface AccessTokenData {
    access_token: string;
    expires_in: number;
}

interface TicketData {
    ticket: string;
    expires_in: number;
}
```

## 开发

### 构建

```bash
npm run build
```

### 开发模式

```bash
npm run dev
```

## 注意事项

1. **Token缓存**：Access Token和JS-SDK Ticket会自动缓存到项目根目录的JSON文件中
2. **过期处理**：Token过期前5分钟会自动刷新
3. **错误处理**：建议在使用时添加适当的错误处理
4. **安全性**：请妥善保管AppSecret，不要提交到版本控制系统

## 许可证

ISC

## 贡献

欢迎提交Issue和Pull Request！ 