
import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateLibraryService, ProjectTemplate } from '../../services/template-library.service';
import { ProjectService } from '../../services/project.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-template-library',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" (click)="close.emit()">
      <div 
        class="w-full max-w-6xl bg-zinc-950/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl flex flex-col h-[90vh] overflow-hidden"
        (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="p-6 border-b border-white/5 flex justify-between items-center shrink-0">
          <div>
            <h2 class="text-2xl font-extralight text-white tracking-wider">Template Library</h2>
            <p class="text-sm text-zinc-400 mt-1">Start with a pre-built project template</p>
          </div>
          <button (click)="close.emit()" class="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Category Filter -->
        <div class="px-6 py-4 border-b border-white/5 flex gap-2 overflow-x-auto shrink-0">
          <button 
            (click)="selectedCategory.set('all')"
            [class.bg-white]="selectedCategory() === 'all'"
            [class.text-zinc-900]="selectedCategory() === 'all'"
            [class.bg-zinc-800]="selectedCategory() !== 'all'"
            [class.text-zinc-300]="selectedCategory() !== 'all'"
            class="px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap">
            All Templates
          </button>
          @for (category of categories; track category) {
            <button 
              (click)="selectedCategory.set(category)"
              [class.bg-white]="selectedCategory() === category"
              [class.text-zinc-900]="selectedCategory() === category"
              [class.bg-zinc-800]="selectedCategory() !== category"
              [class.text-zinc-300]="selectedCategory() !== category"
              class="px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap">
              {{ category }}
            </button>
          }
        </div>

        <!-- Templates Grid -->
        <div class="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (template of filteredTemplates(); track template.id) {
              <div 
                class="bg-zinc-900/50 border border-white/10 rounded-xl p-5 hover:border-white/30 transition-all cursor-pointer group"
                (click)="selectTemplate(template)">
                
                <!-- Icon -->
                <div class="w-12 h-12 bg-gradient-to-br from-white/10 to-white/5 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg class="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    @switch (template.icon) {
                      @case ('rocket') {
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      }
                      @case ('phone') {
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                      }
                      @case ('megaphone') {
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
                      }
                      @case ('heart') {
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                      }
                      @case ('briefcase') {
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      }
                      @case ('pen') {
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                      }
                      @default {
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      }
                    }
                  </svg>
                </div>

                <h3 class="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {{ template.title }}
                </h3>
                
                <p class="text-sm text-zinc-400 mb-4 line-clamp-2">
                  {{ template.description }}
                </p>

                <div class="flex items-center justify-between">
                  <span class="text-xs text-zinc-500 uppercase tracking-wider">
                    {{ template.tasks.length }} Tasks
                  </span>
                  <div class="px-2 py-1 bg-white/5 rounded text-[10px] text-zinc-400 uppercase tracking-wider">
                    {{ template.category }}
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Selected Template Preview -->
        @if (selectedTemplate()) {
          <div class="border-t border-white/10 p-6 bg-zinc-900/50 shrink-0">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="text-xl font-semibold text-white mb-2">{{ selectedTemplate()!.title }}</h3>
                <p class="text-sm text-zinc-400">{{ selectedTemplate()!.description }}</p>
              </div>
              <button 
                (click)="selectedTemplate.set(null)"
                class="text-zinc-500 hover:text-white transition-colors ml-4">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div class="flex gap-3">
              <button 
                (click)="useTemplate(selectedTemplate()!)"
                [disabled]="isCreating()"
                class="flex-1 px-6 py-3 bg-white text-zinc-900 font-semibold rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                @if (isCreating()) {
                  <span class="flex items-center justify-center gap-2">
                    <div class="w-4 h-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
                    Creating Project...
                  </span>
                } @else {
                  Use This Template
                }
              </button>
              <button 
                (click)="selectedTemplate.set(null)"
                class="px-6 py-3 bg-zinc-800 text-zinc-300 font-semibold rounded-lg hover:bg-zinc-700 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        }
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
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class TemplateLibraryComponent {
  private templateService = inject(TemplateLibraryService);
  private projectService = inject(ProjectService);
  private notification = inject(NotificationService);

  close = output<void>();
  
  selectedCategory = signal<string>('all');
  selectedTemplate = signal<ProjectTemplate | null>(null);
  isCreating = signal(false);

  templates = this.templateService.getTemplates();
  categories = this.templateService.getCategories();

  filteredTemplates = signal(this.templates);

  constructor() {
    this.filteredTemplates.set(this.templates);
  }

  ngOnInit() {
    this.selectedCategory.subscribe(category => {
      if (category === 'all') {
        this.filteredTemplates.set(this.templates);
      } else {
        this.filteredTemplates.set(
          this.templates.filter(t => t.category === category)
        );
      }
    });
  }

  selectTemplate(template: ProjectTemplate) {
    this.selectedTemplate.set(template);
  }

  async useTemplate(template: ProjectTemplate) {
    this.isCreating.set(true);
    
    try {
      const today = new Date();
      const tasksWithDates = template.tasks.map((task, index) => ({
        ...task,
        startDate: new Date(today.getTime() + index * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + (index + 3) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }));

      await this.projectService.addProject(
        template.title,
        template.description,
        tasksWithDates
      );

      this.notification.notify(
        'Template Applied',
        `Project "${template.title}" created successfully`,
        'success'
      );

      this.close.emit();
    } catch (e) {
      this.notification.notify(
        'Template Error',
        'Failed to create project from template',
        'critical'
      );
    } finally {
      this.isCreating.set(false);
    }
  }
}
