
import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blueprints',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Main Scroll Container -->
    <div class="fixed inset-0 z-[200] bg-zinc-950 overflow-y-auto custom-scrollbar text-zinc-300 font-mono">
        
        <div class="max-w-7xl mx-auto p-6 md:p-12 relative min-h-screen">
            <!-- Close Button -->
            <button (click)="close.emit()" class="fixed top-6 right-6 z-50 px-4 py-2 bg-zinc-900/80 border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 rounded uppercase font-bold text-[10px] tracking-widest backdrop-blur-md transition-all hover:scale-105 shadow-xl">
                Close Blueprints
            </button>

            <!-- Header -->
            <header class="border-b border-white/10 pb-8 mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div class="text-[10px] text-zinc-500 mb-2 uppercase tracking-widest">System Architecture // Level 0</div>
                    <h1 class="text-4xl md:text-6xl font-light tracking-tighter text-white">ODUS<span class="text-zinc-600">_CORE</span></h1>
                </div>
                <div class="text-left md:text-right text-[10px] text-zinc-500 space-y-1">
                    <div class="flex items-center gap-2 md:justify-end"><span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> STATUS: NOMINAL</div>
                    <div>RENDER: ZONELESS (Signals)</div>
                    <div>BUILD: v1.4.128</div>
                </div>
            </header>

            <!-- Main Architecture Diagram -->
            <section id="architecture" class="mb-24">
                <h2 class="text-lg text-white mb-12 border-l-2 border-indigo-500 pl-4 tracking-widest uppercase">Logic Flow</h2>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 relative">
                    
                    <!-- INPUT LAYER -->
                    <div class="flex flex-col gap-6">
                        <div class="text-center text-[10px] text-zinc-600 uppercase tracking-widest mb-2">Input Layer</div>
                        
                        <div class="blueprint-card group">
                            <h3 class="text-white font-bold mb-3 text-xs uppercase tracking-wider">User Interface</h3>
                            <ul class="text-[10px] text-zinc-400 space-y-2">
                                <li class="flex items-center gap-2"><span class="w-1 h-1 bg-zinc-600 rounded-full"></span> Dashboard (Component)</li>
                                <li class="flex items-center gap-2"><span class="w-1 h-1 bg-zinc-600 rounded-full"></span> Project Board (D3/Canvas)</li>
                                <li class="flex items-center gap-2"><span class="w-1 h-1 bg-zinc-600 rounded-full"></span> Voice Agent (WebSpeech)</li>
                            </ul>
                            <div class="absolute inset-0 border border-white/5 rounded-lg pointer-events-none group-hover:border-indigo-500/30 transition-colors"></div>
                        </div>

                        <div class="hidden lg:block h-8 w-px bg-zinc-800 mx-auto"></div>

                        <div class="blueprint-card border-dashed !bg-transparent group">
                            <h3 class="text-white font-bold mb-3 text-xs uppercase tracking-wider">External Data</h3>
                            <ul class="text-[10px] text-zinc-400 space-y-2">
                                <li class="flex items-center gap-2"><span class="w-1 h-1 bg-zinc-600 rounded-full"></span> GitHub API (Rest)</li>
                                <li class="flex items-center gap-2"><span class="w-1 h-1 bg-zinc-600 rounded-full"></span> File System (Drag/Drop)</li>
                            </ul>
                            <div class="absolute inset-0 border border-dashed border-zinc-800 rounded-lg pointer-events-none group-hover:border-zinc-600 transition-colors"></div>
                        </div>
                    </div>

                    <!-- PROCESSING CORE -->
                    <div class="flex flex-col justify-center relative py-8 lg:py-0">
                        <!-- Connectors (Desktop) -->
                        <div class="hidden lg:block absolute top-1/2 -left-6 w-6 h-px bg-zinc-800"></div>
                        <div class="hidden lg:block absolute top-1/2 -right-6 w-6 h-px bg-zinc-800"></div>
                        
                        <!-- Connectors (Mobile) -->
                        <div class="lg:hidden absolute left-1/2 -top-4 w-px h-8 bg-zinc-800"></div>
                        <div class="lg:hidden absolute left-1/2 -bottom-4 w-px h-8 bg-zinc-800"></div>

                        <div class="blueprint-card !p-8 !bg-zinc-900/80 border !border-indigo-500/20 shadow-2xl relative overflow-hidden">
                             <!-- Scanline -->
                            <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent pointer-events-none animate-scan"></div>
                            
                            <div class="absolute -top-3 left-4 bg-zinc-950 px-2 text-[10px] text-indigo-400 font-bold tracking-widest border border-indigo-900/30 rounded">ANGULAR SIGNALS CORE</div>
                            
                            <div class="space-y-6 relative z-10">
                                <div class="flex items-center gap-4 group">
                                    <div class="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                    <div class="flex-1">
                                        <div class="text-xs text-white font-bold uppercase tracking-wider group-hover:text-emerald-300 transition-colors">Project Service</div>
                                        <div class="text-[9px] text-zinc-500">State Management / CRUD</div>
                                    </div>
                                </div>

                                <div class="w-full h-px bg-zinc-800 relative overflow-hidden">
                                    <div class="absolute top-0 left-0 w-8 h-full bg-indigo-500 animate-packet"></div>
                                </div>

                                <div class="flex items-center gap-4 group">
                                    <div class="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                                    <div class="flex-1">
                                        <div class="text-xs text-white font-bold uppercase tracking-wider group-hover:text-indigo-300 transition-colors">Gemini Service</div>
                                        <div class="text-[9px] text-zinc-500">Intelligence / Reasoning</div>
                                    </div>
                                </div>

                                <div class="w-full h-px bg-zinc-800 relative overflow-hidden">
                                    <div class="absolute top-0 left-0 w-8 h-full bg-indigo-500 animate-packet" style="animation-delay: 0.5s"></div>
                                </div>

                                <div class="flex items-center gap-4 group">
                                    <div class="w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                                    <div class="flex-1">
                                        <div class="text-xs text-white font-bold uppercase tracking-wider group-hover:text-amber-300 transition-colors">Mind Service</div>
                                        <div class="text-[9px] text-zinc-500">Graph Theory / Links</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- PERSISTENCE LAYER -->
                    <div class="flex flex-col justify-center gap-6">
                         <div class="text-center text-[10px] text-zinc-600 uppercase tracking-widest mb-2">Persistence Layer</div>

                         <div class="blueprint-card !bg-black/50 border !border-zinc-800">
                            <h3 class="text-zinc-300 font-bold mb-4 text-xs uppercase tracking-wider">IndexedDB Storage</h3>
                            <div class="grid grid-cols-2 gap-3 text-[9px] text-zinc-500 font-mono">
                                <div class="border border-zinc-800 p-2 rounded bg-zinc-900/50 flex items-center justify-between">
                                    <span>REPOS</span> <span class="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
                                </div>
                                <div class="border border-zinc-800 p-2 rounded bg-zinc-900/50 flex items-center justify-between">
                                    <span>FILES</span> <span class="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
                                </div>
                                <div class="border border-zinc-800 p-2 rounded bg-zinc-900/50 flex items-center justify-between">
                                    <span>AI_MEM</span> <span class="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
                                </div>
                                <div class="border border-zinc-800 p-2 rounded bg-zinc-900/50 flex items-center justify-between">
                                    <span>META</span> <span class="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            </section>

            <!-- Bottom Grid: Specs & Pipeline -->
            <section class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
                <!-- Code Spec -->
                <div>
                    <h2 class="text-lg text-white mb-6 border-l-2 border-indigo-500 pl-4 tracking-widest uppercase">Entity Spec: Task</h2>
                    <div class="bg-[#0c0c0e] border border-white/5 rounded-xl p-6 overflow-x-auto custom-scrollbar group hover:border-white/10 transition-colors">
<pre class="text-[10px] sm:text-xs leading-relaxed font-mono">
<span class="text-purple-400">interface</span> <span class="text-yellow-200">Task</span> <span class="text-zinc-500">{{ '{' }}</span>
  <span class="text-blue-300">id</span>: <span class="text-emerald-300">UUID</span>;
  <span class="text-blue-300">title</span>: <span class="text-emerald-300">string</span>;
  <span class="text-blue-300">status</span>: <span class="text-orange-300">'todo'</span> | <span class="text-orange-300">'in-progress'</span> | <span class="text-orange-300">'done'</span>;
  <span class="text-blue-300">priority</span>: <span class="text-orange-300">'low'</span> | <span class="text-orange-300">'medium'</span> | <span class="text-orange-300">'high'</span>;
  
  <span class="text-zinc-600">// AI Generated</span>
  <span class="text-blue-300">aiTags</span>: <span class="text-emerald-300">string[]</span>;
  <span class="text-blue-300">embeddingVector</span>?: <span class="text-emerald-300">number[]</span>;
  
  <span class="text-zinc-600">// Relationships</span>
  <span class="text-blue-300">dependencyIds</span>: <span class="text-emerald-300">UUID[]</span>;
  <span class="text-blue-300">attachmentIds</span>: <span class="text-emerald-300">UUID[]</span>;
  
  <span class="text-zinc-600">// Meta</span>
  <span class="text-blue-300">inFocusList</span>: <span class="text-emerald-300">boolean</span>; <span class="text-zinc-600">// Founder's Focus</span>
  <span class="text-blue-300">focusIndex</span>: <span class="text-emerald-300">number</span>;
<span class="text-zinc-500">{{ '}' }}</span>
</pre>
                    </div>
                </div>

                <!-- Pipeline -->
                <div>
                    <h2 class="text-lg text-white mb-6 border-l-2 border-indigo-500 pl-4 tracking-widest uppercase">AI Data Pipeline</h2>
                    <div class="space-y-4">
                        <div class="flex items-center gap-4 group">
                            <div class="w-8 h-8 flex items-center justify-center border border-zinc-700 rounded text-zinc-500 text-xs font-bold group-hover:border-indigo-500 group-hover:text-indigo-500 transition-colors">1</div>
                            <div class="flex-1 p-3 bg-zinc-900/50 border border-white/5 rounded text-xs font-mono text-zinc-400 group-hover:text-white transition-colors">
                                USER PROMPT -> "Create marketing plan"
                            </div>
                        </div>
                        
                        <div class="h-4 w-px bg-zinc-800 ml-4"></div>
                        
                        <div class="flex items-center gap-4 group">
                            <div class="w-8 h-8 flex items-center justify-center border border-zinc-700 rounded text-zinc-500 text-xs font-bold group-hover:border-indigo-500 group-hover:text-indigo-500 transition-colors">2</div>
                            <div class="flex-1 p-3 bg-zinc-900/50 border border-white/5 rounded text-xs font-mono text-zinc-400 group-hover:text-white transition-colors">
                                GEMINI FLASH 2.5 -> STRUCTURAL ANALYSIS
                            </div>
                        </div>
                        
                        <div class="h-4 w-px bg-zinc-800 ml-4"></div>
                        
                        <div class="flex items-center gap-4 group">
                            <div class="w-8 h-8 flex items-center justify-center border border-zinc-700 rounded text-zinc-500 text-xs font-bold group-hover:border-indigo-500 group-hover:text-indigo-500 transition-colors">3</div>
                            <div class="flex-1 p-3 bg-zinc-900/50 border border-white/5 rounded text-xs font-mono text-zinc-400 group-hover:text-white transition-colors">
                                JSON HYDRATION -> ProjectService.addProject()
                            </div>
                        </div>
                        
                        <div class="h-4 w-px bg-zinc-800 ml-4"></div>
                        
                        <div class="flex items-center gap-4 group">
                            <div class="w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded text-xs font-bold shadow-lg shadow-indigo-500/20">4</div>
                            <div class="flex-1 p-3 bg-indigo-900/20 border border-indigo-500/30 rounded text-xs font-mono text-white">
                                UI UPDATE (ZONELESS SIGNAL)
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer class="text-center text-[10px] text-zinc-600 border-t border-white/5 pt-8 font-mono">
                ODUS_AI // CONFIDENTIAL BLUEPRINTS // NEXUS_CORP
            </footer>
        </div>
    </div>
  `,
  styles: [`
    .blueprint-card {
        @apply bg-zinc-900/50 p-6 rounded-xl relative border border-white/5 backdrop-blur-sm transition-all duration-300;
    }
    .blueprint-card:hover {
        @apply bg-zinc-900 border-white/10 -translate-y-1 shadow-xl;
    }

    @keyframes packet {
        0% { left: -20%; opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { left: 120%; opacity: 0; }
    }
    .animate-packet {
        animation: packet 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }

    @keyframes scan {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100%); }
    }
    .animate-scan {
        animation: scan 4s linear infinite;
    }
  `]
})
export class BlueprintsComponent {
  close = output();
}
