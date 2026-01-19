
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PredictiveAiService } from '../../services/predictive-ai.service';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-ai-insights',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-zinc-900/50 border border-white/10 rounded-xl p-6 space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold text-zinc-400 uppercase tracking-wider">AI Insights</h2>
        <button 
          (click)="refresh()"
          [disabled]="isRefreshing()"
          class="text-xs text-zinc-400 hover:text-white transition-colors disabled:opacity-50">
          <svg class="w-4 h-4" [class.animate-spin]="isRefreshing()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </button>
      </div>

      <!-- Risk Assessment -->
      <div>
        <h3 class="text-xs text-zinc-500 uppercase tracking-wider mb-3">Risk Assessment</h3>
        @if (highRisks().length > 0) {
          <div class="space-y-2">
            @for (risk of highRisks(); track risk.taskId) {
              <div 
                class="p-3 rounded-lg border transition-colors"
                [class.border-red-500/30]="risk.riskLevel === 'critical'"
                [class.bg-red-900/10]="risk.riskLevel === 'critical'"
                [class.border-orange-500/30]="risk.riskLevel === 'high'"
                [class.bg-orange-900/10]="risk.riskLevel === 'high'">
                <div class="flex items-start gap-2 mb-2">
                  <div 
                    class="w-2 h-2 rounded-full mt-1"
                    [class.bg-red-400]="risk.riskLevel === 'critical'"
                    [class.bg-orange-400]="risk.riskLevel === 'high'">
                  </div>
                  <div class="flex-1">
                    <div class="text-sm text-zinc-200 font-medium mb-1">{{ risk.taskTitle }}</div>
                    <div class="text-xs text-zinc-400 mb-2">{{ risk.recommendation }}</div>
                    <div class="flex flex-wrap gap-1">
                      @for (factor of risk.riskFactors; track factor) {
                        <span class="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                          {{ factor }}
                        </span>
                      }
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="text-center py-4 text-zinc-500 text-sm">
            No high-risk tasks detected
          </div>
        }
      </div>

      <!-- Missing Work Detection -->
      @if (missingWork()) {
        <div class="border-t border-white/5 pt-4">
          <h3 class="text-xs text-zinc-500 uppercase tracking-wider mb-3">Suggested Tasks</h3>
          <div class="space-y-3">
            @for (task of missingWork()!.missingTasks; track task.title) {
              <div class="bg-blue-900/10 border border-blue-500/20 rounded-lg p-3">
                <div class="flex items-start justify-between mb-2">
                  <div class="text-sm text-zinc-200 font-medium">{{ task.title }}</div>
                  <span 
                    class="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded"
                    [class.bg-red-900]="task.priority === 'high'"
                    [class.text-red-300]="task.priority === 'high'"
                    [class.bg-yellow-900]="task.priority === 'medium'"
                    [class.text-yellow-300]="task.priority === 'medium'"
                    [class.bg-zinc-800]="task.priority === 'low'"
                    [class.text-zinc-400]="task.priority === 'low'">
                    {{ task.priority }}
                  </span>
                </div>
                <div class="text-xs text-zinc-400 mb-2" [innerHTML]="task.description"></div>
                <button 
                  (click)="addSuggestedTask(task)"
                  class="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  Add to Project
                </button>
              </div>
            }
          </div>
        </div>
      }

      <!-- Completion Prediction -->
      @if (selectedProject()) {
        <div class="border-t border-white/5 pt-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-xs text-zinc-500 uppercase tracking-wider">Predicted Completion</h3>
            <div class="text-sm text-zinc-300">{{ completionDate() }}</div>
          </div>
          <div class="text-xs text-zinc-400">
            Based on current velocity and remaining tasks
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class AiInsightsComponent {
  private predictiveAi = inject(PredictiveAiService);
  private projectService = inject(ProjectService);

  isRefreshing = signal(false);
  missingWork = signal<any>(null);
  selectedProject = signal<any>(null);

  highRisks = this.predictiveAi.risks;

  completionDate = signal('Calculating...');

  ngOnInit() {
    this.loadInsights();
  }

  async loadInsights() {
    const activeProjects = this.projectService.activeProjects();
    if (activeProjects.length > 0) {
      this.selectedProject.set(activeProjects[0]);
      
      try {
        const missing = await this.predictiveAi.detectMissingWork(activeProjects[0].id);
        this.missingWork.set(missing);
        
        const completion = this.predictiveAi.predictCompletionDate(activeProjects[0].id);
        this.completionDate.set(completion);
      } catch (e) {
        console.error('Failed to load AI insights', e);
      }
    }
  }

  async refresh() {
    this.isRefreshing.set(true);
    await this.loadInsights();
    setTimeout(() => this.isRefreshing.set(false), 1000);
  }

  addSuggestedTask(task: any) {
    const project = this.selectedProject();
    if (project) {
      this.projectService.addTask(project.id, {
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: 'todo',
        tags: ['AI-GEN']
      });
    }
  }
}
