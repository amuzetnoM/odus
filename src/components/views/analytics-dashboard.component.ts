
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col p-4 sm:p-8 overflow-hidden">
      <div class="mb-8 shrink-0">
        <h1 class="text-2xl font-extralight text-white tracking-widest">ANALYTICS</h1>
        <p class="text-sm text-zinc-400 mt-1">Performance metrics and insights</p>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar space-y-6">
        <!-- Key Metrics -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
            <div class="text-xs text-zinc-500 uppercase tracking-wider mb-2">Productivity Score</div>
            <div class="text-4xl font-light text-white mb-2">{{ analytics().productivityScore }}%</div>
            <div class="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                class="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                [style.width.%]="analytics().productivityScore">
              </div>
            </div>
          </div>

          <div class="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
            <div class="text-xs text-zinc-500 uppercase tracking-wider mb-2">Avg Completion Time</div>
            <div class="text-4xl font-light text-white">{{ analytics().averageCompletionTime.toFixed(1) }}</div>
            <div class="text-xs text-zinc-400 mt-1">days per task</div>
          </div>

          <div class="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
            <div class="text-xs text-zinc-500 uppercase tracking-wider mb-2">Total Time Tracked</div>
            <div class="text-4xl font-light text-white">{{ formatTime(analytics().totalTimeTracked) }}</div>
            <div class="text-xs text-zinc-400 mt-1">this week</div>
          </div>

          <div class="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
            <div class="text-xs text-zinc-500 uppercase tracking-wider mb-2">Completion Rate</div>
            <div class="text-4xl font-light text-white">{{ getWeeklyCompletionRate() }}%</div>
            <div class="text-xs text-zinc-400 mt-1">this week</div>
          </div>
        </div>

        <!-- Status Distribution -->
        <div class="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
          <h2 class="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Task Distribution</h2>
          <div class="space-y-3">
            @for (status of analytics().statusDistribution; track status.status) {
              <div>
                <div class="flex justify-between items-center mb-1">
                  <span class="text-sm text-zinc-300 capitalize">{{ status.status }}</span>
                  <span class="text-sm text-zinc-400">{{ status.count }} ({{ status.percentage }}%)</span>
                </div>
                <div class="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    class="h-full transition-all duration-500"
                    [class.bg-zinc-600]="status.status === 'todo'"
                    [class.bg-yellow-500]="status.status === 'in-progress'"
                    [class.bg-green-500]="status.status === 'done'"
                    [style.width.%]="status.percentage">
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Priority Breakdown -->
        <div class="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
          <h2 class="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Priority Breakdown</h2>
          <div class="grid grid-cols-3 gap-4">
            @for (priority of analytics().priorityBreakdown; track priority.priority) {
              <div class="text-center">
                <div class="text-3xl font-light text-white mb-1">{{ priority.count }}</div>
                <div class="text-xs text-zinc-400 uppercase tracking-wider capitalize">{{ priority.priority }}</div>
                <div class="text-xs text-zinc-500 mt-1">{{ priority.percentage }}%</div>
              </div>
            }
          </div>
        </div>

        <!-- Burndown Chart -->
        <div class="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
          <h2 class="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Burndown Chart (30 Days)</h2>
          <div class="relative h-64">
            <svg class="w-full h-full">
              <!-- Grid Lines -->
              @for (i of [0, 1, 2, 3, 4]; track i) {
                <line 
                  [attr.x1]="0" 
                  [attr.y1]="i * 64" 
                  [attr.x2]="'100%'" 
                  [attr.y2]="i * 64" 
                  stroke="rgba(255,255,255,0.05)" 
                  stroke-width="1" />
              }

              <!-- Ideal Line -->
              <polyline
                [attr.points]="getIdealLinePoints()"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                stroke-width="2"
                stroke-dasharray="5,5" />

              <!-- Actual Line -->
              <polyline
                [attr.points]="getActualLinePoints()"
                fill="none"
                stroke="#3b82f6"
                stroke-width="3" />
            </svg>
          </div>
        </div>

        <!-- Velocity Trend -->
        <div class="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
          <h2 class="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Velocity Trend (12 Weeks)</h2>
          <div class="space-y-2">
            @for (week of analytics().velocity; track week.week) {
              <div class="flex items-center gap-3">
                <div class="w-20 text-xs text-zinc-500">{{ week.week }}</div>
                <div class="flex-1 flex gap-2">
                  <div class="flex-1 h-8 bg-zinc-800 rounded overflow-hidden flex">
                    <div 
                      class="bg-green-500 transition-all duration-300"
                      [style.width.%]="(week.completed / getMaxVelocity()) * 100"
                      [title]="week.completed + ' completed'">
                    </div>
                  </div>
                  <div class="flex-1 h-8 bg-zinc-800 rounded overflow-hidden flex">
                    <div 
                      class="bg-blue-500 transition-all duration-300"
                      [style.width.%]="(week.started / getMaxVelocity()) * 100"
                      [title]="week.started + ' started'">
                    </div>
                  </div>
                </div>
                <div class="w-32 text-right text-xs text-zinc-400">
                  <span class="text-green-400">{{ week.completed }}</span> / 
                  <span class="text-blue-400">{{ week.started }}</span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Completion Rates -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (rate of analytics().completionRates; track rate.period) {
            <div class="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
              <div class="text-xs text-zinc-500 uppercase tracking-wider mb-2">{{ rate.period }}</div>
              <div class="text-3xl font-light text-white mb-2">{{ rate.rate }}%</div>
              <div class="text-xs text-zinc-400">{{ rate.completed }} of {{ rate.total }} completed</div>
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
export class AnalyticsDashboardComponent {
  analyticsService = inject(AnalyticsService);
  
  analytics = this.analyticsService.analytics;

  getWeeklyCompletionRate(): number {
    const rate = this.analytics().completionRates.find(r => r.period === 'This Week');
    return rate?.rate || 0;
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    return `${hours}h`;
  }

  getMaxVelocity(): number {
    const velocity = this.analytics().velocity;
    const max = Math.max(
      ...velocity.map(v => Math.max(v.completed, v.started))
    );
    return max || 1;
  }

  getIdealLinePoints(): string {
    const burndown = this.analytics().burndown;
    if (burndown.length === 0) return '';

    const maxRemaining = Math.max(...burndown.map(d => d.ideal));
    const width = 100;
    const height = 256;

    return burndown.map((d, i) => {
      const x = (i / (burndown.length - 1)) * width;
      const y = height - ((d.ideal / maxRemaining) * height);
      return `${x}%,${y}`;
    }).join(' ');
  }

  getActualLinePoints(): string {
    const burndown = this.analytics().burndown;
    if (burndown.length === 0) return '';

    const maxRemaining = Math.max(...burndown.map(d => Math.max(d.remaining, d.ideal)));
    const width = 100;
    const height = 256;

    return burndown.map((d, i) => {
      const x = (i / (burndown.length - 1)) * width;
      const y = height - ((d.remaining / maxRemaining) * height);
      return `${x}%,${y}`;
    }).join(' ');
  }
}
