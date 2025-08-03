// 通用的请求接口
export interface WechatRequest {
    method: string;
    query: Record<string, any>;
    body?: any;
}

// 通用的响应接口
export interface WechatResponse {
    set(header: string, value: string): void;
    send(data: any): void;
    end(data?: any): void;
}

// 通用的中间件接口
export interface WechatMiddleware {
    (req: WechatRequest, res: WechatResponse, next?: () => void): Promise<void> | void;
}

export interface WechatServerOptions {
    appID: string;
    appsecret: string;
    Token: string;
}

export interface AccessTokenData {
    access_token: string;
    expires_in: number;
}

export interface TicketData {
    ticket: string;
    expires_in: number;
}