import sha1 from 'sha1';
import { request } from "./utils/request"
import {AccessTokenData, WechatServerOptions, TicketData, WechatRequest, WechatResponse, WechatMiddleware} from "./types"
import fs from "node:fs";
import path from "node:path";

// 导出适配器
export { ExpressAdapter, createExpressWechatServer } from './adapters/express';

export class WechatServer {
    private appID: string;
    private appsecret: string;
    private Token: string;
    private accessTokenData: AccessTokenData;
    private ticketData: TicketData;

  constructor(options: WechatServerOptions) {
      this.appID = options.appID;
      this.appsecret = options.appsecret;
      this.Token = options.Token;
      this.accessTokenData = {
          access_token: '',
          expires_in: 0
      };
      this.ticketData = {
          ticket: '',
          expires_in: 0
      };
  }

  // 验证服务器的有效性
    public verify(): WechatMiddleware {
        return async (req: WechatRequest, res: WechatResponse, next?: () => void) => {
            const {signature, echostr, timestamp, nonce} = req.query;
            const token = this.Token;
            const sha1Str = sha1([timestamp, nonce, token].sort().join(''));
            
            if (req.method === 'GET'){
                //判断消息是否来自微信服务器
                if (sha1Str === signature){
                    res.set('Content-Type','text/plain');
                    res.send(echostr);
                    if (next) next();
                } else {
                    res.end('error');
                    return;
                }
            }
        }
    }

    // 获取access_token
    public async getAccessToken(): Promise<AccessTokenData> {
      return new Promise(async (resolve, reject) => {
          const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appID}&secret=${this.appsecret}`;
          await request<any, AccessTokenData>(url)
              .then(res => {
                  res.expires_in = Date.now() + (res.expires_in - 300) * 1000;
                  this.accessTokenData.access_token = res.access_token;
                  this.accessTokenData.expires_in = res.expires_in;
                  resolve(res);
              })
              .catch(err => {
                  throw err;
              })
      });
    }
    // 保存access_token
    public async saveAccessToken(tokenData: AccessTokenData) {
      const jsonContent = JSON.stringify(tokenData);
      return new Promise((resolve, reject) => {
          fs.writeFile(process.cwd() + '/access_token.json', jsonContent, (err) => {
              if (err) {
                  throw err;
              } else {
                  resolve('success');
              }
          });
      });
    }
    // 读取access_token
    public async readAccessToken(): Promise<AccessTokenData> {
        const filePath = path.join(process.cwd(), 'access_token.json');

        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
            throw new Error("access_token.json does not exist");
        }

        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf-8', (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }

                try {
                    // 检查是否为空
                    if (!data.trim()) {
                        reject(new Error("File is empty"));
                        return;
                    }

                    const parsedData = JSON.parse(data) as AccessTokenData;

                    // 检查必要字段
                    if (!parsedData.access_token || !parsedData.expires_in) {
                        reject(new Error("Invalid token data format"));
                        return;
                    }

                    resolve(parsedData);
                } catch (parseErr) {
                    reject(parseErr);
                }
            });
        });
    }
    // 验证access_token是否过期
    public isValidAccessToken(tokenData: AccessTokenData){
        //检查是否有效
        if (!tokenData || !tokenData.access_token || !tokenData.expires_in){
            return false;
        }
        return tokenData.expires_in > Date.now();
    }
    // 获取没有过期的
    public async fetchAccessToken(): Promise<AccessTokenData>{
        if (this.accessTokenData.access_token && this.accessTokenData.expires_in && this.isValidAccessToken(this.accessTokenData)){
            return Promise.resolve({
                access_token: this.accessTokenData.access_token,
                expires_in: this.accessTokenData.expires_in
            })
        }
        try {
            const localToken = await this.readAccessToken();
            if (this.isValidAccessToken(localToken)) {
                return localToken;
            }
        } catch (e){
            throw e;
        }
        const newToken = await this.getAccessToken();
        await this.saveAccessToken(newToken);
        this.accessTokenData = newToken;
        return newToken;
    }


    // 获取access_token
    public async getTicket(): Promise<TicketData> {
        return new Promise(async (resolve, reject) => {
            const data = await this.fetchAccessToken();
            const url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${data.access_token}&type=jsapi`;
            await request<any, TicketData>(url)
                .then(res => {
                    res.expires_in = Date.now() + (res.expires_in - 300) * 1000;
                    this.ticketData.ticket = res.ticket;
                    this.ticketData.expires_in = res.expires_in;
                    resolve(res);
                })
                .catch(err => {
                    throw err;
                })
        });
    }
    // 保存access_token
    public async saveTicket(ticketData: TicketData) {
        const jsonContent = JSON.stringify(ticketData);
        return new Promise((resolve, reject) => {
            fs.writeFile(process.cwd() + '/ticket.json', jsonContent, (err) => {
                if (err) {
                    throw err;
                } else {
                    resolve('success');
                }
            });
        });
    }
    // 读取access_token
    public async readTicket(): Promise<TicketData> {
        const filePath = path.join(process.cwd(), 'ticket.json');

        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
            throw new Error("ticket.json does not exist");
        }

        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf-8', (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }

                try {
                    // 检查是否为空
                    if (!data.trim()) {
                        reject(new Error("File is empty"));
                        return;
                    }

                    const parsedData = JSON.parse(data) as TicketData;

                    // 检查必要字段
                    if (!parsedData.ticket || !parsedData.expires_in) {
                        reject(new Error("Invalid token data format"));
                        return;
                    }

                    resolve(parsedData);
                } catch (parseErr) {
                    reject(parseErr);
                }
            });
        });
    }
    // 验证access_token是否过期
    public isValidTicket(tokenData: TicketData){
        //检查是否有效
        if (!tokenData || !tokenData.ticket || !tokenData.expires_in){
            return false;
        }
        return tokenData.expires_in > Date.now();
    }
    // 获取没有过期的
    public async fetchTicket(): Promise<TicketData>{
        if (this.ticketData.ticket && this.ticketData.expires_in && this.isValidTicket(this.ticketData)){
            return Promise.resolve({
                ticket: this.ticketData.ticket,
                expires_in: this.ticketData.expires_in
            })
        }
        try {
            const localToken = await this.readTicket();
            if (this.isValidTicket(localToken)) {
                return localToken;
            }
        } catch (e){
            throw e;
        }
        const newToken = await this.getTicket();
        await this.saveTicket(newToken);
        this.ticketData = newToken;
        return newToken;
    }
}
