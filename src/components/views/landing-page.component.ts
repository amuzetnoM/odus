
import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[100] bg-zinc-950 text-white overflow-y-auto custom-scrollbar">
       <!-- Navigation -->
        <nav class="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-md border-b border-white/5">
            <div class="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-white text-black flex items-center justify-center font-bold text-xs rounded-sm">O</div>
                    <span class="font-light tracking-[0.3em] text-sm text-white">ODUS</span>
                </div>
                <div class="hidden md:flex gap-8 text-xs font-medium uppercase tracking-widest text-zinc-500">
                    <a href="docs/index.html" target="_blank" class="hover:text-white transition-colors">Blueprints</a>
                    <a href="docs/index.html#architecture" target="_blank" class="hover:text-white transition-colors">Architecture</a>
                </div>
                <button (click)="launch.emit()" class="px-6 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest rounded hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    Enter System
                </button>
            </div>
        </nav>

        <!-- Hero Section -->
        <header class="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
            <!-- Abstract Background Elements -->
            <div class="absolute inset-0 z-0 pointer-events-none">
                <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-[120px] animate-pulse"></div>
                <div class="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-zinc-800/20 rounded-full blur-[100px]" style="animation-delay: -3s"></div>
                <!-- Grid -->
                <div class="absolute inset-0" style="background-image: radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 50px 50px; opacity: 0.2"></div>
            </div>

            <div class="relative z-10 text-center max-w-4xl px-6">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] uppercase tracking-widest text-zinc-400 mb-8 backdrop-blur-md animate-fade-in-up">
                    <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    System Online
                </div>
                
                <h1 class="text-5xl md:text-8xl font-thin tracking-tighter text-white mb-6 animate-fade-in-up" style="animation-delay: 0.1s">
                    PROJECT MGT <br />
                    <span class="font-serif italic text-zinc-500">REIMAGINED</span>
                </h1>
                
                <p class="text-zinc-400 text-lg md:text-xl font-light max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style="animation-delay: 0.2s">
                    A zoneless, AI-native workspace. Generate project structures, visualize relationships, and predict risks before they happen.
                </p>

                <div class="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style="animation-delay: 0.3s">
                    <button (click)="launch.emit()" class="px-8 py-4 bg-white text-black text-sm font-bold uppercase tracking-widest rounded hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                        Initialize System
                    </button>
                    <a href="docs/index.html" target="_blank" class="px-8 py-4 border border-white/10 bg-white/5 text-white text-sm font-bold uppercase tracking-widest rounded hover:bg-white/10 transition-colors backdrop-blur-md">
                        View Blueprints
                    </a>
                </div>
            </div>
        </header>

        <!-- Feature Grid -->
        <section class="py-32 relative z-10 bg-zinc-900 border-t border-white/5">
            <div class="max-w-7xl mx-auto px-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="p-8 border border-white/5 bg-zinc-950/50 rounded-2xl hover:border-white/20 transition-colors group">
                         <div class="mb-6 w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                         </div>
                         <h3 class="text-xl font-light mb-2">Generative Core</h3>
                         <p class="text-sm text-zinc-500 leading-relaxed">ODUS uses Gemini 2.5 Flash to construct exhaustive project boards from a single prompt, complete with dependencies and scheduling.</p>
                    </div>

                    <div class="p-8 border border-white/5 bg-zinc-950/50 rounded-2xl hover:border-white/20 transition-colors group">
                         <div class="mb-6 w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                         </div>
                         <h3 class="text-xl font-light mb-2">Neural Analysis</h3>
                         <p class="text-sm text-zinc-500 leading-relaxed">Predictive risk assessment scans your Gantt charts for circular logic, bottlenecks, and critical path failures.</p>
                    </div>

                    <div class="p-8 border border-white/5 bg-zinc-950/50 rounded-2xl hover:border-white/20 transition-colors group">
                         <div class="mb-6 w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                         </div>
                         <h3 class="text-xl font-light mb-2">Local First</h3>
                         <p class="text-sm text-zinc-500 leading-relaxed">Powered by IndexedDB. Your data resides on your device, encrypted and persistent. Zero latency state management.</p>
                    </div>
                </div>
            </div>
        </section>

        <footer class="py-12 bg-zinc-950 text-center text-[10px] text-zinc-600 uppercase tracking-widest border-t border-white/5">
            ODUS AI • v1.0.0 • SYSTEM NOMINAL
        </footer>
    </div>
  `,
  styles: [`
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
  `]
})
export class LandingPageComponent {
  launch = output();
}
