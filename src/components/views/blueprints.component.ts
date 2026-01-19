
import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blueprints',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Main Scroll Container -->
    <div class="fixed inset-0 z-[200] bg-[#050505] overflow-y-auto custom-scrollbar text-zinc-300 font-mono">
        
        <!-- Background Grid -->
        <div class="fixed inset-0 pointer-events-none opacity-10" 
             style="background-image: linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 40px 40px;">
        </div>

        <div class="max-w-7xl mx-auto p-4 md:p-8 lg:p-12 relative min-h-screen flex flex-col">
            <!-- Close Button -->
            <button (click)="close.emit()" class="fixed top-4 right-4 z-50 px-4 py-2 bg-zinc-900/90 border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 rounded uppercase font-bold text-[10px] tracking-widest backdrop-blur-md transition-all hover:scale-105 shadow-xl">
                Close System
            </button>

            <!-- Header -->
            <header class="border-b border-white/10 pb-8 mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 relative z-10">
                <div>
                    <div class="flex items-center gap-2 text-[10px] text-zinc-500 mb-2 uppercase tracking-widest">
                        <span class="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                        System Architecture // Level 1
                    </div>
                    <h1 class="text-4xl md:text-6xl font-light tracking-tighter text-white">ODUS<span class="text-zinc-600">_CORE</span></h1>
                </div>
                <div class="flex flex-col lg:items-end text-[10px] text-zinc-500 space-y-1 font-mono">
                    <div class="flex items-center gap-4">
                        <span>RENDER: <span class="text-zinc-300">ZONELESS</span></span>
                        <span>STATE: <span class="text-zinc-300">SIGNALS</span></span>
                        <span>AI: <span class="text-zinc-300">MULTI-PROVIDER</span></span>
                    </div>
                    <div>BUILD: v2.0.0-ALPHA</div>
                </div>
            </header>

            <!-- SYSTEM VISUALIZATION (Animated SVG) -->
            <section class="mb-24 relative w-full overflow-hidden border border-white/5 bg-zinc-900/30 rounded-xl backdrop-blur-sm">
                <div class="absolute top-0 left-0 px-4 py-2 bg-zinc-950/80 border-b border-r border-white/5 text-[10px] text-zinc-500 uppercase tracking-widest z-10">
                    Live Schematic
                </div>
                
                <!-- SVG Diagram -->
                <div class="w-full overflow-x-auto p-8 flex justify-center">
                    <svg width="800" height="400" viewBox="0 0 800 400" class="min-w-[800px]">
                        <defs>
                            <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.2" />
                                <stop offset="50%" stop-color="#8b5cf6" stop-opacity="1" />
                                <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.2" />
                            </linearGradient>
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

                        <!-- Layers Labels -->
                        <text x="50" y="30" fill="#52525b" font-size="10" font-family="monospace" letter-spacing="2">INTERFACE</text>
                        <text x="350" y="30" fill="#52525b" font-size="10" font-family="monospace" letter-spacing="2">LOGIC & STATE</text>
                        <text x="650" y="30" fill="#52525b" font-size="10" font-family="monospace" letter-spacing="2">PERSISTENCE</text>

                        <!-- Dashed Divider Lines -->
                        <line x1="200" y1="50" x2="200" y2="350" stroke="#27272a" stroke-dasharray="4"/>
                        <line x1="600" y1="50" x2="600" y2="350" stroke="#27272a" stroke-dasharray="4"/>

                        <!-- NODES -->
                        
                        <!-- UI Nodes -->
                        <g transform="translate(50, 100)" class="node-group">
                            <rect width="100" height="60" rx="4" fill="#18181b" stroke="#3f3f46" stroke-width="1"/>
                            <text x="50" y="35" text-anchor="middle" fill="#e4e4e7" font-size="10" font-weight="bold">DASHBOARD</text>
                        </g>
                        <g transform="translate(50, 220)" class="node-group">
                            <rect width="100" height="60" rx="4" fill="#18181b" stroke="#3f3f46" stroke-width="1"/>
                            <text x="50" y="35" text-anchor="middle" fill="#e4e4e7" font-size="10" font-weight="bold">AGENT UI</text>
                        </g>

                        <!-- Service Nodes -->
                        <g transform="translate(300, 80)">
                            <rect width="120" height="50" rx="4" fill="#18181b" stroke="#10b981" stroke-width="1" filter="url(#glow)"/>
                            <text x="60" y="30" text-anchor="middle" fill="#10b981" font-size="10" font-weight="bold">PROJECT SERVICE</text>
                        </g>
                        <g transform="translate(300, 175)">
                            <rect width="120" height="50" rx="4" fill="#18181b" stroke="#8b5cf6" stroke-width="1" filter="url(#glow)"/>
                            <text x="60" y="30" text-anchor="middle" fill="#8b5cf6" font-size="10" font-weight="bold">AI CORE</text>
                        </g>
                        <g transform="translate(300, 270)">
                            <rect width="120" height="50" rx="4" fill="#18181b" stroke="#f59e0b" stroke-width="1" filter="url(#glow)"/>
                            <text x="60" y="30" text-anchor="middle" fill="#f59e0b" font-size="10" font-weight="bold">MIND SERVICE</text>
                        </g>

                        <!-- Persistence Nodes -->
                        <g transform="translate(650, 130)">
                            <rect width="100" height="140" rx="4" fill="#09090b" stroke="#3f3f46" stroke-width="2"/>
                            <text x="50" y="20" text-anchor="middle" fill="#71717a" font-size="9" font-weight="bold">INDEXED DB</text>
                            
                            <!-- DB Tables -->
                            <rect x="10" y="35" width="80" height="20" rx="2" fill="#27272a"/>
                            <text x="50" y="48" text-anchor="middle" fill="#52525b" font-size="8">repos</text>
                            <rect x="10" y="60" width="80" height="20" rx="2" fill="#27272a"/>
                            <text x="50" y="73" text-anchor="middle" fill="#52525b" font-size="8">files</text>
                            <rect x="10" y="85" width="80" height="20" rx="2" fill="#27272a"/>
                            <text x="50" y="98" text-anchor="middle" fill="#52525b" font-size="8">vectors</text>
                        </g>

                        <!-- External Nodes -->
                        <g transform="translate(300, 360)">
                            <rect width="120" height="30" rx="15" fill="#000" stroke="#52525b" stroke-width="1" stroke-dasharray="2"/>
                            <text x="60" y="20" text-anchor="middle" fill="#52525b" font-size="9">EXTERNAL API</text>
                        </g>

                        <!-- CONNECTIONS (Animated) -->
                        
                        <!-- UI to Services -->
                        <path d="M150 130 C 220 130, 220 105, 300 105" fill="none" stroke="#3f3f46" stroke-width="1" marker-end="url(#arrowhead)"/>
                        <path d="M150 130 C 220 130, 220 200, 300 200" fill="none" stroke="#3f3f46" stroke-width="1" marker-end="url(#arrowhead)"/>
                        <path d="M150 250 C 220 250, 220 200, 300 200" fill="none" stroke="#3f3f46" stroke-width="1" marker-end="url(#arrowhead)"/>
                        <path d="M150 250 C 220 250, 220 295, 300 295" fill="none" stroke="#3f3f46" stroke-width="1" marker-end="url(#arrowhead)"/>

                        <!-- Services to DB -->
                        <path d="M420 105 C 500 105, 550 150, 650 150" fill="none" stroke="#10b981" stroke-width="1" opacity="0.5" class="data-flow"/>
                        <path d="M420 200 C 500 200, 550 200, 650 200" fill="none" stroke="#8b5cf6" stroke-width="1" opacity="0.5" class="data-flow" style="animation-delay: -1s"/>
                        <path d="M420 295 C 500 295, 550 250, 650 250" fill="none" stroke="#f59e0b" stroke-width="1" opacity="0.5" class="data-flow" style="animation-delay: -2s"/>

                        <!-- AI Core to External -->
                        <path d="M360 225 L 360 360" fill="none" stroke="#8b5cf6" stroke-width="1" stroke-dasharray="4" opacity="0.6" class="data-flow-vertical"/>

                    </svg>
                </div>
            </section>

            <!-- Detailed Specs Grid (Responsive) -->
            <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                
                <!-- Card 1 -->
                <div class="blueprint-card group">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-8 h-8 rounded bg-zinc-900 flex items-center justify-center border border-white/10 group-hover:border-indigo-500/50 transition-colors">
                            <span class="text-indigo-400 font-bold text-xs">01</span>
                        </div>
                        <h3 class="text-white text-xs font-bold uppercase tracking-wider">Multi-Provider AI</h3>
                    </div>
                    <p class="text-[10px] text-zinc-400 leading-relaxed mb-4">
                        Abstracted AI Gateway layer supporting swappable backend providers.
                    </p>
                    <div class="flex flex-wrap gap-2">
                        <span class="chip border-indigo-500/30 text-indigo-400">Gemini 2.5 Flash</span>
                        <span class="chip border-green-500/30 text-green-400">OpenAI GPT-4o</span>
                        <span class="chip border-amber-500/30 text-amber-400">Claude 3.5</span>
                    </div>
                </div>

                <!-- Card 2 -->
                <div class="blueprint-card group">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-8 h-8 rounded bg-zinc-900 flex items-center justify-center border border-white/10 group-hover:border-cyan-500/50 transition-colors">
                            <span class="text-cyan-400 font-bold text-xs">02</span>
                        </div>
                        <h3 class="text-white text-xs font-bold uppercase tracking-wider">Neural Mind Graph</h3>
                    </div>
                    <p class="text-[10px] text-zinc-400 leading-relaxed mb-4">
                        D3.js Force Directed Graph utilizing physics-based simulation for semantic linking.
                    </p>
                    <ul class="text-[9px] text-zinc-500 space-y-1 font-mono">
                        <li>> d3-force-simulation</li>
                        <li>> auto-tagging (NLP)</li>
                        <li>> bidirectional linking</li>
                    </ul>
                </div>

                <!-- Card 3 -->
                <div class="blueprint-card group">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-8 h-8 rounded bg-zinc-900 flex items-center justify-center border border-white/10 group-hover:border-emerald-500/50 transition-colors">
                            <span class="text-emerald-400 font-bold text-xs">03</span>
                        </div>
                        <h3 class="text-white text-xs font-bold uppercase tracking-wider">Local Persistence</h3>
                    </div>
                    <p class="text-[10px] text-zinc-400 leading-relaxed mb-4">
                        Zero-latency state restoration via IndexedDB wrapper service.
                    </p>
                    <div class="w-full bg-zinc-900 rounded h-1.5 overflow-hidden">
                        <div class="bg-emerald-500 h-full w-[85%] animate-pulse"></div>
                    </div>
                    <div class="flex justify-between mt-1 text-[8px] text-zinc-600 font-mono">
                        <span>CAPACITY</span>
                        <span>85% OPTIMIZED</span>
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
        @apply bg-zinc-900/40 p-6 rounded-xl border border-white/5 backdrop-blur-sm transition-all duration-300;
    }
    .blueprint-card:hover {
        @apply bg-zinc-900/60 border-white/10 -translate-y-1 shadow-2xl;
    }
    .chip {
        @apply px-2 py-1 rounded border bg-zinc-950/50 text-[9px] font-mono uppercase;
    }

    /* SVG Animations */
    .data-flow {
        stroke-dasharray: 5;
        animation: dash 1s linear infinite;
    }
    .data-flow-vertical {
        stroke-dasharray: 5;
        animation: dash 2s linear infinite reverse;
    }

    @keyframes dash {
        to {
            stroke-dashoffset: -10;
        }
    }
  `]
})
export class BlueprintsComponent {
  close = output();
}
