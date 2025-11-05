// services/apiService.ts

// Fix: Hardcode API_BASE_URL to '/api' to rely on the Vite proxy and resolve 'import.meta.env' type errors.
const API_BASE_URL = '/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: { msg: string }[]; // Added for validation errors
}

const getAuthToken = (): string | null => {
    return localStorage.getItem('authToken');
};

async function request<T>(endpoint: string, method: string, body: unknown = null): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
        let errorToThrow;
        try {
            // Attempt to parse a JSON error body from the backend.
            const errorResult = await response.json();
            // Create a new Error object but attach the full result to it
            errorToThrow = new Error(errorResult.message || `API Error: ${response.status} ${response.statusText}`);
            (errorToThrow as any).data = errorResult;
        } catch (e) {
            // The error response wasn't JSON. Throw a plain error.
            errorToThrow = new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        throw errorToThrow;
    }

    // Handle successful responses that might be empty (e.g., 204 No Content)
    const text = await response.text();
    if (!text) {
        return {} as T;
    }

    const result: ApiResponse<T> = JSON.parse(text);

    if (!result.success) {
      const error = new Error(result.message || result.error || 'An unknown API error occurred');
      (error as any).data = result;
      throw error;
    }
    
    // Handle cases where `data` might be intentionally null or undefined in a successful response.
    if (result.data === undefined) {
      // Return a sensible default based on what might be expected (e.g., an empty object for POST/PUT, null for GET)
      return (method === 'GET' ? null : {}) as T;
    }
    
    return result.data;

  } catch (error: any) {
    // This will catch network errors (e.g., server is down)
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
        const networkError = new Error('Cannot connect to the server. Please check your network connection and try again.');
        (networkError as any).data = { isNetworkError: true };
        throw networkError;
    }
    console.error(`API Error on ${method} ${endpoint}:`, error);
    // Re-throw other errors (like the ones we threw manually for bad responses)
    throw error;
  }
}

const apiService = {
  get<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, 'GET');
  },

  post<T>(endpoint: string, body: unknown): Promise<T> {
    return request<T>(endpoint, 'POST', body);
  },

  put<T>(endpoint: string, body: unknown): Promise<T> {
    return request<T>(endpoint, 'PUT', body);
  },

  delete<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, 'DELETE');
  },
};

export default apiService;