
import { Component, inject, computed, signal, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService, Task, TaskMetadata, Priority } from '../../services/project.service';
import { DriveService } from '../../services/drive.service';
import { GeminiService } from '../../services/gemini.service';
import { MindService } from '../../services/mind.service';
import { TimeTrackingService } from '../../services/time-tracking.service';
import { SuccessRoadmapComponent } from './success-roadmap.component';
import { TimeTrackerComponent } from '../time-tracker.component';
import { AiInsightsComponent } from '../ai-insights.component';
import { TemplateLibraryComponent } from '../template-library.component';
import { AdvancedSettingsComponent } from '../advanced-settings.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, SuccessRoadmapComponent, TimeTrackerComponent, AiInsightsComponent, TemplateLibraryComponent, AdvancedSettingsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full flex flex-col p-4 sm:p-8 overflow-hidden">
      <!-- Header with responsive wrapping and right-aligned input -->
      <div class="mb-8 flex flex-wrap items-end gap-4 shrink-0">
         <div class="min-w-[120px] mr-auto flex flex-col gap-1">
            <h1 class="text-2xl font-extralight text-white tracking-widest mb-0">SCOPE</h1>
         </div>
         
         <!-- Action Buttons -->
         <div class="flex gap-2">
            <button 
              (click)="showTemplateLibrary.set(true)"
              class="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Templates
            </button>
            <button 
              (click)="showAdvancedSettings.set(true)"
              class="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Settings
            </button>
         </div>
         
         <!-- Smart Quick Add Form (Right Aligned) -->
         <div class="flex items-center bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 focus-within:border-white/20 transition-colors max-w-full ml-auto shadow-lg">
            <input 
              [(ngModel)]="quickTaskTitle" 
              (keydown.enter)="quickAdd()"
              placeholder="Add Focus Point..." 
              class="bg-transparent text-xs text-white focus:outline-none w-32 sm:w-64 transition-all placeholder:text-zinc-600"
              [disabled]="isQuickAdding()"
            />
            <button (click)="quickAdd()" class="ml-2 w-5 h-5 flex items-center justify-center text-zinc-500 hover:text-white rounded hover:bg-white/10 transition-colors shrink-0" [disabled]="isQuickAdding()">
              @if(isQuickAdding()) { <div class="w-3 h-3 border border-zinc-500 border-t-white rounded-full animate-spin"></div> } 
              @else { + }
            </button>
         </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 flex-1 min-h-0">
         
         <!-- Focus List -->
         <div class="flex flex-col min-h-0 bg-zinc-900/10 border border-white/5 rounded-xl p-4 relative overflow-hidden backdrop-blur-sm">
            <div class="flex justify-between items-center mb-4 shrink-0">
                <h2 class="text-xs font-semibold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                   <span class="w-1 h-1 bg-white rounded-full shadow-[0_0_8px_white]"></span> Focus
                </h2>
                <button 
                  (click)="curateFocusList()"
                  [disabled]="isCurating()"
                  class="text-[9px] uppercase tracking-wider text-zinc-400 hover:text-white border border-zinc-800 hover:bg-zinc-800 px-2 py-1 rounded transition-all flex items-center gap-1 group">
                   @if(isCurating()) { <div class="w-2 h-2 border border-zinc-500 border-t-white rounded-full animate-spin"></div> }
                   <span>Curate (AI)</span>
                </button>
            </div>
            
            <div 
              class="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2"
              (dragover)="onDragOver($event)"
              (drop)="onDrop($event)"
            >
               @for (task of focusTasks(); track task.id; let i = $index) {
                  <div 
                    draggable="true"
                    (dragstart)="onDragStart($event, i)"
                    class="group flex flex-col gap-2 p-3 rounded-lg border border-white/5 bg-zinc-950/40 hover:bg-zinc-900/80 transition-all cursor-move relative shadow-sm"
                    [style.border-left-width.px]="3"
                    [style.border-left-color]="task.projectColor"
                  >
                     <div class="flex items-center gap-4">
                        <!-- Complete Button -->
                        <button (click)="completeFocusTask(task)" class="w-4 h-4 rounded-full border border-zinc-600 hover:border-white hover:bg-green-500/20 flex items-center justify-center group/check transition-colors" title="Complete Task">
                           <svg class="w-2.5 h-2.5 text-transparent group-hover/check:text-green-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                        </button>

                        <div class="flex-1 min-w-0">
                           <input 
                             [ngModel]="task.title" 
                             (blur)="updateTitle(task, $event)"
                             class="w-full bg-transparent text-sm text-zinc-200 font-light focus:outline-none focus:text-white truncate"
                           />
                           <div class="flex gap-2 items-center mt-1">
                              <span 
                                class="text-[9px] font-bold uppercase tracking-wider bg-zinc-900 px-1.5 py-0.5 rounded border border-white/5"
                                [style.color]="task.projectColor">
                                {{ task.projectTitle }}
                              </span>
                              
                              <!-- Priority Toggle -->
                              <button 
                                (click)="cyclePriority(task)"
                                class="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border transition-colors flex items-center gap-1"
                                [class.border-red-900]="task.priority === 'high'"
                                [class.text-red-400]="task.priority === 'high'"
                                [class.bg-red-900_20]="task.priority === 'high'"
                                [class.border-yellow-900]="task.priority === 'medium'"
                                [class.text-yellow-500]="task.priority === 'medium'"
                                [class.bg-yellow-900_20]="task.priority === 'medium'"
                                [class.border-zinc-800]="task.priority === 'low'"
                                [class.text-zinc-600]="task.priority === 'low'"
                              >
                                {{ task.priority }}
                              </button>
                              
                              @if (task.tags && task.tags.length > 0) {
                                <span class="text-[9px] text-zinc-600 font-mono flex items-center gap-1">
                                    <span class="w-0.5 h-2 bg-zinc-700"></span> {{ task.tags[0] }}
                                </span>
                              }
                           </div>
                        </div>
                        <button (click)="toggleExpand(task.id)" class="text-zinc-600 hover:text-white text-[10px] uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                            {{ isExpanded(task.id) ? 'Hide' : 'Meta' }}
                        </button>
                        <button (click)="toggleFocus(task)" class="text-zinc-600 hover:text-red-400 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity" title="Remove from Focus List">×</button>
                     </div>
                     
                     <!-- Metadata (Expanded) -->
                     @if (isExpanded(task.id)) {
                        <div class="pl-0 pt-2 border-t border-white/5 grid grid-cols-2 gap-2 animate-fade-in">
                            <div class="col-span-2">
                                <label class="text-[9px] text-zinc-600 block mb-1">Project Assignment</label>
                                <select 
                                   [ngModel]="task.projectId" 
                                   (change)="moveTaskProject(task, $event)"
                                   class="w-full bg-zinc-950/50 border border-zinc-800 rounded px-2 py-1 text-[10px] text-zinc-300 focus:outline-none focus:border-zinc-600">
                                   <option value="personal">Personal / General</option>
                                   @for (proj of projectService.projects(); track proj.id) {
                                      <option [value]="proj.id">{{ proj.title }}</option>
                                   }
                                </select>
                            </div>
                            <div>
                                <label class="text-[9px] text-zinc-600 block">Notes</label>
                                <input 
                                  [ngModel]="task.metadata?.notes" 
                                  (change)="updateMeta(task, 'notes', $event)"
                                  class="w-full bg-zinc-950/50 border border-zinc-800 rounded px-2 py-1 text-[10px] text-zinc-400 focus:outline-none focus:border-zinc-600" 
                                  placeholder="Add notes..."
                                />
                            </div>
                             <div>
                                <label class="text-[9px] text-zinc-600 block">Due</label>
                                <input 
                                  type="date"
                                  [ngModel]="task.metadata?.dueDate" 
                                  (change)="updateMeta(task, 'dueDate', $event)"
                                  class="w-full bg-zinc-950/50 border border-zinc-800 rounded px-2 py-1 text-[10px] text-zinc-400 focus:outline-none focus:border-zinc-600" 
                                />
                            </div>
                        </div>
                     }
                  </div>
               } @empty {
                  <div class="p-8 border border-dashed border-zinc-800 rounded text-center text-zinc-600 font-light text-sm flex flex-col items-center justify-center h-full">
                     <span class="mb-2 opacity-50">Focus list clear.</span>
                     <span class="text-[10px]">Use "Curate" or Smart Add (+).</span>
                  </div>
               }
            </div>
         </div>

         <!-- Time Tracker & AI Insights -->
         <div class="flex flex-col min-h-0 space-y-6">
            <app-time-tracker />
            <app-ai-insights />
         </div>

         <!-- Success Roadmap (Replaces Recent Data) -->
         <div class="flex flex-col min-h-0 h-full">
            <app-success-roadmap class="h-full block" />
         </div>
      </div>

      <!-- Modals -->
      @if (showTemplateLibrary()) {
        <app-template-library (close)="showTemplateLibrary.set(false)" />
      }
      @if (showAdvancedSettings()) {
        <app-advanced-settings (close)="showAdvancedSettings.set(false)" />
      }
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; overflow: hidden; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .animate-fade-in { animation: fadeIn 0.2s ease-out; }
  `]
})
export class DashboardComponent {
  projectService = inject(ProjectService);
  driveService = inject(DriveService);
  geminiService = inject(GeminiService);
  mindService = inject(MindService);
  timeTracking = inject(TimeTrackingService);
  
  quickTaskTitle = signal('');
  expandedTasks = signal<string[]>([]);
  isCurating = signal(false);
  isQuickAdding = signal(false);
  showTemplateLibrary = signal(false);
  showAdvancedSettings = signal(false);
  
  draggedTaskIndex = -1;

  focusTasks = computed(() => {
    return this.projectService.allTasks()
      .filter((t: any) => t.inFocusList && t.status !== 'done')
      .sort((a: any, b: any) => (a.focusIndex ?? 9999) - (b.focusIndex ?? 9999));
  });

  async quickAdd() {
      const title = this.quickTaskTitle().trim();
      if (!title) return;
      
      this.isQuickAdding.set(true);
      
      try {
          // 1. Ingest to Project System
          const targetProjectId = await this.geminiService.routeTaskToProject(title, this.projectService.projects());
          
          const today = new Date();
          const endDate = new Date();
          endDate.setDate(today.getDate() + 3);

          this.projectService.addTask(targetProjectId, {
              title: title,
              description: 'Added via Dashboard Smart Add',
              status: 'todo',
              priority: 'medium',
              tags: ['QUICK', 'FOCUS'],
              inFocusList: true,
              focusIndex: 0,
              startDate: today.toISOString().split('T')[0],
              endDate: endDate.toISOString().split('T')[0]
          });

          // 2. Absorb into Mind Map (Neural Ingestion)
          await this.mindService.addNode(title);

          this.quickTaskTitle.set('');
      } catch (err) {
          console.error("Quick add failed", err);
      } finally {
          this.isQuickAdding.set(false);
      }
  }

  async curateFocusList() {
      this.isCurating.set(true);
      const allTasks = this.projectService.allTasks();
      const result = await this.geminiService.curateFocusList(allTasks);
      
      allTasks.forEach((t: any) => {
          if (t.inFocusList) this.projectService.updateTask(t.projectId, t.id, { inFocusList: false });
      });

      result.taskIds.forEach((id, index) => {
          const taskObj = allTasks.find((t: any) => t.id === id);
          if (taskObj) {
              this.projectService.updateTask(taskObj.projectId, id, { 
                  inFocusList: true, 
                  focusIndex: index,
                  priority: 'high' 
              });
          }
      });
      this.isCurating.set(false);
  }

  updateTitle(task: any, event: any) {
      this.projectService.updateTask(task.projectId, task.id, { title: event.target.value });
  }

  toggleExpand(id: string) {
      this.expandedTasks.update(prev => 
          prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
      );
  }

  isExpanded(id: string) { return this.expandedTasks().includes(id); }

  updateMeta(task: any, field: keyof TaskMetadata, event: any) {
      const val = event.target.value;
      const currentMeta = task.metadata || {};
      this.projectService.updateTask(task.projectId, task.id, { 
          metadata: { ...currentMeta, [field]: val } 
      });
  }

  cyclePriority(task: any) {
      const map: Record<Priority, Priority> = {
          'low': 'medium',
          'medium': 'high',
          'high': 'low'
      };
      const next = map[task.priority];
      this.projectService.updateTask(task.projectId, task.id, { priority: next });
  }

  moveTaskProject(task: any, event: any) {
      const newProjectId = event.target.value;
      this.projectService.moveTask(task.id, task.projectId, newProjectId);
  }

  toggleFocus(task: any) {
      this.projectService.updateTask(task.projectId, task.id, { inFocusList: !task.inFocusList });
  }

  completeFocusTask(task: any) {
      this.projectService.updateTaskStatus(task.projectId, task.id, 'done');
  }

  onDragStart(e: DragEvent, index: number) {
      this.draggedTaskIndex = index;
      e.dataTransfer!.effectAllowed = 'move';
  }

  onDragOver(e: DragEvent) {
      e.preventDefault();
      e.dataTransfer!.dropEffect = 'move';
  }

  onDrop(e: DragEvent) {
      e.preventDefault();
      const tasks = this.focusTasks();
      if (this.draggedTaskIndex > -1 && this.draggedTaskIndex < tasks.length) {
          const task = tasks[this.draggedTaskIndex];
          this.projectService.updateTask((task as any).projectId, task.id, { focusIndex: -1 });
      }
  }
}
