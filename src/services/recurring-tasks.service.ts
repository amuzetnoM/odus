
import { Injectable, signal, effect, inject, OnDestroy } from '@angular/core';
import { ProjectService, Task } from './project.service';
import { NotificationService } from './notification.service';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly';

export interface RecurringTask {
  id: string;
  templateTaskId: string;
  projectId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate?: string;
  lastCreated?: string;
  isActive: boolean;
  daysOfWeek?: number[];
  dayOfMonth?: number;
}

@Injectable({
  providedIn: 'root'
})
export class RecurringTasksService implements OnDestroy {
  private projectService = inject(ProjectService);
  private notification = inject(NotificationService);
  
  private recurringTasksState = signal<RecurringTask[]>([]);
  private saveTimeout: any;
  private checkInterval: any;

  readonly recurringTasks = this.recurringTasksState.asReadonly();

  constructor() {
    this.loadFromStorage();
    this.startRecurrenceChecker();
    
    effect(() => {
      const tasks = this.recurringTasksState();
      clearTimeout(this.saveTimeout);
      this.saveTimeout = setTimeout(() => {
        localStorage.setItem('artifact_recurring_tasks', JSON.stringify(tasks));
      }, 1000);
    });
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('artifact_recurring_tasks');
      if (stored) {
        this.recurringTasksState.set(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load recurring tasks', e);
    }
  }

  private startRecurrenceChecker() {
    this.checkAndCreateTasks();
    this.checkInterval = setInterval(() => {
      this.checkAndCreateTasks();
    }, 60 * 60 * 1000);
  }

  private checkAndCreateTasks() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    this.recurringTasksState().forEach(recurring => {
      if (!recurring.isActive) return;
      if (recurring.endDate && recurring.endDate < today) return;
      if (recurring.startDate > today) return;

      const shouldCreate = this.shouldCreateTask(recurring, now);
      
      if (shouldCreate) {
        this.createTaskFromRecurring(recurring);
      }
    });
  }

  private shouldCreateTask(recurring: RecurringTask, now: Date): boolean {
    const today = now.toISOString().split('T')[0];
    
    if (recurring.lastCreated === today) return false;

    switch (recurring.frequency) {
      case 'daily':
        return true;
      
      case 'weekly':
        if (recurring.daysOfWeek && recurring.daysOfWeek.length > 0) {
          const dayOfWeek = now.getDay();
          return recurring.daysOfWeek.includes(dayOfWeek);
        }
        return false;
      
      case 'monthly':
        if (recurring.dayOfMonth) {
          return now.getDate() === recurring.dayOfMonth;
        }
        return false;
      
      default:
        return false;
    }
  }

  private createTaskFromRecurring(recurring: RecurringTask) {
    const today = new Date().toISOString().split('T')[0];
    
    const newTask = this.projectService.addTask(recurring.projectId, {
      title: recurring.title,
      description: recurring.description,
      priority: recurring.priority,
      status: 'todo',
      tags: recurring.tags || [],
      startDate: today,
      endDate: today
    });

    this.recurringTasksState.update(tasks =>
      tasks.map(t => 
        t.id === recurring.id 
          ? { ...t, lastCreated: today, templateTaskId: newTask.id }
          : t
      )
    );

    this.notification.notify(
      'Recurring Task Created',
      `"${recurring.title}" has been added to your tasks`,
      'info'
    );
  }

  addRecurringTask(
    projectId: string,
    title: string,
    description: string,
    priority: 'low' | 'medium' | 'high',
    frequency: RecurrenceFrequency,
    config: {
      startDate?: string;
      endDate?: string;
      daysOfWeek?: number[];
      dayOfMonth?: number;
      tags?: string[];
    }
  ): RecurringTask {
    const today = new Date().toISOString().split('T')[0];
    
    const recurring: RecurringTask = {
      id: crypto.randomUUID(),
      templateTaskId: '',
      projectId,
      title,
      description,
      priority,
      frequency,
      startDate: config.startDate || today,
      endDate: config.endDate,
      isActive: true,
      tags: config.tags,
      daysOfWeek: config.daysOfWeek,
      dayOfMonth: config.dayOfMonth
    };

    this.recurringTasksState.update(tasks => [...tasks, recurring]);
    
    this.notification.notify(
      'Recurring Task Created',
      `"${title}" will repeat ${frequency}`,
      'success'
    );

    return recurring;
  }

  updateRecurringTask(id: string, updates: Partial<RecurringTask>) {
    this.recurringTasksState.update(tasks =>
      tasks.map(t => t.id === id ? { ...t, ...updates } : t)
    );
  }

  deleteRecurringTask(id: string) {
    this.recurringTasksState.update(tasks => tasks.filter(t => t.id !== id));
    this.notification.notify('Recurring Task Deleted', 'Recurrence removed', 'info');
  }

  toggleActive(id: string) {
    this.recurringTasksState.update(tasks =>
      tasks.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t)
    );
  }

  getRecurringTasksForProject(projectId: string): RecurringTask[] {
    return this.recurringTasksState().filter(t => t.projectId === projectId);
  }

  ngOnDestroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}
