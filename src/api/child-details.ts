import request from '../utils/request';
import {
  ChildDetailPublic,
  ChildDetailsPublic,
  ChildDetailCreate,
  ChildDetailUpdate,
} from '../types/api';

/**
 * API endpoints for child detail management
 */
export const childDetailsApi = {
  /**
   * Create a new child detail
   * @param data Child detail data
   * @returns Created child detail
   */
  createChildDetail: (data: ChildDetailCreate): Promise<ChildDetailPublic> => {
    return request.post('/api/v1/child-details/', data);
  },

  /**
   * Get child details
   * @param childId Child ID
   * @param detailType Optional detail type filter
   * @param tags Optional tags filter
   * @param skip Number of details to skip
   * @param limit Maximum number of details to return
   * @returns Paginated child details
   */
  getChildDetails: (
    childId: string,
    detailType?: string,
    tags?: string[],
    skip: number = 0,
    limit: number = 100
  ): Promise<ChildDetailsPublic> => {
    return request.get('/api/v1/child-details/', {
      child_id: childId,
      detail_type: detailType,
      tags: tags ? JSON.stringify(tags) : undefined,
      skip,
      limit,
    });
  },

  /**
   * Get child detail by ID
   * @param detailId Child detail ID
   * @returns Child detail
   */
  getChildDetailById: (detailId: string): Promise<ChildDetailPublic> => {
    return request.get(`/api/v1/child-details/${detailId}`);
  },

  /**
   * Update child detail
   * @param detailId Child detail ID
   * @param data Child detail data to update
   * @returns Updated child detail
   */
  updateChildDetail: (
    detailId: string,
    data: ChildDetailUpdate
  ): Promise<ChildDetailPublic> => {
    return request.put(`/api/v1/child-details/${detailId}`, data);
  },

  /**
   * Delete child detail
   * @param detailId Child detail ID
   * @returns Deleted child detail
   */
  deleteChildDetail: (detailId: string): Promise<ChildDetailPublic> => {
    return request.delete(`/api/v1/child-details/${detailId}`);
  },

  /**
   * Create multiple child details in a batch
   * @param data Array of child detail data
   * @returns Created child details
   */
  createChildDetailsBatch: (
    data: ChildDetailCreate[]
  ): Promise<ChildDetailsPublic> => {
    return request.post('/api/v1/child-details/batch', data);
  },
};

export default childDetailsApi;
