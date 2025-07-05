import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/ui/Toast';

interface ToastOptions {
  title?: string;
  description: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  visible: boolean;
  duration: number;
}

interface ToastContextType {
  toast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toastState, setToastState] = useState<ToastState>({
    message: '',
    type: 'info',
    visible: false,
    duration: 3000,
  });

  const toast = useCallback((options: ToastOptions) => {
    const message = options.title 
      ? `${options.title}: ${options.description}`
      : options.description;
    
    setToastState({
      message,
      type: options.variant || 'info',
      visible: true,
      duration: options.duration || 3000,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToastState(prev => ({ ...prev, visible: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <Toast
        message={toastState.message}
        type={toastState.type}
        visible={toastState.visible}
        onHide={hideToast}
        duration={toastState.duration}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
