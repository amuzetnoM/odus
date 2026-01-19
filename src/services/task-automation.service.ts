
import { Injectable, signal, effect, inject } from '@angular/core';
import { ProjectService, Task, TaskStatus, Priority } from './project.service';
import { NotificationService } from './notification.service';

export type TriggerType = 'status_change' | 'priority_change' | 'date_reached' | 'tag_added' | 'dependency_completed';
export type ActionType = 'change_status' | 'change_priority' | 'add_tag' | 'move_project' | 'create_task' | 'send_notification';

export interface AutomationTrigger {
  type: TriggerType;
  condition: any;
}

export interface AutomationAction {
  type: ActionType;
  parameters: any;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskAutomationService {
  private projectService = inject(ProjectService);
  private notification = inject(NotificationService);
  
  private automationRulesState = signal<AutomationRule[]>([]);
  private saveTimeout: any;

  readonly automationRules = this.automationRulesState.asReadonly();

  constructor() {
    this.loadFromStorage();
    this.setupTaskWatcher();
    
    effect(() => {
      const rules = this.automationRulesState();
      clearTimeout(this.saveTimeout);
      this.saveTimeout = setTimeout(() => {
        localStorage.setItem('artifact_automation_rules', JSON.stringify(rules));
      }, 1000);
    });
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('artifact_automation_rules');
      if (stored) {
        this.automationRulesState.set(JSON.parse(stored));
      } else {
        this.createDefaultRules();
      }
    } catch (e) {
      console.error('Failed to load automation rules', e);
      this.createDefaultRules();
    }
  }

  private createDefaultRules() {
    const defaultRules: AutomationRule[] = [
      {
        id: crypto.randomUUID(),
        name: 'High Priority Alert',
        description: 'Send notification when task is marked as high priority',
        isActive: true,
        trigger: {
          type: 'priority_change',
          condition: { newPriority: 'high' }
        },
        actions: [
          {
            type: 'send_notification',
            parameters: { message: 'Task marked as high priority' }
          }
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'Auto-tag Completed',
        description: 'Add DONE tag when task is completed',
        isActive: true,
        trigger: {
          type: 'status_change',
          condition: { newStatus: 'done' }
        },
        actions: [
          {
            type: 'add_tag',
            parameters: { tag: 'DONE' }
          }
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'Dependency Cascade',
        description: 'When task is completed, start dependent tasks',
        isActive: true,
        trigger: {
          type: 'status_change',
          condition: { newStatus: 'done' }
        },
        actions: [
          {
            type: 'change_status',
            parameters: { status: 'in-progress', targetType: 'dependents' }
          }
        ],
        createdAt: new Date().toISOString()
      }
    ];

    this.automationRulesState.set(defaultRules);
  }

  private setupTaskWatcher() {
    let previousTasks: any[] = [];
    
    effect(() => {
      const currentTasks = this.projectService.allTasks();
      
      if (previousTasks.length > 0) {
        currentTasks.forEach(currentTask => {
          const previousTask = previousTasks.find(t => t.id === currentTask.id);
          
          if (previousTask) {
            this.detectChangesAndTrigger(previousTask, currentTask);
          }
        });
      }
      
      previousTasks = JSON.parse(JSON.stringify(currentTasks));
    });
  }

  private detectChangesAndTrigger(oldTask: any, newTask: any) {
    const activeRules = this.automationRulesState().filter(r => r.isActive);

    activeRules.forEach(rule => {
      let shouldTrigger = false;

      switch (rule.trigger.type) {
        case 'status_change':
          if (oldTask.status !== newTask.status && 
              newTask.status === rule.trigger.condition.newStatus) {
            shouldTrigger = true;
          }
          break;

        case 'priority_change':
          if (oldTask.priority !== newTask.priority && 
              newTask.priority === rule.trigger.condition.newPriority) {
            shouldTrigger = true;
          }
          break;

        case 'tag_added':
          const oldTags = oldTask.tags || [];
          const newTags = newTask.tags || [];
          const addedTags = newTags.filter((t: string) => !oldTags.includes(t));
          if (addedTags.includes(rule.trigger.condition.tag)) {
            shouldTrigger = true;
          }
          break;

        case 'date_reached':
          const today = new Date().toISOString().split('T')[0];
          if (newTask.endDate === today && rule.trigger.condition.dateType === 'dueDate') {
            shouldTrigger = true;
          }
          break;
      }

      if (shouldTrigger) {
        this.executeActions(rule, newTask);
      }
    });
  }

  private executeActions(rule: AutomationRule, task: any) {
    rule.actions.forEach(action => {
      switch (action.type) {
        case 'change_status':
          if (action.parameters.targetType === 'dependents') {
            this.handleDependentTasks(task);
          } else {
            this.projectService.updateTask(
              task.projectId,
              task.id,
              { status: action.parameters.status }
            );
          }
          break;

        case 'change_priority':
          this.projectService.updateTask(
            task.projectId,
            task.id,
            { priority: action.parameters.priority }
          );
          break;

        case 'add_tag':
          const currentTags = task.tags || [];
          if (!currentTags.includes(action.parameters.tag)) {
            this.projectService.updateTask(
              task.projectId,
              task.id,
              { tags: [...currentTags, action.parameters.tag] }
            );
          }
          break;

        case 'move_project':
          this.projectService.moveTask(
            task.id,
            task.projectId,
            action.parameters.targetProjectId
          );
          break;

        case 'send_notification':
          this.notification.notify(
            rule.name,
            action.parameters.message || `Automation triggered for "${task.title}"`,
            'info'
          );
          break;

        case 'create_task':
          this.projectService.addTask(task.projectId, {
            title: action.parameters.title || 'Follow-up Task',
            description: action.parameters.description || '',
            status: 'todo',
            priority: action.parameters.priority || 'medium',
            tags: action.parameters.tags || []
          });
          break;
      }
    });
  }

  private handleDependentTasks(completedTask: any) {
    const allTasks = this.projectService.allTasks();
    
    const dependentTasks = allTasks.filter((t: any) => 
      t.dependencyIds && t.dependencyIds.includes(completedTask.id)
    );

    dependentTasks.forEach((depTask: any) => {
      const allDependenciesComplete = (depTask.dependencyIds || []).every((depId: string) => {
        const dep = allTasks.find((t: any) => t.id === depId);
        return dep && dep.status === 'done';
      });

      if (allDependenciesComplete && depTask.status === 'todo') {
        this.projectService.updateTask(
          depTask.projectId,
          depTask.id,
          { status: 'in-progress' }
        );
      }
    });
  }

  addRule(rule: Omit<AutomationRule, 'id' | 'createdAt'>): AutomationRule {
    const newRule: AutomationRule = {
      ...rule,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };

    this.automationRulesState.update(rules => [...rules, newRule]);
    this.notification.notify('Automation Created', `Rule "${rule.name}" is now active`, 'success');
    
    return newRule;
  }

  updateRule(id: string, updates: Partial<AutomationRule>) {
    this.automationRulesState.update(rules =>
      rules.map(r => r.id === id ? { ...r, ...updates } : r)
    );
  }

  deleteRule(id: string) {
    this.automationRulesState.update(rules => rules.filter(r => r.id !== id));
    this.notification.notify('Automation Deleted', 'Rule removed', 'info');
  }

  toggleRule(id: string) {
    this.automationRulesState.update(rules =>
      rules.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r)
    );
  }
}
