import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/const';

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

// 记录是否正在刷新token
let isRefreshingToken = false;
// 等待token刷新的请求队列
let refreshSubscribers: ((token: string) => void)[] = [];

// 拓展AxiosRequestConfig类型，添加_retry属性
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

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
  }

  /**
   * 设置请求和响应拦截器
   */
  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 检查当前请求头是否已有Authorization - 如果没有则尝试从localStorage获取
        if (!config.headers.Authorization && typeof window !== 'undefined') {
          // 从localStorage中获取token (Zustand persist自动存储的)
          const userAuthStorage = localStorage.getItem('user-auth-storage');
          if (userAuthStorage) {
            try {
              const { state } = JSON.parse(userAuthStorage);
              if (state && state.token) {
                config.headers.Authorization = `Bearer ${state.token}`;
              }
            } catch (e) {
              console.error('解析localStorage中的token失败:', e);
            }
          }
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

          // 处理 401 未授权错误
          if (error.response.status === 401) {
            // 获取原始请求配置
            const originalRequest = error.config as InternalAxiosRequestConfig;
            if (!originalRequest) {
              window.location.href = '/login';
              return Promise.reject(error);
            }

            // 确保请求没有被重试过，防止死循环
            if (!originalRequest._retry) {
              // 如果已经在刷新token，则将请求加入队列
              if (isRefreshingToken) {
                return new Promise((resolve) => {
                  refreshSubscribers.push((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    resolve(this.instance(originalRequest));
                  });
                });
              }

              // 标记正在刷新token
              isRefreshingToken = true;
              originalRequest._retry = true;

              // 从localStorage获取refreshToken
              try {
                const userAuthStorage =
                  localStorage.getItem('user-auth-storage');
                if (!userAuthStorage) {
                  throw new Error('No refresh token available');
                }

                const { state } = JSON.parse(userAuthStorage);
                const refreshToken = state?.[REFRESH_TOKEN_KEY.split('.')[1]];

                if (!refreshToken) {
                  throw new Error('No refresh token found');
                }

                // 尝试使用refreshToken获取新的accessToken
                // 需要使用基础axios发起请求，避免触发拦截器
                return axios
                  .post(
                    `${this.baseUrl}/auth/refresh-token`,
                    { refreshToken },
                    { headers: { 'Content-Type': 'application/json' } },
                  )
                  .then((response) => {
                    const { accessToken } = response.data;

                    // 保存新的token到localStorage (由于Zustand持久化依赖localStorage)
                    const updatedState = {
                      ...state,
                      [ACCESS_TOKEN_KEY.split('.')[1]]: accessToken,
                    };
                    localStorage.setItem(
                      'user-auth-storage',
                      JSON.stringify({ state: updatedState }),
                    );

                    // 更新实例默认headers
                    this.setAuthToken(accessToken);

                    // 更新原始请求中的Authorization
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                    // 执行队列中的请求
                    refreshSubscribers.forEach((callback) =>
                      callback(accessToken),
                    );
                    refreshSubscribers = [];

                    // 重置标记
                    isRefreshingToken = false;

                    // 尝试同步更新Zustand store (如果已加载)
                    try {
                      if (
                        window &&
                        typeof (window as any).useUserStore !== 'undefined'
                      ) {
                        const userStore = (window as any).useUserStore;
                        userStore
                          .getState()
                          .setUser(
                            userStore.getState().user || { id: '', email: '' },
                            accessToken,
                          );
                      }
                    } catch (e) {
                      console.error('同步token到store失败:', e);
                    }

                    // 重新发起原始请求
                    return this.instance(originalRequest);
                  })
                  .catch((refreshError) => {
                    console.error('刷新令牌失败:', refreshError);
                    isRefreshingToken = false;
                    refreshSubscribers = [];

                    // 刷新token失败，重定向到登录页
                    if (typeof window !== 'undefined') {
                      window.location.href = '/login';
                    }
                    return Promise.reject(refreshError);
                  });
              } catch (error) {
                console.error('处理刷新token失败:', error);
                isRefreshingToken = false;

                // 处理失败，重定向到登录页
                if (typeof window !== 'undefined') {
                  window.location.href = '/login';
                }
                return Promise.reject(error);
              }
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
              if (trimmedLine.startsWith('data:')) {
                const data = trimmedLine.slice(5).trim();
                if (data) {
                  onStream(data);
                }
              } else {
                // 为非标准格式的响应提供回退
                onStream(trimmedLine);
              }
            }
          }
        },
      });

      // 设置活动超时
      if (options.timeout) {
        timeoutId = window.setTimeout(() => {
          if (!hasReceivedData) {
            controller.abort();
            reject(new Error('流请求超时'));
          }
        }, options.timeout);
      }

      // 处理请求完成
      axiosRequest
        .then((response) => {
          resetActivityTimer();
          resolve(response as T);
        })
        .catch((error) => {
          resetActivityTimer();
          reject(error);
        });
    });
  }
}

// 创建全局 HTTP 客户端实例
const request = new Request();

export default request;
