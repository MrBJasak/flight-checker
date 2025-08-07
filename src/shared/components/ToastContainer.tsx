'use client';

import { useEffect, useState } from 'react';
import { toastService } from '../services/toastService';
import { Toast, ToastData } from './Toast';

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const unsubscribe = toastService.subscribe((newToasts: ToastData[]) => {
      setToasts(newToasts);
    });
    return unsubscribe;
  }, []);

  const removeToast = (id: string) => {
    toastService.remove(id);
  };

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className='fixed top-4 right-4 z-50 space-y-2'>
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};
