
import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GithubService } from '../../services/github.service';
import { GeminiService } from '../../services/gemini.service';
import { PersistenceService } from '../../services/persistence.service';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-github-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col bg-zinc-950/20 relative overflow-hidden">
       <!-- Toolbar -->
       <div class="h-14 border-b border-white/5 bg-zinc-900/40 backdrop-blur flex items-center justify-between px-4 shrink-0 z-50">
          <div class="flex items-center gap-4">
             <button (click)="toggleRepoList()" class="text-zinc-400 hover:text-white transition-colors p-1 rounded hover:bg-white/5">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16"></path></svg>
             </button>
             <div class="flex items-center gap-3">
                 <div class="w-2 h-2 rounded-full shadow-[0_0_8px_white]" [class.bg-green-500]="hasToken()" [class.bg-red-500]="!hasToken()"></div>
                 <span class="text-xs font-bold tracking-widest text-zinc-300 uppercase hidden sm:block">GitHub Intelligence</span>
             </div>
          </div>
          
          <div class="flex gap-2 items-center">
             @if (!hasToken()) {
                 <div class="flex items-center gap-2 px-3 py-1.5 rounded border border-red-900/30 bg-red-900/10 text-red-400 text-[10px] uppercase tracking-wide">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    <span>Config Required</span>
                 </div>
             }
             <button (click)="fetchRepos()" class="bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300 p-1.5 rounded-sm transition-colors" title="Force Sync">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
             </button>
          </div>
       </div>

       <!-- Main Content Area -->
       <div class="flex-1 relative overflow-hidden flex min-h-0">
          
          <!-- Floating Repo List (Sidebar) -->
          <div 
             class="absolute top-0 bottom-0 left-0 w-80 bg-zinc-900/95 backdrop-blur-xl border-r border-white/10 z-40 transition-transform duration-300 shadow-2xl flex flex-col transform h-full"
             [class.-translate-x-full]="!isRepoListOpen()"
             [class.translate-x-0]="isRepoListOpen()">
             
             <!-- Sidebar Header/Filters -->
             <div class="p-4 border-b border-white/5 space-y-3 bg-zinc-950/50 shrink-0">
                <div class="flex justify-between items-center">
                    <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Repositories</span>
                    <button (click)="isRepoListOpen.set(false)" class="text-zinc-500 hover:text-white">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <input 
                  [(ngModel)]="searchQuery" 
                  class="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-600 placeholder:text-zinc-700"
                  placeholder="Filter repositories..."
                />
                <div class="flex gap-2">
                    <button 
                       (click)="filterSourceOnly.set(!filterSourceOnly())"
                       [class.bg-zinc-700]="filterSourceOnly()"
                       [class.text-white]="filterSourceOnly()"
                       class="flex-1 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-500 uppercase tracking-wide hover:border-zinc-600 transition-colors">
                       Source
                    </button>
                    <button 
                       (click)="filterActiveOnly.set(!filterActiveOnly())"
                       [class.bg-zinc-700]="filterActiveOnly()"
                       [class.text-white]="filterActiveOnly()"
                       class="flex-1 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-500 uppercase tracking-wide hover:border-zinc-600 transition-colors">
                       Active
                    </button>
                </div>
             </div>

             <!-- List -->
             <div class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1 min-h-0">
                @for (repo of filteredRepos(); track repo.id) {
                   <button 
                     (click)="selectRepo(repo)"
                     [class.bg-white_10]="selectedRepo()?.id === repo.id"
                     [class.text-white]="selectedRepo()?.id === repo.id"
                     [class.text-zinc-400]="selectedRepo()?.id !== repo.id"
                     class="w-full text-left px-3 py-2.5 rounded hover:bg-white/5 transition-all flex items-center justify-between group border border-transparent hover:border-white/5">
                     <div class="flex items-center gap-3 min-w-0">
                        @if (repo.fork) {
                            <svg class="w-4 h-4 shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                        } @else {
                            <svg class="w-4 h-4 shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                        }
                        <span class="text-xs truncate font-medium">{{ repo.name }}</span>
                     </div>
                     @if (repo.private) { 
                        <span class="text-[9px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500 group-hover:bg-zinc-700">Lock</span> 
                     }
                   </button>
                }
             </div>
             <div class="p-3 border-t border-white/5 text-[10px] text-zinc-600 text-center font-mono bg-zinc-950/50 shrink-0">
                {{ filteredRepos().length }} / {{ repos().length }} Repositories
             </div>
          </div>

          <!-- Backdrop -->
          @if (isRepoListOpen()) {
             <div (click)="isRepoListOpen.set(false)" class="absolute inset-0 bg-black/50 backdrop-blur-sm z-30 animate-fade-in"></div>
          }

          <!-- Analysis / Detail Panel (Full Width) -->
          <div class="flex-1 flex flex-col min-w-0 bg-zinc-950/30 overflow-hidden relative z-10 h-full">
             @if (selectedRepo(); as repo) {
                <!-- Repo Header -->
                <div class="p-4 sm:p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start bg-zinc-900/20 gap-4 shrink-0">
                   <div class="min-w-0 flex-1">
                       <div class="flex items-center gap-3 flex-wrap">
                          <h1 class="text-2xl font-light text-white tracking-tight truncate">{{ repo.name }}</h1>
                          <div class="flex gap-2">
                             <span class="text-[10px] px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-500 uppercase">{{ repo.visibility }}</span>
                             @if(repo.fork) { <span class="text-[10px] px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-600 uppercase">Fork</span> }
                             @if(repo.archived) { <span class="text-[10px] px-1.5 py-0.5 rounded border border-red-900 text-red-400 uppercase">Archived</span> }
                          </div>
                       </div>
                       <p class="text-xs text-zinc-500 mt-2 max-w-2xl leading-relaxed">{{ repo.description || 'No description provided.' }}</p>
                       
                       <div class="flex gap-4 mt-4 text-[10px] text-zinc-400 font-mono flex-wrap">
                          <span class="flex items-center gap-1">
                             <div class="w-2 h-2 rounded-full bg-yellow-500/50"></div> {{ repo.language || 'Unknown' }}
                          </span>
                          <span>Updated {{ repo.updated_at | date:'shortDate' }}</span>
                          <span>{{ repo.default_branch }}</span>
                       </div>
                   </div>

                   <button 
                     (click)="analyzeAndPopulate()" 
                     [disabled]="isAnalyzing()"
                     class="group relative w-full sm:w-32 h-10 bg-white text-black text-xs font-bold uppercase tracking-widest overflow-hidden transition-all hover:bg-zinc-200 disabled:opacity-50 flex items-center justify-center rounded-sm shrink-0">
                        @if (isAnalyzing()) {
                            <div class="w-4 h-4 border-2 border-zinc-400 border-t-black rounded-full animate-spin"></div>
                        } @else {
                            <div class="flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                                <span>ADD</span>
                            </div>
                        }
                   </button>
                </div>

                <!-- Terminal / Content Area -->
                <div class="flex-1 p-4 sm:p-6 overflow-hidden flex flex-col min-h-0">
                    <div class="flex-1 bg-black border border-zinc-800 rounded-lg overflow-hidden flex flex-col font-mono text-xs shadow-2xl relative group">
                        <!-- Scanline Effect -->
                        <div class="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20"></div>

                        <div class="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex justify-between items-center shrink-0 z-20">
                            <div class="flex items-center gap-2">
                                <span class="text-zinc-500">od_sys_console</span>
                                <span class="px-1 bg-zinc-800 text-[9px] text-zinc-400 rounded">bash</span>
                            </div>
                            <div class="flex gap-1.5">
                                <div class="w-2 h-2 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                <div class="w-2 h-2 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                                <div class="w-2 h-2 rounded-full bg-green-500/20 border border-green-500/50"></div>
                            </div>
                        </div>
                        
                        <div class="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-2 relative z-20 font-mono">
                            @if (analysisLog().length === 0) {
                                <div class="h-full flex flex-col items-center justify-center opacity-40 select-none">
                                    <div class="w-2 h-4 bg-zinc-500 animate-pulse"></div>
                                    <p class="mt-2 text-zinc-600">Awaiting Command Input...</p>
                                </div>
                            }
                            
                            @for (log of analysisLog(); track $index) {
                                <div class="flex gap-3 animate-type">
                                    <span class="text-zinc-600 shrink-0 select-none">[{{ log.time | date:'HH:mm:ss' }}]</span>
                                    <span class="text-zinc-300">
                                        <span class="text-green-500 mr-2 font-bold">➜</span>
                                        {{ log.message }}
                                    </span>
                                </div>
                            }
                            @if (isAnalyzing()) {
                                <div class="flex gap-2 items-center text-zinc-500">
                                    <span class="animate-pulse">_</span>
                                </div>
                            }
                        </div>
                    </div>
                </div>

             } @else {
                <div class="h-full flex flex-col items-center justify-center text-zinc-600 p-8 text-center">
                   <div class="w-16 h-16 border border-zinc-800 rounded-full flex items-center justify-center mb-4 bg-zinc-900/50">
                      <svg class="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                   </div>
                   <h3 class="text-lg font-light text-zinc-400 tracking-widest mb-2">NO SIGNAL</h3>
                   <p class="text-xs font-mono uppercase tracking-widest text-zinc-600">
                      @if(hasToken()) {
                          Select a repository from the stream to begin analysis.
                      } @else {
                          Configure GitHub Access Token in Settings to enable intelligence.
                      }
                   </p>
                </div>
             }
          </div>
       </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    @keyframes type { from { opacity: 0; transform: translateX(-5px); } to { opacity: 1; transform: translateX(0); } }
    .animate-type { animation: type 0.1s ease-out forwards; }
    
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
  `]
})
export class GithubViewComponent {
  githubService = inject(GithubService);
  geminiService = inject(GeminiService);
  persistence = inject(PersistenceService);
  projectService = inject(ProjectService);
  
  repos = signal<any[]>([]);
  searchQuery = signal('');
  selectedRepo = signal<any>(null);
  hasToken = signal(false);
  
  // Filters
  filterSourceOnly = signal(true);
  filterActiveOnly = signal(true);

  isAnalyzing = signal(false);
  analysisLog = signal<{time: Date, message: string}[]>([]);
  isRepoListOpen = signal(true);

  filteredRepos = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const sourceOnly = this.filterSourceOnly();
    const activeOnly = this.filterActiveOnly();

    return this.repos()
      .filter(r => {
          if (!r.name.toLowerCase().includes(q)) return false;
          if (sourceOnly && r.fork) return false;
          if (activeOnly && r.archived) return false;
          return true;
      })
      .sort((a,b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  });

  constructor() {
      // Responsive check on init
      if (window.innerWidth < 1024) {
          this.isRepoListOpen.set(false);
      }

      // Reactive Auto-Loader
      effect(() => {
          const token = this.githubService.getToken();
          this.hasToken.set(!!token);
          
          if (token && this.repos().length === 0) {
              this.fetchRepos();
          }
      });
  }
  
  toggleRepoList() {
      this.isRepoListOpen.set(!this.isRepoListOpen());
  }

  async fetchRepos() {
      if (!this.hasToken()) return;
      try {
          const repos = await this.githubService.getUserRepos();
          this.repos.set(repos);
          this.isRepoListOpen.set(true);
      } catch (e) {
          // Silent fail or UI indicator handled by empty state logic
          console.error("Failed to sync repos", e);
      }
  }

  selectRepo(repo: any) {
      this.selectedRepo.set(repo);
      this.analysisLog.set([]);
      
      // Auto close on smaller screens for better UX
      if (window.innerWidth < 1024) {
          this.isRepoListOpen.set(false);
      }
  }

  log(message: string) {
      this.analysisLog.update(prev => [...prev, { time: new Date(), message }]);
  }

  async analyzeAndPopulate() {
      if (!this.selectedRepo()) return;
      this.isAnalyzing.set(true);
      const repo = this.selectedRepo();
      this.analysisLog.set([]);
      
      try {
          // 1. Fetch Basic Info
          this.log(`Initiating connection to ${repo.name}...`);
          this.log(`Fetching latest commits from branch: ${repo.default_branch}...`);
          const commits = await this.githubService.getRepoCommits(repo.owner.login, repo.name);
          const commitSummary = commits.map((c: any) => `- ${c.commit.message} (${c.commit.author.name})`).join('\n');
          this.log(`Retrieved ${commits.length} recent commits.`);
          
          // 2. Fetch File Tree
          this.log(`Scanning file tree structure...`);
          const treeData = await this.githubService.getRepoTree(repo.owner.login, repo.name);
          
          const files = treeData.tree
            .filter((t: any) => t.type === 'blob')
            .map((t: any) => t.path)
            .slice(0, 300) 
            .join('\n');
            
          this.log(`Mapped ${treeData.tree.length} file system nodes.`);

          // 3. Fetch Deep Context (Readme / Package.json)
          this.log(`Retrieving documentation (README.md)...`);
          const readme = await this.githubService.getFileContent(repo.owner.login, repo.name, 'README.md');
          
          this.log(`Retrieving configuration (package.json)...`);
          const packageJson = await this.githubService.getFileContent(repo.owner.login, repo.name, 'package.json');

          // 4. Persistence Snapshot
          this.log(`Snapshotting state to local persistence layer...`);
          await this.persistence.saveRepoData(repo.id, { 
              name: repo.name, 
              commits: commits.slice(0, 5), 
              structure: files.substring(0, 100) + '...' 
          });

          // 5. Multi-Pass AI Analysis
          this.log(`[PASS 1] Transmitting context to AI Analysis Core (Drafting)...`);
          this.log(`Context Size: ~${(files.length + commitSummary.length + (readme?.length||0)).toString()} bytes`);
          
          const tasks = await this.geminiService.analyzeRepoAndPlan(
              repo.name, 
              files, 
              commitSummary,
              readme,
              packageJson
          );
          
          this.log(`[PASS 2] AI Review Loop complete. Refined task list generated.`);
          this.log(`Generated ${tasks.length} strategic tasks.`);
          
          this.projectService.addProject(repo.name, `GitHub Imported: ${repo.description || ''}`, tasks);
          
          this.log(`Board "${repo.name}" initialized successfully.`);
          this.log(`Process terminated. Ready.`);

      } catch (e) {
          console.error(e);
          this.log('CRITICAL ERROR: Analysis sequence failed. Check console.');
      } finally {
          this.isAnalyzing.set(false);
      }
  }
}
