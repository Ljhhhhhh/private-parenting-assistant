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
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer' | 'stream';
  onStream?: (chunk: string) => void;
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

  /**
   * Make a request that handles event streams
   * @param url URL
   * @param data Request body
   * @param onStream Callback function to handle each chunk of the stream
   * @param options Request options
   * @returns Promise that resolves when the stream is complete
   */
  async stream<T = unknown>(
    url: string,
    data?: unknown,
    onStream?: (chunk: string) => void,
    options: Omit<RequestOptions, 'method' | 'data' | 'onStream'> = {},
  ): Promise<T> {
    if (!onStream) {
      throw new Error('onStream callback is required for stream requests');
    }

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
      ...options,
    };

    // Use axios directly with response type handling
    return new Promise((resolve, reject) => {
      // Create a variable to track if we've received any data
      let hasReceivedData = false;
      // Create a variable to store the timeout ID
      let timeoutId: number | null = null;
      // Create a variable to store the abort controller
      const controller = new AbortController();

      // Function to reset the activity timer and clear timeout
      const resetActivityTimer = () => {
        // If we're receiving data, clear any existing timeout
        if (hasReceivedData && timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      };

      // Set up the request
      const axiosRequest = this.instance.request({
        ...config,
        // Remove the timeout from config as we'll handle it manually
        timeout: undefined,
        responseType: 'text',
        // Add the signal from AbortController
        signal: controller.signal,
        onDownloadProgress: (progressEvent) => {
          const response = progressEvent.event.target as XMLHttpRequest;
          const responseText = response.responseText;

          // Process the response text to extract the latest chunk
          if (responseText) {
            // Reset the activity timer since we received data
            resetActivityTimer();

            // Mark that we've received data
            hasReceivedData = true;

            // Process the response text to extract new chunks
            // We need to be careful about partial or incomplete lines
            const lines = responseText.split('\n');

            // Process each line
            for (const line of lines) {
              const trimmedLine = line.trim();
              if (!trimmedLine) continue; // Skip empty lines

              // Handle SSE format (data: {...})
              if (line.startsWith('data:')) {
                try {
                  const data = line.substring(5).trim();
                  if (data) {
                    // Validate JSON before passing to callback
                    try {
                      // Just check if it's valid JSON, but don't require it
                      if (data.startsWith('{') && data.endsWith('}')) {
                        JSON.parse(data);
                      }
                      onStream(data);
                    } catch {
                      // If it's not valid JSON, still send it as it might be partial
                      console.warn(
                        'Received invalid JSON in stream, but processing anyway:',
                        data,
                      );
                      onStream(data);
                    }
                  }
                } catch (error) {
                  console.error('Error processing stream data:', error);
                }
              }
              // Handle direct JSON format without 'data:' prefix
              else if (trimmedLine.includes('{') && trimmedLine.includes('}')) {
                try {
                  // Try to parse as JSON to validate
                  try {
                    JSON.parse(trimmedLine);
                    onStream(trimmedLine);
                  } catch {
                    // If it looks like JSON but isn't valid, it might be a partial chunk
                    // We'll still process it as the client might be able to handle it
                    console.warn(
                      'Received invalid JSON in stream, but processing anyway:',
                      trimmedLine,
                    );
                    onStream(trimmedLine);
                  }
                } catch (error) {
                  console.error('Error processing direct JSON data:', error);
                }
              }
              // Handle any other format that might contain useful data
              else if (trimmedLine.length > 0) {
                // Pass through any non-empty content that doesn't match other formats
                onStream(trimmedLine);
              }
            }
          }
        },
      });

      // Set up the initial connection timeout
      if (config.timeout) {
        timeoutId = setTimeout(() => {
          // If we haven't received any data by the timeout, abort the request
          if (!hasReceivedData) {
            console.error('Request timed out waiting for initial response');
            // Use the AbortController to cancel the request
            controller.abort();
            reject(new Error('Request timed out waiting for initial response'));
          }
        }, config.timeout);
      }

      // Handle request completion
      axiosRequest
        .then((response) => {
          // When the stream is complete, resolve with the full response
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

// Create and export a singleton instance
const request = new Request();
export default request;
