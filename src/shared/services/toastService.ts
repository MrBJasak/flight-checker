import { ToastData } from '../components/Toast';

type ToastSubscriber = (toasts: ToastData[]) => void;

class ToastService {
  private toasts: ToastData[] = [];
  private subscribers: ToastSubscriber[] = [];

  public subscribe(callback: ToastSubscriber): () => void {
    this.subscribers.push(callback);
    callback(this.toasts);

    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback);
    };
  }

  private notify() {
    this.subscribers.forEach((callback) => callback([...this.toasts]));
  }

  public show(message: string, type: ToastData['type'] = 'info', duration?: number): string {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: ToastData = {
      id,
      message,
      type,
      duration: duration || (type === 'error' ? 8000 : 5000),
    };

    this.toasts.push(toast);
    this.notify();

    return id;
  }

  public success(message: string, duration?: number): string {
    return this.show(message, 'success', duration);
  }

  public error(message: string, duration?: number): string {
    return this.show(message, 'error', duration);
  }

  public warning(message: string, duration?: number): string {
    return this.show(message, 'warning', duration);
  }

  public info(message: string, duration?: number): string {
    return this.show(message, 'info', duration);
  }

  public remove(id: string) {
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
    this.notify();
  }

  public clear() {
    this.toasts = [];
    this.notify();
  }
}

export const toastService = new ToastService();
