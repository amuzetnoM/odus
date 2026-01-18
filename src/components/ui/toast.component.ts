
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
      @for (toast of notificationService.toasts(); track toast.id) {
        <div 
          class="pointer-events-auto px-4 py-2 rounded-full shadow-2xl backdrop-blur-md border border-white/10 flex items-center gap-3 animate-slide-up"
          [class.bg-emerald-950_80]="toast.type === 'success'"
          [class.text-emerald-200]="toast.type === 'success'"
          [class.bg-red-950_80]="toast.type === 'error'"
          [class.text-red-200]="toast.type === 'error'"
          [class.bg-zinc-900_80]="toast.type === 'info'"
          [class.text-zinc-200]="toast.type === 'info'"
        >
           @if (toast.type === 'success') {
             <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
           } @else if (toast.type === 'error') {
             <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
           } @else {
             <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
           }
           <span class="text-xs font-medium tracking-wide">{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
  `]
})
export class ToastComponent {
  notificationService = inject(NotificationService);
}
