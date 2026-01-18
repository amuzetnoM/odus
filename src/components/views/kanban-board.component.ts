
import { Component, input, output, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project, ProjectService, Task, TaskStatus } from '../../services/project.service';
import { TaskCardComponent } from '../task-card.component';

type SortOption = 'smart' | 'date' | 'priority' | 'created';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, TaskCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full bg-zinc-950/20">
      
      <!-- Board Controls -->
      <div class="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-zinc-950/40 backdrop-blur-sm shrink-0">
         <div class="flex items-center gap-3">
             <div class="flex -space-x-1">
                 <!-- Mock Avatars for "Team" feel -->
                 <div class="w-5 h-5 rounded-full bg-zinc-700 border border-zinc-900 flex items-center justify-center text-[8px] text-white">AI</div>
                 <div class="w-5 h-5 rounded-full bg-indigo-500 border border-zinc-900 flex items-center justify-center text-[8px] text-white">U</div>
             </div>
             <span class="text-[10px] font-mono text-zinc-500 uppercase border-l border-zinc-800 pl-3">{{ taskCounts().total }} Artifacts</span>
         </div>
         
         <!-- Modern Segmented Control -->
         <div class="flex bg-black/40 p-0.5 rounded-lg border border-white/5">
            <button 
                (click)="sortBy.set('smart')" 
                [class]="getSortBtnClass('smart')"
                title="Smart Sort: Priority + Deadline">
                Smart
            </button>
            <button 
                (click)="sortBy.set('priority')" 
                [class]="getSortBtnClass('priority')"
                title="Sort by Priority">
                Prio
            </button>
            <button 
                (click)="sortBy.set('date')" 
                [class]="getSortBtnClass('date')"
                title="Sort by Due Date">
                Date
            </button>
            <button 
                (click)="sortBy.set('created')" 
                [class]="getSortBtnClass('created')"
                title="Sort by Newest">
                New
            </button>
         </div>
      </div>

      <!-- Columns Container -->
      <div class="flex-1 flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory divide-x divide-white/5">
        
        <!-- Todo Column -->
        <div 
          class="flex-1 min-w-[85vw] sm:min-w-[300px] flex flex-col transition-all duration-300 snap-center"
          [class.bg-zinc-900_30]="dragOverColumn() === 'todo'"
          [class.bg-blue-900_10]="dragOverColumn() === 'todo'"
          (dragover)="onDragOver($event, 'todo')" 
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event, 'todo')"
        >
          <div class="p-4 flex items-center gap-2 sticky top-0 bg-zinc-950/80 z-10 backdrop-blur border-b border-white/5">
            <div class="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>
            <h3 class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Pending</h3>
            <span class="ml-auto text-[9px] px-1.5 py-0.5 border border-zinc-800 rounded text-zinc-500 font-mono">{{ taskCounts().todo }}</span>
          </div>
          <div class="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
            @for (task of todoTasks(); track task.id) {
              <div (click)="taskClick.emit(task)" class="animate-enter">
                <app-task-card [task]="task" />
              </div>
            }
          </div>
        </div>

        <!-- In Progress Column -->
        <div 
          class="flex-1 min-w-[85vw] sm:min-w-[300px] flex flex-col transition-all duration-300 snap-center"
          [class.bg-zinc-900_30]="dragOverColumn() === 'in-progress'"
          [class.bg-emerald-900_10]="dragOverColumn() === 'in-progress'"
          (dragover)="onDragOver($event, 'in-progress')" 
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event, 'in-progress')"
        >
          <div class="p-4 flex items-center gap-2 sticky top-0 bg-zinc-950/80 z-10 backdrop-blur border-b border-white/5">
            <div class="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]"></div>
            <h3 class="text-[10px] font-bold text-zinc-200 uppercase tracking-widest">Active</h3>
            <span class="ml-auto text-[9px] px-1.5 py-0.5 border border-zinc-800 rounded text-zinc-500 font-mono">{{ taskCounts().inProgress }}</span>
          </div>
          <div class="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
            @for (task of inProgressTasks(); track task.id) {
               <div (click)="taskClick.emit(task)" class="animate-enter">
                 <app-task-card [task]="task" />
               </div>
            }
          </div>
        </div>

        <!-- Done Column -->
        <div 
          class="flex-1 min-w-[85vw] sm:min-w-[300px] flex flex-col transition-all duration-300 snap-center"
          [class.bg-zinc-900_30]="dragOverColumn() === 'done'"
          [class.bg-purple-900_10]="dragOverColumn() === 'done'"
          (dragover)="onDragOver($event, 'done')" 
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event, 'done')"
        >
          <div class="p-4 flex items-center gap-2 sticky top-0 bg-zinc-950/80 z-10 backdrop-blur border-b border-white/5">
            <div class="w-1.5 h-1.5 rounded-full bg-zinc-800 border border-zinc-600"></div>
            <h3 class="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Archived</h3>
            <span class="ml-auto text-[9px] px-1.5 py-0.5 border border-zinc-800 rounded text-zinc-500 font-mono">{{ taskCounts().done }}</span>
          </div>
          <div class="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
            @for (task of doneTasks(); track task.id) {
               <div (click)="taskClick.emit(task)" class="opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all animate-done">
                 <app-task-card [task]="task" />
               </div>
            }
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    @keyframes enter { 
      from { opacity: 0; transform: translateY(10px) scale(0.98); } 
      to { opacity: 1; transform: translateY(0) scale(1); } 
    }
    .animate-enter { animation: enter 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }
    
    @keyframes doneFlash {
      0% { opacity: 0; transform: scale(1.05); filter: brightness(2); }
      100% { opacity: 0.6; transform: scale(1); filter: brightness(1); }
    }
    .animate-done { animation: doneFlash 0.5s ease-out; }
  `]
})
export class KanbanBoardComponent {
  project = input.required<Project>();
  taskClick = output<Task>();
  
  private projectService = inject(ProjectService);
  
  sortBy = signal<SortOption>('smart');
  dragOverColumn = signal<TaskStatus | null>(null);

  getSortBtnClass(option: SortOption) {
      const active = this.sortBy() === option;
      return active 
        ? 'px-3 py-1 text-[9px] font-bold uppercase tracking-wide bg-zinc-700 text-white rounded shadow-sm transition-all'
        : 'px-3 py-1 text-[9px] font-medium uppercase tracking-wide text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded transition-all';
  }

  // Robust Sorting Function
  private sortTasks(tasks: Task[]) {
    const sort = this.sortBy();
    const pMap = { high: 3, medium: 2, low: 1 };
    
    return [...tasks].sort((a, b) => {
        if (sort === 'priority') {
            return pMap[b.priority] - pMap[a.priority];
        } 
        
        else if (sort === 'date') {
            // Sort by EndDate. If missing, treat as "Far Future" (bottom of list)
            const dateA = a.endDate ? new Date(a.endDate).getTime() : 8640000000000000;
            const dateB = b.endDate ? new Date(b.endDate).getTime() : 8640000000000000;
            return dateA - dateB;
        } 
        
        else if (sort === 'created') {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } 
        
        else if (sort === 'smart') {
            // Smart Sort: High Priority First, then overdue/soonest due date
            if (pMap[b.priority] !== pMap[a.priority]) {
                return pMap[b.priority] - pMap[a.priority];
            }
            const dateA = a.endDate ? new Date(a.endDate).getTime() : 8640000000000000;
            const dateB = b.endDate ? new Date(b.endDate).getTime() : 8640000000000000;
            return dateA - dateB;
        }
        
        return 0;
    });
  }

  // Computed signals
  todoTasks = computed(() => this.sortTasks(this.project().tasks.filter(t => t.status === 'todo')));
  inProgressTasks = computed(() => this.sortTasks(this.project().tasks.filter(t => t.status === 'in-progress')));
  doneTasks = computed(() => this.sortTasks(this.project().tasks.filter(t => t.status === 'done')));

  taskCounts = computed(() => ({
      todo: this.todoTasks().length,
      inProgress: this.inProgressTasks().length,
      done: this.doneTasks().length,
      total: this.project().tasks.length
  }));

  onDragOver(event: DragEvent, column: TaskStatus) {
    event.preventDefault(); 
    event.dataTransfer!.dropEffect = 'move';
    this.dragOverColumn.set(column);
  }

  onDragLeave(event: DragEvent) {
     const target = event.target as HTMLElement;
     const related = event.relatedTarget as HTMLElement;
     // Simple check to prevent flicker when dragging over children
     if (target.contains(related)) return; 
     this.dragOverColumn.set(null);
  }

  onDrop(event: DragEvent, newStatus: TaskStatus) {
    event.preventDefault();
    this.dragOverColumn.set(null);
    const taskId = event.dataTransfer?.getData('text/plain');
    if (taskId) {
      this.projectService.updateTaskStatus(this.project().id, taskId, newStatus);
    }
  }
}
