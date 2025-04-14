import request from '../utils/request';
import {
  GrowthRecordPublic,
  GrowthRecordsPublic,
  GrowthRecordCreate,
  GrowthRecordUpdate,
} from '../types/api';

/**
 * API endpoints for growth record management
 */
export const growthRecordsApi = {
  /**
   * Create a new growth record
   * @param data Growth record data
   * @returns Created growth record
   */
  createGrowthRecord: (data: GrowthRecordCreate): Promise<GrowthRecordPublic> => {
    return request.post('/api/v1/growth-records/', data);
  },

  /**
   * Get growth records
   * @param childId Child ID
   * @param recordType Optional record type filter
   * @param skip Number of records to skip
   * @param limit Maximum number of records to return
   * @returns Paginated growth records
   */
  getGrowthRecords: (
    childId: string,
    recordType?: string,
    skip: number = 0,
    limit: number = 100
  ): Promise<GrowthRecordsPublic> => {
    return request.get('/api/v1/growth-records/', {
      child_id: childId,
      record_type: recordType,
      skip,
      limit,
    });
  },

  /**
   * Get growth record by ID
   * @param recordId Growth record ID
   * @returns Growth record
   */
  getGrowthRecordById: (recordId: string): Promise<GrowthRecordPublic> => {
    return request.get(`/api/v1/growth-records/${recordId}`);
  },

  /**
   * Update growth record
   * @param recordId Growth record ID
   * @param data Growth record data to update
   * @returns Updated growth record
   */
  updateGrowthRecord: (
    recordId: string,
    data: GrowthRecordUpdate
  ): Promise<GrowthRecordPublic> => {
    return request.put(`/api/v1/growth-records/${recordId}`, data);
  },

  /**
   * Delete growth record
   * @param recordId Growth record ID
   * @returns Deleted growth record
   */
  deleteGrowthRecord: (recordId: string): Promise<GrowthRecordPublic> => {
    return request.delete(`/api/v1/growth-records/${recordId}`);
  },
};

export default growthRecordsApi;
