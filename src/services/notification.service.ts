
import { Injectable, signal, effect } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'critical';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
  projectId?: string; 
  taskId?: string; 
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // Transient toasts
  readonly toasts = signal<AppNotification[]>([]);
  
  // Persistent Inbox
  readonly inbox = signal<AppNotification[]>([]);
  readonly unreadCount = signal(0);
  
  // Proactive AI Message Stream (Consumed by AiAgentComponent)
  readonly incomingAiMessage = signal<{text: string, timestamp: Date} | null>(null);

  constructor() {
      this.loadInbox();
      
      // Update unread count
      effect(() => {
          this.unreadCount.set(this.inbox().filter(n => !n.read).length);
          this.saveInbox();
      });

      // Request permissions early if possible
      if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission();
      }
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

  /**
   * Proactive AI Communication Channel
   * Decides whether to chat (Online) or Notify (Offline/Background)
   */
  broadcastAiAgentMessage(message: string) {
      const isAppVisible = document.visibilityState === 'visible';

      if (isAppVisible) {
          // User is online/active: Send directly to Chat Interface
          this.incomingAiMessage.set({ text: message, timestamp: new Date() });
          
          // Also show a subtle info toast just in case chat is closed
          this.notify('ODUS Intelligence', 'New suggestion available in chat.', 'info');
      } else {
          // User is offline/tabbed away: Send System Notification
          this.sendSystemNotification('ODUS Project Manager', message);
          
          // Queue it for when they return
          this.incomingAiMessage.set({ text: message, timestamp: new Date() });
      }
  }

  private sendSystemNotification(title: string, body: string) {
      if (!('Notification' in window)) return;

      if (Notification.permission === 'granted') {
          new Notification(title, {
              body: body,
              icon: '/assets/icon.png', // Fallback if exists, browser handles default
              tag: 'odus-ai-msg' // Prevents stacking
          });
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

  private loadInbox() {
      try {
          const data = localStorage.getItem('artifact_notifications');
          if (data) this.inbox.set(JSON.parse(data));
      } catch (e) { console.error('Failed to load notifications', e); }
  }

  private saveInbox() {
      const safeList = this.inbox().slice(0, 50);
      localStorage.setItem('artifact_notifications', JSON.stringify(safeList));
  }
}
