import request from '../utils/request';
import {
  UserPublic,
  UsersPublic,
  UserCreate,
  UserUpdate,
  UserUpdateMe,
  UserRegister,
  UpdatePassword,
  MessageResponse,
} from '../types/api';

/**
 * API endpoints for user management
 */
export const usersApi = {
  /**
   * Get all users
   * @param skip Number of users to skip
   * @param limit Maximum number of users to return
   * @returns Paginated users
   */
  getUsers: (skip: number = 0, limit: number = 100): Promise<UsersPublic> => {
    return request.get('/api/v1/users/', { skip, limit });
  },

  /**
   * Create a new user
   * @param data User data
   * @returns Created user
   */
  createUser: (data: UserCreate): Promise<UserPublic> => {
    return request.post('/api/v1/users/', data);
  },

  /**
   * Get current user
   * @returns Current user
   */
  getCurrentUser: (): Promise<UserPublic> => {
    return request.get('/api/v1/users/me');
  },

  /**
   * Delete current user
   * @returns Message response
   */
  deleteCurrentUser: (): Promise<MessageResponse> => {
    return request.delete('/api/v1/users/me');
  },

  /**
   * Update current user
   * @param data User data to update
   * @returns Updated user
   */
  updateCurrentUser: (data: UserUpdateMe): Promise<UserPublic> => {
    return request.patch('/api/v1/users/me', data);
  },

  /**
   * Update current user's password
   * @param data Password data
   * @returns Message response
   */
  updateCurrentUserPassword: (data: UpdatePassword): Promise<MessageResponse> => {
    return request.patch('/api/v1/users/me/password', data);
  },

  /**
   * Register a new user
   * @param data User registration data
   * @returns Created user
   */
  registerUser: (data: UserRegister): Promise<UserPublic> => {
    return request.post('/api/v1/users/signup', data);
  },

  /**
   * Get user by ID
   * @param userId User ID
   * @returns User
   */
  getUserById: (userId: string): Promise<UserPublic> => {
    return request.get(`/api/v1/users/${userId}`);
  },

  /**
   * Update user
   * @param userId User ID
   * @param data User data to update
   * @returns Updated user
   */
  updateUser: (userId: string, data: UserUpdate): Promise<UserPublic> => {
    return request.patch(`/api/v1/users/${userId}`, data);
  },

  /**
   * Delete user
   * @param userId User ID
   * @returns Message response
   */
  deleteUser: (userId: string): Promise<MessageResponse> => {
    return request.delete(`/api/v1/users/${userId}`);
  },
};

export default usersApi;
