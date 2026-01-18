
import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { NotificationService } from './notification.service';
import { PersistenceService } from './persistence.service';
import { AuthService } from './auth.service';

export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

export interface TaskMetadata {
  location?: string;
  notes?: string;
  dueDate?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  tags?: string[];
  metadata?: TaskMetadata;
  dependencyIds?: string[];
  comments?: Comment[];
  attachmentIds?: string[];
  
  inFocusList?: boolean;
  focusIndex?: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
  createdAt: string;
  isArchived?: boolean;
  color?: string; // Hex color for UI distinction
}

const PROJECT_COLORS = [
    '#3b82f6', // blue-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#06b6d4', // cyan-500
    '#f97316', // orange-500
    '#14b8a6', // teal-500
    '#d946ef', // fuchsia-500
];

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private notification = inject(NotificationService);
  private persistence = inject(PersistenceService);
  private authService = inject(AuthService);

  private projectsState = signal<Project[]>([]);
  private activeProjectIdsState = signal<string[]>([]);
  private personalTasksState = signal<Task[]>([]);
  private saveTimeout: any;

  readonly projects = this.projectsState.asReadonly();
  readonly activeProjectIds = this.activeProjectIdsState.asReadonly();
  readonly personalTasks = this.personalTasksState.asReadonly();

  readonly activeProjects = computed(() => {
    const projects = this.projectsState();
    const activeIds = this.activeProjectIdsState();
    return activeIds
      .map(id => projects.find(p => p.id === id))
      .filter((p): p is Project => !!p);
  });

  readonly allTasks = computed(() => {
    // Optimization: This computation can be expensive. 
    // However, signal memoization handles dependency tracking efficiently.
    const projectTasks = this.projectsState().flatMap(p => 
        p.tasks.map(t => ({ 
            ...t, 
            projectId: p.id, 
            projectTitle: p.title,
            projectColor: p.color || '#71717a'
        }))
    );
    const personal = this.personalTasksState().map(t => ({ 
        ...t, 
        projectId: 'personal', 
        projectTitle: 'Personal',
        projectColor: '#ffffff'
    }));
    return [...projectTasks, ...personal];
  });

  // Metrics
  readonly metrics = computed(() => {
      const all = this.allTasks();
      const total = all.length;
      let completed = 0;
      let inProgress = 0;
      let highPriority = 0;
      let focusCount = 0;

      // Single pass loop for performance
      for (const t of all) {
          if (t.status === 'done') completed++;
          if (t.status === 'in-progress') inProgress++;
          if (t.priority === 'high' && t.status !== 'done') highPriority++;
          if (t.inFocusList && t.status !== 'done') focusCount++;
      }
      
      const health = total === 0 ? 100 : Math.round((completed / total) * 100);
      
      return { total, completed, inProgress, highPriority, focusCount, health };
  });

  constructor() {
    this.loadFromStorage();
    
    // Debounced Save Effect
    effect(() => {
        // Track signals
        const p = this.projectsState();
        const pt = this.personalTasksState();
        
        // Debounce storage write
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            localStorage.setItem('artifact_projects', JSON.stringify(p));
            localStorage.setItem('artifact_personal', JSON.stringify(pt));
        }, 1000); // 1 second debounce
    });
  }

  private loadFromStorage() {
      try {
          const storedProjects = localStorage.getItem('artifact_projects');
          const storedPersonal = localStorage.getItem('artifact_personal');
          
          if (storedProjects) this.projectsState.set(JSON.parse(storedProjects));
          if (storedPersonal) this.personalTasksState.set(JSON.parse(storedPersonal));
      } catch (e) { console.error('Failed to load storage', e); }
      
      // Removed Dummy Data Init call to ensure clean slate for user
  }

  // --- Reset Capability ---
  hardReset() {
      this.projectsState.set([]);
      this.personalTasksState.set([]);
      this.activeProjectIdsState.set([]);
      
      localStorage.removeItem('artifact_projects');
      localStorage.removeItem('artifact_personal');
      // Note: IndexedDB is handled separately but this clears UI state immediately
      this.notification.show('System Factory Reset Complete', 'info');
  }

  addProject(title: string, description: string, tasks: Task[]) {
    const randomColor = PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)];
    
    const newProject: Project = {
      id: crypto.randomUUID(),
      title,
      description,
      tasks: tasks.map(t => ({...t, createdAt: t.createdAt || new Date().toISOString()})),
      createdAt: new Date().toISOString(),
      color: randomColor
    };
    
    // Auto-index dependencies in background
    const graph = tasks.map(t => ({ id: t.id, deps: t.dependencyIds }));
    this.persistence.saveRepoIndex(newProject.id, graph);

    this.projectsState.update(prev => [newProject, ...prev]);
    this.toggleProjectActive(newProject.id, true);
    this.notification.show('Project initialized', 'success');
    return newProject;
  }

  toggleProjectActive(projectId: string, forceState?: boolean) {
    this.activeProjectIdsState.update(prev => {
      const isActive = prev.includes(projectId);
      const shouldBeActive = forceState !== undefined ? forceState : !isActive;
      if (shouldBeActive && !isActive) return [...prev, projectId];
      else if (!shouldBeActive && isActive) return prev.filter(id => id !== projectId);
      return prev;
    });
  }

  setSingleActiveProject(projectId: string) {
      this.activeProjectIdsState.set([projectId]);
  }

  updateTask(projectId: string, taskId: string, updates: Partial<Task>) {
    // Optimistic Update
    if (projectId === 'personal') {
        this.personalTasksState.update(tasks => tasks.map(t => t.id === taskId ? { ...t, ...updates } : t));
    } else {
        this.projectsState.update(projects =>
            projects.map(p => {
                if (p.id === projectId) {
                    return {
                        ...p,
                        tasks: p.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
                    };
                }
                return p;
            })
        );
    }
  }

  deleteTask(projectId: string, taskId: string) {
      if (projectId === 'personal') {
          this.personalTasksState.update(tasks => tasks.filter(t => t.id !== taskId));
      } else {
          this.projectsState.update(projects => 
            projects.map(p => {
                if (p.id === projectId) {
                    return { ...p, tasks: p.tasks.filter(t => t.id !== taskId) };
                }
                return p;
            })
          );
      }
      this.notification.show('Artifact deleted', 'info');
  }

  updateTaskStatus(projectId: string, taskId: string, status: TaskStatus) {
      this.updateTask(projectId, taskId, { status });
  }

  addTask(projectId: string, task: Omit<Task, 'id' | 'createdAt'>) {
    const newTask: Task = { 
        ...task, 
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        inFocusList: task.inFocusList ?? false,
        focusIndex: task.focusIndex ?? 9999
    };
    
    if (projectId === 'personal') {
        this.personalTasksState.update(prev => [...prev, newTask]);
    } else {
        this.projectsState.update(projects => 
            projects.map(p => {
                if (p.id === projectId) {
                    return { ...p, tasks: [...p.tasks, newTask] };
                }
                return p;
            })
        );
    }
    this.notification.show('Artifact created', 'success');
    return newTask;
  }

  moveTask(taskId: string, fromProjectId: string, toProjectId: string) {
      if (fromProjectId === toProjectId) return;

      let taskToMove: Task | undefined;

      // 1. Remove from Source
      if (fromProjectId === 'personal') {
          this.personalTasksState.update(tasks => {
              taskToMove = tasks.find(t => t.id === taskId);
              return tasks.filter(t => t.id !== taskId);
          });
      } else {
          this.projectsState.update(projects => projects.map(p => {
              if (p.id === fromProjectId) {
                  taskToMove = p.tasks.find(t => t.id === taskId);
                  return { ...p, tasks: p.tasks.filter(t => t.id !== taskId) };
              }
              return p;
          }));
      }

      if (!taskToMove) return;

      // 2. Add to Target
      if (toProjectId === 'personal') {
          this.personalTasksState.update(prev => [...prev, taskToMove!]);
      } else {
          this.projectsState.update(projects => projects.map(p => {
              if (p.id === toProjectId) {
                  return { ...p, tasks: [...p.tasks, taskToMove!] };
              }
              return p;
          }));
      }
      this.notification.show(`Moved to ${toProjectId === 'personal' ? 'Personal' : 'Project'}`, 'success');
  }

  addTasksToProject(projectId: string, tasks: Task[]) {
     this.projectsState.update(projects => 
        projects.map(p => {
            if (p.id === projectId) {
                return { ...p, tasks: [...p.tasks, ...tasks] };
            }
            return p;
        })
     );
  }

  removeProject(projectId: string) {
    this.projectsState.update(prev => prev.filter(p => p.id !== projectId));
    this.activeProjectIdsState.update(prev => prev.filter(id => id !== projectId));
    
    // Clean up background index
    this.persistence.deleteRepoIndex(projectId);
    
    this.notification.show('Project decommissioned', 'info');
  }

  findTaskByTitle(title: string): { task: Task, projectId: string } | null {
      const normalizedTitle = title.trim().toLowerCase();
      for (const project of this.projectsState()) {
          const found = project.tasks.find(t => t.title.toLowerCase() === normalizedTitle);
          if (found) {
              return { task: { ...found }, projectId: project.id };
          }
      }
      const foundPersonal = this.personalTasksState().find(t => t.title.toLowerCase() === normalizedTitle);
      if (foundPersonal) {
          return { task: { ...foundPersonal }, projectId: 'personal' };
      }
      return null;
  }
  
  addComment(projectId: string, taskId: string, text: string) {
      const user = this.authService.currentUser();
      const newComment: Comment = {
          id: crypto.randomUUID(),
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          text: text,
          createdAt: new Date().toISOString()
      };
      
      const taskContainer = projectId === 'personal' 
          ? this.personalTasksState().find(t => t.id === taskId)
          : this.projectsState().find(p => p.id === projectId)?.tasks.find(t => t.id === taskId);
          
      if (taskContainer) {
          const updatedComments = [...(taskContainer.comments || []), newComment];
          this.updateTask(projectId, taskId, { comments: updatedComments });
      }
  }
}
