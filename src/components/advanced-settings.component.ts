
import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecurringTasksService, RecurringTask } from '../services/recurring-tasks.service';
import { TaskAutomationService, AutomationRule } from '../services/task-automation.service';
import { ProjectService } from '../services/project.service';

type SettingsTab = 'recurring' | 'automation';

@Component({
  selector: 'app-advanced-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" (click)="close.emit()">
      <div 
        class="w-full max-w-6xl bg-zinc-950/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl flex flex-col h-[92vh] overflow-auto"
        (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="p-6 border-b border-white/5 flex justify-between items-center shrink-0">
          <div>
            <h2 class="text-2xl font-extralight text-white tracking-wider">Advanced Settings</h2>
            <p class="text-sm text-zinc-400 mt-1">Manage recurring tasks and automation</p>
          </div>
          <button (click)="close.emit()" class="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Tabs -->
        <div class="px-6 py-4 border-b border-white/5 flex gap-2 shrink-0">
          <button 
            (click)="activeTab.set('recurring')"
            [class.bg-white]="activeTab() === 'recurring'"
            [class.text-zinc-900]="activeTab() === 'recurring'"
            [class.bg-zinc-800]="activeTab() !== 'recurring'"
            [class.text-zinc-300]="activeTab() !== 'recurring'"
            class="px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors">
            Recurring Tasks
          </button>
          <button 
            (click)="activeTab.set('automation')"
            [class.bg-white]="activeTab() === 'automation'"
            [class.text-zinc-900]="activeTab() === 'automation'"
            [class.bg-zinc-800]="activeTab() !== 'automation'"
            [class.text-zinc-300]="activeTab() !== 'automation'"
            class="px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors">
            Automation Rules
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6 custom-scrollbar">
          @if (activeTab() === 'recurring') {
            <div class="space-y-4">
              @for (task of recurringService.recurringTasks(); track task.id) {
                <div class="bg-zinc-900/50 border border-white/10 rounded-xl p-4">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                      <h3 class="text-lg font-semibold text-white mb-1">{{ task.title }}</h3>
                      <p class="text-sm text-zinc-400">{{ task.description }}</p>
                    </div>
                    <div class="flex items-center gap-2 ml-4">
                      <button 
                        (click)="recurringService.toggleActive(task.id)"
                        class="p-2 rounded transition-colors"
                        [class.text-green-400]="task.isActive"
                        [class.bg-green-900/20]="task.isActive"
                        [class.text-zinc-500]="!task.isActive"
                        [class.bg-zinc-800]="!task.isActive">
                        @if (task.isActive) {
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        } @else {
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        }
                      </button>
                      <button 
                        (click)="deleteRecurring(task.id)"
                        class="p-2 text-zinc-600 hover:text-red-400 rounded transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div class="flex gap-4 text-xs text-zinc-500">
                    <span class="capitalize">{{ task.frequency }}</span>
                    <span>Priority: {{ task.priority }}</span>
                    @if (task.lastCreated) {
                      <span>Last: {{ task.lastCreated }}</span>
                    }
                  </div>
                </div>
              } @empty {
                <div class="text-center py-12 text-zinc-500">
                  No recurring tasks configured yet
                </div>
              }
            </div>
          }

          @if (activeTab() === 'automation') {
            <div class="space-y-4">
              @for (rule of automationService.automationRules(); track rule.id) {
                <div class="bg-zinc-900/50 border border-white/10 rounded-xl p-4">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                      <h3 class="text-lg font-semibold text-white mb-1">{{ rule.name }}</h3>
                      <p class="text-sm text-zinc-400">{{ rule.description }}</p>
                    </div>
                    <div class="flex items-center gap-2 ml-4">
                      <button 
                        (click)="automationService.toggleRule(rule.id)"
                        class="p-2 rounded transition-colors"
                        [class.text-blue-400]="rule.isActive"
                        [class.bg-blue-900/20]="rule.isActive"
                        [class.text-zinc-500]="!rule.isActive"
                        [class.bg-zinc-800]="!rule.isActive">
                        @if (rule.isActive) {
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                          </svg>
                        } @else {
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                          </svg>
                        }
                      </button>
                      <button 
                        (click)="deleteRule(rule.id)"
                        class="p-2 text-zinc-600 hover:text-red-400 rounded transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div class="flex gap-2 text-xs">
                    <span class="bg-zinc-800 text-zinc-400 px-2 py-1 rounded">
                      Trigger: {{ rule.trigger.type }}
                    </span>
                    <span class="bg-zinc-800 text-zinc-400 px-2 py-1 rounded">
                      Actions: {{ rule.actions.length }}
                    </span>
                  </div>
                </div>
              } @empty {
                <div class="text-center py-12 text-zinc-500">
                  No automation rules configured yet
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  `]
})
export class AdvancedSettingsComponent {
  recurringService = inject(RecurringTasksService);
  automationService = inject(TaskAutomationService);
  projectService = inject(ProjectService);

  close = output<void>();
  
  activeTab = signal<SettingsTab>('recurring');

  deleteRecurring(id: string) {
    if (confirm('Delete this recurring task?')) {
      this.recurringService.deleteRecurringTask(id);
    }
  }

  deleteRule(id: string) {
    if (confirm('Delete this automation rule?')) {
      this.automationService.deleteRule(id);
    }
  }
}
