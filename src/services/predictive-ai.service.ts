
import { Injectable, inject, computed } from '@angular/core';
import { ProjectService, Project, Task } from './project.service';
import { GeminiService } from './gemini.service';
import { NotificationService } from './notification.service';

export interface RiskAssessment {
  taskId: string;
  taskTitle: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  recommendation: string;
}

export interface ScheduleSuggestion {
  taskId: string;
  suggestedStartDate: string;
  suggestedEndDate: string;
  reasoning: string;
}

export interface MissingWorkDetection {
  projectId: string;
  projectTitle: string;
  missingTasks: Array<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    reasoning: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class PredictiveAiService {
  private projectService = inject(ProjectService);
  private gemini = inject(GeminiService);
  private notification = inject(NotificationService);

  readonly risks = computed(() => {
    return this.detectRisks(this.projectService.allTasks());
  });

  private detectRisks(tasks: any[]): RiskAssessment[] {
    const today = new Date().toISOString().split('T')[0];
    const risks: RiskAssessment[] = [];

    tasks.forEach(task => {
      if (task.status === 'done') return;

      const riskFactors: string[] = [];
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

      if (task.endDate && task.endDate < today) {
        riskFactors.push('Task is overdue');
        riskLevel = 'critical';
      } else if (task.endDate) {
        const daysUntilDue = Math.floor(
          (new Date(task.endDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysUntilDue <= 2) {
          riskFactors.push('Due within 2 days');
          riskLevel = 'high';
        } else if (daysUntilDue <= 7) {
          riskFactors.push('Due within a week');
          if (riskLevel === 'low') riskLevel = 'medium';
        }
      }

      if (task.dependencyIds && task.dependencyIds.length > 0) {
        const blockedDeps = task.dependencyIds.filter((depId: string) => {
          const dep = tasks.find(t => t.id === depId);
          return dep && dep.status !== 'done';
        });

        if (blockedDeps.length > 0) {
          riskFactors.push(`Blocked by ${blockedDeps.length} incomplete dependencies`);
          if (riskLevel === 'low') riskLevel = 'medium';
        }
      }

      if (task.priority === 'high' && task.status === 'todo') {
        riskFactors.push('High priority task not started');
        if (riskLevel === 'low') riskLevel = 'medium';
      }

      if (!task.startDate || !task.endDate) {
        riskFactors.push('Missing timeline information');
        if (riskLevel === 'low') riskLevel = 'medium';
      }

      if (riskFactors.length > 0) {
        risks.push({
          taskId: task.id,
          taskTitle: task.title,
          riskLevel,
          riskFactors,
          recommendation: this.generateRecommendation(task, riskFactors)
        });
      }
    });

    return risks.sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return order[a.riskLevel] - order[b.riskLevel];
    });
  }

  private generateRecommendation(task: any, riskFactors: string[]): string {
    if (riskFactors.includes('Task is overdue')) {
      return 'Immediately prioritize this task or reschedule with realistic timeline';
    }
    if (riskFactors.some(f => f.includes('Blocked by'))) {
      return 'Focus on completing dependencies first or consider removing blocking relationships';
    }
    if (riskFactors.includes('Due within 2 days')) {
      return 'Start this task immediately to meet deadline';
    }
    if (riskFactors.includes('High priority task not started')) {
      return 'Begin work on this high-priority item as soon as possible';
    }
    return 'Review and update task details to improve planning accuracy';
  }

  async generateSmartSchedule(projectId: string): Promise<ScheduleSuggestion[]> {
    const project = this.projectService.projects().find(p => p.id === projectId);
    if (!project) return [];

    const tasks = project.tasks.filter(t => t.status !== 'done');
    const suggestions: ScheduleSuggestion[] = [];

    const today = new Date();
    let currentDate = new Date(today);

    const sortedTasks = this.topologicalSort(tasks);

    sortedTasks.forEach(task => {
      const estimatedDuration = this.estimateTaskDuration(task);
      const startDate = new Date(currentDate);
      const endDate = new Date(currentDate);
      endDate.setDate(endDate.getDate() + estimatedDuration);

      suggestions.push({
        taskId: task.id,
        suggestedStartDate: startDate.toISOString().split('T')[0],
        suggestedEndDate: endDate.toISOString().split('T')[0],
        reasoning: `Estimated ${estimatedDuration} days based on task complexity and dependencies`
      });

      currentDate = new Date(endDate);
      currentDate.setDate(currentDate.getDate() + 1);
    });

    return suggestions;
  }

  private topologicalSort(tasks: Task[]): Task[] {
    const sorted: Task[] = [];
    const visited = new Set<string>();
    const temp = new Set<string>();

    const visit = (task: Task) => {
      if (temp.has(task.id)) return;
      if (visited.has(task.id)) return;

      temp.add(task.id);

      if (task.dependencyIds) {
        task.dependencyIds.forEach(depId => {
          const dep = tasks.find(t => t.id === depId);
          if (dep) visit(dep);
        });
      }

      temp.delete(task.id);
      visited.add(task.id);
      sorted.push(task);
    };

    tasks.forEach(task => {
      if (!visited.has(task.id)) {
        visit(task);
      }
    });

    return sorted;
  }

  private estimateTaskDuration(task: Task): number {
    let baseDuration = 3;

    if (task.priority === 'high') baseDuration += 2;
    if (task.priority === 'low') baseDuration -= 1;

    if (task.dependencyIds && task.dependencyIds.length > 2) {
      baseDuration += 2;
    }

    const descLength = (task.description || '').length;
    if (descLength > 500) baseDuration += 2;
    else if (descLength > 200) baseDuration += 1;

    return Math.max(1, baseDuration);
  }

  async detectMissingWork(projectId: string): Promise<MissingWorkDetection | null> {
    const project = this.projectService.projects().find(p => p.id === projectId);
    if (!project) return null;

    try {
      const suggestion = await this.gemini.suggestNextTask(project.tasks);
      
      if (suggestion) {
        return {
          projectId: project.id,
          projectTitle: project.title,
          missingTasks: [
            {
              title: suggestion.title,
              description: suggestion.description,
              priority: suggestion.priority || 'medium',
              reasoning: 'AI identified this as a logical next step based on current project tasks'
            }
          ]
        };
      }
    } catch (e) {
      console.error('Failed to detect missing work', e);
    }

    return null;
  }

  async analyzeProjectRisks(projectId: string): Promise<string> {
    const project = this.projectService.projects().find(p => p.id === projectId);
    if (!project) return 'Project not found';

    try {
      const analysis = await this.gemini.analyzeProjectRisks(project);
      return analysis;
    } catch (e) {
      console.error('Failed to analyze risks', e);
      return 'Unable to perform risk analysis at this time';
    }
  }

  getHighRiskTasks(): RiskAssessment[] {
    return this.risks().filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical');
  }

  async autoOptimizeProject(projectId: string): Promise<void> {
    this.notification.notify(
      'Optimization Started',
      'Analyzing project and generating recommendations...',
      'info'
    );

    const [schedule, missingWork] = await Promise.all([
      this.generateSmartSchedule(projectId),
      this.detectMissingWork(projectId)
    ]);

    const project = this.projectService.projects().find(p => p.id === projectId);
    if (!project) return;

    schedule.forEach(suggestion => {
      this.projectService.updateTask(projectId, suggestion.taskId, {
        startDate: suggestion.suggestedStartDate,
        endDate: suggestion.suggestedEndDate
      });
    });

    if (missingWork && missingWork.missingTasks.length > 0) {
      missingWork.missingTasks.forEach(task => {
        this.projectService.addTask(projectId, {
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: 'todo',
          tags: ['AI-GEN']
        });
      });
    }

    this.notification.notify(
      'Optimization Complete',
      `Updated ${schedule.length} tasks and added ${missingWork?.missingTasks.length || 0} suggested tasks`,
      'success'
    );
  }

  predictCompletionDate(projectId: string): string {
    const project = this.projectService.projects().find(p => p.id === projectId);
    if (!project) return 'Unknown';

    const incompleteTasks = project.tasks.filter(t => t.status !== 'done');
    const avgDuration = incompleteTasks.reduce((sum, task) => {
      return sum + this.estimateTaskDuration(task);
    }, 0);

    const totalDays = avgDuration > 0 ? avgDuration : incompleteTasks.length * 3;

    const today = new Date();
    const completionDate = new Date(today);
    completionDate.setDate(completionDate.getDate() + totalDays);

    return completionDate.toISOString().split('T')[0];
  }
}
