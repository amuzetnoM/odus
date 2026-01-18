
import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../services/project.service';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="bg-zinc-900/40 backdrop-blur-sm p-3 rounded border border-white/5 hover:border-white/20 hover:bg-zinc-800/50 transition-all cursor-grab active:cursor-grabbing group relative select-none"
      draggable="true"
      (dragstart)="onDragStart($event)"
    >
      <!-- Tags Row -->
      @if (task().tags?.length) {
         <div class="flex gap-1 mb-2 flex-wrap">
            @for (tag of task().tags; track tag) {
               <span class="text-[8px] uppercase tracking-wider font-bold text-zinc-500 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">{{ tag }}</span>
            }
         </div>
      }

      <div class="flex justify-between items-start mb-1">
        <h4 class="font-light text-zinc-200 text-sm leading-tight tracking-wide">{{ task().title }}</h4>
        <div [class]="priorityClass() + ' w-1.5 h-1.5 rounded-full shrink-0 mt-1 ml-2 opacity-70'"></div>
      </div>
      @if (task().description) {
        <p class="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed font-light">{{ task().description }}</p>
      }
    </div>
  `
})
export class TaskCardComponent {
  task = input.required<Task>();
  
  onDragStart(event: DragEvent) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', this.task().id);
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  priorityClass = computed(() => {
    switch (this.task().priority) {
      case 'high': return 'bg-zinc-100 shadow-[0_0_5px_rgba(255,255,255,0.5)]';
      case 'medium': return 'bg-zinc-400';
      case 'low': return 'bg-zinc-700';
      default: return 'bg-zinc-800';
    }
  });
}
