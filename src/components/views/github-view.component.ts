
import { Component, inject, signal, computed } from '@angular/core';
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
    <div class="h-full flex flex-col bg-zinc-950/20">
       <!-- Toolbar -->
       <div class="h-12 border-b border-white/5 bg-zinc-900/40 backdrop-blur flex items-center justify-between px-4 shrink-0">
          <div class="flex items-center gap-3">
             <div class="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_white]"></div>
             <span class="text-xs font-bold tracking-widest text-zinc-300 uppercase">GitHub Integration</span>
          </div>
          
          <div class="flex gap-2 items-center">
             <div class="relative group">
                 <input 
                   [ngModel]="token()"
                   (change)="updateToken($event)"
                   type="password"
                   class="bg-zinc-950 border border-zinc-800 rounded-sm px-2 py-1 text-[10px] text-zinc-400 w-32 focus:w-64 focus:text-white focus:border-zinc-600 transition-all outline-none font-mono"
                   placeholder="GH_TOKEN"
                 />
                 <div class="absolute right-2 top-1.5 w-1.5 h-1.5 rounded-full" [class.bg-green-500]="!!token()" [class.bg-red-500]="!token()"></div>
             </div>
             <button (click)="fetchRepos()" class="bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300 p-1.5 rounded-sm transition-colors" title="Sync Repos">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
             </button>
          </div>
       </div>

       <div class="flex-1 flex overflow-hidden">
          
          <!-- Compact Repo List (Sidebar) -->
          <div class="w-72 flex flex-col border-r border-white/5 bg-zinc-900/10">
             <div class="p-2 border-b border-white/5 space-y-2">
                <input 
                  [(ngModel)]="searchQuery" 
                  class="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-[10px] text-zinc-300 focus:outline-none placeholder:text-zinc-600"
                  placeholder="Filter repositories..."
                />
                <!-- Filters -->
                <div class="flex gap-2">
                    <button 
                       (click)="filterSourceOnly.set(!filterSourceOnly())"
                       [class.bg-zinc-700]="filterSourceOnly()"
                       [class.text-white]="filterSourceOnly()"
                       class="flex-1 py-1 rounded bg-zinc-900 border border-zinc-800 text-[9px] text-zinc-500 uppercase tracking-wide hover:border-zinc-600 transition-colors">
                       Source Only
                    </button>
                    <button 
                       (click)="filterActiveOnly.set(!filterActiveOnly())"
                       [class.bg-zinc-700]="filterActiveOnly()"
                       [class.text-white]="filterActiveOnly()"
                       class="flex-1 py-1 rounded bg-zinc-900 border border-zinc-800 text-[9px] text-zinc-500 uppercase tracking-wide hover:border-zinc-600 transition-colors">
                       Active Only
                    </button>
                </div>
             </div>
             <div class="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-0.5">
                @for (repo of filteredRepos(); track repo.id) {
                   <button 
                     (click)="selectRepo(repo)"
                     [class.bg-white_10]="selectedRepo()?.id === repo.id"
                     [class.text-white]="selectedRepo()?.id === repo.id"
                     [class.text-zinc-400]="selectedRepo()?.id !== repo.id"
                     class="w-full text-left px-3 py-2 rounded-sm hover:bg-white/5 transition-all flex items-center justify-between group">
                     <div class="flex items-center gap-2 min-w-0">
                        @if (repo.fork) {
                            <svg class="w-3 h-3 shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                        } @else {
                            <svg class="w-3 h-3 shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                        }
                        <span class="text-[11px] truncate font-medium">{{ repo.name }}</span>
                     </div>
                     @if (repo.private) { 
                        <span class="text-[8px] bg-zinc-800 px-1 rounded text-zinc-500 group-hover:bg-zinc-700">Lock</span> 
                     }
                   </button>
                }
             </div>
             <div class="p-2 border-t border-white/5 text-[9px] text-zinc-600 text-center font-mono">
                {{ filteredRepos().length }} / {{ repos().length }} Repositories
             </div>
          </div>

          <!-- Analysis / Detail Panel -->
          <div class="flex-1 flex flex-col min-w-0 bg-zinc-950/30">
             @if (selectedRepo(); as repo) {
                <!-- Repo Header -->
                <div class="p-6 border-b border-white/5 flex justify-between items-start bg-zinc-900/20">
                   <div>
                       <div class="flex items-baseline gap-3">
                          <h1 class="text-2xl font-light text-white tracking-tight">{{ repo.name }}</h1>
                          <span class="text-[10px] px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-500 uppercase">{{ repo.visibility }}</span>
                          @if(repo.fork) { <span class="text-[10px] px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-600 uppercase">Fork</span> }
                          @if(repo.archived) { <span class="text-[10px] px-1.5 py-0.5 rounded border border-red-900 text-red-400 uppercase">Archived</span> }
                       </div>
                       <p class="text-xs text-zinc-500 mt-2 max-w-2xl leading-relaxed">{{ repo.description || 'No description provided.' }}</p>
                       
                       <div class="flex gap-4 mt-4 text-[10px] text-zinc-400 font-mono">
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
                     class="group relative w-32 h-9 bg-white text-black text-xs font-bold uppercase tracking-widest overflow-hidden transition-all hover:bg-zinc-200 disabled:opacity-50 flex items-center justify-center rounded-sm">
                        @if (isAnalyzing()) {
                            <div class="w-4 h-4 border-2 border-zinc-400 border-t-black rounded-full animate-spin"></div>
                        } @else {
                            <div class="flex items-center gap-2">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                                <span>ADD</span>
                            </div>
                        }
                   </button>
                </div>

                <!-- Terminal / Content Area -->
                <div class="flex-1 p-6 overflow-hidden flex flex-col">
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
                <div class="h-full flex flex-col items-center justify-center text-zinc-600">
                   <div class="w-16 h-16 border border-zinc-800 rounded-full flex items-center justify-center mb-4 bg-zinc-900/50">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                   </div>
                   <p class="text-xs font-mono uppercase tracking-widest">Select Repository</p>
                </div>
             }
          </div>
       </div>
    </div>
  `,
  styles: [`
    @keyframes type { from { opacity: 0; transform: translateX(-5px); } to { opacity: 1; transform: translateX(0); } }
    .animate-type { animation: type 0.1s ease-out forwards; }
  `]
})
export class GithubViewComponent {
  githubService = inject(GithubService);
  geminiService = inject(GeminiService);
  persistence = inject(PersistenceService);
  projectService = inject(ProjectService);
  
  token = signal('');
  repos = signal<any[]>([]);
  searchQuery = signal('');
  selectedRepo = signal<any>(null);
  
  // Filters
  filterSourceOnly = signal(true);
  filterActiveOnly = signal(true);

  isAnalyzing = signal(false);
  analysisLog = signal<{time: Date, message: string}[]>([]);

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
      this.token.set(this.githubService.getToken());
      if (this.token()) this.fetchRepos();
  }

  updateToken(event: any) {
      this.githubService.setToken(event.target.value);
  }

  async fetchRepos() {
      try {
          const repos = await this.githubService.getUserRepos();
          this.repos.set(repos);
      } catch (e) {
          alert('Failed to sync GitHub. Check Token.');
      }
  }

  selectRepo(repo: any) {
      this.selectedRepo.set(repo);
      this.analysisLog.set([]);
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
