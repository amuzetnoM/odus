import { Component, input, output, inject, computed, signal, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService, Task, TaskStatus } from '../services/project.service';
import { DriveService, DriveFile } from '../services/drive.service';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" (click)="close.emit()">
      <div 
        class="w-full max-w-4xl bg-zinc-950/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl flex flex-col h-[85vh] overflow-hidden animate-scale-in relative" 
        (click)="$event.stopPropagation()">
        
        <!-- Decoration -->
        <div class="absolute -top-32 -right-32 w-64 h-64 bg-zinc-800/30 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Header -->
        <div class="p-6 border-b border-white/5 flex justify-between items-start gap-4 shrink-0 bg-white/5 relative z-10">
           <div class="flex-1 min-w-0">
             <input 
               [ngModel]="task().title"
               (ngModelChange)="updateTitle($event)"
               class="bg-transparent text-xl sm:text-2xl font-extralight tracking-tight text-white w-full focus:outline-none placeholder:text-zinc-700"
               placeholder="Artifact Name"
             />
             <div class="mt-2 flex gap-3 items-center text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
               <span class="bg-zinc-900 px-1.5 py-0.5 rounded border border-white/5">{{ task().id.substring(0,8) }}</span>
               <span>Created {{ task().createdAt | date:'mediumDate' }}</span>
             </div>
           </div>
           
           <div class="flex items-center gap-2">
               <button 
                 (click)="deleteTask()"
                 class="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-950/30 rounded transition-colors"
                 title="Delete Artifact">
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
               </button>
               <div class="w-px h-6 bg-white/10 mx-1"></div>
               <button (click)="close.emit()" class="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded">
                 <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"></path></svg>
               </button>
           </div>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8 custom-scrollbar relative z-10">
           
           <!-- Main Content -->
           <div class="flex-1 space-y-8 min-w-0">
              
              <!-- Tags -->
              <div>
                 <label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Classifications</label>
                 <div class="flex flex-wrap gap-2">
                    @for (tag of task().tags || []; track tag) {
                       <span class="inline-flex items-center gap-1.5 bg-zinc-900/80 border border-white/10 px-2.5 py-1 rounded text-[10px] text-zinc-300 uppercase tracking-wide group hover:border-white/30 transition-colors">
                          {{ tag }}
                          <button (click)="removeTag(tag)" class="text-zinc-600 hover:text-red-400 ml-1">×</button>
                       </span>
                    }
                    <div class="relative flex items-center">
                        <span class="absolute left-2 text-zinc-600 text-[10px]">+</span>
                        <input 
                        #tagInput
                        (keydown.enter)="addTag(tagInput)"
                        class="bg-zinc-900/50 border border-white/5 rounded pl-6 pr-2 py-1 text-[10px] text-zinc-400 focus:outline-none focus:border-white/20 focus:text-white uppercase tracking-wide w-24 focus:w-32 transition-all"
                        placeholder="TAG"
                        />
                    </div>
                 </div>
              </div>

              <!-- Description -->
              <div class="flex flex-col">
                <label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Detailed Specifications</label>
                <div class="relative group">
                    <textarea 
                    [ngModel]="task().description"
                    (ngModelChange)="updateDesc($event)"
                    class="w-full bg-zinc-900/30 border border-white/5 rounded-lg p-4 text-zinc-300 text-sm font-light focus:bg-zinc-900/80 focus:border-white/20 focus:outline-none resize-none leading-relaxed field-sizing-content min-h-[150px]"
                    placeholder="Enter detailed task requirements, acceptance criteria, and notes..."
                    ></textarea>
                </div>
              </div>

              <!-- Attachments -->
              <div>
                <label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex justify-between items-center">
                   <span>Linked Data</span>
                   <button class="text-zinc-400 hover:text-white transition-colors text-[10px] font-bold bg-white/5 border border-white/5 px-3 py-1 rounded hover:bg-white/10" (click)="attachDummyFile()">+ LINK</button>
                </label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   @for (file of taskFiles(); track file.id) {
                     <div class="flex items-center gap-3 p-3 bg-zinc-900/50 border border-white/5 rounded hover:border-white/20 transition-colors group cursor-pointer hover:bg-zinc-900">
                        <div class="w-10 h-10 rounded bg-black/40 flex items-center justify-center text-[10px] font-mono text-zinc-400 border border-white/5">{{ file.type }}</div>
                        <div class="flex-1 min-w-0">
                             <div class="text-xs text-zinc-200 font-light truncate group-hover:text-white">{{ file.name }}</div>
                             <div class="text-[9px] text-zinc-600 font-mono">{{ file.sizeStr }}</div>
                        </div>
                     </div>
                   } @empty {
                     <div class="col-span-full py-6 text-xs text-zinc-600 font-light italic border border-dashed border-zinc-800 rounded text-center">
                        No data linked to this artifact.
                     </div>
                   }
                </div>
              </div>
           </div>

           <!-- Sidebar Controls -->
           <div class="w-full md:w-72 shrink-0 space-y-8 md:border-l md:border-white/5 md:pl-8 pb-6">
              
              <!-- Status -->
              <div>
                 <label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Lifecycle State</label>
                 <div class="flex flex-col gap-2">
                    @for(s of ['todo', 'in-progress', 'done']; track s) {
                        <button 
                          (click)="updateStatus(s)"
                          class="relative w-full text-left px-4 py-3 rounded border transition-all flex items-center justify-between group overflow-hidden"
                          [class.border-white_20]="task().status === s"
                          [class.bg-white_10]="task().status === s"
                          [class.border-zinc-800]="task().status !== s"
                          [class.text-zinc-500]="task().status !== s"
                          [class.hover-border-zinc-600]="task().status !== s"
                        >
                            <span class="relative z-10 text-xs font-medium uppercase tracking-wider" [class.text-white]="task().status === s">
                                {{ s === 'todo' ? 'Pending' : (s === 'in-progress' ? 'Active' : 'Archived') }}
                            </span>
                            @if(task().status === s) {
                                <div class="w-2 h-2 rounded-full" [class.bg-zinc-400]="s==='todo'" [class.bg-white]="s==='in-progress'" [class.bg-zinc-600]="s==='done'"></div>
                            }
                        </button>
                    }
                 </div>
              </div>

              <!-- Priority -->
              <div>
                 <label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Priority Level</label>
                 <div class="flex bg-zinc-900/50 p-1 rounded-lg border border-white/5">
                    @for (p of ['low', 'medium', 'high']; track p) {
                       <button 
                         (click)="updatePriority(p)"
                         [class.bg-zinc-700]="task().priority === p"
                         [class.text-white]="task().priority === p"
                         [class.text-zinc-500]="task().priority !== p"
                         [class.shadow-lg]="task().priority === p"
                         class="flex-1 py-1.5 rounded text-[10px] uppercase tracking-wider transition-all">
                         {{ p }}
                       </button>
                    }
                 </div>
              </div>

              <!-- Dates -->
              <div>
                 <label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Timeline</label>
                 <div class="space-y-3 bg-zinc-900/30 p-3 rounded border border-white/5">
                    <div>
                        <span class="text-[9px] text-zinc-500 block mb-1">Start Date</span>
                        <input type="date" [ngModel]="task().startDate" (ngModelChange)="updateDate('startDate', $event)" class="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-600 font-mono uppercase" />
                    </div>
                    <div>
                        <span class="text-[9px] text-zinc-500 block mb-1">Due Date</span>
                        <input type="date" [ngModel]="task().endDate" (ngModelChange)="updateDate('endDate', $event)" class="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-600 font-mono uppercase" />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    .animate-scale-in { animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
    .field-sizing-content { field-sizing: content; }
  `]
})
export class TaskDetailComponent {
  task = input.required<Task>();
  projectId = input.required<string>();
  
  close = output();
  
  projectService = inject(ProjectService);
  driveService = inject(DriveService);

  taskFiles = computed(() => {
    const ids = this.task().attachmentIds || [];
    return this.driveService.files().filter(f => ids.includes(f.id));
  });

  updateTitle(title: string) { this.projectService.updateTask(this.projectId(), this.task().id, { title }); }
  updateDesc(description: string) { this.projectService.updateTask(this.projectId(), this.task().id, { description }); }
  updateStatus(status: any) { this.projectService.updateTask(this.projectId(), this.task().id, { status }); }
  updatePriority(priority: any) { this.projectService.updateTask(this.projectId(), this.task().id, { priority }); }
  updateDate(field: 'startDate' | 'endDate', value: string) { this.projectService.updateTask(this.projectId(), this.task().id, { [field]: value }); }

  addTag(input: HTMLInputElement) {
      const val = input.value.trim().toUpperCase();
      if (!val) return;
      const currentTags = this.task().tags || [];
      if (!currentTags.includes(val)) {
          this.projectService.updateTask(this.projectId(), this.task().id, { tags: [...currentTags, val] });
      }
      input.value = '';
      input.focus();
  }

  removeTag(tag: string) {
      const currentTags = this.task().tags || [];
      this.projectService.updateTask(this.projectId(), this.task().id, { tags: currentTags.filter(t => t !== tag) });
  }

  // FIX: `createDummyFile` is async, so we must await its result.
  async attachDummyFile() {
    const file = await this.driveService.createDummyFile();
    const ids = [...(this.task().attachmentIds || []), file.id];
    this.projectService.updateTask(this.projectId(), this.task().id, { attachmentIds: ids });
  }

  deleteTask() {
      if (confirm('Permanently delete this artifact?')) {
          this.projectService.deleteTask(this.projectId(), this.task().id);
          this.close.emit();
      }
  }
}
