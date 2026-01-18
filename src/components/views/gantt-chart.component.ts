
import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project, Task } from '../../services/project.service';

@Component({
  selector: 'app-gantt-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col bg-zinc-900/10 text-xs">
      <!-- Header Dates -->
      <div class="flex border-b border-white/5 bg-zinc-950/80 sticky top-0 z-10 backdrop-blur">
        <div class="w-48 p-3 border-r border-white/5 shrink-0 font-bold text-[10px] text-zinc-500 uppercase tracking-widest">Artifact</div>
        <div class="flex-1 flex overflow-hidden">
           @for (day of timelineDays(); track day) {
              <div class="w-10 border-r border-white/5 flex flex-col items-center justify-center p-1 shrink-0">
                  <span class="text-[9px] text-zinc-600 uppercase">{{ day | date:'EEE' }}</span>
                  <span class="font-mono text-zinc-400">{{ day | date:'d' }}</span>
              </div>
           }
        </div>
      </div>

      <!-- Task Rows -->
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        @for (task of sortedTasks(); track task.id) {
          <div class="flex border-b border-white/5 hover:bg-white/5 transition-colors group relative h-10">
            <!-- Task Name -->
            <div class="w-48 px-3 border-r border-white/5 shrink-0 truncate flex items-center gap-2">
               <div [class]="'w-1.5 h-1.5 rounded-full ' + getStatusColor(task.status)"></div>
               <span class="text-zinc-300 font-light tracking-wide text-[11px]" [title]="task.title">{{ task.title }}</span>
            </div>

            <!-- Gantt Bars Area -->
            <div class="flex-1 relative h-full">
               <!-- Grid lines -->
               <div class="absolute inset-0 flex pointer-events-none">
                  @for (day of timelineDays(); track day) {
                    <div class="w-10 border-r border-white/5 h-full shrink-0"></div>
                  }
               </div>

               <!-- Bar -->
               @if (getTaskPosition(task); as pos) {
                 <div 
                   class="absolute top-2.5 h-5 rounded-sm border border-white/10 flex items-center px-2 whitespace-nowrap overflow-hidden text-[9px] font-medium text-white/90 z-10 transition-all hover:brightness-110"
                   [style.left.px]="pos.left"
                   [style.width.px]="pos.width"
                   [class]="getPriorityColor(task.priority)"
                   [title]="task.title"
                 >
                   {{ task.title }}
                 </div>
               }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class GanttChartComponent {
  project = input.required<Project>();

  timelineDays = computed(() => {
    const tasks = this.project().tasks;
    if (tasks.length === 0) return [];

    const dates = tasks.flatMap(t => [new Date(t.startDate || ''), new Date(t.endDate || '')].filter(d => !isNaN(d.getTime())));
    if (dates.length === 0) {
        const today = new Date();
        dates.push(today);
        const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);
        dates.push(nextWeek);
    }
    
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    minDate.setDate(minDate.getDate() - 1);
    maxDate.setDate(maxDate.getDate() + 2);

    const days = [];
    for (let d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  });

  sortedTasks = computed(() => {
    return [...this.project().tasks].sort((a, b) => {
      const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
      const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
      return dateA - dateB;
    });
  });

  getTaskPosition(task: Task) {
    if (!task.startDate || !task.endDate) return null;
    
    const timeline = this.timelineDays();
    if (timeline.length === 0) return null;

    const start = new Date(task.startDate);
    const end = new Date(task.endDate);
    const timelineStart = timeline[0];

    const dayWidth = 40; 
    
    const diffTime = Math.abs(start.getTime() - timelineStart.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    const durationTime = Math.abs(end.getTime() - start.getTime());
    let durationDays = Math.ceil(durationTime / (1000 * 60 * 60 * 24));
    if (durationDays < 1) durationDays = 1;

    return {
      left: diffDays * dayWidth,
      width: durationDays * dayWidth
    };
  }

  getPriorityColor(priority: string) {
    switch (priority) {
      case 'high': return 'bg-white text-black';
      case 'medium': return 'bg-zinc-500';
      case 'low': return 'bg-zinc-800';
      default: return 'bg-zinc-800';
    }
  }
  
  getStatusColor(status: string) {
      switch(status) {
          case 'in-progress': return 'bg-white';
          case 'done': return 'bg-zinc-700';
          default: return 'bg-zinc-600';
      }
  }
}
