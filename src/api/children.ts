import request from '../utils/request';
import {
  ChildPublic,
  ChildrenPublic,
  ChildCreate,
  ChildUpdate,
} from '../types/api';

/**
 * API endpoints for child management
 */
export const childrenApi = {
  /**
   * Create a new child
   * @param data Child data
   * @returns Created child
   */
  createChild: (data: ChildCreate): Promise<ChildPublic> => {
    return request.post('/api/v1/children/', data);
  },

  /**
   * Get all children
   * @param skip Number of children to skip
   * @param limit Maximum number of children to return
   * @returns Paginated children
   */
  getChildren: (skip: number = 0, limit: number = 100): Promise<ChildrenPublic> => {
    return request.get('/api/v1/children/', { skip, limit });
  },

  /**
   * Get child by ID
   * @param childId Child ID
   * @returns Child
   */
  getChildById: (childId: string): Promise<ChildPublic> => {
    return request.get(`/api/v1/children/${childId}`);
  },

  /**
   * Update child
   * @param childId Child ID
   * @param data Child data to update
   * @returns Updated child
   */
  updateChild: (childId: string, data: ChildUpdate): Promise<ChildPublic> => {
    return request.put(`/api/v1/children/${childId}`, data);
  },

  /**
   * Delete child
   * @param childId Child ID
   * @returns Deleted child
   */
  deleteChild: (childId: string): Promise<ChildPublic> => {
    return request.delete(`/api/v1/children/${childId}`);
  },
};

export default childrenApi;
