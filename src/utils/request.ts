import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';
import { TokenDto } from '@/types/models';

// 定义请求选项接口，扩展 AxiosRequestConfig
export interface RequestOptions
  extends Omit<AxiosRequestConfig, 'url' | 'method' | 'baseURL'> {
  method?: string;
  headers?: Record<string, string>;
  data?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
  withCredentials?: boolean;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer' | 'stream';
  onStream?: (chunk: string) => void;
}

// 定义错误接口
export interface ApiError extends Error {
  status?: number;
  data?: unknown;
  config?: AxiosRequestConfig;
}

// 定义响应接口
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: AxiosRequestConfig;
}

// 存储 Token 的键名
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

class Request {
  private instance: AxiosInstance;
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(
    baseUrl: string = import.meta.env.VITE_API_BASE_URL ||
      'http://localhost:3010',
    defaultHeaders: Record<string, string> = {},
    timeout: number = 10000,
  ) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };

    // 创建 axios 实例
    this.instance = axios.create({
      baseURL: this.baseUrl,
      timeout,
      headers: this.defaultHeaders,
      withCredentials: false,
    });

    // 初始化拦截器
    this.setupInterceptors();

    // 从本地存储加载 token
    this.loadTokenFromStorage();
  }

  /**
   * 设置请求和响应拦截器
   */
  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 从本地存储获取 token 并添加到请求头
        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        if (accessToken && config.headers) {
          config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // 直接返回响应数据
        return response.data;
      },
      async (error: AxiosError) => {
        // 处理错误响应
        const apiError: ApiError = new Error(error.message || '请求失败');

        if (error.response) {
          // 请求已发出，服务器返回状态码不在 2xx 范围内
          apiError.status = error.response.status;
          apiError.data = error.response.data;

          // 处理 401 未授权错误，尝试刷新 token
          if (error.response.status === 401) {
            try {
              // 尝试刷新 token
              const originalRequest = error.config as AxiosRequestConfig;
              const refreshed = await this.refreshToken();

              if (refreshed) {
                // 重新发送之前失败的请求
                return this.instance(originalRequest);
              }
            } catch (refreshError) {
              console.error('刷新 token 失败:', refreshError);
              // 刷新 token 失败，清除所有 token 并重定向到登录页
              this.clearTokens();
              // 可以在这里添加重定向到登录页的逻辑
              window.location.href = '/login';
            }
          }

          // 显示错误信息
          const responseData = error.response.data as Record<string, unknown>;
          if (responseData && responseData.message) {
            console.error(responseData.message);
          } else if (responseData && responseData.error) {
            console.error(responseData.error);
          } else {
            console.error('请求失败');
          }
        } else if (error.request) {
          // 请求已发出但没有收到响应
          console.error('服务器无响应');
        } else {
          // 设置请求时发生错误
          console.error('请求配置错误');
        }

        if (axios.isCancel(error)) {
          console.error('请求已取消');
        }

        return Promise.reject(apiError);
      },
    );
  }

  /**
   * 从本地存储加载 token
   */
  private loadTokenFromStorage(): void {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (accessToken) {
      this.setAuthToken(accessToken);
    }
  }

  /**
   * 保存 token 到本地存储
   * @param tokens Token 对象
   */
  private saveTokens(tokens: TokenDto): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    this.setAuthToken(tokens.accessToken);
  }

  /**
   * 清除所有 token
   */
  private clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.clearAuthToken();
  }

  /**
   * 刷新 token
   * @returns 是否成功刷新 token
   */
  private async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      return false;
    }

    try {
      // 创建一个新的 axios 实例来刷新 token，避免进入拦截器循环
      const response = await axios.post<TokenDto>(
        `${this.baseUrl}/auth/refresh`,
        {},
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        },
      );

      if (response.data) {
        this.saveTokens(response.data);
        return true;
      }

      return false;
    } catch (error) {
      console.error('刷新 token 失败:', error);
      this.clearTokens();
      return false;
    }
  }

  /**
   * 设置认证 token
   * @param token 访问令牌
   */
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    this.instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * 清除认证 token
   */
  clearAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
    delete this.instance.defaults.headers.common['Authorization'];
  }

  /**
   * 设置基础 URL
   * @param url 基础 URL
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
    this.instance.defaults.baseURL = url;
  }

  /**
   * 设置默认请求头
   * @param headers 默认请求头
   */
  setDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = {
      ...this.defaultHeaders,
      ...headers,
    };

    // 更新 axios 实例的请求头
    Object.entries(this.defaultHeaders).forEach(([key, value]) => {
      this.instance.defaults.headers.common[key] = value;
    });
  }

  /**
   * 登录并保存 token
   * @param email 邮箱
   * @param password 密码
   * @returns Token 对象
   */
  async login(email: string, password: string): Promise<TokenDto> {
    const response = await this.post<TokenDto>('/auth/login', {
      email,
      password,
    });
    this.saveTokens(response);
    return response;
  }

  /**
   * 登出并清除 token
   */
  logout(): void {
    this.clearTokens();
  }

  /**
   * 发起 HTTP 请求
   * @param url URL
   * @param options 请求选项
   * @returns 响应 Promise
   */
  async request<T = unknown>(
    url: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const config: AxiosRequestConfig = {
      url,
      method: options.method || 'GET',
      headers: {
        ...options.headers,
      },
      params: options.params,
      data: options.data,
      timeout: options.timeout,
      withCredentials: options.withCredentials,
      ...options,
    };

    // 发起请求
    return this.instance.request<unknown, T>(config);
  }

  /**
   * 发起 GET 请求
   * @param url URL
   * @param params 查询参数
   * @param options 请求选项
   * @returns 响应 Promise
   */
  async get<T = unknown>(
    url: string,
    params?: Record<string, string | number | boolean | undefined>,
    options: Omit<RequestOptions, 'method' | 'params'> = {},
  ): Promise<T> {
    return this.request<T>(url, {
      method: 'GET',
      params,
      ...options,
    });
  }

  /**
   * 发起 POST 请求
   * @param url URL
   * @param data 请求体
   * @param options 请求选项
   * @returns 响应 Promise
   */
  async post<T = unknown>(
    url: string,
    data?: unknown,
    options: Omit<RequestOptions, 'method' | 'data'> = {},
  ): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      data,
      ...options,
    });
  }

  /**
   * 发起 PUT 请求
   * @param url URL
   * @param data 请求体
   * @param options 请求选项
   * @returns 响应 Promise
   */
  async put<T = unknown>(
    url: string,
    data?: unknown,
    options: Omit<RequestOptions, 'method' | 'data'> = {},
  ): Promise<T> {
    return this.request<T>(url, {
      method: 'PUT',
      data,
      ...options,
    });
  }

  /**
   * 发起 PATCH 请求
   * @param url URL
   * @param data 请求体
   * @param options 请求选项
   * @returns 响应 Promise
   */
  async patch<T = unknown>(
    url: string,
    data?: unknown,
    options: Omit<RequestOptions, 'method' | 'data'> = {},
  ): Promise<T> {
    return this.request<T>(url, {
      method: 'PATCH',
      data,
      ...options,
    });
  }

  /**
   * 发起 DELETE 请求
   * @param url URL
   * @param options 请求选项
   * @returns 响应 Promise
   */
  async delete<T = unknown>(
    url: string,
    options: Omit<RequestOptions, 'method'> = {},
  ): Promise<T> {
    return this.request<T>(url, {
      method: 'DELETE',
      ...options,
    });
  }

  /**
   * 上传文件
   * @param url URL
   * @param file 要上传的文件
   * @param fieldName 文件字段名
   * @param extraData 额外表单数据
   * @param options 请求选项
   * @returns 响应 Promise
   */
  async uploadFile<T = unknown>(
    url: string,
    file: File,
    fieldName: string = 'file',
    extraData: Record<string, string> = {},
    options: Omit<RequestOptions, 'method' | 'data'> = {},
  ): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    // 添加额外数据到表单
    Object.entries(extraData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // 让 axios 设置带有正确边界的 Content-Type 头
    return this.request<T>(url, {
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...options,
    });
  }

  /**
   * 处理流式响应的请求
   * @param url URL
   * @param data 请求体
   * @param onStream 处理每个数据块的回调函数
   * @param options 请求选项
   * @returns 完成时的 Promise
   */
  async stream<T = unknown>(
    url: string,
    data?: unknown,
    onStream?: (chunk: string) => void,
    options: Omit<RequestOptions, 'method' | 'data' | 'onStream'> = {},
  ): Promise<T> {
    if (!onStream) {
      throw new Error('流式请求需要提供 onStream 回调函数');
    }

    const controller = new AbortController();
    const config: AxiosRequestConfig = {
      url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        ...options.headers,
      },
      data,
      responseType: 'stream',
      signal: controller.signal,
      ...options,
    };

    return new Promise((resolve, reject) => {
      let hasReceivedData = false;
      let timeoutId: number | null = null;

      // 重置活动计时器的函数
      const resetActivityTimer = () => {
        if (hasReceivedData && timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      };

      // 设置请求
      const axiosRequest = this.instance.request({
        ...config,
        timeout: undefined,
        responseType: 'text',
        onDownloadProgress: (progressEvent) => {
          const response = progressEvent.event.target as XMLHttpRequest;
          const responseText = response.responseText;

          if (responseText) {
            // 重置活动计时器，因为我们收到了数据
            resetActivityTimer();
            hasReceivedData = true;

            // 处理响应文本以提取新块
            const lines = responseText.split('\n');

            // 处理每一行
            for (const line of lines) {
              const trimmedLine = line.trim();
              if (!trimmedLine) continue; // 跳过空行

              // 处理 SSE 格式 (data: {...})
              if (line.startsWith('data:')) {
                try {
                  const data = line.substring(5).trim();
                  onStream(data);
                } catch (error) {
                  console.error('处理流数据时出错:', error);
                }
              }
              // 处理不带 'data:' 前缀的直接 JSON 格式
              else if (trimmedLine.includes('{') && trimmedLine.includes('}')) {
                try {
                  // 尝试解析为 JSON 以验证
                  try {
                    JSON.parse(trimmedLine);
                    onStream(trimmedLine);
                  } catch {
                    // 如果看起来像 JSON 但无效，可能是部分块
                    console.warn(
                      '在流中收到无效的 JSON，但仍在处理:',
                      trimmedLine,
                    );
                    onStream(trimmedLine);
                  }
                } catch (error) {
                  console.error('处理直接 JSON 数据时出错:', error);
                }
              }
              // 处理可能包含有用数据的任何其他格式
              else if (trimmedLine.length > 0) {
                // 传递任何不匹配其他格式的非空内容
                onStream(trimmedLine);
              }
            }
          }
        },
      });

      // 设置初始连接超时
      if (config.timeout) {
        timeoutId = setTimeout(() => {
          // 如果在超时前没有收到任何数据，中止请求
          if (!hasReceivedData) {
            console.error('等待初始响应超时');
            controller.abort();
            reject(new Error('等待初始响应超时'));
          }
        }, config.timeout) as unknown as number;
      }

      // 处理请求完成
      axiosRequest
        .then((response) => {
          // 当流完成时，解析完整响应
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          resolve(response.data as T);
        })
        .catch((error) => {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          reject(error);
        });
    });
  }
}

// 创建并导出单例实例
const request = new Request();
export default request;
