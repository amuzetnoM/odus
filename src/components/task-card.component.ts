
import { Component, input, computed, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../services/project.service';
import { MS_PER_DAY } from '../utils/date-utils';
import { MindService } from '../services/mind.service';
import { ProjectService } from '../services/project.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="bg-zinc-900/40 backdrop-blur-sm p-3 rounded-lg border border-white/5 hover:border-white/20 hover:bg-zinc-800/60 transition-all cursor-grab active:cursor-grabbing group relative select-none shadow-sm flex flex-col gap-2"
      [class.ring-2]="isLongPressing()"
      [class.ring-indigo-500]="isLongPressing()"
      [class.scale-95]="isLongPressing()"
      [style.border-left]="'3px solid ' + (projectColor() || '#52525b')"
      draggable="true"
      (dragstart)="onDragStart($event)"
      (dblclick)="onDoubleClick($event)"
      (touchstart)="onTouchStart($event)"
      (touchend)="onTouchEnd()"
      (touchcancel)="onTouchEnd()"
    >
      <!-- Header: Title -->
      <div class="flex justify-between items-start gap-2">
        <h4 class="font-normal text-zinc-200 text-xs leading-tight tracking-wide group-hover:text-white transition-colors flex-1" title="{{ task().title }}">{{ displayTitle() }}</h4>
        @if (task().inFocusList) {
          <svg class="w-3 h-3 text-indigo-400 shrink-0" fill="currentColor" viewBox="0 0 20 20" title="In Focus List"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
        }
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
      
      <!-- Dates Row -->
      @if (task().startDate || task().endDate) {
        <div class="flex gap-2 text-[9px] text-zinc-600 font-mono">
          @if (task().startDate) {
            <span title="Start Date">▶ {{ task().startDate }}</span>
          }
          @if (task().endDate) {
            <span [class.text-red-400]="isOverdue()" [class.text-yellow-400]="isDueSoon()" title="Due Date">◀ {{ task().endDate }}</span>
          }
        </div>
      }
      
      <!-- Footer Info -->
      @if (task().comments?.length || task().attachmentIds?.length || task().dependencyIds?.length || task().metadata?.notes) {
          <div class="flex gap-3 text-[9px] text-zinc-600 border-t border-white/5 pt-2 mt-1 flex-wrap">
             @if(task().dependencyIds?.length) { 
                <span class="flex items-center gap-1" title="Dependencies">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> 
                  {{task().dependencyIds?.length}}
                </span> 
             }
             @if(task().comments?.length) { 
                <span class="flex items-center gap-1" title="Comments">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg> 
                  {{task().comments?.length}}
                </span> 
             }
             @if(task().attachmentIds?.length) { 
                <span class="flex items-center gap-1" title="Attachments">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg> 
                  {{task().attachmentIds?.length}}
                </span> 
             }
             @if(task().metadata?.notes) {
                <span class="flex items-center gap-1 text-indigo-500" title="{{ task().metadata?.notes }}">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </span>
             }
          </div>
      }
    </div>
  `
})
export class TaskCardComponent {
  task = input.required<Task>();
  projectColor = input<string>('#52525b');
  projectId = input<string>();
  
  private mindService = inject(MindService);
  private projectService = inject(ProjectService);
  private notification = inject(NotificationService);
  
  private longPressTimer: any = null;
  private longPressingSignal = signal(false);
  
  isLongPressing = this.longPressingSignal.asReadonly();
  
  // Display-friendly title (truncated for card display)
  displayTitle = computed(() => {
    const t = this.task().title || '';
    return t.length > 80 ? t.slice(0, 80).trim() + '…' : t;
  });
  
  isOverdue = computed(() => {
    const endDate = this.task().endDate;
    if (!endDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return endDate < today && this.task().status !== 'done';
  });
  
  isDueSoon = computed(() => {
    const endDate = this.task().endDate;
    if (!endDate || this.isOverdue()) return false;
    const today = new Date();
    const due = new Date(endDate);
    const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / MS_PER_DAY);
    return daysUntilDue <= 3 && daysUntilDue >= 0 && this.task().status !== 'done';
  });

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
  
  onDoubleClick(event: MouseEvent) {
    event.stopPropagation();
    this.createMindNodeFromTask();
  }
  
  onTouchStart(event: TouchEvent) {
    this.longPressTimer = setTimeout(() => {
      this.longPressingSignal.set(true);
      this.createMindNodeFromTask();
      // Provide haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500); // 500ms for long press
  }
  
  onTouchEnd() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    setTimeout(() => {
      this.longPressingSignal.set(false);
    }, 200);
  }
  
  private async createMindNodeFromTask() {
    const task = this.task();
    const projectId = this.projectId();
    
    // Build detailed content for mind node
    let content = `**Task: ${task.title}**\n\n`;
    
    if (task.description) {
      content += `${task.description}\n\n`;
    }
    
    content += `**Priority:** ${task.priority}\n`;
    content += `**Status:** ${task.status}\n`;
    
    if (task.startDate) {
      content += `**Start Date:** ${task.startDate}\n`;
    }
    
    if (task.endDate) {
      content += `**End Date:** ${task.endDate}\n`;
    }
    
    if (task.tags && task.tags.length > 0) {
      content += `**Tags:** ${task.tags.join(', ')}\n`;
    }
    
    if (task.dependencyIds && task.dependencyIds.length > 0) {
      content += `**Dependencies:** ${task.dependencyIds.length} task(s)\n`;
    }
    
    if (task.metadata?.notes) {
      content += `\n**Notes:**\n${task.metadata.notes}\n`;
    }
    
    try {
      // Create mind node
      await this.mindService.addNode(content);
      
      // Get the newly created node (first in the list after adding)
      const nodes = this.mindService.nodes();
      const newNode = nodes[0];
      
      // Link task to mind node
      if (projectId && newNode) {
        this.projectService.updateTask(projectId, task.id, {
          metadata: {
            ...task.metadata,
            mindNodeId: newNode.id,
            notes: task.metadata?.notes || `Linked to mind node: ${newNode.title}`
          }
        });
      }
      
      this.notification.notify('Mind Node Created', `"${newNode?.title || 'Untitled'}"`, 'success');
    } catch (error) {
      console.error('Failed to create mind node:', error);
      this.notification.notify('Error', 'Failed to create mind node', 'error');
    }
  }
}
