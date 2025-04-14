# API Client Documentation

This folder contains API client functions for interacting with the backend API.

## Request Utility

The `request.ts` utility provides a wrapper around the Fetch API with the following features:

- Support for different HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Authentication token handling
- Error handling
- Request/response interceptors
- Type safety with TypeScript generics

## API Modules

The API is organized into the following modules:

- `auth.ts` - Authentication-related endpoints
- `users.ts` - User management endpoints
- `children.ts` - Child management endpoints
- `growth-records.ts` - Growth records endpoints
- `child-details.ts` - Child details endpoints
- `documents.ts` - Document management endpoints
- `chat.ts` - Chat functionality endpoints
- `utils.ts` - Utility endpoints

## Usage Examples

### Authentication

```typescript
import { authApi } from '../api';

// Login
const login = async (email: string, password: string) => {
  try {
    const response = await authApi.login({ username: email, password });
    // Store token in localStorage or secure storage
    localStorage.setItem('token', response.access_token);
    return response;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

// Test token
const testToken = async () => {
  try {
    const user = await authApi.testToken();
    return user;
  } catch (error) {
    console.error('Token test failed:', error);
    throw error;
  }
};
```

### User Management

```typescript
import { usersApi } from '../api';

// Get current user
const getCurrentUser = async () => {
  try {
    const user = await usersApi.getCurrentUser();
    return user;
  } catch (error) {
    console.error('Failed to get current user:', error);
    throw error;
  }
};

// Register a new user
const registerUser = async (email: string, password: string, fullName?: string) => {
  try {
    const user = await usersApi.registerUser({
      email,
      password,
      full_name: fullName,
    });
    return user;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};
```

### Child Management

```typescript
import { childrenApi } from '../api';

// Create a new child
const createChild = async (name: string, birthday: string, gender: string) => {
  try {
    const child = await childrenApi.createChild({
      name,
      birthday,
      gender,
    });
    return child;
  } catch (error) {
    console.error('Failed to create child:', error);
    throw error;
  }
};

// Get all children
const getChildren = async () => {
  try {
    const response = await childrenApi.getChildren();
    return response.data;
  } catch (error) {
    console.error('Failed to get children:', error);
    throw error;
  }
};
```

### Growth Records

```typescript
import { growthRecordsApi } from '../api';

// Create a growth record
const createGrowthRecord = async (
  childId: string,
  recordType: string,
  recordData: Record<string, any>,
  recordedAt: string,
  notes?: string
) => {
  try {
    const record = await growthRecordsApi.createGrowthRecord({
      child_id: childId,
      record_type: recordType,
      record_data: recordData,
      recorded_at: recordedAt,
      notes,
    });
    return record;
  } catch (error) {
    console.error('Failed to create growth record:', error);
    throw error;
  }
};

// Get growth records for a child
const getGrowthRecords = async (childId: string, recordType?: string) => {
  try {
    const response = await growthRecordsApi.getGrowthRecords(childId, recordType);
    return response.data;
  } catch (error) {
    console.error('Failed to get growth records:', error);
    throw error;
  }
};
```

### Document Upload

```typescript
import { documentsApi } from '../api';

// Upload a document
const uploadDocument = async (file: File, title: string, description?: string) => {
  try {
    const document = await documentsApi.uploadDocument(file, title, description);
    return document;
  } catch (error) {
    console.error('Failed to upload document:', error);
    throw error;
  }
};
```

### Chat

```typescript
import { chatApi } from '../api';

// Send a chat message
const sendChatMessage = async (question: string, sessionId?: string, childId?: string) => {
  try {
    const response = await chatApi.sendChatMessage({
      question,
      session_id: sessionId,
      child_id: childId,
    });
    return response;
  } catch (error) {
    console.error('Failed to send chat message:', error);
    throw error;
  }
};

// Get chat history
const getChatHistory = async (sessionId?: string) => {
  try {
    const response = await chatApi.getChatHistories(sessionId);
    return response.data;
  } catch (error) {
    console.error('Failed to get chat history:', error);
    throw error;
  }
};
```

## Error Handling

The request utility includes built-in error handling that will display error messages using the message component. You can also catch errors and handle them manually:

```typescript
try {
  const user = await usersApi.getCurrentUser();
  // Handle success
} catch (error) {
  // Handle error
  if (error.status === 401) {
    // Unauthorized, redirect to login
  } else {
    // Display custom error message
  }
}
```

## Authentication Token Management

The request utility provides methods to set and clear the authentication token:

```typescript
import request from '../utils/request';

// Set token after login
const setAuthToken = (token: string) => {
  request.setAuthToken(token);
};

// Clear token on logout
const clearAuthToken = () => {
  request.clearAuthToken();
};
```

You should call `setAuthToken` when your application starts and after a successful login to ensure that all API requests include the authentication token.
