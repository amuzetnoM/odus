
import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blueprints',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Main Scroll Container -->
    <div class="fixed inset-0 z-[200] bg-[#050505] overflow-y-auto custom-scrollbar text-zinc-300 font-sans">
        
        <!-- Background Grid -->
        <div class="fixed inset-0 pointer-events-none opacity-5" 
             style="background-image: linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 40px 40px;">
        </div>

        <div class="max-w-7xl mx-auto p-4 md:p-8 lg:p-12 relative min-h-screen flex flex-col">
            <!-- Top Controls -->
            <div class="fixed top-4 right-4 z-50 flex gap-4">
                <a href="https://docs.gitbook.com" target="_blank" class="px-4 py-2 bg-zinc-900/90 border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 rounded uppercase font-bold text-[10px] tracking-widest backdrop-blur-md transition-all hover:scale-105 shadow-xl flex items-center gap-2">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                    Documentation
                </a>
                <button (click)="close.emit()" class="px-4 py-2 bg-white text-black font-bold uppercase text-[10px] tracking-widest rounded hover:bg-zinc-200 transition-all shadow-xl">
                    Close System
                </button>
            </div>

            <!-- Header -->
            <header class="border-b border-white/10 pb-12 mb-16 flex flex-col items-start relative z-10">
                <div class="flex items-center gap-2 text-[10px] text-zinc-500 mb-4 uppercase tracking-widest font-mono">
                    <span class="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                    System Specification v2.0
                </div>
                <h1 class="text-5xl md:text-7xl font-thin tracking-tighter text-white mb-2">ODUS<span class="text-zinc-600">_CORE</span></h1>
                <p class="text-zinc-500 font-mono text-xs max-w-xl leading-relaxed">
                    A comprehensive architectural overview of the Odus Project Management System.
                    Outlining data flow, component hierarchy, and persistence layers.
                </p>
            </header>

            <!-- Level 1: Macro Architecture -->
            <section class="mb-24 relative w-full">
                <div class="flex items-center gap-4 mb-6">
                    <div class="h-px bg-white/10 flex-1"></div>
                    <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Level 01: Macro Topology</span>
                    <div class="h-px bg-white/10 flex-1"></div>
                </div>

                <div class="w-full overflow-hidden border border-white/5 bg-zinc-900/30 rounded-xl backdrop-blur-sm p-8">
                     <!-- SVG Diagram -->
                     <div class="w-full overflow-x-auto flex justify-center">
                        <svg width="800" height="400" viewBox="0 0 800 400" class="min-w-[800px]">
                            <defs>
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                                    <feMerge>
                                        <feMergeNode in="coloredBlur"/>
                                        <feMergeNode in="SourceGraphic"/>
                                    </feMerge>
                                </filter>
                                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                    <polygon points="0 0, 10 3.5, 0 7" fill="#52525b" />
                                </marker>
                            </defs>

                            <!-- Zones -->
                            <rect x="20" y="20" width="200" height="360" rx="8" fill="none" stroke="#27272a" stroke-dasharray="4"/>
                            <text x="30" y="40" fill="#52525b" font-size="10" font-family="monospace" letter-spacing="2">CLIENT LAYER</text>

                            <rect x="250" y="20" width="220" height="360" rx="8" fill="none" stroke="#27272a" stroke-dasharray="4"/>
                            <text x="260" y="40" fill="#52525b" font-size="10" font-family="monospace" letter-spacing="2">LOGIC & STATE</text>

                            <rect x="500" y="20" width="280" height="360" rx="8" fill="none" stroke="#27272a" stroke-dasharray="4"/>
                            <text x="510" y="40" fill="#52525b" font-size="10" font-family="monospace" letter-spacing="2">PERSISTENCE & IO</text>

                            <!-- Nodes -->
                            <g transform="translate(60, 100)">
                                <rect width="120" height="60" rx="4" fill="#18181b" stroke="#71717a" stroke-width="1"/>
                                <text x="60" y="35" text-anchor="middle" fill="#e4e4e7" font-size="10" font-weight="bold" font-family="monospace">VIEW ENGINE</text>
                            </g>
                            
                            <g transform="translate(300, 80)">
                                <rect width="120" height="50" rx="4" fill="#18181b" stroke="#10b981" stroke-width="1" filter="url(#glow)"/>
                                <text x="60" y="30" text-anchor="middle" fill="#10b981" font-size="10" font-weight="bold" font-family="monospace">PROJECT SVC</text>
                            </g>
                            <g transform="translate(300, 175)">
                                <rect width="120" height="50" rx="4" fill="#18181b" stroke="#8b5cf6" stroke-width="1" filter="url(#glow)"/>
                                <text x="60" y="30" text-anchor="middle" fill="#8b5cf6" font-size="10" font-weight="bold" font-family="monospace">AI GATEWAY</text>
                            </g>
                            
                            <g transform="translate(580, 130)">
                                <rect width="120" height="140" rx="4" fill="#09090b" stroke="#3f3f46" stroke-width="2"/>
                                <text x="60" y="20" text-anchor="middle" fill="#71717a" font-size="9" font-weight="bold" font-family="monospace">INDEXED DB</text>
                                <rect x="20" y="35" width="80" height="15" rx="2" fill="#27272a"/>
                                <rect x="20" y="55" width="80" height="15" rx="2" fill="#27272a"/>
                                <rect x="20" y="75" width="80" height="15" rx="2" fill="#27272a"/>
                            </g>

                             <!-- Connections -->
                             <path d="M180 130 L 300 105" fill="none" stroke="#52525b" stroke-width="1" marker-end="url(#arrowhead)"/>
                             <path d="M420 105 L 580 150" fill="none" stroke="#10b981" stroke-width="1" opacity="0.5" class="data-flow"/>
                             <path d="M420 200 L 580 200" fill="none" stroke="#8b5cf6" stroke-width="1" opacity="0.5" class="data-flow" style="animation-delay: -1s"/>

                        </svg>
                     </div>
                </div>
            </section>

            <!-- Level 2: Entity & Data Flow (New Section) -->
            <section class="mb-24">
                <div class="flex items-center gap-4 mb-8">
                    <div class="h-px bg-white/10 flex-1"></div>
                    <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Level 02: Entity Relationships</span>
                    <div class="h-px bg-white/10 flex-1"></div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <!-- Col 1 -->
                     <div class="space-y-4">
                         <h3 class="font-mono text-xs text-indigo-400 font-bold uppercase mb-4">Project Structure</h3>
                         <div class="bg-zinc-900/50 border border-white/5 p-4 rounded text-xs font-mono">
                             <span class="text-zinc-500 block mb-2">// Project Root</span>
                             <div class="pl-2 border-l border-zinc-700 space-y-2">
                                 <div class="text-white">id: UUID</div>
                                 <div class="text-white">tasks: Task[]</div>
                                 <div class="text-zinc-500 pl-2 border-l border-zinc-800 mt-1">
                                     <div>dependencyIds: string[]</div>
                                     <div>attachmentIds: string[]</div>
                                     <div>aiTags: string[]</div>
                                 </div>
                             </div>
                         </div>
                     </div>

                     <!-- Col 2 -->
                     <div class="space-y-4">
                         <h3 class="font-mono text-xs text-emerald-400 font-bold uppercase mb-4">Data Persistence</h3>
                         <div class="flex flex-col gap-2">
                             <div class="flex items-center gap-3 p-3 bg-zinc-900/30 border border-white/5 rounded">
                                 <div class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                 <div class="flex-1">
                                     <div class="text-xs text-white">DriveService</div>
                                     <div class="text-[10px] text-zinc-500">Binary Blob Storage</div>
                                 </div>
                                 <code class="text-[9px] bg-zinc-950 px-1 rounded text-zinc-400">IDB</code>
                             </div>
                             <div class="flex items-center gap-3 p-3 bg-zinc-900/30 border border-white/5 rounded">
                                 <div class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                 <div class="flex-1">
                                     <div class="text-xs text-white">MindService</div>
                                     <div class="text-[10px] text-zinc-500">Graph Node Index</div>
                                 </div>
                                 <code class="text-[9px] bg-zinc-950 px-1 rounded text-zinc-400">IDB</code>
                             </div>
                         </div>
                     </div>

                     <!-- Col 3 -->
                     <div class="space-y-4">
                         <h3 class="font-mono text-xs text-amber-400 font-bold uppercase mb-4">AI Pipeline</h3>
                         <div class="relative pl-4 border-l border-zinc-800 space-y-6">
                             <div class="relative">
                                 <div class="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-zinc-800 border border-zinc-600 rounded-full"></div>
                                 <div class="text-xs text-white mb-1">Input Ingestion</div>
                                 <div class="text-[10px] text-zinc-500">User Prompt / File Content</div>
                             </div>
                             <div class="relative">
                                 <div class="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-amber-500/20 border border-amber-500 rounded-full animate-pulse"></div>
                                 <div class="text-xs text-white mb-1">Context Window</div>
                                 <div class="text-[10px] text-zinc-500">Hydration of active tasks + project metadata</div>
                             </div>
                             <div class="relative">
                                 <div class="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-zinc-800 border border-zinc-600 rounded-full"></div>
                                 <div class="text-xs text-white mb-1">Recursive Reasoning</div>
                                 <div class="text-[10px] text-zinc-500">Multi-pass generation (Draft -> Critique -> JSON)</div>
                             </div>
                         </div>
                     </div>
                </div>
            </section>

            <!-- Level 3: Tech Stack -->
            <section class="mb-12">
                 <div class="flex items-center gap-4 mb-8">
                    <div class="h-px bg-white/10 flex-1"></div>
                    <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Level 03: Technology Stack</span>
                    <div class="h-px bg-white/10 flex-1"></div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="p-4 bg-zinc-900/30 border border-white/5 rounded text-center">
                        <div class="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-mono">Core</div>
                        <div class="text-sm text-white font-bold">Angular 18+</div>
                        <div class="text-[10px] text-zinc-600 mt-1">Zoneless Signals</div>
                    </div>
                    <div class="p-4 bg-zinc-900/30 border border-white/5 rounded text-center">
                        <div class="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-mono">Intelligence</div>
                        <div class="text-sm text-white font-bold">Gemini 2.0</div>
                        <div class="text-[10px] text-zinc-600 mt-1">Flash Model</div>
                    </div>
                    <div class="p-4 bg-zinc-900/30 border border-white/5 rounded text-center">
                        <div class="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-mono">Visualization</div>
                        <div class="text-sm text-white font-bold">D3.js</div>
                        <div class="text-[10px] text-zinc-600 mt-1">Force Simulation</div>
                    </div>
                    <div class="p-4 bg-zinc-900/30 border border-white/5 rounded text-center">
                        <div class="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-mono">Style</div>
                        <div class="text-sm text-white font-bold">Tailwind</div>
                        <div class="text-[10px] text-zinc-600 mt-1">Utility First</div>
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
    /* SVG Animations */
    .data-flow {
        stroke-dasharray: 5;
        animation: dash 1s linear infinite;
    }
    @keyframes dash {
        to { stroke-dashoffset: -10; }
    }
  `]
})
export class BlueprintsComponent {
  close = output();
}
