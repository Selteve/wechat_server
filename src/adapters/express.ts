import { Request, Response, NextFunction } from 'express';
import { WechatServer } from '../index';
import { WechatRequest, WechatResponse } from '../types';

// Express适配器
export class ExpressAdapter {
    private wechatServer: WechatServer;

    constructor(wechatServer: WechatServer) {
        this.wechatServer = wechatServer;
    }

    // 将Express的Request/Response适配为WechatRequest/WechatResponse
    private adaptRequest(req: Request): WechatRequest {
        return {
            method: req.method,
            query: req.query,
            body: req.body
        };
    }

    private adaptResponse(res: Response): WechatResponse {
        return {
            set: (header: string, value: string) => res.set(header, value),
            send: (data: any) => res.send(data),
            end: (data?: any) => res.end(data)
        };
    }

    // 返回Express中间件
    public verify() {
        return async (req: Request, res: Response, next: NextFunction) => {
            const wechatReq = this.adaptRequest(req);
            const wechatRes = this.adaptResponse(res);
            
            await this.wechatServer.verify()(wechatReq, wechatRes, next);
        };
    }
}

// 便捷函数：直接创建Express适配的WechatServer
export function createExpressWechatServer(options: any) {
    const wechatServer = new WechatServer(options);
    return new ExpressAdapter(wechatServer);
} 