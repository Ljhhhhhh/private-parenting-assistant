import authApi from './auth';
import usersApi from './users';
import childrenApi from './children';
import growthRecordsApi from './growth-records';
import childDetailsApi from './child-details';
import documentsApi from './documents';
import chatApi from './chat';
import utilsApi from './utils';

// Export all API functions
export {
  authApi,
  usersApi,
  childrenApi,
  growthRecordsApi,
  childDetailsApi,
  documentsApi,
  chatApi,
  utilsApi,
};

// Export default as an object containing all APIs
const api = {
  auth: authApi,
  users: usersApi,
  children: childrenApi,
  growthRecords: growthRecordsApi,
  childDetails: childDetailsApi,
  documents: documentsApi,
  chat: chatApi,
  utils: utilsApi,
};

export default api;
