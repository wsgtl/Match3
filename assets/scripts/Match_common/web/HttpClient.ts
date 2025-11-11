import { _decorator, Component } from 'cc';
import { MD5Util } from '../utils/MD5Util';

/**
 * 网络请求配置接口
 */
interface RequestConfig {
    url: string;
    method?: 'GET' | 'POST';
    data?: any;
    headers?: Record<string, string>;
    timeout?: number;
    needSign?: boolean; // 新增：是否需要签名
    signKey?: string; // 新增：签名密钥
    signParams?: { // 新增：签名参数配置
        timestampKey?: string; // 时间戳字段名
        nonceKey?: string; // 随机数字段名
        signKey?: string; // 签名字段名
    };
}

/**
 * 响应数据接口
 */
interface ResponseData<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    code?: number;
    message?: string;
}

/**
 * 网络请求封装类
 */
export class HttpClient {
    private static instance: HttpClient;
    private baseURL: string = '';
    private defaultTimeout: number = 10000;
    private defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    private globalSignKey: string = ''; // 全局签名密钥
    private globalNeedSign: boolean = false; // 全局是否启用签名
    private defaultSignParams = { // 默认签名参数配置
        timestampKey: 'timestamp',
        nonceKey: 'nonce', 
        signKey: 'sign'
    };

    private constructor() {}

    public static getInstance(): HttpClient {
        if (!HttpClient.instance) {
            HttpClient.instance = new HttpClient();
        }
        return HttpClient.instance;
    }

    /**
     * 设置基础URL
     */
    public setBaseURL(url: string): void {
        this.baseURL = url;
    }

    /**
     * 设置默认超时时间
     */
    public setTimeout(timeout: number): void {
        this.defaultTimeout = timeout;
    }

    /**
     * 设置默认请求头
     */
    public setHeaders(headers: Record<string, string>): void {
        this.defaultHeaders = { ...this.defaultHeaders, ...headers };
    }

    /**
     * 添加请求头
     */
    public addHeader(key: string, value: string): void {
        this.defaultHeaders[key] = value;
    }

    /**
     * 移除请求头
     */
    public removeHeader(key: string): void {
        delete this.defaultHeaders[key];
    }

    /**
     * 设置全局签名密钥
     */
    public setSignKey(key: string): void {
        this.globalSignKey = key;
    }

    /**
     * 启用/禁用全局签名
     */
    public enableSign(enable: boolean = true): void {
        this.globalNeedSign = enable;
    }

    /**
     * 设置签名参数配置
     */
    public setSignParams(params: Partial<typeof this.defaultSignParams>): void {
        this.defaultSignParams = { ...this.defaultSignParams, ...params };
    }

    /**
     * GET 请求
     */
    public async get<T = any>(url: string, params?: Record<string, any>, config?: Partial<RequestConfig>): Promise<ResponseData<T>> {
        return this.request<T>({
            url,
            method: 'GET',
            data: params,
            ...config
        });
    }

    /**
     * POST 请求
     */
    public async post<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<ResponseData<T>> {
        return this.request<T>({
            url,
            method: 'POST',
            data,
            ...config
        });
    }

    /**
     * 通用请求方法
     */
    public async request<T = any>(config: RequestConfig): Promise<ResponseData<T>> {
        const startTime = Date.now();
        const requestId = this.generateRequestId();
        
        try {
            // 准备请求参数
            const { 
                url, 
                method = 'GET', 
                data, 
                headers = {}, 
                timeout = this.defaultTimeout,
                needSign = this.globalNeedSign,
                signKey = this.globalSignKey,
                signParams = this.defaultSignParams
            } = config;
            
            let fullUrl = this.buildFullUrl(url);
            const requestHeaders = { ...this.defaultHeaders, ...headers };

            // 处理请求数据和URL
            let requestData = data;
            if (method === 'GET' && data) {
                // GET 请求将数据作为查询参数
                fullUrl = this.buildUrlWithParams(fullUrl, data);
                requestData = undefined;
            }

            // 如果需要签名，添加签名参数
            if (needSign && signKey) {
                const signedData = this.signRequestData(requestData, signKey, method, signParams);
                if (method === 'GET') {
                    fullUrl = this.buildUrlWithParams(fullUrl, signedData);
                } else {
                    requestData = signedData;
                }
            }

            this.logRequest(requestId, method, fullUrl, requestData, requestHeaders);

            // 创建请求选项
            const requestOptions: RequestInit = {
                method,
                headers: requestHeaders,
            };

            // 处理 POST 请求的 body 数据
            if (method === 'POST' && requestData) {
                requestOptions.body = JSON.stringify(requestData);
            }

            // 发送请求（超时控制单独处理）
            const response = await this.fetchWithTimeout(fullUrl, requestOptions, timeout);
            
            // 检查 HTTP 状态码
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
            }

            // 尝试解析响应数据
            let responseData;
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }

            const endTime = Date.now();
            const duration = endTime - startTime;

            this.logResponse(requestId, response.status, responseData, duration);

            return {
                success: true,
                data: responseData as T,
                code: response.status
            };

        } catch (error) {
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            this.logError(requestId, error, duration);

            return {
                success: false,
                error: this.getErrorMessage(error),
                code: this.getErrorCode(error),
                message: this.getErrorDetail(error)
            };
        }
    }

    /**
     * 对请求数据进行签名
     */
    private signRequestData(data: any, key: string, method: string, signParams: any): any {
        const timestamp = Date.now();
        const nonce = Math.random().toString(36).substring(2, 15);
        
        // 构建签名数据
        const signData = {
            ...data,
            [signParams.timestampKey]: timestamp,
            [signParams.nonceKey]: nonce
        };

        // 生成签名
        const sign = MD5Util.generateSign(signData, key, timestamp);
        
        // 添加签名到数据中
        return {
            ...signData,
            [signParams.signKey]: sign
        };
    }

    /**
     * 验证响应签名
     */
    public verifyResponse(data: any, key: string, timestamp: number, sign: string): boolean {
        return MD5Util.verifySign(data, key, timestamp, sign);
    }

    /**
     * 计算字符串的MD5值
     */
    public md5(str: string): string {
        return MD5Util.hash(str);
    }

    /**
     * 计算对象的MD5值
     */
    public md5Object(obj: any): string {
        return MD5Util.hashObject(obj);
    }

    /**
     * 带超时的 fetch 请求
     */
    private async fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
        return new Promise((resolve, reject) => {
            const controller = new AbortController();
            const signal = controller.signal;

            const timeoutId = setTimeout(() => {
                controller.abort();
                reject(new Error(`Request timeout after ${timeout}ms`));
            }, timeout);

            // 将 signal 添加到请求选项中
            const fetchOptions: RequestInit = {
                ...options,
                signal
            };

            fetch(url, fetchOptions)
                .then(response => {
                    clearTimeout(timeoutId);
                    resolve(response);
                })
                .catch(error => {
                    clearTimeout(timeoutId);
                    reject(error);
                });
        });
    }

    /**
     * 构建完整 URL
     */
    private buildFullUrl(url: string): string {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return this.baseURL + url;
    }

    /**
     * 为 URL 添加查询参数
     */
    private buildUrlWithParams(url: string, params: Record<string, any>): string {
        if (!params || Object.keys(params).length === 0) {
            return url;
        }

        const urlObj = new URL(url);
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                urlObj.searchParams.append(key, params[key].toString());
            }
        });

        return urlObj.toString();
    }

    /**
     * 生成请求 ID
     */
    private generateRequestId(): string {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 获取错误信息
     */
    private getErrorMessage(error: any): string {
        if (error instanceof Error) {
            return error.message;
        }
        return String(error);
    }

    /**
     * 获取错误代码
     */
    private getErrorCode(error: any): number {
        if (error.name === 'AbortError' || error.message?.includes('timeout')) {
            return -1; // 超时错误码
        }
        
        // 尝试从错误信息中提取 HTTP 状态码
        const httpStatusMatch = error.message?.match(/HTTP (\d+)/);
        if (httpStatusMatch) {
            return parseInt(httpStatusMatch[1]);
        }
        
        return -999; // 未知错误码
    }

    /**
     * 获取错误详情
     */
    private getErrorDetail(error: any): string {
        if (error instanceof Error) {
            return error.stack || error.message;
        }
        return String(error);
    }

    /**
     * 记录请求日志
     */
    private logRequest(requestId: string, method: string, url: string, data: any, headers: Record<string, string>): void {
        console.log(`🚀 [${requestId}] ${method} ${url}`);
        if (data && Object.keys(data).length > 0) {
            console.log(`📦 [${requestId}] Request Data:`, JSON.stringify(data, null, 2));
        }
        if (headers && Object.keys(headers).length > 0) {
            console.log(`📋 [${requestId}] Headers:`, headers);
        }
    }

    /**
     * 记录响应日志
     */
    private logResponse(requestId: string, status: number, data: any, duration: number): void {
        console.log(`✅ [${requestId}] Response Status: ${status}, Duration: ${duration}ms`);
        if (data) {
            // 限制日志输出长度，避免过大响应体
            const dataStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
            const preview = dataStr.length > 1000 ? dataStr.substring(0, 1000) + '...' : dataStr;
            console.log(`📨 [${requestId}] Response Data:`, preview);
        }
    }

    /**
     * 记录错误日志
     */
    private logError(requestId: string, error: any, duration: number): void {
        console.error(`❌ [${requestId}] Request Failed after ${duration}ms:`, error);
    }

    /**
     * 清理资源
     */
    public destroy(): void {
        // 清理可能的 pending 请求
    }
}

// 导出单例实例
export const httpClient = HttpClient.getInstance();

/**
 * 使用示例
 */
export class NetworkExample extends Component {
    private readonly API_BASE = 'https://api.example.com';

    onLoad() {
        // 配置 HttpClient
        httpClient.setBaseURL(this.API_BASE);
        httpClient.setTimeout(15000);
        
        // 添加认证头
        httpClient.setHeaders({
            'Authorization': 'Bearer your-token-here',
            'User-Agent': 'CocosCreator/3.8.x'
        });

        // 配置签名
        httpClient.setSignKey('your-secret-key');
        httpClient.enableSign(true);
        
        // 自定义签名参数字段名（可选）
        httpClient.setSignParams({
            timestampKey: 'ts',
            nonceKey: 'nonceStr',
            signKey: 'signature'
        });
    }

    async start() {
        // GET 请求示例（自动添加签名）
        const userResult = await httpClient.get('/user', { 
            id: 123, 
            page: 1 
        });
        if (userResult.success) {
            console.log('用户数据:', userResult.data);
        } else {
            console.error('获取用户失败:', userResult.error, '错误码:', userResult.code);
        }

        // POST 请求示例（自动添加签名）
        const loginResult = await httpClient.post('/login', {
            username: 'user',
            password: 'pass'
        });
        if (loginResult.success) {
            console.log('登录成功:', loginResult.data);
            // 更新认证token
            if (loginResult.data?.token) {
                httpClient.addHeader('Authorization', `Bearer ${loginResult.data.token}`);
            }
        } else {
            console.error('登录失败:', loginResult.error);
        }

        // 手动计算MD5
        const md5Hash = httpClient.md5('hello world');
        console.log('MD5哈希:', md5Hash);

        // 单个请求禁用签名
        const noSignResult = await httpClient.get('/public-data', { page: 1 }, {
            needSign: false
        });
    }

    onDestroy() {
        httpClient.destroy();
    }
}