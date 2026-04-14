/**
 * API Request utility for making HTTP calls
 */

export interface RequestOptions extends RequestInit {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}

export async function apiRequest<T = any>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

export async function uploadFile(
  endpoint: string,
  file: File,
  options?: Omit<RequestOptions, 'body' | 'method'>
): Promise<any> {
  const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}${endpoint}`;
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(url, {
      method: 'POST',
      ...options,
      body: formData,
      headers: {
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
}
