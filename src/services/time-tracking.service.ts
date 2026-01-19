
import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { NotificationService } from './notification.service';

export interface TimeLog {
  id: string;
  taskId: string;
  projectId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  description?: string;
}

export interface ActiveTimer {
  taskId: string;
  projectId: string;
  startTime: string;
  taskTitle: string;
}

export interface VelocityMetrics {
  dailyAverage: number;
  weeklyTotal: number;
  monthlyTotal: number;
  taskCompletionRate: number;
  averageTaskDuration: number;
}

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const MILLISECONDS_PER_WEEK = 7 * MILLISECONDS_PER_DAY;
const MILLISECONDS_PER_MONTH = 30 * MILLISECONDS_PER_DAY;

@Injectable({
  providedIn: 'root'
})
export class TimeTrackingService {
  private notification = inject(NotificationService);
  
  private timeLogsState = signal<TimeLog[]>([]);
  private activeTimerState = signal<ActiveTimer | null>(null);
  private saveTimeout: any;

  readonly timeLogs = this.timeLogsState.asReadonly();
  readonly activeTimer = this.activeTimerState.asReadonly();

  readonly isTracking = computed(() => !!this.activeTimerState());
  
  readonly currentDuration = computed(() => {
    const timer = this.activeTimerState();
    if (!timer) return 0;
    const start = new Date(timer.startTime).getTime();
    const now = Date.now();
    return Math.floor((now - start) / 1000);
  });

  readonly velocityMetrics = computed<VelocityMetrics>(() => {
    const logs = this.timeLogsState();
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - MILLISECONDS_PER_DAY);
    const oneWeekAgo = new Date(now.getTime() - MILLISECONDS_PER_WEEK);
    const oneMonthAgo = new Date(now.getTime() - MILLISECONDS_PER_MONTH);

    const dailyLogs = logs.filter(log => log.endTime && new Date(log.endTime) >= oneDayAgo);
    const weeklyLogs = logs.filter(log => log.endTime && new Date(log.endTime) >= oneWeekAgo);
    const monthlyLogs = logs.filter(log => log.endTime && new Date(log.endTime) >= oneMonthAgo);

    const dailyTotal = dailyLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
    const weeklyTotal = weeklyLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
    const monthlyTotal = monthlyLogs.reduce((sum, log) => sum + (log.duration || 0), 0);

    const dailyAverage = dailyTotal;
    const completedTasks = new Set(logs.filter(log => log.endTime).map(log => log.taskId)).size;
    const totalLogs = logs.filter(log => log.endTime).length;
    const taskCompletionRate = totalLogs > 0 ? completedTasks / totalLogs : 0;
    
    const averageTaskDuration = totalLogs > 0 
      ? logs.filter(log => log.duration).reduce((sum, log) => sum + (log.duration || 0), 0) / totalLogs 
      : 0;

    return {
      dailyAverage,
      weeklyTotal,
      monthlyTotal,
      taskCompletionRate,
      averageTaskDuration
    };
  });

  constructor() {
    this.loadFromStorage();
    
    effect(() => {
      const logs = this.timeLogsState();
      const timer = this.activeTimerState();
      clearTimeout(this.saveTimeout);
      this.saveTimeout = setTimeout(() => {
        localStorage.setItem('artifact_time_logs', JSON.stringify(logs));
        if (timer) {
          localStorage.setItem('artifact_active_timer', JSON.stringify(timer));
        } else {
          localStorage.removeItem('artifact_active_timer');
        }
      }, 1000);
    });
  }

  private loadFromStorage() {
    try {
      const storedLogs = localStorage.getItem('artifact_time_logs');
      const storedTimer = localStorage.getItem('artifact_active_timer');
      
      if (storedLogs) this.timeLogsState.set(JSON.parse(storedLogs));
      if (storedTimer) this.activeTimerState.set(JSON.parse(storedTimer));
    } catch (e) {
      console.error('Failed to load time tracking data', e);
    }
  }

  startTimer(taskId: string, projectId: string, taskTitle: string) {
    if (this.activeTimerState()) {
      this.notification.notify('Timer Active', 'Please stop the current timer first.', 'warning');
      return;
    }

    const timer: ActiveTimer = {
      taskId,
      projectId,
      startTime: new Date().toISOString(),
      taskTitle
    };

    this.activeTimerState.set(timer);
    this.notification.notify('Timer Started', `Tracking time for "${taskTitle}"`, 'success');
  }

  stopTimer(description?: string) {
    const timer = this.activeTimerState();
    if (!timer) return;

    const endTime = new Date().toISOString();
    const startTime = new Date(timer.startTime).getTime();
    const duration = Math.floor((new Date(endTime).getTime() - startTime) / 1000);

    const log: TimeLog = {
      id: crypto.randomUUID(),
      taskId: timer.taskId,
      projectId: timer.projectId,
      startTime: timer.startTime,
      endTime,
      duration,
      description
    };

    this.timeLogsState.update(logs => [...logs, log]);
    this.activeTimerState.set(null);
    
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    
    this.notification.notify('Timer Stopped', `Logged ${timeStr} for "${timer.taskTitle}"`, 'success');
  }

  cancelTimer() {
    this.activeTimerState.set(null);
    this.notification.notify('Timer Cancelled', 'Time tracking cancelled', 'info');
  }

  getLogsForTask(taskId: string): TimeLog[] {
    return this.timeLogsState().filter(log => log.taskId === taskId);
  }

  getTotalTimeForTask(taskId: string): number {
    return this.getLogsForTask(taskId).reduce((sum, log) => sum + (log.duration || 0), 0);
  }

  deleteLog(logId: string) {
    this.timeLogsState.update(logs => logs.filter(log => log.id !== logId));
    this.notification.notify('Log Deleted', 'Time log removed', 'info');
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }
}
