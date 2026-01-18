
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DriveService } from '../../services/drive.service';

@Component({
  selector: 'app-drive-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="h-full flex flex-col p-4 sm:p-6"
      (dragover)="onDragOver($event)"
      (drop)="onDrop($event)"
    >
       <div class="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
          <h2 class="text-xl font-light tracking-widest text-white uppercase flex items-center gap-2">
             DATA VAULT
          </h2>
          <div class="flex gap-3">
             <button class="flex items-center gap-2 px-3 py-1.5 rounded text-[10px] font-bold tracking-wider transition-colors uppercase border border-white/10 hover:bg-white/5 text-zinc-400">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.01 1.987C12.593 1.987 13.064 2.459 13.064 3.042V8.902L18.924 8.902C19.507 8.902 19.979 9.373 19.979 9.957C19.979 10.54 19.507 11.011 18.924 11.011L13.064 11.011V16.871C13.064 17.455 12.593 17.927 12.01 17.927C11.426 17.927 10.955 17.455 10.955 16.871V11.011L5.094 11.011C4.511 11.011 4.039 10.54 4.039 9.957C4.039 9.373 4.511 8.902 5.094 8.902L10.955 8.902V3.042C10.955 2.459 11.426 1.987 12.01 1.987ZM17.766 21.033C17.766 21.616 17.294 22.088 16.711 22.088H7.308C6.725 22.088 6.253 21.616 6.253 21.033C6.253 20.45 6.725 19.978 7.308 19.978H16.711C17.294 19.978 17.766 20.45 17.766 21.033Z"/></svg>
                Connect Drive
             </button>
             <label class="bg-white text-black hover:bg-zinc-200 px-4 py-1.5 rounded text-[10px] font-bold tracking-wider transition-colors uppercase cursor-pointer flex items-center gap-2">
                Upload
                <input type="file" class="hidden" (change)="handleFile($event)" multiple>
             </label>
          </div>
       </div>

       <!-- Filters -->
       <div class="flex gap-6 mb-6">
          <button class="text-white text-xs font-bold uppercase tracking-widest border-b border-white pb-1">All Data</button>
          <button class="text-zinc-600 hover:text-zinc-400 text-xs font-bold uppercase tracking-widest transition-colors pb-1">Shared</button>
          <button class="text-zinc-600 hover:text-zinc-400 text-xs font-bold uppercase tracking-widest transition-colors pb-1">Archived</button>
       </div>

       @if(isDragging()) {
         <div class="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-lg bg-white/5 animate-pulse">
            <svg class="w-16 h-16 text-white mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
            <span class="text-lg font-light tracking-widest text-white">DROP TO UPLOAD</span>
         </div>
       } @else {
          <!-- Grid -->
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 overflow-y-auto custom-scrollbar pb-10">
             @for (file of driveService.files(); track file.id) {
                <div class="bg-zinc-900/30 border border-white/5 rounded p-4 hover:bg-zinc-800/50 hover:border-white/20 transition-all group cursor-pointer flex flex-col h-32 backdrop-blur-sm relative overflow-hidden">
                   <div class="absolute top-2 right-2 text-[10px] font-mono text-zinc-700 group-hover:text-zinc-500">{{ file.type }}</div>
                   
                   <div class="flex-1 flex items-center justify-center text-zinc-700 group-hover:text-zinc-300 transition-colors">
                      <svg class="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                   </div>
                   
                   <div class="flex justify-between items-end">
                      <div class="min-w-0 flex-1 pr-2">
                         <div class="text-xs text-zinc-300 font-light truncate tracking-wide" [title]="file.name">{{ file.name }}</div>
                         <div class="text-[9px] text-zinc-600 mt-1 font-mono">{{ file.sizeStr }}</div>
                      </div>
                      <button (click)="$event.stopPropagation(); driveService.downloadFile(file.id)" class="text-zinc-500 hover:text-white" title="Download">
                         <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                      </button>
                   </div>
                </div>
             } @empty {
                <div class="col-span-full py-12 text-center border border-dashed border-zinc-800 rounded">
                   <span class="text-zinc-600 text-xs font-mono uppercase">Vault Empty</span>
                </div>
             }
          </div>
       }
    </div>
  `
})
export class DriveViewComponent {
  driveService = inject(DriveService);
  isDragging = signal(false);

  onDragOver(e: DragEvent) { e.preventDefault(); this.isDragging.set(true); }
  onDrop(e: DragEvent) {
      e.preventDefault();
      this.isDragging.set(false);
      if (e.dataTransfer?.files) {
          Array.from(e.dataTransfer.files).forEach(file => this.driveService.addFile(file));
      }
  }

  handleFile(event: any) {
      const files = event.target.files;
      if (files) {
          Array.from(files).forEach((file: any) => this.driveService.addFile(file));
      }
  }
}
