
import { Component, inject, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService, Task } from '../../services/project.service';
import { GeminiService } from '../../services/gemini.service';

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full flex flex-col p-4 sm:p-6 relative">
      <div class="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
         <h2 class="text-xl font-light tracking-widest text-white uppercase">Timeline</h2>
         <div class="flex gap-2 items-center">
            <button (click)="changeMonth(-1)" class="p-2 hover:bg-white/5 rounded text-zinc-500 hover:text-white transition-colors"><</button>
            <span class="text-sm font-mono text-zinc-300 w-32 text-center uppercase">{{ currentMonth() | date:'MMMM yyyy' }}</span>
            <button (click)="changeMonth(1)" class="p-2 hover:bg-white/5 rounded text-zinc-500 hover:text-white transition-colors">></button>
         </div>
      </div>

      <div class="flex-1 bg-zinc-900/10 border border-white/5 rounded-lg overflow-hidden flex flex-col backdrop-blur-sm shadow-xl">
         <!-- Week Header -->
         <div class="grid grid-cols-7 border-b border-white/5 bg-zinc-900/20">
            @for(day of ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; track day) {
                <div class="p-3 text-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{{ day }}</div>
            }
         </div>
         
         <!-- Days Grid -->
         <div class="flex-1 grid grid-cols-7 grid-rows-5 md:grid-rows-6 divide-x divide-y divide-white/5">
             @for (day of calendarDays(); track $index) {
                <div 
                   (click)="openDay(day)"
                   class="min-h-[80px] p-2 relative group hover:bg-white/5 transition-colors cursor-pointer flex flex-col gap-1"
                   [class.bg-zinc-950_30]="!day.isCurrentMonth">
                   <div class="flex justify-between items-start">
                       <span 
                          class="text-[10px] font-mono block w-6 h-6 flex items-center justify-center rounded-full"
                          [class.text-zinc-400]="day.isCurrentMonth"
                          [class.text-zinc-800]="!day.isCurrentMonth"
                          [class.bg-white]="day.isToday"
                          [class.text-black]="day.isToday">
                          {{ day.date | date:'d' }}
                       </span>
                       
                       <!-- Indicators -->
                       <div class="flex gap-0.5">
                           @if(day.startingCount) { <div class="w-1.5 h-1.5 bg-green-500 rounded-full" title="Starts"></div> }
                           @if(day.dueCount) { <div class="w-1.5 h-1.5 bg-red-500 rounded-full" title="Due"></div> }
                       </div>
                   </div>
                   
                   <div class="space-y-0.5 mt-1">
                      @for (task of day.previewTasks; track task.id) {
                         <div class="h-1 rounded-full w-full" 
                             [class.bg-zinc-700]="task.status === 'todo'"
                             [class.bg-white]="task.status === 'in-progress'"
                             [class.bg-zinc-800]="task.status === 'done'"
                         ></div>
                      }
                   </div>
                </div>
             }
         </div>
      </div>

      <!-- Super Glass Popup -->
      @if (selectedDay(); as day) {
          <div class="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" (click)="selectedDay.set(null)">
             <div class="w-full max-w-lg bg-zinc-900/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6 relative overflow-hidden" (click)="$event.stopPropagation()">
                 
                 <!-- Header -->
                 <div class="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
                    <div>
                        <h3 class="text-2xl font-light text-white">{{ day.date | date:'EEEE, MMMM d' }}</h3>
                        <p class="text-xs text-zinc-500 font-mono mt-1">Daily Intelligence Briefing</p>
                    </div>
                    <button (click)="selectedDay.set(null)" class="text-zinc-500 hover:text-white">✕</button>
                 </div>

                 <!-- Content -->
                 <div class="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                     
                     <!-- AI Summary -->
                     <div class="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 p-4 rounded-lg border border-white/5">
                        <div class="flex items-center gap-2 mb-2">
                           <div class="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                           <span class="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">AI Analysis</span>
                        </div>
                        <p class="text-xs text-zinc-300 leading-relaxed font-light">
                           {{ getDayAnalysis(day) }}
                        </p>
                     </div>

                     <!-- Sections -->
                     <div class="space-y-4">
                        @if (day.starting.length) {
                           <div>
                              <h4 class="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-2">Kickoff ({{ day.starting.length }})</h4>
                              <div class="space-y-2">
                                 @for (t of day.starting; track t.id) {
                                    <div class="p-2 bg-zinc-950/50 rounded border border-white/5 flex justify-between items-center">
                                       <span class="text-xs text-white">{{ t.title }}</span>
                                       <span class="text-[9px] text-zinc-500 bg-zinc-900 px-1 rounded border border-zinc-800">{{ t.projectTitle }}</span>
                                    </div>
                                 }
                              </div>
                           </div>
                        }

                        @if (day.due.length) {
                           <div>
                              <h4 class="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2">Deadlines ({{ day.due.length }})</h4>
                              <div class="space-y-2">
                                 @for (t of day.due; track t.id) {
                                    <div class="p-2 bg-red-900/10 rounded border border-red-500/20 flex justify-between items-center">
                                       <span class="text-xs text-red-100">{{ t.title }}</span>
                                       <span class="text-[9px] text-red-300/50 uppercase">Due Today</span>
                                    </div>
                                 }
                              </div>
                           </div>
                        }
                        
                        @if (day.ongoing.length) {
                           <div>
                              <h4 class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">In Flight ({{ day.ongoing.length }})</h4>
                              <div class="space-y-1 opacity-60">
                                 @for (t of day.ongoing; track t.id) {
                                     <div class="text-[10px] text-zinc-400 truncate">• {{ t.title }}</div>
                                 }
                              </div>
                           </div>
                        }

                        @if (!day.starting.length && !day.due.length && !day.ongoing.length) {
                            <div class="text-center py-8 opacity-30">
                                <span class="text-xs font-mono uppercase">No activity scheduled</span>
                            </div>
                        }
                     </div>
                 </div>
             </div>
          </div>
      }
    </div>
  `,
  styles: [`
     @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
     .animate-fade-in { animation: fadeIn 0.2s ease-out; }
  `]
})
export class CalendarViewComponent {
  projectService = inject(ProjectService);
  geminiService = inject(GeminiService);
  
  currentDate = signal(new Date());
  selectedDay = signal<any>(null);

  currentMonth = computed(() => this.currentDate());

  calendarDays = computed(() => {
    const year = this.currentDate().getFullYear();
    const month = this.currentDate().getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay(); 
    const daysInMonth = lastDay.getDate();
    
    // Algorithm Optimization: Pre-process tasks into a Map
    const taskMap = new Map<string, {starting: any[], due: any[], ongoing: any[]}>();
    const tasks = this.projectService.allTasks();
    
    // Single pass over tasks O(N)
    for (const t of tasks) {
        if (t.startDate) {
           if (!taskMap.has(t.startDate)) taskMap.set(t.startDate, {starting: [], due: [], ongoing: []});
           taskMap.get(t.startDate)!.starting.push(t);
        }
        if (t.endDate) {
           if (!taskMap.has(t.endDate)) taskMap.set(t.endDate, {starting: [], due: [], ongoing: []});
           taskMap.get(t.endDate)!.due.push(t);
        }
        // Ongoing logic is slightly harder to Map O(1), but we can optimize.
        // For simplicity in this constrained context, we handle ongoing in the daily loop or optimize range.
        // Given complexity, let's keep ongoing loop but it's lighter if we filter only relevant ranges.
    }

    const days = [];
    
    // Fillers
    for (let i = startOffset - 1; i >= 0; i--) {
       days.push({ date: new Date(year, month, -i), isCurrentMonth: false, isToday: false, starting: [], due: [], ongoing: [], previewTasks: [] });
    }

    // Days O(30)
    for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(year, month, i);
        const dStr = d.toISOString().split('T')[0];
        
        const bucket = taskMap.get(dStr) || {starting: [], due: [], ongoing: []};
        
        // Only run ongoing filter for tasks that actually span ranges
        // To optimize, strictly we'd use an interval tree, but native filter is fast enough for <1000 items if we check simple strings.
        const ongoing = tasks.filter((t: any) => 
            t.startDate && t.endDate && t.startDate < dStr && t.endDate > dStr
        );

        days.push({
            date: d,
            isCurrentMonth: true,
            isToday: d.toDateString() === new Date().toDateString(),
            starting: bucket.starting,
            due: bucket.due,
            ongoing,
            startingCount: bucket.starting.length,
            dueCount: bucket.due.length,
            previewTasks: [...bucket.starting, ...bucket.due, ...ongoing].slice(0, 3)
        });
    }

    // Fillers
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
        days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false, isToday: false, starting: [], due: [], ongoing: [], previewTasks: [] });
    }

    return days;
  });

  changeMonth(delta: number) {
     const newDate = new Date(this.currentDate());
     newDate.setMonth(newDate.getMonth() + delta);
     this.currentDate.set(newDate);
  }

  openDay(day: any) {
     this.selectedDay.set(day);
  }

  getDayAnalysis(day: any): string {
      const load = day.starting.length + day.due.length + day.ongoing.length;
      if (load === 0) return "Clear schedule. Perfect day for deep work or planning ahead.";
      
      let msg = "";
      if (day.due.length > 0) msg += `Critical Focus: ${day.due.length} artifacts due today. `;
      if (day.starting.length > 0) msg += `New Initiatives: ${day.starting.length} tasks kicking off. `;
      
      if (day.due.length > 3) return "High Alert: Heavy deadline convergence detected. Prioritize immediately.";
      if (load > 5) return "Heavy Load: Schedule is dense. Recommend deferring non-critical items.";
      
      return msg || "Balanced schedule. Standard operational cadence.";
  }
}
