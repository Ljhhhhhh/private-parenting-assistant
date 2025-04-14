import request from '../utils/request';
import {
  LoginRequest,
  TokenResponse,
  MessageResponse,
  NewPassword,
} from '../types/api';

/**
 * API endpoints for authentication
 */
export const authApi = {
  /**
   * Login with username and password
   * @param data Login credentials
   * @returns Token response
   */
  login: (data: LoginRequest): Promise<TokenResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', data.username);
    formData.append('password', data.password);

    return request.request<TokenResponse>('/api/v1/login/access-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: formData.toString(), // Convert URLSearchParams to string for Axios
    });
  },

  /**
   * Test access token
   * @returns User data
   */
  testToken: () => {
    return request.post('/api/v1/login/test-token');
  },

  /**
   * Request password recovery
   * @param email User email
   * @returns Message response
   */
  recoverPassword: (email: string): Promise<MessageResponse> => {
    return request.post(`/api/v1/password-recovery/${email}`);
  },

  /**
   * Reset password with token
   * @param data New password data
   * @returns Message response
   */
  resetPassword: (data: NewPassword): Promise<MessageResponse> => {
    return request.post('/api/v1/reset-password/', data);
  },

  /**
   * Get password recovery HTML content
   * @param email User email
   * @returns HTML content
   */
  getPasswordRecoveryHtml: (email: string): Promise<string> => {
    return request.post(
      `/api/v1/password-recovery-html-content/${email}`,
      undefined,
      {
        headers: {
          Accept: 'text/html',
        },
      },
    );
  },
};

export default authApi;
