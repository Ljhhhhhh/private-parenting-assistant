import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

// Define request options interface extending AxiosRequestConfig
export interface RequestOptions
  extends Omit<AxiosRequestConfig, 'url' | 'method' | 'baseURL'> {
  method?: string;
  headers?: Record<string, string>;
  data?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
  withCredentials?: boolean;
}

// Define error interface
export interface ApiError extends Error {
  status?: number;
  data?: unknown;
  config?: AxiosRequestConfig;
}

class Request {
  private instance: AxiosInstance;
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(
    baseUrl: string = 'http://localhost:8000',
    defaultHeaders: Record<string, string> = {},
    timeout: number = 10000,
  ) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };

    // Create axios instance
    this.instance = axios.create({
      baseURL: this.baseUrl,
      timeout,
      headers: this.defaultHeaders,
      withCredentials: true,
    });

    // Add request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // You can modify the request config here
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Add response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        // Return the response data directly
        return response.data;
      },
      (error: AxiosError) => {
        // Handle error responses
        const apiError: ApiError = new Error(error.message || 'Request failed');

        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          apiError.status = error.response.status;
          apiError.data = error.response.data;

          // Show error message
          const responseData = error.response.data as Record<string, unknown>;
          if (responseData && responseData.detail) {
            if (Array.isArray(responseData.detail)) {
              const detail = responseData.detail[0] as Record<string, string>;
              console.error(detail.msg || 'Request failed');
            } else {
              console.error(
                (responseData.detail as string) || 'Request failed',
              );
            }
          } else {
            console.error('Request failed');
          }
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response from server');
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Request configuration error');
        }

        if (axios.isCancel(error)) {
          console.error('Request cancelled');
        }

        return Promise.reject(apiError);
      },
    );
  }

  /**
   * Set authorization token
   * @param token Access token
   */
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    this.instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Clear authorization token
   */
  clearAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
    delete this.instance.defaults.headers.common['Authorization'];
  }

  /**
   * Set base URL
   * @param url Base URL
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
    this.instance.defaults.baseURL = url;
  }

  /**
   * Set default headers
   * @param headers Default headers
   */
  setDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = {
      ...this.defaultHeaders,
      ...headers,
    };

    // Update axios instance headers
    Object.entries(this.defaultHeaders).forEach(([key, value]) => {
      this.instance.defaults.headers.common[key] = value;
    });
  }

  /**
   * Make HTTP request
   * @param url URL
   * @param options Request options
   * @returns Promise with response
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

    // Make the request
    return this.instance.request<unknown, T>(config);
  }

  /**
   * Make GET request
   * @param url URL
   * @param params Query parameters
   * @param options Request options
   * @returns Promise with response
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
   * Make POST request
   * @param url URL
   * @param data Request body
   * @param options Request options
   * @returns Promise with response
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
   * Make PUT request
   * @param url URL
   * @param data Request body
   * @param options Request options
   * @returns Promise with response
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
   * Make PATCH request
   * @param url URL
   * @param data Request body
   * @param options Request options
   * @returns Promise with response
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
   * Make DELETE request
   * @param url URL
   * @param options Request options
   * @returns Promise with response
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
   * Upload file
   * @param url URL
   * @param file File to upload
   * @param fieldName Field name for the file
   * @param extraData Extra form data
   * @param options Request options
   * @returns Promise with response
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

    // Add extra data to form data
    Object.entries(extraData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Let axios set the Content-Type header with the correct boundary
    return this.request<T>(url, {
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...options,
    });
  }
}

// Create and export a singleton instance
const request = new Request();
export default request;
