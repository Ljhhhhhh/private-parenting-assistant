import axios from 'axios'

// API基础配置
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加认证信息等
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器 - 统一处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 根据错误状态码处理不同错误
    const { response } = error
    if (response) {
      switch (response.status) {
        case 401:
          // 未授权处理
          console.error('未授权，请登录')
          break
        case 403:
          console.error('无权限访问')
          break
        case 404:
          console.error('请求的资源不存在')
          break
        case 500:
          console.error('服务器错误')
          break
        default:
          console.error(`请求错误: ${response.status}`)
      }
    } else {
      // 网络错误
      console.error('网络错误，请检查您的网络连接')
    }
    
    return Promise.reject(error)
  }
)

// 聊天相关API
export const chatApi = {
  // 发送消息并获取回复
  sendMessage: async (message: string) => {
    try {
      const response = await api.post('/chat/send', { message })
      return response.data
    } catch (error) {
      console.error('发送消息失败:', error)
      throw error
    }
  },
  
  // 获取历史消息
  getHistory: async (conversationId: string) => {
    try {
      const response = await api.get(`/chat/history/${conversationId}`)
      return response.data
    } catch (error) {
      console.error('获取历史消息失败:', error)
      throw error
    }
  },
  
  // 创建新会话
  createConversation: async (title: string) => {
    try {
      const response = await api.post('/chat/conversation', { title })
      return response.data
    } catch (error) {
      console.error('创建会话失败:', error)
      throw error
    }
  }
}

export default api
