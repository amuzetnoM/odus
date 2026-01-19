
import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeTrackingService } from '../services/time-tracking.service';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-time-tracker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-zinc-900/50 border border-white/10 rounded-xl p-4">
      <!-- Active Timer -->
      @if (timeTracking.activeTimer()) {
        <div class="mb-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span class="text-xs text-zinc-400 uppercase tracking-wider">Tracking</span>
            </div>
            <div class="text-2xl font-light text-white font-mono">
              {{ formatDuration(currentDuration()) }}
            </div>
          </div>
          <div class="text-sm text-zinc-200 mb-3">{{ timeTracking.activeTimer()?.taskTitle }}</div>
          <div class="flex gap-2">
            <button 
              (click)="stopTimer()"
              class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold rounded transition-colors">
              Stop Timer
            </button>
            <button 
              (click)="cancelTimer()"
              class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded transition-colors">
              Cancel
            </button>
          </div>
        </div>
      }

      <!-- Velocity Metrics -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div class="bg-zinc-950/50 p-3 rounded-lg border border-white/5">
          <div class="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Today</div>
          <div class="text-lg font-light text-white">{{ formatDuration(velocityMetrics().dailyAverage) }}</div>
        </div>
        <div class="bg-zinc-950/50 p-3 rounded-lg border border-white/5">
          <div class="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">This Week</div>
          <div class="text-lg font-light text-white">{{ formatDuration(velocityMetrics().weeklyTotal) }}</div>
        </div>
        <div class="bg-zinc-950/50 p-3 rounded-lg border border-white/5">
          <div class="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">This Month</div>
          <div class="text-lg font-light text-white">{{ formatDuration(velocityMetrics().monthlyTotal) }}</div>
        </div>
        <div class="bg-zinc-950/50 p-3 rounded-lg border border-white/5">
          <div class="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Avg Task</div>
          <div class="text-lg font-light text-white">{{ formatDuration(velocityMetrics().averageTaskDuration) }}</div>
        </div>
      </div>

      <!-- Recent Time Logs -->
      <div>
        <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Recent Activity</h3>
        <div class="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
          @for (log of recentLogs(); track log.id) {
            <div class="flex items-center justify-between p-2 bg-zinc-950/30 rounded border border-white/5 hover:border-white/10 transition-colors">
              <div class="flex-1 min-w-0">
                <div class="text-sm text-zinc-200 truncate">{{ getTaskTitle(log.taskId) }}</div>
                <div class="text-[10px] text-zinc-500 mt-0.5">{{ formatDate(log.startTime) }}</div>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-sm text-zinc-300 font-mono">{{ formatDuration(log.duration || 0) }}</div>
                <button 
                  (click)="deleteLog(log.id)"
                  class="text-zinc-600 hover:text-red-400 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          } @empty {
            <div class="text-center py-8 text-zinc-500 text-sm">
              No time logs yet. Start a timer to begin tracking.
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  `]
})
export class TimeTrackerComponent {
  readonly timeTracking: TimeTrackingService = inject(TimeTrackingService);
  private readonly projectService: ProjectService = inject(ProjectService);

  velocityMetrics = this.timeTracking.velocityMetrics;
  currentDuration = this.timeTracking.currentDuration;

  recentLogs = computed(() => {
    return this.timeTracking.timeLogs().slice(-10).reverse();
  });

  stopTimer() {
    this.timeTracking.stopTimer();
  }

  cancelTimer() {
    this.timeTracking.cancelTimer();
  }

  deleteLog(logId: string) {
    this.timeTracking.deleteLog(logId);
  }

  getTaskTitle(taskId: string): string {
    const allTasks = this.projectService.allTasks();
    const task = allTasks.find((t: any) => t.id === taskId);
    return task?.title || 'Unknown Task';
  }

  formatDuration(seconds: number): string {
    return this.timeTracking.formatDuration(seconds);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  }
}
