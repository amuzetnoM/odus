
import { Component, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { GithubService } from '../services/github.service';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" (click)="close.emit()">
      <div class="w-full max-w-md bg-zinc-950 border border-white/10 rounded-xl shadow-2xl overflow-hidden" (click)="$event.stopPropagation()">
        <div class="p-6 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
           <h2 class="text-sm font-bold text-white uppercase tracking-widest">System Configuration</h2>
           <button (click)="close.emit()" class="text-zinc-500 hover:text-white">✕</button>
        </div>
        
        <div class="p-6 space-y-6">
           <!-- Gemini -->
           <div>
              <label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Gemini API Key</label>
              <div class="relative">
                  <input 
                    [ngModel]="geminiKey()"
                    (ngModelChange)="geminiKey.set($event)"
                    type="password"
                    class="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                    placeholder="AI Studio Key..."
                  />
              </div>
              <p class="text-[9px] text-zinc-600 mt-2">Required for generative features. Stored locally.</p>
           </div>

           <!-- GitHub -->
           <div>
              <label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">GitHub Personal Token</label>
              <div class="relative">
                  <input 
                    [ngModel]="githubToken()"
                    (ngModelChange)="githubToken.set($event)"
                    type="password"
                    class="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                    placeholder="ghp_..."
                  />
              </div>
              <p class="text-[9px] text-zinc-600 mt-2">Required for repository analysis. Needs 'repo' scope.</p>
           </div>
        </div>

        <div class="p-6 border-t border-white/5 bg-zinc-900/30 flex justify-end gap-3">
           <button (click)="close.emit()" class="px-4 py-2 text-xs text-zinc-400 hover:text-white transition-colors">Cancel</button>
           <button (click)="save()" class="px-6 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest rounded hover:bg-zinc-200 transition-colors">Save Configuration</button>
        </div>
      </div>
    </div>
  `
})
export class SettingsModalComponent {
  close = output();
  private geminiService = inject(GeminiService);
  private githubService = inject(GithubService);

  geminiKey = signal(localStorage.getItem('gemini_api_key') || '');
  githubToken = signal(localStorage.getItem('gh_token') || '');

  save() {
      this.geminiService.updateApiKey(this.geminiKey());
      this.githubService.setToken(this.githubToken());
      this.close.emit();
  }
}
