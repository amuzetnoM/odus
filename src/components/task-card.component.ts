
import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../services/project.service';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="bg-zinc-900/40 backdrop-blur-sm p-3 rounded-lg border border-white/5 hover:border-white/20 hover:bg-zinc-800/60 transition-all cursor-grab active:cursor-grabbing group relative select-none shadow-sm flex flex-col gap-2"
      [style.border-left]="'3px solid ' + (projectColor() || '#52525b')"
      draggable="true"
      (dragstart)="onDragStart($event)"
    >
      <!-- Header: Title -->
      <div class="flex justify-between items-start">
        <h4 class="font-normal text-zinc-200 text-xs leading-tight tracking-wide group-hover:text-white transition-colors">{{ task().title }}</h4>
      </div>

      <!-- Description -->
      @if (task().description) {
        <p class="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed font-light">{{ task().description }}</p>
      }

      <!-- Metadata Row (Priority Badge + Tags) -->
      <div class="flex flex-wrap gap-1.5 items-center mt-1">
          <!-- Priority Badge -->
          <span 
             class="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded border"
             [class]="priorityBadgeClass()">
             {{ task().priority }}
          </span>

          <!-- Tags -->
          @for (tag of task().tags; track tag) {
             <span class="text-[8px] uppercase tracking-wider font-bold text-zinc-400 bg-zinc-950/50 border border-white/5 px-1.5 py-0.5 rounded shadow-sm">{{ tag }}</span>
          }
      </div>
      
      <!-- Footer Info -->
      @if (task().comments?.length || task().attachmentIds?.length) {
          <div class="flex gap-3 text-[9px] text-zinc-600 border-t border-white/5 pt-2 mt-1">
             @if(task().comments?.length) { <span class="flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg> {{task().comments?.length}}</span> }
             @if(task().attachmentIds?.length) { <span class="flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg> {{task().attachmentIds?.length}}</span> }
          </div>
      }
    </div>
  `
})
export class TaskCardComponent {
  task = input.required<Task>();
  projectColor = input<string>('#52525b');
  
  onDragStart(event: DragEvent) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', this.task().id);
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  priorityBadgeClass = computed(() => {
    switch (this.task().priority) {
      case 'high': return 'bg-red-900/20 text-red-400 border-red-900/50';
      case 'medium': return 'bg-yellow-900/20 text-yellow-400 border-yellow-900/50';
      case 'low': return 'bg-blue-900/20 text-blue-400 border-blue-900/50';
      default: return 'bg-zinc-800 text-zinc-500 border-zinc-700';
    }
  });
}
