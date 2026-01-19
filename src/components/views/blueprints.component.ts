
import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blueprints',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8 min-h-screen">
        <!-- Close Button -->
        <button (click)="close.emit()" class="fixed top-6 right-6 z-50 px-4 py-2 bg-[#00e5ff]/10 border border-[#00e5ff] text-[#00e5ff] hover:bg-[#00e5ff]/20 rounded uppercase font-bold text-xs tracking-widest backdrop-blur-md transition-all hover:scale-105">
            Return to Console
        </button>

        <!-- Header -->
        <header class="border-b border-cyan-900/50 pb-8 mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
                <div class="text-[10px] text-cyan-600 mb-2 font-mono">CLASSIFIED // SYSTEM ARCHITECTURE // V1.0</div>
                <h1 class="text-4xl md:text-6xl font-bold tracking-tighter glow-text font-mono">ODUS<span class="text-white">_CORE</span></h1>
            </div>
            <div class="text-left md:text-right text-xs text-cyan-500 font-mono">
                <div>STATUS: <span class="text-green-400">ONLINE</span></div>
                <div>LATENCY: <span class="text-green-400">0.01ms</span></div>
                <div>MODE: <span class="text-white">ZONELESS</span></div>
            </div>
        </header>

        <!-- Main Architecture Diagram -->
        <section id="architecture" class="mb-24 relative min-h-[600px]">
            <h2 class="text-xl mb-12 border-l-4 border-cyan-500 pl-4 font-mono">LOGIC_FLOW_DIAGRAM</h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                
                <!-- INPUT LAYER -->
                <div class="flex flex-col gap-6">
                    <div class="text-center text-xs text-cyan-700 mb-2 font-mono">INPUT_LAYER</div>
                    
                    <div class="blueprint-box p-6 hover:bg-cyan-900/10 transition-colors">
                        <h3 class="text-white font-bold mb-2 font-mono">USER_INTERFACE</h3>
                        <ul class="text-xs text-cyan-400 space-y-2 list-none font-mono">
                            <li>> Dashboard (Component)</li>
                            <li>> Project Board (D3/Canvas)</li>
                            <li>> Voice Agent (WebSpeech)</li>
                        </ul>
                    </div>

                    <div class="h-8 w-px bg-cyan-500/30 mx-auto"></div>

                    <div class="blueprint-box p-6 border-dashed border-cyan-500/30">
                        <h3 class="text-white font-bold mb-2 font-mono">EXTERNAL_DATA</h3>
                        <ul class="text-xs text-cyan-400 space-y-2 font-mono">
                            <li>> GitHub API (Rest)</li>
                            <li>> File System (Drag/Drop)</li>
                        </ul>
                    </div>
                </div>

                <!-- PROCESSING CORE -->
                <div class="flex flex-col justify-center relative">
                    <!-- Connectors -->
                    <div class="hidden md:block absolute top-1/2 -left-6 w-6 h-px bg-cyan-500"></div>
                    <div class="hidden md:block absolute top-1/2 -right-6 w-6 h-px bg-cyan-500"></div>

                    <div class="blueprint-box p-8 border-2 border-white/20 shadow-[0_0_30px_rgba(0,229,255,0.1)]">
                        <div class="absolute -top-3 left-4 bg-[#050505] px-2 text-xs text-white font-bold font-mono">ANGULAR_SIGNALS_CORE</div>
                        
                        <div class="space-y-6">
                            <div class="flex items-center gap-4">
                                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <div class="flex-1">
                                    <div class="text-sm text-white font-bold font-mono">PROJECT_SERVICE</div>
                                    <div class="text-[10px] text-cyan-600 font-mono">State Management / CRUD</div>
                                </div>
                            </div>

                            <div class="data-stream w-full"></div>

                            <div class="flex items-center gap-4">
                                <div class="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                                <div class="flex-1">
                                    <div class="text-sm text-white font-bold font-mono">GEMINI_SERVICE</div>
                                    <div class="text-[10px] text-cyan-600 font-mono">Intelligence / Reasoning</div>
                                </div>
                            </div>

                            <div class="data-stream w-full"></div>

                            <div class="flex items-center gap-4">
                                <div class="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                <div class="flex-1">
                                    <div class="text-sm text-white font-bold font-mono">MIND_SERVICE</div>
                                    <div class="text-[10px] text-cyan-600 font-mono">Graph Theory / Links</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PERSISTENCE LAYER -->
                <div class="flex flex-col justify-center gap-6">
                     <div class="text-center text-xs text-cyan-700 mb-2 font-mono">PERSISTENCE_LAYER</div>

                     <div class="blueprint-box p-6 bg-black/50">
                        <h3 class="text-white font-bold mb-2 font-mono">INDEXED_DB</h3>
                        <div class="grid grid-cols-2 gap-2 text-[10px] text-cyan-500 font-mono">
                            <div class="border border-cyan-900 p-1">STORE: repos</div>
                            <div class="border border-cyan-900 p-1">STORE: files</div>
                            <div class="border border-cyan-900 p-1">STORE: ai_mem</div>
                            <div class="border border-cyan-900 p-1">STORE: meta</div>
                        </div>
                     </div>
                </div>
            </div>
        </section>

        <!-- Entity Spec -->
        <section class="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
            <div>
                <h2 class="text-xl mb-6 border-l-4 border-cyan-500 pl-4 font-mono">ENTITY_SPEC: TASK</h2>
                <div class="blueprint-box p-6 font-mono text-xs leading-relaxed">
<pre class="text-cyan-300 overflow-x-auto">
interface Task {{ '{' }}
  id: UUID;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  
  // AI Generated
  aiTags: string[];
  embeddingVector?: number[];
  
  // Relationships
  dependencyIds: UUID[];
  attachmentIds: UUID[];
  
  // Meta
  inFocusList: boolean; // Founder's Focus
  focusIndex: number;
{{ '}' }}
</pre>
                </div>
            </div>
            <div>
                <h2 class="text-xl mb-6 border-l-4 border-cyan-500 pl-4 font-mono">AI_PIPELINE</h2>
                <div class="space-y-4">
                    <div class="flex items-center gap-4">
                        <div class="w-8 h-8 flex items-center justify-center border border-cyan-500 rounded text-cyan-500 font-mono">1</div>
                        <div class="flex-1 p-2 bg-cyan-900/20 border border-cyan-900/50 text-xs font-mono">USER PROMPT -> "Create marketing plan"</div>
                    </div>
                    <div class="h-4 w-px bg-cyan-500 ml-4"></div>
                    <div class="flex items-center gap-4">
                        <div class="w-8 h-8 flex items-center justify-center border border-cyan-500 rounded text-cyan-500 font-mono">2</div>
                        <div class="flex-1 p-2 bg-cyan-900/20 border border-cyan-900/50 text-xs font-mono">GEMINI FLASH 2.5 -> STRUCTURAL ANALYSIS</div>
                    </div>
                    <div class="h-4 w-px bg-cyan-500 ml-4"></div>
                    <div class="flex items-center gap-4">
                        <div class="w-8 h-8 flex items-center justify-center border border-cyan-500 rounded text-cyan-500 font-mono">3</div>
                        <div class="flex-1 p-2 bg-cyan-900/20 border border-cyan-900/50 text-xs font-mono">JSON HYDRATION -> ProjectService.addProject()</div>
                    </div>
                     <div class="h-4 w-px bg-cyan-500 ml-4"></div>
                    <div class="flex items-center gap-4">
                        <div class="w-8 h-8 flex items-center justify-center border border-white text-white bg-cyan-600 font-mono">4</div>
                        <div class="flex-1 p-2 bg-cyan-500/20 border border-cyan-500 text-xs text-white font-mono">UI UPDATE (ZONELESS SIGNAL)</div>
                    </div>
                </div>
            </div>
        </section>

        <footer class="text-center text-[10px] text-cyan-800 border-t border-cyan-900/30 pt-8 font-mono">
            ODUS_AI // CONFIDENTIAL BLUEPRINTS // NEXUS_CORP
        </footer>
    </div>
  `,
  styles: [`
    :host {
        display: block;
        background-color: #050505;
        color: #00e5ff;
        background-image: 
            linear-gradient(rgba(0, 229, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 229, 255, 0.05) 1px, transparent 1px);
        background-size: 40px 40px;
        min-height: 100vh;
        overflow-x: hidden;
    }

    .blueprint-box {
        border: 1px solid rgba(0, 229, 255, 0.3);
        background: rgba(0, 20, 30, 0.8);
        position: relative;
    }

    .blueprint-box::before, .blueprint-box::after {
        content: '';
        position: absolute;
        width: 4px;
        height: 4px;
        background: #00e5ff;
        transition: all 0.3s ease;
    }
    .blueprint-box::before { top: -2px; left: -2px; }
    .blueprint-box::after { bottom: -2px; right: -2px; }

    .glow-text { text-shadow: 0 0 10px rgba(0, 229, 255, 0.5); }
    
    @keyframes flow {
        0% { background-position: 0 0; }
        100% { background-position: 20px 0; }
    }
    .data-stream {
        height: 2px;
        background: repeating-linear-gradient(90deg, #00e5ff 0, #00e5ff 4px, transparent 4px, transparent 8px);
        animation: flow 1s linear infinite;
        opacity: 0.5;
    }
  `]
})
export class BlueprintsComponent {
  close = output();
}
