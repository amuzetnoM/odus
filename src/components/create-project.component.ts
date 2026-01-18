
import { Component, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-create-project',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md">
      <div class="w-full max-w-lg bg-black border border-zinc-800 shadow-2xl p-8 relative overflow-hidden">
        
        <!-- Decoration -->
        <div class="absolute -top-20 -right-20 w-64 h-64 bg-zinc-800/20 rounded-full blur-3xl pointer-events-none"></div>

        <h2 class="text-xl font-light tracking-widest text-white mb-2 uppercase">Initialize Odus</h2>
        <p class="text-zinc-500 text-xs font-mono mb-8">Define parameters for automated project generation.</p>

        <div class="mb-6">
           <label class="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Prompt Input</label>
           <textarea 
             [(ngModel)]="prompt"
             class="w-full h-32 bg-zinc-900 border border-zinc-800 p-4 text-zinc-300 focus:outline-none focus:border-zinc-500 resize-none placeholder:text-zinc-700 font-light text-sm"
             placeholder="Describe objective..."
             [disabled]="isLoading()"
           ></textarea>
        </div>

        <div class="flex justify-end gap-4 items-center">
          <button 
            (click)="close.emit()"
            class="text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
            [disabled]="isLoading()">
            Abort
          </button>
          <button 
            (click)="generate()"
            [disabled]="!prompt() || isLoading()"
            class="px-6 py-2 bg-white text-black hover:bg-zinc-200 text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            @if (isLoading()) {
              <div class="w-3 h-3 border-2 border-zinc-400 border-t-black rounded-full animate-spin"></div>
              <span>Processing...</span>
            } @else {
              <span>Execute</span>
            }
          </button>
        </div>
      </div>
    </div>
  `
})
export class CreateProjectComponent {
  close = output();
  
  private geminiService = inject(GeminiService);
  private projectService = inject(ProjectService);
  
  prompt = signal('');
  isLoading = signal(false);

  async generate() {
    if (!this.prompt()) return;
    
    this.isLoading.set(true);
    try {
      const data = await this.geminiService.generateProjectStructure(this.prompt());
      this.projectService.addProject(data.title, data.description, data.tasks);
      this.close.emit();
    } catch (e) {
      console.error('Failed', e);
      alert('Generation Failed.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
