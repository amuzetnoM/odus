
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationType } from '../../services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none items-end">
      @for (toast of notificationService.toasts(); track toast.id) {
        <div 
          class="pointer-events-auto min-w-[300px] max-w-sm rounded-lg backdrop-blur-xl border-l-4 shadow-2xl animate-slide-in overflow-hidden relative"
          [class]="getClasses(toast.type)"
        >
           <!-- Background Glow -->
           <div class="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none"></div>

           <div class="p-4 flex gap-3 relative z-10">
               <!-- Icon Column -->
               <div class="shrink-0 text-xl pt-0.5">
                   {{ getIcon(toast.type) }}
               </div>

               <!-- Content -->
               <div class="flex-1">
                   <h4 class="text-sm font-bold uppercase tracking-wide mb-1" [class]="getTitleColor(toast.type)">
                       {{ toast.title }}
                   </h4>
                   <p class="text-xs text-zinc-300 font-light leading-relaxed">
                       {{ toast.message }}
                   </p>
               </div>

               <!-- Close -->
               <button (click)="notificationService.removeToast(toast.id)" class="shrink-0 text-zinc-500 hover:text-white self-start -mt-1 -mr-1">
                   <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
               </button>
           </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slideIn { 
      from { opacity: 0; transform: translateX(20px); } 
      to { opacity: 1; transform: translateX(0); } 
    }
    .animate-slide-in { animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
  `]
})
export class ToastComponent {
  notificationService = inject(NotificationService);

  getIcon(type: NotificationType): string {
      switch(type) {
          case 'success': return '✅';
          case 'error': return '❌';
          case 'warning': return '🔶';
          case 'critical': return '⭕️';
          case 'info': return '🟦';
          default: return '⬜️';
      }
  }

  getClasses(type: NotificationType): string {
      const base = "bg-zinc-900/95 border";
      switch(type) {
          case 'success': return `${base} border-l-emerald-500 border-t-white/5 border-r-white/5 border-b-white/5`;
          case 'error': return `${base} border-l-red-500 border-t-white/5 border-r-white/5 border-b-white/5`;
          case 'warning': return `${base} border-l-amber-500 border-t-white/5 border-r-white/5 border-b-white/5`;
          case 'critical': return `${base} border-l-red-600 border-t-white/5 border-r-white/5 border-b-white/5 shadow-red-900/20`;
          case 'info': return `${base} border-l-blue-500 border-t-white/5 border-r-white/5 border-b-white/5`;
          default: return `${base} border-l-zinc-500 border-white/5`;
      }
  }

  getTitleColor(type: NotificationType): string {
      switch(type) {
          case 'success': return 'text-emerald-400';
          case 'error': return 'text-red-400';
          case 'warning': return 'text-amber-400';
          case 'critical': return 'text-red-500 animate-pulse';
          case 'info': return 'text-blue-400';
          default: return 'text-zinc-400';
      }
  }
}
