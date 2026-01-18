
import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  readonly toasts = signal<Toast[]>([]);

  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const id = crypto.randomUUID();
    this.toasts.update(prev => [...prev, { id, message, type }]);
    
    // Auto dismiss
    setTimeout(() => {
      this.remove(id);
    }, 3000);
  }

  remove(id: string) {
    this.toasts.update(prev => prev.filter(t => t.id !== id));
  }
}
