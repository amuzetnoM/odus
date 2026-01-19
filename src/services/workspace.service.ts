
import { Injectable, inject, computed, effect } from '@angular/core';
import { ProjectService } from './project.service';
import { MindService } from './mind.service';
import { DriveService } from './drive.service';
import { PersistenceService } from './persistence.service';
import { GithubService } from './github.service';

/**
 * Unified Workspace Context Service
 * 
 * Provides a comprehensive, AI-ready snapshot of the entire workspace including:
 * - Projects and tasks with dependencies
 * - Mind map nodes and relationships
 * - Files and documents
 * - Calendar/timeline data
 * - Cross-references between different data types
 */

export interface WorkspaceSnapshot {
  timestamp: string;
  projects: {
    id: string;
    title: string;
    description: string;
    taskCount: number;
    completionRate: number;
    tasks: {
      id: string;
      title: string;
      status: string;
      priority: string;
      startDate?: string;
      endDate?: string;
      tags?: string[];
      dependencies?: string[];
    }[];
  }[];
  mindMap: {
    nodeCount: number;
    nodes: {
      id: string;
      title: string;
      content: string;
      tags: string[];
      linkedTo: string[];
      properties: Record<string, string>;
    }[];
  };
  files: {
    id: string;
    name: string;
    type: string;
    size: number;
    createdAt: string;
  }[];
  timeline: {
    today: string;
    upcomingTasks: {
      id: string;
      title: string;
      dueDate: string;
      project: string;
      priority: string;
    }[];
    overdueTasks: {
      id: string;
      title: string;
      dueDate: string;
      project: string;
    }[];
  };
  metrics: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    highPriorityTasks: number;
    health: number;
    focusCount: number;
  };
  relationships: {
    taskToMindMap: { taskId: string; nodeId: string; reason: string }[];
    projectToFiles: { projectId: string; fileId: string }[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  private projectService = inject(ProjectService);
  private mindService = inject(MindService);
  private driveService = inject(DriveService);
  private persistence = inject(PersistenceService);
  private githubService = inject(GithubService);

  /**
   * Computed workspace snapshot that updates automatically when any service changes
   */
  readonly workspaceSnapshot = computed<WorkspaceSnapshot>(() => {
    const allProjects = this.projectService.projects();
    const allTasks = this.projectService.allTasks();
    const mindNodes = this.mindService.nodes();
    const files = this.driveService.files();
    const metrics = this.projectService.metrics();

    const today = new Date().toISOString().split('T')[0];
    
    // Build upcoming and overdue tasks
    const upcomingTasks = allTasks
      .filter(t => t.status !== 'done' && t.endDate && t.endDate >= today)
      .slice(0, 10)
      .map(t => ({
        id: t.id,
        title: t.title,
        dueDate: t.endDate!,
        project: (t as any).projectTitle || 'Unknown',
        priority: t.priority
      }));

    const overdueTasks = allTasks
      .filter(t => t.status !== 'done' && t.endDate && t.endDate < today)
      .map(t => ({
        id: t.id,
        title: t.title,
        dueDate: t.endDate!,
        project: (t as any).projectTitle || 'Unknown'
      }));

    // Build relationships (AI can use this to understand connections)
    const relationships = this.buildRelationships(allTasks, mindNodes, files);

    return {
      timestamp: new Date().toISOString(),
      projects: allProjects.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        taskCount: p.tasks.length,
        completionRate: p.tasks.length > 0 
          ? Math.round((p.tasks.filter(t => t.status === 'done').length / p.tasks.length) * 100)
          : 0,
        tasks: p.tasks.map(t => ({
          id: t.id,
          title: t.title,
          status: t.status,
          priority: t.priority,
          startDate: t.startDate,
          endDate: t.endDate,
          tags: t.tags,
          dependencies: t.dependencyIds
        }))
      })),
      mindMap: {
        nodeCount: mindNodes.length,
        nodes: mindNodes.map(n => ({
          id: n.id,
          title: n.title,
          content: n.content.substring(0, 200), // Truncate for AI context size
          tags: n.tags,
          linkedTo: [...n.links, ...n.manualLinks],
          properties: n.properties
        }))
      },
      files: files.map(f => ({
        id: f.id,
        name: f.name,
        type: f.type,
        size: (f as any).size || 0,
        createdAt: f.createdAt
      })),
      timeline: {
        today,
        upcomingTasks,
        overdueTasks
      },
      metrics: {
        totalTasks: metrics.total,
        completedTasks: metrics.completed,
        inProgressTasks: metrics.inProgress,
        highPriorityTasks: metrics.highPriority,
        health: metrics.health,
        focusCount: metrics.focusCount
      },
      relationships
    };
  });

  /**
   * Get a compact AI-ready context string
   */
  getAIContext(): string {
    const snapshot = this.workspaceSnapshot();
    
    return JSON.stringify({
      workspace: {
        projects: snapshot.projects.map(p => ({
          id: p.id,
          title: p.title,
          completion: p.completionRate,
          taskCount: p.taskCount
        })),
        openTasks: snapshot.projects.flatMap(p => 
          p.tasks
            .filter(t => t.status !== 'done')
            .map(t => ({
              id: t.id,
              title: t.title,
              priority: t.priority,
              project: p.title,
              dueDate: t.endDate
            }))
        ),
        mindMap: {
          nodeCount: snapshot.mindMap.nodeCount,
          recentNodes: snapshot.mindMap.nodes.slice(0, 5).map(n => ({
            id: n.id,
            title: n.title,
            tags: n.tags
          }))
        },
        files: snapshot.files.map(f => ({ name: f.name, type: f.type })),
        timeline: {
          today: snapshot.timeline.today,
          upcomingCount: snapshot.timeline.upcomingTasks.length,
          overdueCount: snapshot.timeline.overdueTasks.length
        },
        metrics: snapshot.metrics,
        relationships: snapshot.relationships
      }
    }, null, 2);
  }

  /**
   * Build smart relationships between different data types
   */
  private buildRelationships(tasks: any[], mindNodes: any[], files: any[]): WorkspaceSnapshot['relationships'] {
    const taskToMindMap: { taskId: string; nodeId: string; reason: string }[] = [];
    const projectToFiles: { projectId: string; fileId: string }[] = [];

    // Find task-to-mind-map relationships based on title/tag similarity
    tasks.forEach(task => {
      mindNodes.forEach(node => {
        // Check if task title appears in node content or title
        const taskWords = task.title.toLowerCase().split(' ').filter((w: string) => w.length > 3);
        const nodeText = (node.title + ' ' + node.content).toLowerCase();
        
        const matchingWords = taskWords.filter((word: string) => nodeText.includes(word));
        if (matchingWords.length >= 2) {
          taskToMindMap.push({
            taskId: task.id,
            nodeId: node.id,
            reason: `Shared keywords: ${matchingWords.join(', ')}`
          });
        }

        // Check if task tags match node tags
        if (task.tags && node.tags) {
          const commonTags = task.tags.filter((tag: string) => 
            node.tags.some((t: string) => t.toLowerCase() === tag.toLowerCase())
          );
          if (commonTags.length > 0) {
            taskToMindMap.push({
              taskId: task.id,
              nodeId: node.id,
              reason: `Shared tags: ${commonTags.join(', ')}`
            });
          }
        }
      });
    });

    // Find project-to-file relationships based on name similarity
    const projects = this.projectService.projects();
    projects.forEach(project => {
      files.forEach(file => {
        const projectWords = project.title.toLowerCase().split(' ').filter(w => w.length > 3);
        const fileName = file.name.toLowerCase();
        
        const matchingWords = projectWords.filter(word => fileName.includes(word));
        if (matchingWords.length >= 1) {
          projectToFiles.push({
            projectId: project.id,
            fileId: file.id
          });
        }
      });
    });

    return {
      taskToMindMap: [...new Map(taskToMindMap.map(r => [r.taskId + r.nodeId, r])).values()], // Deduplicate
      projectToFiles: [...new Map(projectToFiles.map(r => [r.projectId + r.fileId, r])).values()]
    };
  }

  /**
   * Store AI reasoning/memory for future reference
   */
  async storeAIMemory(context: string, reasoning: string, outcome: string): Promise<void> {
    await this.persistence.logAiReasoning(context, reasoning, outcome);
  }

  /**
   * Retrieve AI memory for learning from past interactions
   */
  async getAIMemory(): Promise<any[]> {
    return await this.persistence.getAiMemory();
  }

  /**
   * Get full workspace snapshot for AI analysis
   */
  getFullSnapshot(): WorkspaceSnapshot {
    return this.workspaceSnapshot();
  }
}
