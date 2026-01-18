
import { Component, input, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project, ProjectService, Task } from '../services/project.service';
import { GeminiService } from '../services/gemini.service';
import { KanbanBoardComponent } from './views/kanban-board.component';
import { GanttChartComponent } from './views/gantt-chart.component';
import { DependencyGraphComponent } from './views/dependency-graph.component';
import { TaskDetailComponent } from './task-detail.component';

type ProjectView = 'kanban' | 'gantt' | 'graph';

@Component({
  selector: 'app-project-board',
  standalone: true,
  imports: [CommonModule, KanbanBoardComponent, GanttChartComponent, DependencyGraphComponent, TaskDetailComponent],
  template: `
    <div class="flex flex-col h-full bg-zinc-950/50 backdrop-blur-md rounded border border-white/5 overflow-hidden transition-all duration-300 relative group">
      <!-- Header -->
      <div class="p-4 border-b border-white/5 bg-zinc-950/80 shrink-0 flex flex-col gap-4">
        <div class="flex justify-between items-start">
          <div class="min-w-0 pr-4">
            <h2 class="text-sm font-light tracking-widest text-white uppercase truncate">{{ project().title }}</h2>
            <p class="text-[10px] text-zinc-500 font-mono truncate mt-0.5">{{ project().description }}</p>
          </div>
          
          <div class="flex gap-2 shrink-0">
              <button 
                (click)="analyzeRisks()" 
                [disabled]="isAnalyzing()"
                class="px-2 py-1 text-zinc-400 hover:text-white border border-transparent hover:border-white/20 bg-zinc-900/50 rounded transition-all text-[10px] font-mono uppercase tracking-wide flex items-center gap-1 disabled:opacity-50">
                @if (isAnalyzing()) {
                   <div class="w-3 h-3 border border-zinc-500 border-t-white rounded-full animate-spin"></div>
                } @else {
                   <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                   <span>Risk Scan</span>
                }
              </button>

              <button 
                (click)="generateTask()" 
                [disabled]="isGeneratingTask()"
                class="px-2 py-1 text-zinc-400 hover:text-white border border-transparent hover:border-white/20 bg-zinc-900/50 rounded transition-all text-[10px] font-mono uppercase tracking-wide flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                @if (isGeneratingTask()) {
                   <div class="w-3 h-3 border border-zinc-500 border-t-white rounded-full animate-spin"></div>
                } @else {
                   <span>AI+</span>
                }
              </button>

              <button 
                (click)="close.emit(project().id)"
                class="px-2 py-1 text-zinc-500 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors text-[10px]"
                title="Close Project Stream">
                ✕
              </button>
          </div>
        </div>
        
        <!-- View Switcher -->
        <div class="flex bg-zinc-900/50 p-0.5 rounded border border-white/5 self-start">
           <button 
             (click)="currentView.set('kanban')" 
             [class]="getViewClass('kanban')"
             class="px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-sm transition-all flex items-center gap-1">
             Board
           </button>
           <button 
             (click)="currentView.set('gantt')" 
             [class]="getViewClass('gantt')"
             class="px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-sm transition-all flex items-center gap-1">
             Gantt
           </button>
           <button 
             (click)="currentView.set('graph')" 
             [class]="getViewClass('graph')"
             class="px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-sm transition-all flex items-center gap-1">
             Node
           </button>
        </div>
      </div>

      <!-- Main View Content -->
      <div class="flex-1 overflow-hidden relative">
        @switch (currentView()) {
           @case ('kanban') {
             <app-kanban-board (taskClick)="openTaskDetail($event)" [project]="project()" class="h-full block overflow-x-auto" />
           }
           @case ('gantt') {
             <app-gantt-chart [project]="project()" class="h-full block" />
           }
           @case ('graph') {
             <app-dependency-graph (nodeClick)="openTaskDetail($event)" [project]="project()" class="h-full block" />
           }
        }
      </div>
      
      <!-- Risk Analysis Modal -->
      @if (riskReport()) {
          <div class="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8" (click)="riskReport.set(null)">
              <div class="bg-zinc-900 border border-white/10 rounded-xl p-6 max-w-2xl w-full max-h-full overflow-y-auto shadow-2xl relative" (click)="$event.stopPropagation()">
                  <div class="flex justify-between items-center mb-4">
                      <h3 class="text-white font-light text-lg uppercase tracking-widest">Risk Analysis Report</h3>
                      <button (click)="riskReport.set(null)" class="text-zinc-500 hover:text-white">✕</button>
                  </div>
                  <div class="prose prose-invert prose-sm font-light text-zinc-300" [innerHTML]="parsedRiskReport()"></div>
              </div>
          </div>
      }

      @if (selectedTask()) {
        <app-task-detail 
           [task]="selectedTask()!"
           [projectId]="project().id"
           (close)="selectedTask.set(null)"
        />
      }
    </div>
  `
})
export class ProjectBoardComponent {
  project = input.required<Project>();
  close = output<string>();
  
  private projectService = inject(ProjectService);
  private geminiService = inject(GeminiService);
  
  currentView = signal<ProjectView>('kanban');
  isGeneratingTask = signal(false);
  isAnalyzing = signal(false);
  selectedTask = signal<Task | null>(null);
  riskReport = signal<string | null>(null);

  getViewClass(view: ProjectView) {
    return this.currentView() === view 
      ? 'bg-white text-black shadow-sm' 
      : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5';
  }

  openTaskDetail(task: Task) {
    this.selectedTask.set(task);
  }

  async generateTask() {
    if (this.isGeneratingTask()) return;
    this.isGeneratingTask.set(true);
    try {
      const suggestion = await this.geminiService.suggestNextTask(this.project().tasks);
      if (suggestion) {
        const today = new Date().toISOString().split('T')[0];
        const next = new Date(); next.setDate(next.getDate() + 3);
        const nextStr = next.toISOString().split('T')[0];

        this.projectService.addTask(this.project().id, {
            title: suggestion.title,
            description: suggestion.description,
            priority: suggestion.priority,
            status: 'todo',
            startDate: today,
            endDate: nextStr
        });
      }
    } catch (err) {
      console.error('Failed to generate task', err);
    } finally {
      this.isGeneratingTask.set(false);
    }
  }

  async analyzeRisks() {
      if (this.isAnalyzing()) return;
      this.isAnalyzing.set(true);
      try {
          const report = await this.geminiService.analyzeProjectRisks(this.project());
          this.riskReport.set(report);
      } catch (e) {
          this.riskReport.set("Failed to generate risk analysis.");
      } finally {
          this.isAnalyzing.set(false);
      }
  }

  parsedRiskReport() {
      const raw = this.riskReport() || '';
      return raw
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
        .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold mb-2">$1</h1>')
        .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold mb-2 mt-4 text-white">$1</h2>')
        .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc mb-1">$1</li>')
        .replace(/\n/g, '<br>');
  }
}
