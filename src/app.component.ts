
import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from './services/project.service';
import { DriveService } from './services/drive.service';
import { AuthService } from './services/auth.service';
import { AppControlService, AppView } from './services/app-control.service';
import { NotificationService } from './services/notification.service';
import { ProjectBoardComponent } from './components/project-board.component';
import { CreateProjectComponent } from './components/create-project.component';
import { DashboardComponent } from './components/views/dashboard.component';
import { CalendarViewComponent } from './components/views/calendar-view.component';
import { DriveViewComponent } from './components/views/drive-view.component';
import { GithubViewComponent } from './components/views/github-view.component';
import { MindBoardComponent } from './components/views/mind-board.component';
import { AiAgentComponent } from './components/ai-agent.component';
import { ToastComponent } from './components/ui/toast.component';
import { LandingPageComponent } from './components/views/landing-page.component';
import { SettingsModalComponent } from './components/settings-modal.component';
import { NotificationPanelComponent } from './components/notification-panel.component';
import { ZenModeComponent } from './components/zen-mode.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    ProjectBoardComponent, 
    CreateProjectComponent,
    DashboardComponent,
    CalendarViewComponent,
    DriveViewComponent,
    GithubViewComponent,
    MindBoardComponent,
    AiAgentComponent,
    ToastComponent,
    LandingPageComponent,
    SettingsModalComponent,
    NotificationPanelComponent,
    ZenModeComponent
  ],
  template: `
    @if (showLanding()) {
      <app-landing-page (launch)="launchApp()" />
    } @else {
      <div 
        class="flex h-screen w-screen bg-zinc-950 text-zinc-300 font-sans relative overflow-hidden animate-fade-in"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
      >
        
        <!-- Ambient Background (Cleaned) -->
        <div class="absolute inset-0 pointer-events-none z-0">
          <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-zinc-900/30 rounded-full blur-[100px] animate-drift"></div>
          <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-800/10 rounded-full blur-[120px] animate-drift" style="animation-delay: -5s"></div>
        </div>

        <!-- Sidebar -->
        <aside class="w-16 lg:w-64 border-r border-white/5 bg-zinc-950/50 backdrop-blur-md flex flex-col shrink-0 z-10 transition-all duration-300 relative group">
          
          <!-- Header / User Profile -->
          <div 
            class="p-4 lg:p-6 flex items-center justify-center lg:justify-start gap-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors group/profile"
            (click)="showSettingsModal.set(true)"
            title="Open Settings"
          >
             <div class="relative">
                <img 
                  [src]="authService.currentUser().avatar" 
                  class="w-8 h-8 rounded-full object-cover border border-white/10 group-hover/profile:border-white/30 transition-colors bg-zinc-900" 
                  alt="User"
                />
                <div class="absolute inset-0 rounded-full border border-white/10 shadow-[0_0_10px_rgba(255,255,255,0.1)] opacity-0 group-hover/profile:opacity-100 transition-opacity"></div>
             </div>
             <div class="hidden lg:flex flex-col min-w-0">
                 <span class="text-xs font-bold text-white tracking-widest uppercase truncate">{{ authService.currentUser().name }}</span>
                 <span class="text-[9px] text-zinc-500 font-mono">ID: {{ authService.currentUser().id.substring(0,4) }}</span>
             </div>
          </div>

          <!-- Nav -->
          <nav class="flex-1 py-6 flex flex-col gap-2 px-2 lg:px-4">
            <button 
              (click)="currentView.set('dashboard')"
              [class]="getNavLinkClass('dashboard')"
              class="flex items-center justify-center lg:justify-start gap-4 p-3 rounded-lg transition-all group">
              <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              <span class="hidden lg:block text-xs uppercase tracking-wider font-medium">Scope</span>
            </button>

            <button 
              (click)="currentView.set('calendar')"
              [class]="getNavLinkClass('calendar')"
              class="flex items-center justify-center lg:justify-start gap-4 p-3 rounded-lg transition-all group">
              <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <span class="hidden lg:block text-xs uppercase tracking-wider font-medium">Timeline</span>
            </button>

            <button 
              (click)="currentView.set('drive')"
              [class]="getNavLinkClass('drive')"
              class="flex items-center justify-center lg:justify-start gap-4 p-3 rounded-lg transition-all group">
              <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
              <span class="hidden lg:block text-xs uppercase tracking-wider font-medium">Data</span>
            </button>
            
            <button 
              (click)="currentView.set('mind')"
              [class]="getNavLinkClass('mind')"
              class="flex items-center justify-center lg:justify-start gap-4 p-3 rounded-lg transition-all group">
              <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" stroke-width="1.5"></circle>
                  <circle cx="12" cy="4.5" r="1.5" stroke-width="1.5"></circle>
                  <circle cx="19.5" cy="12" r="1.5" stroke-width="1.5"></circle>
                  <circle cx="12" cy="19.5" r="1.5" stroke-width="1.5"></circle>
                  <circle cx="4.5" cy="12" r="1.5" stroke-width="1.5"></circle>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9V6M15 12h3M12 15v3M9 12H6"></path>
              </svg>
              <span class="hidden lg:block text-xs uppercase tracking-wider font-medium">Mind Board</span>
            </button>

            <button 
              (click)="currentView.set('github')"
              [class]="getNavLinkClass('github')"
              class="flex items-center justify-center lg:justify-start gap-4 p-3 rounded-lg transition-all group">
              <svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              <span class="hidden lg:block text-xs uppercase tracking-wider font-medium">GitHub</span>
            </button>
            
            <div class="my-2 border-t border-white/5 mx-2"></div>
            
            <!-- Compact Project List -->
            <div class="flex-1 overflow-y-auto custom-scrollbar space-y-1">
              <div class="hidden lg:flex justify-between items-center px-2 mb-2">
                  <span class="text-[10px] text-zinc-600 font-bold uppercase">Projects</span>
                  <button (click)="showCreateModal.set(true)" class="text-zinc-500 hover:text-white">+</button>
              </div>
              @for (project of projectService.projects(); track project.id) {
                  <div 
                    (click)="toggleProject(project.id, $event)"
                    [class.bg-white_5]="isActive(project.id)"
                    class="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-white/5 transition-colors group justify-center lg:justify-start"
                    [style.border-left]="isActive(project.id) ? '2px solid ' + (project.color || 'white') : '2px solid transparent'"
                  >
                    <div class="w-2 h-2 rounded-full border border-zinc-600 group-hover:border-white transition-colors shrink-0" [style.background-color]="project.color"></div>
                    <span class="hidden lg:block text-xs truncate font-light text-zinc-400 group-hover:text-white transition-colors">{{ project.title }}</span>
                  </div>
              }
              
              <button (click)="showCreateModal.set(true)" class="lg:hidden w-full flex justify-center py-2 text-zinc-500 hover:text-white">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4"></path></svg>
              </button>
            </div>

            <!-- Settings & Notifications -->
             <div class="my-2 border-t border-white/5 mx-2"></div>

             <!-- De-stress Mode -->
             <button 
               (click)="showZenMode.set(true)"
               class="flex items-center justify-center lg:justify-start gap-4 p-3 rounded-lg transition-all text-zinc-500 hover:text-white hover:bg-white/5 group relative">
               <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               <span class="hidden lg:block text-xs uppercase tracking-wider font-medium">Zen Mode</span>
             </button>
             
             <!-- Notification Bell -->
             <button 
               (click)="showNotifications.set(!showNotifications())"
               class="flex items-center justify-center lg:justify-start gap-4 p-3 rounded-lg transition-all text-zinc-500 hover:text-white hover:bg-white/5 group relative">
               <div class="relative">
                  <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                  @if(notificationService.unreadCount() > 0) {
                     <span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 border border-zinc-950 rounded-full flex items-center justify-center text-[7px] text-white font-bold">{{ notificationService.unreadCount() > 9 ? '!' : notificationService.unreadCount() }}</span>
                  }
               </div>
               <span class="hidden lg:block text-xs uppercase tracking-wider font-medium">Alerts</span>
             </button>

             <!-- Config -->
             <button 
               (click)="showSettingsModal.set(true)"
               class="flex items-center justify-center lg:justify-start gap-4 p-3 rounded-lg transition-all text-zinc-500 hover:text-white hover:bg-white/5 group">
               <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
               <span class="hidden lg:block text-xs uppercase tracking-wider font-medium">Config</span>
             </button>
          </nav>

          <!-- Sidebar Metrics -->
          <div class="p-2 lg:p-4 bg-zinc-900/30 border-t border-white/5 hidden lg:block">
            <span class="text-[10px] text-zinc-600 font-bold uppercase mb-2 block">System Telemetry</span>
            
            <div class="grid grid-cols-2 gap-2 mb-2">
              <div class="bg-black/40 border border-white/5 rounded p-2 flex flex-col items-center">
                  <span class="text-xs text-white font-mono">{{ projectService.metrics().total }}</span>
                  <span class="text-[8px] text-zinc-500 uppercase tracking-widest">Items</span>
              </div>
              <div class="bg-black/40 border border-white/5 rounded p-2 flex flex-col items-center border-b-2 border-b-red-500/50">
                  <span class="text-xs text-white font-mono">{{ projectService.metrics().highPriority }}</span>
                  <span class="text-[8px] text-zinc-500 uppercase tracking-widest">Critical</span>
              </div>
            </div>

            <div class="bg-black/40 border border-white/5 rounded p-2 flex flex-col gap-1 mb-2">
                <div class="flex justify-between items-end">
                    <span class="text-[8px] text-zinc-500 uppercase tracking-widest">Focus Load</span>
                    <span class="text-xs font-mono text-zinc-300">{{ projectService.metrics().focusCount }}</span>
                </div>
                <div class="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div class="h-full bg-white transition-all duration-500" [style.width.%]="(projectService.metrics().focusCount / (projectService.metrics().total || 1)) * 100"></div>
                </div>
            </div>

            <div class="bg-black/40 border border-white/5 rounded p-2 flex flex-col gap-1">
                <div class="flex justify-between items-end">
                    <span class="text-[8px] text-zinc-500 uppercase tracking-widest">Health</span>
                    <span class="text-xs font-mono text-zinc-300">{{ projectService.metrics().health }}%</span>
                </div>
                <div class="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div class="h-full bg-green-500/80 transition-all duration-500" [style.width.%]="projectService.metrics().health"></div>
                </div>
            </div>
          </div>
        </aside>

        <!-- Content -->
        <main class="flex-1 flex flex-col relative min-w-0 h-full overflow-hidden">
          @switch (currentView()) {
            @case ('dashboard') { <app-dashboard /> }
            @case ('calendar') { <app-calendar-view /> }
            @case ('drive') { <app-drive-view /> }
            @case ('github') { <app-github-view class="h-full block" /> }
            @case ('mind') { <app-mind-board /> }
            @case ('projects') { 
              @if (projectService.activeProjects().length === 0) {
                  <div class="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                    <h2 class="text-xl font-light tracking-widest text-white mb-2">NO SIGNAL</h2>
                    <p class="text-xs text-zinc-500 font-mono">Select a project stream to initialize.</p>
                  </div>
              } @else {
                  <div class="flex h-full p-2 sm:p-4 gap-4 w-full overflow-x-auto snap-x snap-mandatory">
                    @for (project of projectService.activeProjects(); track project.id) {
                      <div class="flex-1 min-w-[100%] sm:min-w-[400px] lg:min-w-[600px] h-full snap-center">
                          <app-project-board 
                            [project]="project" 
                            (close)="closeProject($event)"
                            class="h-full block" 
                          />
                      </div>
                    }
                  </div>
              }
            }
          }
        </main>

        <app-ai-agent />
        <app-toast />
        
        @if (showNotifications()) {
            <app-notification-panel (close)="showNotifications.set(false)" />
        }

        @if (showZenMode()) {
            <app-zen-mode (close)="showZenMode.set(false)" />
        }

        <!-- Drag Overlay -->
        @if (isDragging()) {
          <div class="absolute inset-0 z-50 bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center border-4 border-dashed border-zinc-600 m-4 rounded-xl pointer-events-none">
              <div class="text-center">
                <svg class="w-16 h-16 mx-auto text-white mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                <h3 class="text-xl font-light text-white tracking-widest">INGEST DATA</h3>
              </div>
          </div>
        }

        @if (showCreateModal()) {
          <app-create-project (close)="showCreateModal.set(false)" />
        }
        
        @if (showSettingsModal()) {
            <app-settings-modal (close)="showSettingsModal.set(false)" />
        }
      </div>
    }
  `,
  styles: [`
     @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
     .animate-fade-in { animation: fadeIn 1s ease-out; }
  `]
})
export class AppComponent {
  authService = inject(AuthService);
  projectService = inject(ProjectService);
  driveService = inject(DriveService);
  appControlService = inject(AppControlService);
  notificationService = inject(NotificationService);
  
  showLanding = signal(true);
  showCreateModal = signal(false);
  showSettingsModal = signal(false);
  showNotifications = signal(false);
  showZenMode = signal(false);
  
  currentView = signal<AppView>('dashboard');
  isDragging = signal(false);
  
  constructor() {
    effect(() => {
      const view = this.appControlService.navigationRequest();
      if (view) {
        this.currentView.set(view);
        // Reset the signal to prevent re-triggering on other changes
        this.appControlService.navigationRequest.set(null);
      }
    });

    // Production Requirement: Ensure API Key exists, or prompt user immediately
    const key = localStorage.getItem('gemini_api_key');
    if (!key) {
        setTimeout(() => this.showSettingsModal.set(true), 1500);
    }
  }

  launchApp() {
      this.showLanding.set(false);
  }

  isActive(id: string) { return this.projectService.activeProjectIds().includes(id); }

  toggleProject(id: string, event?: MouseEvent) {
    const isMultiSelect = event?.ctrlKey || event?.metaKey || event?.shiftKey;
    
    if (isMultiSelect) {
        const wasActive = this.isActive(id);
        this.projectService.toggleProjectActive(id);
        if (!wasActive) this.currentView.set('projects');
    } else {
        const activeIds = this.projectService.activeProjectIds();
        if (activeIds.length === 1 && activeIds.includes(id)) {
             this.projectService.toggleProjectActive(id, false);
        } else {
             this.projectService.setSingleActiveProject(id);
             this.currentView.set('projects');
        }
    }
  }

  closeProject(id: string) {
      this.projectService.toggleProjectActive(id, false);
      if (this.projectService.activeProjectIds().length === 0) {
          this.currentView.set('dashboard');
      }
  }

  getNavLinkClass(view: AppView) {
    const active = this.currentView() === view;
    return active 
      ? 'bg-white text-black shadow-lg shadow-white/5' 
      : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5';
  }

  onDragOver(e: DragEvent) { e.preventDefault(); this.isDragging.set(true); }
  onDragLeave(e: DragEvent) { if (e.clientX === 0 && e.clientY === 0) this.isDragging.set(false); }
  
  onDrop(e: DragEvent) {
      e.preventDefault();
      this.isDragging.set(false);
      if (e.dataTransfer?.files) {
          Array.from(e.dataTransfer.files).forEach(file => this.driveService.addFile(file));
          this.currentView.set('drive');
      }
  }
}
