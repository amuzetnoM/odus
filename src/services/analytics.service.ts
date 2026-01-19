
import { Injectable, computed, inject } from '@angular/core';
import { ProjectService } from './project.service';
import { TimeTrackingService } from './time-tracking.service';

export interface BurndownDataPoint {
  date: string;
  remaining: number;
  ideal: number;
}

export interface VelocityDataPoint {
  week: string;
  completed: number;
  started: number;
}

export interface CompletionRate {
  period: string;
  rate: number;
  total: number;
  completed: number;
}

export interface TaskDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface PriorityBreakdown {
  priority: string;
  count: number;
  percentage: number;
}

export interface AnalyticsSnapshot {
  burndown: BurndownDataPoint[];
  velocity: VelocityDataPoint[];
  completionRates: CompletionRate[];
  statusDistribution: TaskDistribution[];
  priorityBreakdown: PriorityBreakdown[];
  averageCompletionTime: number;
  totalTimeTracked: number;
  productivityScore: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private projectService = inject(ProjectService);
  private timeTracking = inject(TimeTrackingService);

  readonly analytics = computed<AnalyticsSnapshot>(() => {
    const allTasks = this.projectService.allTasks();
    const projects = this.projectService.projects();
    const activeProjects = this.projectService.activeProjects();
    
    return {
      burndown: this.calculateBurndown(allTasks),
      velocity: this.calculateVelocity(allTasks),
      completionRates: this.calculateCompletionRates(allTasks),
      statusDistribution: this.calculateStatusDistribution(allTasks),
      priorityBreakdown: this.calculatePriorityBreakdown(allTasks),
      averageCompletionTime: this.calculateAverageCompletionTime(allTasks),
      totalTimeTracked: this.timeTracking.velocityMetrics().weeklyTotal,
      productivityScore: this.calculateProductivityScore(allTasks)
    };
  });

  private calculateBurndown(tasks: any[]): BurndownDataPoint[] {
    const activeTasks = tasks.filter(t => t.status !== 'done');
    const totalTasks = tasks.length;
    
    if (totalTasks === 0) return [];

    const today = new Date();
    const startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const dataPoints: BurndownDataPoint[] = [];

    for (let i = 0; i <= 30; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const remaining = tasks.filter(t => {
        if (t.status === 'done' && t.endDate && t.endDate <= dateStr) {
          return false;
        }
        return true;
      }).length;

      const ideal = totalTasks - (totalTasks * (i / 30));

      dataPoints.push({
        date: dateStr,
        remaining,
        ideal: Math.max(0, ideal)
      });
    }

    return dataPoints;
  }

  private calculateVelocity(tasks: any[]): VelocityDataPoint[] {
    const weeks: VelocityDataPoint[] = [];
    const today = new Date();

    for (let i = 0; i < 12; i++) {
      const weekStart = new Date(today.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      const weekStartStr = weekStart.toISOString().split('T')[0];
      const weekEndStr = weekEnd.toISOString().split('T')[0];

      const completed = tasks.filter(t => 
        t.status === 'done' && 
        t.endDate && 
        t.endDate >= weekStartStr && 
        t.endDate < weekEndStr
      ).length;

      const started = tasks.filter(t => 
        t.startDate && 
        t.startDate >= weekStartStr && 
        t.startDate < weekEndStr
      ).length;

      weeks.unshift({
        week: `Week ${i + 1}`,
        completed,
        started
      });
    }

    return weeks;
  }

  private calculateCompletionRates(tasks: any[]): CompletionRate[] {
    const now = new Date();
    const periods = [
      { name: 'Today', days: 1 },
      { name: 'This Week', days: 7 },
      { name: 'This Month', days: 30 },
      { name: 'This Quarter', days: 90 }
    ];

    return periods.map(period => {
      const startDate = new Date(now.getTime() - period.days * 24 * 60 * 60 * 1000);
      const startDateStr = startDate.toISOString().split('T')[0];

      const relevantTasks = tasks.filter(t => 
        t.createdAt && t.createdAt >= startDateStr
      );

      const completed = relevantTasks.filter(t => t.status === 'done').length;
      const total = relevantTasks.length;
      const rate = total > 0 ? (completed / total) * 100 : 0;

      return {
        period: period.name,
        rate: Math.round(rate),
        total,
        completed
      };
    });
  }

  private calculateStatusDistribution(tasks: any[]): TaskDistribution[] {
    const statuses = ['todo', 'in-progress', 'done'];
    const total = tasks.length;

    return statuses.map(status => {
      const count = tasks.filter(t => t.status === status).length;
      return {
        status,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      };
    });
  }

  private calculatePriorityBreakdown(tasks: any[]): PriorityBreakdown[] {
    const priorities = ['high', 'medium', 'low'];
    const total = tasks.length;
    const activeTasks = tasks.filter(t => t.status !== 'done');

    return priorities.map(priority => {
      const count = activeTasks.filter(t => t.priority === priority).length;
      return {
        priority,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      };
    });
  }

  private calculateAverageCompletionTime(tasks: any[]): number {
    const completedTasks = tasks.filter(t => 
      t.status === 'done' && t.startDate && t.endDate
    );

    if (completedTasks.length === 0) return 0;

    const totalDays = completedTasks.reduce((sum, task) => {
      const start = new Date(task.startDate);
      const end = new Date(task.endDate);
      const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);

    return totalDays / completedTasks.length;
  }

  private calculateProductivityScore(tasks: any[]): number {
    const completionRates = this.calculateCompletionRates(tasks);
    const weeklyRate = completionRates.find(r => r.period === 'This Week')?.rate || 0;
    
    const velocity = this.timeTracking.velocityMetrics();
    const timeScore = Math.min(100, (velocity.weeklyTotal / 14400) * 100);
    
    const activeTasks = tasks.filter(t => t.status !== 'done');
    const highPriorityCompliance = activeTasks.filter(t => 
      t.priority === 'high' && t.status === 'in-progress'
    ).length;
    const priorityScore = activeTasks.length > 0 
      ? (highPriorityCompliance / activeTasks.length) * 100 
      : 0;

    return Math.round((weeklyRate * 0.4) + (timeScore * 0.3) + (priorityScore * 0.3));
  }

  getTaskTrends(days: number = 30): { date: string; created: number; completed: number; }[] {
    const tasks = this.projectService.allTasks();
    const today = new Date();
    const trends: { date: string; created: number; completed: number; }[] = [];

    for (let i = days; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];

      const created = tasks.filter(t => 
        t.createdAt && t.createdAt.startsWith(dateStr)
      ).length;

      const completed = tasks.filter(t => 
        t.status === 'done' && t.endDate && t.endDate === dateStr
      ).length;

      trends.push({ date: dateStr, created, completed });
    }

    return trends;
  }

  getProjectHealthScore(projectId: string): number {
    const project = this.projectService.projects().find(p => p.id === projectId);
    if (!project) return 0;

    const tasks = project.tasks;
    const total = tasks.length;
    if (total === 0) return 100;

    const completed = tasks.filter(t => t.status === 'done').length;
    const overdue = tasks.filter(t => 
      t.status !== 'done' && 
      t.endDate && 
      t.endDate < new Date().toISOString().split('T')[0]
    ).length;

    const completionScore = (completed / total) * 100;
    const overdueScore = overdue > 0 ? -20 * overdue : 0;

    return Math.max(0, Math.min(100, completionScore + overdueScore));
  }

  exportAnalytics(): string {
    const snapshot = this.analytics();
    return JSON.stringify(snapshot, null, 2);
  }
}
