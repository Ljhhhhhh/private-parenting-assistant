import request from '../utils/request';
import { MessageResponse } from '../types/api';

/**
 * API endpoints for utility functions
 */
export const utilsApi = {
  /**
   * Test email sending
   * @param email Email address to send test email to
   * @returns Message response
   */
  testEmail: (email: string): Promise<MessageResponse> => {
    return request.post('/api/v1/utils/test-email/', undefined, {
      params: { email_to: email },
    });
  },

  /**
   * Check API health
   * @returns Health status
   */
  healthCheck: (): Promise<boolean> => {
    return request.get('/api/v1/utils/health-check/');
  },
};

export default utilsApi;
