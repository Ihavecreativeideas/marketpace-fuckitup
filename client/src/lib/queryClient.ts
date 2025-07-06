const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export async function apiRequest(
  method: string,
  endpoint: string,
  data?: any
): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for session management
  };

  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`API Request failed: ${method} ${endpoint}`, error);
    throw error;
  }
}