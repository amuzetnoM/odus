
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
               <!-- Icon Column (SVG Replacements) -->
               <div class="shrink-0 mt-0.5">
                   @switch (toast.type) {
                       @case ('success') {
                           <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                       }
                       @case ('error') {
                           <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                       }
                       @case ('warning') {
                           <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                       }
                       @case ('critical') {
                           <svg class="w-5 h-5 text-red-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                       }
                       @case ('info') {
                           <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                       }
                   }
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
