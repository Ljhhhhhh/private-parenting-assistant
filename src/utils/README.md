# Request Utility Documentation

This folder contains utility functions for making HTTP requests to the backend API.

## Request Utility

The `request.ts` utility provides a wrapper around Axios with the following features:

- Support for different HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Authentication token handling
- Error handling with console error logging
- Request/response interceptors
- Type safety with TypeScript generics
- File upload support

## Usage Examples

### Basic Usage

```typescript
import request from '../utils/request';

// GET request
const getData = async () => {
  try {
    const response = await request.get('/api/v1/users/me');
    return response;
  } catch (error) {
    console.error('Failed to get data:', error);
    throw error;
  }
};

// POST request
const createData = async (data: any) => {
  try {
    const response = await request.post('/api/v1/items', data);
    return response;
  } catch (error) {
    console.error('Failed to create data:', error);
    throw error;
  }
};
```

### Authentication

```typescript
import request from '../utils/request';

// Set authentication token
const setAuthToken = (token: string) => {
  request.setAuthToken(token);
};

// Clear authentication token
const clearAuthToken = () => {
  request.clearAuthToken();
};
```

### File Upload

```typescript
import request from '../utils/request';

// Upload a file
const uploadFile = async (file: File, title: string, description?: string) => {
  try {
    const response = await request.uploadFile(
      '/api/v1/documents/upload',
      file,
      'file',
      { title, description: description || '' }
    );
    return response;
  } catch (error) {
    console.error('Failed to upload file:', error);
    throw error;
  }
};
```

### Custom Request Configuration

```typescript
import request from '../utils/request';

// Custom request with specific options
const customRequest = async () => {
  try {
    const response = await request.request('/api/v1/custom-endpoint', {
      method: 'POST',
      data: { key: 'value' },
      timeout: 5000,
      headers: {
        'Custom-Header': 'value',
      },
    });
    return response;
  } catch (error) {
    console.error('Custom request failed:', error);
    throw error;
  }
};
```

## Error Handling

The request utility includes built-in error handling that will log errors to the console. You can also catch errors and handle them manually:

```typescript
try {
  const user = await request.get('/api/v1/users/me');
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
