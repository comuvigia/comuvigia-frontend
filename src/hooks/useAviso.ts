import { useState, useCallback } from 'react';

export const useAviso = () => {
  const [alertState, setAlertState] = useState({
    isOpen: false,
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    message: '',
    title: '',
    style: 'simple' as 'simple' | 'detailed' | 'actionable' | 'toast',
    actions: [] as any[],
    duration: 5000
  });

  const showAlert = useCallback((
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    options: {
      title?: string;
      style?: 'simple' | 'detailed' | 'actionable' | 'toast';
      duration?: number;
      actions?: any[];
    } = {}
  ) => {
    setAlertState({
      isOpen: true,
      type,
      message,
      title: options.title || '',
      style: options.style || 'simple',
      actions: options.actions || [],
      duration: options.duration || 5000
    });
  }, []);

  const closeAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Métodos rápidos
  const showSuccess = useCallback((message: string, options?: any) => {
    showAlert('success', message, options);
  }, [showAlert]);

  const showError = useCallback((message: string, options?: any) => {
    showAlert('error', message, options);
  }, [showAlert]);

  const showWarning = useCallback((message: string, options?: any) => {
    showAlert('warning', message, options);
  }, [showAlert]);

  const showInfo = useCallback((message: string, options?: any) => {
    showAlert('info', message, options);
  }, [showAlert]);

  return {
    alertState,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeAlert
  };
};