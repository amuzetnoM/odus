
import { Component, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationType } from '../services/notification.service';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="absolute top-0 bottom-0 left-0 w-80 bg-zinc-900/95 backdrop-blur-xl border-r border-white/10 z-[60] flex flex-col shadow-2xl animate-slide-right">
       
       <!-- Header -->
       <div class="h-16 flex items-center justify-between px-6 border-b border-white/5 shrink-0 bg-zinc-950/50">
           <div class="flex items-center gap-2">
               <span class="text-xs font-bold text-white uppercase tracking-widest">Inbox</span>
               <span class="bg-zinc-800 text-zinc-400 text-[10px] px-1.5 py-0.5 rounded-full font-mono">{{ notificationService.unreadCount() }}</span>
           </div>
           <div class="flex gap-2">
               <button (click)="notificationService.markAllRead()" class="text-[10px] text-zinc-500 hover:text-white uppercase tracking-wider transition-colors" title="Mark all read">Read All</button>
               <div class="w-px h-3 bg-zinc-800 self-center"></div>
               <button (click)="notificationService.clearAll()" class="text-[10px] text-zinc-500 hover:text-red-400 uppercase tracking-wider transition-colors">Clear</button>
               <div class="w-px h-3 bg-zinc-800 self-center"></div>
               <button (click)="close.emit()" class="text-zinc-400 hover:text-white">✕</button>
           </div>
       </div>

       <!-- List -->
       <div class="flex-1 overflow-y-auto custom-scrollbar p-0">
           @for (item of notificationService.inbox(); track item.id) {
               <div 
                  class="p-4 border-b border-white/5 hover:bg-white/5 transition-colors group relative"
                  [class.bg-white_5]="!item.read"
                  (click)="notificationService.markRead(item.id)"
               >
                  @if(!item.read) {
                      <div class="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-500"></div>
                  }
                  
                  <div class="flex gap-3 items-start">
                      <div class="shrink-0 mt-0.5">
                           @switch (item.type) {
                               @case ('success') {
                                   <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                               }
                               @case ('error') {
                                   <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                               }
                               @case ('warning') {
                                   <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                               }
                               @case ('critical') {
                                   <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                               }
                               @case ('info') {
                                   <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                               }
                           }
                      </div>
                      <div class="flex-1 min-w-0">
                          <div class="flex justify-between items-start mb-1">
                              <h5 class="text-xs font-bold text-zinc-200 truncate pr-2" [class.text-white]="!item.read">{{ item.title }}</h5>
                              <span class="text-[9px] text-zinc-600 shrink-0 whitespace-nowrap">{{ item.timestamp | date:'shortTime' }}</span>
                          </div>
                          <p class="text-[11px] text-zinc-400 leading-tight line-clamp-2">{{ item.message }}</p>
                      </div>
                  </div>
               </div>
           } @empty {
               <div class="h-full flex flex-col items-center justify-center text-zinc-600 opacity-50 p-8 text-center">
                   <svg class="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                   <p class="text-xs font-mono uppercase">System Quiet</p>
               </div>
           }
       </div>

       <!-- Footer -->
       <div class="p-3 border-t border-white/5 bg-zinc-950/50 text-center">
           <p class="text-[9px] text-zinc-600 font-mono">NOTIFICATIONS PERSIST LOCAL ONLY</p>
       </div>
    </div>
    
    <!-- Backdrop to close -->
    <div class="fixed inset-0 z-[50]" (click)="close.emit()"></div>
  `,
  styles: [`
    @keyframes slideRight { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    .animate-slide-right { animation: slideRight 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
  `]
})
export class NotificationPanelComponent {
  close = output();
  notificationService = inject(NotificationService);
}
