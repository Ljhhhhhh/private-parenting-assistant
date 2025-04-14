import request from '../utils/request';
import {
  DocumentPublic,
  DocumentsPublic,
  DocumentUpdate,
} from '../types/api';

/**
 * API endpoints for document management
 */
export const documentsApi = {
  /**
   * Upload a new document
   * @param file File to upload
   * @param title Document title
   * @param description Optional document description
   * @returns Uploaded document
   */
  uploadDocument: (
    file: File,
    title: string,
    description?: string
  ): Promise<DocumentPublic> => {
    const extraData: Record<string, string> = {
      title,
    };

    if (description) {
      extraData.description = description;
    }

    return request.uploadFile<DocumentPublic>(
      '/api/v1/documents/upload',
      file,
      'file',
      extraData
    );
  },

  /**
   * Get all documents
   * @param skip Number of documents to skip
   * @param limit Maximum number of documents to return
   * @returns Paginated documents
   */
  getDocuments: (
    skip: number = 0,
    limit: number = 100
  ): Promise<DocumentsPublic> => {
    return request.get('/api/v1/documents/', { skip, limit });
  },

  /**
   * Get document by ID
   * @param documentId Document ID
   * @returns Document
   */
  getDocumentById: (documentId: string): Promise<DocumentPublic> => {
    return request.get(`/api/v1/documents/${documentId}`);
  },

  /**
   * Update document
   * @param documentId Document ID
   * @param data Document data to update
   * @returns Updated document
   */
  updateDocument: (
    documentId: string,
    data: DocumentUpdate
  ): Promise<DocumentPublic> => {
    return request.put(`/api/v1/documents/${documentId}`, data);
  },

  /**
   * Delete document
   * @param documentId Document ID
   * @returns Deleted document
   */
  deleteDocument: (documentId: string): Promise<DocumentPublic> => {
    return request.delete(`/api/v1/documents/${documentId}`);
  },
};

export default documentsApi;
