
import { Injectable, signal, effect } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'critical';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
  projectId?: string; // Optional link to project
  taskId?: string; // Optional link to task
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // Transient toasts (disappear after a few seconds)
  readonly toasts = signal<AppNotification[]>([]);
  
  // Persistent Inbox (held for user login / review)
  readonly inbox = signal<AppNotification[]>([]);
  readonly unreadCount = signal(0);

  constructor() {
      this.loadInbox();
      
      // Update unread count whenever inbox changes
      effect(() => {
          this.unreadCount.set(this.inbox().filter(n => !n.read).length);
          this.saveInbox();
      });
  }

  /**
   * Main entry point for system alerts
   */
  notify(
      title: string, 
      message: string, 
      type: NotificationType = 'info', 
      options: { projectId?: string, taskId?: string, persist?: boolean } = {}
  ) {
    const notification: AppNotification = {
        id: crypto.randomUUID(),
        title,
        message,
        type,
        timestamp: new Date().toISOString(),
        read: false,
        projectId: options.projectId,
        taskId: options.taskId
    };

    // 1. Show Toast (Immediate Visual)
    this.toasts.update(prev => [...prev, notification]);
    setTimeout(() => this.removeToast(notification.id), 5000); // 5s timeout

    // 2. Add to Inbox (Persistence) if requested or if it's critical/warning
    if (options.persist || type === 'critical' || type === 'warning') {
        // Prevent duplicate spam: Check if similar unread msg exists from last minute
        const isDuplicate = this.inbox().some(n => 
            !n.read && 
            n.title === title && 
            n.taskId === options.taskId && 
            (new Date().getTime() - new Date(n.timestamp).getTime() < 60000)
        );

        if (!isDuplicate) {
            this.inbox.update(prev => [notification, ...prev]);
        }
    }
  }

  markRead(id: string) {
      this.inbox.update(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  markAllRead() {
      this.inbox.update(prev => prev.map(n => ({ ...n, read: true })));
  }

  clearAll() {
      this.inbox.set([]);
  }

  removeToast(id: string) {
    this.toasts.update(prev => prev.filter(t => t.id !== id));
  }

  // --- Persistence ---
  private loadInbox() {
      try {
          const data = localStorage.getItem('artifact_notifications');
          if (data) this.inbox.set(JSON.parse(data));
      } catch (e) { console.error('Failed to load notifications', e); }
  }

  private saveInbox() {
      // Limit inbox size to last 50 items to save space
      const safeList = this.inbox().slice(0, 50);
      localStorage.setItem('artifact_notifications', JSON.stringify(safeList));
  }
}
