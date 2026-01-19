
import { Component, input, output, inject, computed, signal, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService, Task, TaskStatus } from '../services/project.service';
import { DriveService, DriveFile } from '../services/drive.service';
import { TimeTrackingService } from '../services/time-tracking.service';

type Tab = 'details' | 'comments' | 'time';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" (click)="close.emit()">
      <div 
        class="w-full max-w-5xl bg-zinc-950/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl flex flex-col h-[90vh] overflow-hidden animate-scale-in relative" 
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
               <!-- Tabs Toggle -->
               <div class="bg-zinc-900 p-0.5 rounded-lg border border-white/5 flex mr-4">
                  <button (click)="activeTab.set('details')" [class.bg-zinc-700]="activeTab() === 'details'" class="px-3 py-1 text-xs rounded transition-colors text-zinc-400" [class.text-white]="activeTab() === 'details'">Details</button>
                  <button (click)="activeTab.set('time')" [class.bg-zinc-700]="activeTab() === 'time'" class="px-3 py-1 text-xs rounded transition-colors text-zinc-400" [class.text-white]="activeTab() === 'time'">
                     Time <span class="ml-1 opacity-50">{{ formatDuration(totalTime()) }}</span>
                  </button>
                  <button (click)="activeTab.set('comments')" [class.bg-zinc-700]="activeTab() === 'comments'" class="px-3 py-1 text-xs rounded transition-colors text-zinc-400" [class.text-white]="activeTab() === 'comments'">
                     Discuss <span class="ml-1 opacity-50">{{ task().comments?.length || 0 }}</span>
                  </button>
               </div>

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
        <div class="flex-1 overflow-y-auto custom-scrollbar relative z-10 flex flex-col">
           @if (activeTab() === 'details') {
               <div class="p-6 flex flex-col md:flex-row gap-8">
                   <!-- Main Content -->
                   <div class="flex-1 space-y-8 min-w-0">
                      
                      <!-- Tags -->
                      <div>
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
        
                      <!-- Markdown Description -->
                      <div class="flex flex-col">
                        <div class="flex justify-between items-center mb-2">
                           <label class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Specifications</label>
                           <div class="flex gap-2">
                               @if(!showPreview()) {
                                  <div class="flex bg-zinc-900 rounded border border-white/5 p-0.5 gap-0.5">
                                      <button (click)="insertMarkdown('**', '**')" class="w-5 h-5 flex items-center justify-center text-[10px] text-zinc-400 hover:text-white hover:bg-white/10 rounded font-bold" title="Bold">B</button>
                                      <button (click)="insertMarkdown('_', '_')" class="w-5 h-5 flex items-center justify-center text-[10px] text-zinc-400 hover:text-white hover:bg-white/10 rounded italic" title="Italic">I</button>
                                      <button (click)="insertMarkdown('- ')" class="w-5 h-5 flex items-center justify-center text-[10px] text-zinc-400 hover:text-white hover:bg-white/10 rounded" title="List">•</button>
                                      <button (click)="insertMarkdown('\`', '\`')" class="w-5 h-5 flex items-center justify-center text-[10px] text-zinc-400 hover:text-white hover:bg-white/10 rounded font-mono" title="Code">&lt;&gt;</button>
                                  </div>
                               }
                               <button (click)="showPreview.set(!showPreview())" class="text-[10px] text-zinc-400 hover:text-white uppercase tracking-wider px-2 py-0.5 rounded border border-transparent hover:border-white/10">
                                  {{ showPreview() ? 'Edit' : 'Preview' }}
                               </button>
                           </div>
                        </div>
                        
                        <div class="relative group min-h-[200px] border border-white/5 rounded-lg overflow-hidden bg-zinc-900/30">
                            @if(!showPreview()) {
                                <textarea 
                                  #descInput
                                  [ngModel]="task().description"
                                  (ngModelChange)="updateDesc($event)"
                                  class="w-full h-full bg-transparent p-4 text-zinc-300 text-sm font-light focus:bg-zinc-900/80 focus:outline-none resize-y leading-relaxed font-mono min-h-[200px]"
                                  placeholder="Use Markdown to describe task..."
                                ></textarea>
                            } @else {
                                <div class="p-4 prose prose-invert prose-sm max-w-none h-full overflow-y-auto" [innerHTML]="parsedDescription()"></div>
                            }
                        </div>
                      </div>
                      
                      <!-- Dependencies & Blockers -->
                      <div>
                          <label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Blockers & Dependencies</label>
                          <div class="bg-zinc-900/30 border border-white/5 rounded-lg p-3 space-y-3">
                              @if (taskDependencies().length) {
                                  <div class="space-y-2">
                                      @for (dep of taskDependencies(); track dep.id) {
                                          <div class="flex items-center justify-between p-2 bg-zinc-950/50 border border-white/5 rounded text-xs">
                                              <span class="flex items-center gap-2">
                                                  <span class="w-1.5 h-1.5 rounded-full" [class.bg-green-500]="dep.status === 'done'" [class.bg-zinc-500]="dep.status !== 'done'"></span>
                                                  <span class="text-zinc-300">{{ dep.title }}</span>
                                              </span>
                                              <button (click)="removeDependency(dep.id)" class="text-zinc-600 hover:text-red-400">×</button>
                                          </div>
                                      }
                                  </div>
                              }
                              
                              <div class="flex gap-2 items-center h-8">
                                  @if (!isCreatingDep()) {
                                      <select #depSelect class="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-400 focus:outline-none focus:border-zinc-600 h-full">
                                          <option value="">Select existing task...</option>
                                          @for (t of availableDependencies(); track t.id) {
                                              <option [value]="t.id">{{ t.title }}</option>
                                          }
                                      </select>
                                      <button (click)="addDependency(depSelect.value); depSelect.value=''" [disabled]="!depSelect.value" class="px-3 h-full bg-white/5 hover:bg-white/10 border border-white/5 rounded text-xs text-zinc-300 uppercase font-bold transition-colors disabled:opacity-50">Link</button>
                                      <div class="w-px h-4 bg-white/10 mx-1"></div>
                                      <button (click)="isCreatingDep.set(true)" class="px-3 h-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded text-xs text-indigo-400 uppercase font-bold transition-colors whitespace-nowrap" title="Create New Dependency">+ New</button>
                                  } @else {
                                      <input 
                                          [ngModel]="newDepTitle()" 
                                          (ngModelChange)="newDepTitle.set($event)" 
                                          (keydown.enter)="createDependency()"
                                          (keydown.escape)="isCreatingDep.set(false)"
                                          class="flex-1 bg-zinc-950 border border-indigo-500/50 rounded px-2 py-1.5 text-xs text-white focus:outline-none placeholder:text-zinc-600 h-full"
                                          placeholder="New task title..."
                                          autofocus
                                      />
                                      <button (click)="createDependency()" class="px-3 h-full bg-indigo-600 text-white rounded text-xs font-bold uppercase transition-colors hover:bg-indigo-500">Create</button>
                                      <button (click)="isCreatingDep.set(false)" class="px-2 h-full text-zinc-500 hover:text-white">✕</button>
                                  }
                              </div>
                          </div>
                      </div>
        
                      <!-- Attachments -->
                      <div>
                        <div class="flex justify-between items-center mb-3">
                           <label class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Linked Data</label>
                           <div class="flex gap-2 items-center">
                               <div class="flex bg-zinc-900 border border-zinc-800 rounded p-0.5">
                                   <select #fileSelect class="bg-transparent text-[10px] text-zinc-400 focus:outline-none w-32 px-1">
                                       <option value="">Select from Vault...</option>
                                       @for(f of availableFiles(); track f.id) {
                                           <option [value]="f.id">{{ f.name }}</option>
                                       }
                                   </select>
                                   <button (click)="attachFile(fileSelect.value); fileSelect.value=''" class="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[10px] rounded hover:bg-zinc-700 disabled:opacity-50" [disabled]="!fileSelect.value">LINK</button>
                               </div>
                               
                               <span class="text-zinc-700 text-[10px]">OR</span>
                               
                               <label class="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-1 rounded text-[10px] text-zinc-300 hover:text-white uppercase font-bold transition-colors flex items-center gap-1">
                                   <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                   Upload
                                   <input type="file" class="hidden" (change)="onFileUpload($event)">
                               </label>
                           </div>
                        </div>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                           @for (file of taskFiles(); track file.id) {
                             <div class="flex items-center gap-3 p-3 bg-zinc-900/50 border border-white/5 rounded hover:border-white/20 transition-colors group cursor-pointer hover:bg-zinc-900 relative">
                                <div class="w-10 h-10 rounded bg-black/40 flex items-center justify-center text-[10px] font-mono text-zinc-400 border border-white/5">{{ file.type }}</div>
                                <div class="flex-1 min-w-0">
                                     <div class="text-xs text-zinc-200 font-light truncate group-hover:text-white">{{ file.name }}</div>
                                     <div class="text-[9px] text-zinc-600 font-mono">{{ file.sizeStr }}</div>
                                </div>
                                <button (click)="$event.stopPropagation(); detachFile(file.id)" class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400">×</button>
                             </div>
                           } @empty {
                             <div class="col-span-full py-4 text-xs text-zinc-700 font-light italic border border-dashed border-zinc-800 rounded text-center">
                                No data linked.
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
           }
           
           @if (activeTab() === 'time') {
               <div class="p-6 space-y-6">
                  <!-- Timer Control -->
                  <div class="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
                     <div class="flex items-center justify-between mb-4">
                        <h3 class="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Time Tracker</h3>
                        @if (isTimerActive()) {
                           <div class="flex items-center gap-2">
                              <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              <span class="text-xs text-zinc-400">Tracking</span>
                           </div>
                        }
                     </div>
                     
                     @if (isTimerActive()) {
                        <div class="text-center mb-4">
                           <div class="text-4xl font-light text-white font-mono mb-2">
                              {{ formatDuration(timeTracking.currentDuration()) }}
                           </div>
                           <p class="text-sm text-zinc-400">Active session</p>
                        </div>
                        <div class="flex gap-3">
                           <button 
                              (click)="stopTimer()"
                              class="flex-1 px-4 py-3 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-lg transition-colors">
                              Stop Timer
                           </button>
                           <button 
                              (click)="cancelTimer()"
                              class="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-lg transition-colors">
                              Cancel
                           </button>
                        </div>
                     } @else {
                        <button 
                           (click)="startTimer()"
                           class="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                           <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                           </svg>
                           Start Timer
                        </button>
                     }
                  </div>

                  <!-- Total Time -->
                  <div class="bg-zinc-900/50 border border-white/10 rounded-xl p-6 text-center">
                     <div class="text-xs text-zinc-500 uppercase tracking-wider mb-2">Total Time Tracked</div>
                     <div class="text-3xl font-light text-white">{{ formatDuration(totalTime()) }}</div>
                  </div>

                  <!-- Time Logs -->
                  <div class="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
                     <h3 class="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Activity Log</h3>
                     <div class="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                        @for (log of timeLogs(); track log.id) {
                           <div class="flex items-center justify-between p-3 bg-zinc-950/30 rounded border border-white/5">
                              <div>
                                 <div class="text-sm text-zinc-200">{{ formatDate(log.startTime) }}</div>
                                 @if (log.description) {
                                    <div class="text-xs text-zinc-500 mt-1">{{ log.description }}</div>
                                 }
                              </div>
                              <div class="flex items-center gap-3">
                                 <div class="text-sm text-zinc-300 font-mono">{{ formatDuration(log.duration || 0) }}</div>
                                 <button 
                                    (click)="deleteTimeLog(log.id)"
                                    class="text-zinc-600 hover:text-red-400 transition-colors">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                 </button>
                              </div>
                           </div>
                        } @empty {
                           <div class="text-center py-12 text-zinc-500 text-sm">
                              No time logs yet. Start tracking to see activity.
                           </div>
                        }
                     </div>
                  </div>
               </div>
           }

           @if (activeTab() === 'comments') {
               <div class="flex flex-col h-full p-6">
                   <div class="flex-1 overflow-y-auto space-y-6 pr-2 mb-4 custom-scrollbar">
                       @for (comment of task().comments || []; track comment.id) {
                           <div class="flex gap-4">
                               <img [src]="comment.userAvatar" class="w-8 h-8 rounded-full bg-zinc-800 object-cover border border-white/10 shrink-0" />
                               <div class="flex-1 bg-zinc-900/40 p-3 rounded-lg border border-white/5">
                                   <div class="flex justify-between items-baseline mb-1">
                                       <span class="text-xs font-bold text-zinc-300">{{ comment.userName }}</span>
                                       <span class="text-[9px] text-zinc-600 font-mono">{{ comment.createdAt | date:'short' }}</span>
                                   </div>
                                   <p class="text-sm text-zinc-400 font-light leading-relaxed">{{ comment.text }}</p>
                               </div>
                           </div>
                       } @empty {
                           <div class="text-center py-12 opacity-30">
                               <p class="text-xs font-mono uppercase text-zinc-500">No discussions yet.</p>
                           </div>
                       }
                   </div>
                   
                   <div class="flex gap-3 items-end pt-4 border-t border-white/5 shrink-0">
                       <textarea 
                         #commentInput
                         class="flex-1 bg-zinc-900 border border-zinc-800 rounded p-3 text-sm text-zinc-300 focus:outline-none focus:border-zinc-600 resize-none h-20"
                         placeholder="Add a comment..."
                         (keydown.enter.prevent)="postComment(commentInput)"
                       ></textarea>
                       <button (click)="postComment(commentInput)" class="h-10 px-4 bg-white text-black text-xs font-bold uppercase tracking-widest rounded hover:bg-zinc-200 transition-colors">Post</button>
                   </div>
               </div>
           }
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    .animate-scale-in { animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
  `]
})
export class TaskDetailComponent {
  task = input.required<Task>();
  projectId = input.required<string>();
  close = output();
  
  projectService = inject(ProjectService);
  driveService = inject(DriveService);
  timeTracking = inject(TimeTrackingService);

  activeTab = signal<Tab>('details');
  showPreview = signal(false);
  descInput = viewChild<ElementRef>('descInput');
  
  // Create Dependency State
  isCreatingDep = signal(false);
  newDepTitle = signal('');

  // --- Computed ---
  taskFiles = computed(() => {
    const ids = this.task().attachmentIds || [];
    return this.driveService.files().filter(f => ids.includes(f.id));
  });

  availableFiles = computed(() => {
    const attached = this.task().attachmentIds || [];
    return this.driveService.files().filter(f => !attached.includes(f.id));
  });

  project = computed(() => this.projectService.projects().find(p => p.id === this.projectId()));
  
  availableDependencies = computed(() => {
      const p = this.project();
      if (!p) return [];
      const currentDeps = this.task().dependencyIds || [];
      return p.tasks.filter(t => t.id !== this.task().id && !currentDeps.includes(t.id));
  });

  taskDependencies = computed(() => {
      const p = this.project();
      if (!p) return [];
      const currentDeps = this.task().dependencyIds || [];
      return p.tasks.filter(t => currentDeps.includes(t.id));
  });

  parsedDescription = computed(() => {
      const raw = this.task().description || '';
      return this.parseMarkdown(raw);
  });

  timeLogs = computed(() => {
    return this.timeTracking.getLogsForTask(this.task().id);
  });

  totalTime = computed(() => {
    return this.timeTracking.getTotalTimeForTask(this.task().id);
  });

  isTimerActive = computed(() => {
    const timer = this.timeTracking.activeTimer();
    return timer?.taskId === this.task().id;
  });

  // --- Actions ---

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

  deleteTask() {
      if (confirm('Permanently delete this artifact?')) {
          this.projectService.deleteTask(this.projectId(), this.task().id);
          this.close.emit();
      }
  }

  // --- Attachments ---
  attachFile(fileId: string) {
      if (!fileId) return;
      const ids = [...(this.task().attachmentIds || []), fileId];
      this.projectService.updateTask(this.projectId(), this.task().id, { attachmentIds: ids });
  }

  detachFile(fileId: string) {
      const ids = (this.task().attachmentIds || []).filter(id => id !== fileId);
      this.projectService.updateTask(this.projectId(), this.task().id, { attachmentIds: ids });
  }
  
  async onFileUpload(event: Event) {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files[0]) {
          const file = await this.driveService.addFile(input.files[0]);
          this.attachFile(file.id);
      }
  }

  // --- Dependencies ---
  addDependency(targetId: string) {
      if (!targetId) return;
      const ids = [...(this.task().dependencyIds || []), targetId];
      this.projectService.updateTask(this.projectId(), this.task().id, { dependencyIds: ids });
  }

  removeDependency(targetId: string) {
      const ids = (this.task().dependencyIds || []).filter(id => id !== targetId);
      this.projectService.updateTask(this.projectId(), this.task().id, { dependencyIds: ids });
  }
  
  createDependency() {
      const title = this.newDepTitle().trim();
      if(!title) return;
      
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 3);

      // Add task to current project
      const newTask = this.projectService.addTask(this.projectId(), {
          title,
          description: `Dependency for ${this.task().title}`,
          status: 'todo',
          priority: 'medium',
          startDate: today.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
      });

      // Link it
      this.addDependency(newTask.id);
      
      // Reset
      this.newDepTitle.set('');
      this.isCreatingDep.set(false);
  }

  // --- Comments ---
  postComment(input: HTMLTextAreaElement) {
      const text = input.value.trim();
      if (!text) return;
      this.projectService.addComment(this.projectId(), this.task().id, text);
      input.value = '';
  }

  // --- Markdown Helper ---
  insertMarkdown(prefix: string, suffix: string = '') {
      const textarea = this.descInput()?.nativeElement;
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const selection = text.substring(start, end);
      const after = text.substring(end);
      
      const newText = before + prefix + selection + suffix + after;
      this.updateDesc(newText);
      
      // Restore focus
      setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + prefix.length, end + prefix.length);
      });
  }

  parseMarkdown(text: string): string {
      if (!text) return '';
      
      let html = text
          // Headers
          .replace(/^### (.*$)/gim, '<h3 class="text-lg font-medium text-white mb-2 mt-4">$1</h3>')
          .replace(/^## (.*$)/gim, '<h2 class="text-xl font-light text-white mb-3 mt-6">$1</h2>')
          .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-light text-white mb-4 mt-6 border-b border-white/10 pb-2">$1</h1>')
          // Bold and Italic
          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em class="text-zinc-400 italic">$1</em>')
          .replace(/_(.*?)_/g, '<em class="text-zinc-400 italic">$1</em>')
          // Code
          .replace(/`(.*?)`/g, '<code class="bg-zinc-800 text-zinc-300 px-1 rounded font-mono text-xs">$1</code>')
          // Lists
          .replace(/^\s*[-*+] (.*$)/gim, '<li class="ml-4 list-disc text-zinc-300 mb-1">$1</li>')
          .replace(/^\s*\d+\. (.*$)/gim, '<li class="ml-4 list-decimal text-zinc-300 mb-1">$1</li>')
          // Line breaks
          .replace(/\n\n/g, '</p><p class="mb-3">')
          .replace(/\n/g, '<br />');
      
      // Wrap in paragraph if not already wrapped
      if (!html.startsWith('<')) {
          html = '<p class="mb-3">' + html + '</p>';
      }
      
      return html;
  }

  // --- Time Tracking ---
  startTimer() {
    this.timeTracking.startTimer(this.task().id, this.projectId(), this.task().title);
  }

  stopTimer() {
    this.timeTracking.stopTimer();
  }

  cancelTimer() {
    this.timeTracking.cancelTimer();
  }

  deleteTimeLog(logId: string) {
    if (confirm('Delete this time log?')) {
      this.timeTracking.deleteLog(logId);
    }
  }

  formatDuration(seconds: number): string {
    return this.timeTracking.formatDuration(seconds);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString();
  }
}
