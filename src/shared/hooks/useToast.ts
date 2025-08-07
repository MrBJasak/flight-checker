import { useCallback } from 'react';
import { ToastData } from '../components/Toast';
import { toastService } from '../services/toastService';

export const useToast = () => {
  const show = useCallback((message: string, type: ToastData['type'] = 'info', duration?: number) => {
    return toastService.show(message, type, duration);
  }, []);

  const success = useCallback((message: string, duration?: number) => {
    return toastService.success(message, duration);
  }, []);

  const error = useCallback((message: string, duration?: number) => {
    return toastService.error(message, duration);
  }, []);

  const warning = useCallback((message: string, duration?: number) => {
    return toastService.warning(message, duration);
  }, []);

  const info = useCallback((message: string, duration?: number) => {
    return toastService.info(message, duration);
  }, []);

  const remove = useCallback((id: string) => {
    toastService.remove(id);
  }, []);

  const clear = useCallback(() => {
    toastService.clear();
  }, []);

  return {
    show,
    success,
    error,
    warning,
    info,
    remove,
    clear
  };
};
