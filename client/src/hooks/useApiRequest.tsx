// Temporary API request hook for onboarding screens
import { useState } from 'react';

export const useApiRequest = () => {
  const [loading, setLoading] = useState(false);
  
  const apiRequest = async (method: string, endpoint: string, data?: any) => {
    setLoading(true);
    try {
      // Mock API request for now
      console.log(`API Request: ${method} ${endpoint}`, data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { apiRequest, loading };
};