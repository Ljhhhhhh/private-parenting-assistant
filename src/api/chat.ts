import request from '../utils/request';
import { ChatRequest, ChatHistoriesPublic, ModelsResponse } from '../types/api';

/**
 * API endpoints for chat functionality
 */
export const chatApi = {
  /**
   * Send a chat message
   * @param data Chat request data
   * @param onStream Optional callback to handle streaming response
   * @returns Chat response
   */
  sendChatMessage: (
    data: ChatRequest,
    onStream?: (chunk: string) => void,
  ): Promise<any> => {
    // Set timeout to 60000ms (1 minute)
    const timeout = 60000;

    if (onStream) {
      // Use streaming mode if callback is provided
      return request.stream('/api/v1/chat/', data, onStream, { timeout });
    } else {
      // Use regular POST request if no callback is provided
      return request.post('/api/v1/chat/', data, { timeout });
    }
  },

  /**
   * Get chat histories
   * @param sessionId Optional session ID filter
   * @param childId Optional child ID filter
   * @param skip Number of histories to skip
   * @param limit Maximum number of histories to return
   * @returns Paginated chat histories
   */
  getChatHistories: (
    sessionId?: string,
    childId?: string,
    skip: number = 0,
    limit: number = 100,
  ): Promise<ChatHistoriesPublic> => {
    return request.get('/api/v1/chat/history', {
      session_id: sessionId,
      child_id: childId,
      skip,
      limit,
    });
  },

  /**
   * Get chat sessions
   * @returns Array of session IDs
   */
  getChatSessions: (): Promise<string[]> => {
    return request.get('/api/v1/chat/sessions');
  },

  /**
   * Get available chat models
   * @returns Models response
   */
  getAvailableModels: (): Promise<ModelsResponse> => {
    return request.get('/api/v1/chat/models');
  },
};

export default chatApi;
