// Simple toast hook without JSX to avoid compilation issues
import { useState, useCallback } from 'react';

interface ToastOptions {
  title?: string;
  description: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export function useToast() {
  const [isVisible, setIsVisible] = useState(false);

  const toast = useCallback((options: ToastOptions) => {
    console.log('Toast:', options.description);
    setIsVisible(true);
    setTimeout(() => setIsVisible(false), options.duration || 3000);
  }, []);

  return { toast };
}