
import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { NotificationService } from './notification.service';
import { PersistenceService } from './persistence.service';
import { AuthService } from './auth.service';
import { GeminiService } from './gemini.service';
import { normalizeDate } from '../utils/date-utils';

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
  mindNodeId?: string;  // Reference to linked mind map node
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
  color?: string; 
}

const PROJECT_COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', 
    '#14b8a6', '#d946ef'
];

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private notification = inject(NotificationService);
  private persistence = inject(PersistenceService);
  private authService = inject(AuthService);
  private geminiService = inject(GeminiService);

  private projectsState = signal<Project[]>([]);
  private activeProjectIdsState = signal<string[]>([]);
  private personalTasksState = signal<Task[]>([]);
  private saveTimeout: any;

  private monitoredTasks = new Set<string>();

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

  readonly metrics = computed(() => {
      const all = this.allTasks();
      const total = all.length;
      let completed = 0;
      let inProgress = 0;
      let highPriority = 0;
      let focusCount = 0;

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
    this.startSystemMonitor();
    
    effect(() => {
        const p = this.projectsState();
        const pt = this.personalTasksState();
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            localStorage.setItem('artifact_projects', JSON.stringify(p));
            localStorage.setItem('artifact_personal', JSON.stringify(pt));
        }, 1000);
    });
  }

  private startSystemMonitor() {
      this.checkDeadlines();
      setInterval(() => this.checkDeadlines(), 60000);
  }

  /**
   * Normalize & sanitize task fields to ensure titles are concise and descriptions are preserved.
   * - Strips markdown-like tokens from titles
   * - Moves overflow / trailing content from long titles into description
   * - Truncates long titles to a sensible limit
   * - Validates and normalizes dates
   */
  private normalizeTask(input: Partial<Task>): Partial<Task> {
      const out: Partial<Task> = { ...input };
      let title = (out.title || '').trim();
      let description = (out.description || '').trim();

      // Remove common markdown tokens and collapse whitespace
      title = title.replace(/[`*_~#>]+/g, '').replace(/\s+/g, ' ').trim();

      // If title contains a leading portion of the description, remove it from the title
      if (description) {
          const descSample = description.slice(0, 120);
          if (descSample && title.includes(descSample)) {
              title = title.replace(descSample, '').trim();
          }
      }

      // If separator used in title (" - ", " — ", ":") and no explicit description, split it
      const sepMatch = title.match(/(.+?)(?:\s[-—:]\s)(.+)/);
      if (sepMatch && !description) {
          title = sepMatch[1].trim();
          description = sepMatch[2].trim();
      }

      // Move overflow from very long titles into description when appropriate
      if (title.length > 120) {
          const parts = title.split(/\n+/);
          if (parts.length > 1) {
              const head = parts.shift()!.trim();
              const tail = parts.join(' ').trim();
              if (!description) description = tail;
              title = head;
          } else {
              const sentenceEdge = title.match(/(.{0,120}?([.?!]|$))/);
              if (sentenceEdge && sentenceEdge[0].trim().length < title.length) {
                  const head = sentenceEdge[0].trim();
                  const tail = title.slice(head.length).trim();
                  if (!description) description = tail;
                  title = head;
              } else {
                  title = title.slice(0, 100).trim() + '…';
              }
          }
      } else if (title.length > 80) {
          title = title.slice(0, 80).trim() + '…';
      }

      out.title = title || 'Untitled Task';
      out.description = description || out.description || '';
      
      // Validate and normalize dates using shared utility
      out.startDate = normalizeDate(out.startDate);
      out.endDate = normalizeDate(out.endDate);
      
      // Ensure endDate >= startDate
      if (out.startDate && out.endDate && out.endDate < out.startDate) {
          // Swap them or set endDate to startDate + 1 day
          const start = new Date(out.startDate);
          const end = new Date(start);
          end.setDate(start.getDate() + 1);
          out.endDate = end.toISOString().split('T')[0];
      }

      return out;
  }

  private checkDeadlines() {
      const all = this.allTasks();
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      
      all.forEach((task: any) => {
          if (task.status === 'done') return;
          const alertKey = `${task.id}-${todayStr}`;
          if (this.monitoredTasks.has(alertKey)) return;

          if (task.endDate && task.endDate < todayStr) {
             this.notification.notify('Overdue Artifact', `"${task.title}" is past due.`, 'critical', { projectId: task.projectId, taskId: task.id });
             this.monitoredTasks.add(alertKey);
          } else if (task.endDate === todayStr) {
             this.notification.notify('Due Today', `"${task.title}" is due.`, 'warning', { projectId: task.projectId, taskId: task.id });
             this.monitoredTasks.add(alertKey);
          }
      });
  }

  private loadFromStorage() {
      try {
          const storedProjects = localStorage.getItem('artifact_projects');
          const storedPersonal = localStorage.getItem('artifact_personal');
          if (storedProjects) this.projectsState.set(JSON.parse(storedProjects));
          if (storedPersonal) this.personalTasksState.set(JSON.parse(storedPersonal));
      } catch (e) { console.error('Failed to load storage', e); }
  }

  async hardReset() {
      this.projectsState.set([]);
      this.personalTasksState.set([]);
      this.activeProjectIdsState.set([]);
      
      const keysToRemove = [
          'artifact_projects', 'artifact_personal', 'artifact_user_profile',
          'artifact_notifications', 'artifact_chat_history', 'artifact_mind_nodes',
          'artifact_files', 'gh_token', 'gemini_api_key'
      ];
      keysToRemove.forEach(k => localStorage.removeItem(k));

      await this.persistence.resetDatabase();
      window.location.reload();
  }

  async addProject(title: string, description: string, tasks: Partial<Task>[]) {
    const randomColor = PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)];
    
    const newProject: Project = {
      id: crypto.randomUUID(),
      title,
      description,
      tasks: tasks.map(t => {
        const base: Task = {
          ...t,
          // Preserve existing ID if present (for dependencies to work), otherwise generate new one
          id: t.id || crypto.randomUUID(),
          createdAt: t.createdAt || new Date().toISOString(),
          status: t.status || 'todo',
          priority: t.priority || 'medium',
          // Ensure dependencyIds is preserved
          dependencyIds: t.dependencyIds || []
        } as Task;
        const sanitized = this.normalizeTask(base) as Task;
        return sanitized;
      }),
      createdAt: new Date().toISOString(),
      color: randomColor
    };
    
    const graph = newProject.tasks.map(t => ({ id: t.id, deps: t.dependencyIds || [] }));
    this.persistence.saveRepoIndex(newProject.id, graph);

    this.projectsState.update(prev => [newProject, ...prev]);
    this.toggleProjectActive(newProject.id, true);
    
    this.notification.notify('Project Initialized', `"${title}" has been successfully instantiated.`, 'success');

    // Trigger Smart AI Manager Insight (Non-blocking)
    try {
        const insight = await this.geminiService.generateManagerialInsight({
            title, description, taskCount: newProject.tasks.length, tasks: newProject.tasks
        });
        this.notification.broadcastAiAgentMessage(insight);
    } catch(e) { console.error("Auto-manager failed", e); }

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
    if (projectId === 'personal') {
        this.personalTasksState.update(tasks => tasks.map(t => t.id === taskId ? { ...t, ...updates } : t));
    } else {
        this.projectsState.update(projects =>
            projects.map(p => {
                if (p.id === projectId) {
                    return { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t) };
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
      this.notification.notify('Artifact Deleted', 'The task has been permanently removed.', 'info');
  }

  updateTaskStatus(projectId: string, taskId: string, status: TaskStatus) {
      this.updateTask(projectId, taskId, { status });
      if (status === 'done') {
           this.notification.notify('Artifact Complete', 'Task status updated to Done.', 'success');
      }
  }

  addTask(projectId: string, task: Omit<Task, 'id' | 'createdAt'>) {
    const sanitizedInput = this.normalizeTask(task) as Omit<Task, 'id' | 'createdAt'>;
    const newTask: Task = { 
        ...sanitizedInput, 
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        inFocusList: sanitizedInput.inFocusList ?? false,
        focusIndex: sanitizedInput.focusIndex ?? 9999
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
    
    if (newTask.priority === 'high') {
        this.notification.notify('Critical Artifact Created', `"${newTask.title}" added to queue.`, 'warning');
    } else {
        this.notification.notify('Artifact Created', `"${newTask.title}" added successfully.`, 'success');
    }
    
    return newTask;
  }

  moveTask(taskId: string, fromProjectId: string, toProjectId: string) {
      if (fromProjectId === toProjectId) return;
      let taskToMove: Task | undefined;
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
      this.notification.notify('Migration Complete', `Artifact moved to ${toProjectId === 'personal' ? 'Personal' : 'Project'}.`, 'success');
  }

  addTasksToProject(projectId: string, tasks: Task[]) {
     const sanitized = tasks.map(t => this.normalizeTask(t) as Task);
     this.projectsState.update(projects => 
        projects.map(p => {
            if (p.id === projectId) {
                return { ...p, tasks: [...p.tasks, ...sanitized] };
            }
            return p;
        })
     );
  }

  removeProject(projectId: string) {
    this.projectsState.update(prev => prev.filter(p => p.id !== projectId));
    this.activeProjectIdsState.update(prev => prev.filter(id => id !== projectId));
    this.persistence.deleteRepoIndex(projectId);
    this.notification.notify('Project Decommissioned', 'Project and all associated artifacts removed.', 'info');
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

  updateUserIdentity(userId: string, newName: string, newAvatar: string) {
    const updateTasks = (tasks: Task[]) => {
        return tasks.map(t => {
            if (!t.comments) return t;
            const needsUpdate = t.comments.some(c => c.userId === userId && (c.userName !== newName || c.userAvatar !== newAvatar));
            if (!needsUpdate) return t;

            const updatedComments = t.comments.map(c => {
                if (c.userId === userId) {
                    return { ...c, userName: newName, userAvatar: newAvatar };
                }
                return c;
            });
            return { ...t, comments: updatedComments };
        });
    };

    this.projectsState.update(projects => projects.map(p => ({
        ...p,
        tasks: updateTasks(p.tasks)
    })));

    this.personalTasksState.update(tasks => updateTasks(tasks));
  }
}
