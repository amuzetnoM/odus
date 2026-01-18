
import { Component, inject, signal, effect, computed, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MindService, MindNode } from '../../services/mind.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-mind-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="absolute inset-0 w-full h-full bg-[#050505] overflow-hidden select-none font-sans">
       <!-- Infinite Canvas -->
       <div #graphContainer 
            class="w-full h-full cursor-grab active:cursor-grabbing relative z-0"
            (dblclick)="onCanvasDoubleClick($event)">
       </div>

       <!-- Overlay UI: Help / Status -->
       <div class="absolute bottom-6 left-6 pointer-events-none z-10 flex flex-col gap-2">
           <div class="bg-zinc-950/80 backdrop-blur border border-white/5 px-4 py-2 rounded-full flex items-center gap-3 shadow-2xl">
               <span class="w-2 h-2 rounded-full" [class.bg-green-500]="!isProcessing()" [class.bg-yellow-500]="isProcessing()"></span>
               <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                   {{ isProcessing() ? 'NEURAL PROCESSING...' : 'SYSTEM READY' }}
               </span>
           </div>
           <div class="text-[9px] text-zinc-600 font-mono px-2 hidden sm:block">
               DBL CLICK: ADD • CLICK: EDIT • HOLD/R-CLICK: MENU
           </div>
       </div>

       <!-- Connection Mode Indicator -->
       @if (connectingSourceId()) {
           <div class="absolute top-6 left-1/2 -translate-x-1/2 z-50 animate-pulse w-full max-w-xs px-4">
               <div class="bg-indigo-600/90 text-white px-6 py-2 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.5)] border border-indigo-400 font-bold text-xs uppercase tracking-widest text-center truncate">
                   Select Target
               </div>
               <button (click)="cancelConnection()" class="block mx-auto mt-2 text-[10px] text-zinc-500 hover:text-white underline pointer-events-auto">Cancel</button>
           </div>
       }

       <!-- Context Menu (Absolute Positioned) -->
       @if (contextMenu(); as menu) {
           <div 
             class="absolute z-50 min-w-[140px] bg-zinc-900/95 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl flex flex-col py-1 animate-scale-in origin-top-left"
             [style.left.px]="menu.x"
             [style.top.px]="menu.y"
             (click)="$event.stopPropagation()">
              
              <div class="px-3 py-2 border-b border-white/5 text-[10px] text-zinc-500 font-bold uppercase tracking-wider truncate max-w-[200px]">
                  {{ menu.node.title }}
              </div>

              <button (click)="initiateConnection(menu.node)" class="text-left px-3 py-2 text-xs text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-100 transition-colors flex items-center gap-2 w-full">
                  <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> Connect
              </button>
              
              <button (click)="deleteNode(menu.node.id)" class="text-left px-3 py-2 text-xs text-red-400 hover:bg-red-900/20 hover:text-red-200 transition-colors flex items-center gap-2 w-full">
                  <span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span> Delete
              </button>
              
              <button (click)="closeContextMenu()" class="text-left px-3 py-2 text-xs text-zinc-500 hover:bg-white/5 transition-colors w-full">
                  Cancel
              </button>
           </div>
       }

       <!-- Quick Add Input (Floats at click location) -->
       @if (quickAddPos(); as pos) {
           <div 
             class="absolute z-50 w-64 animate-scale-in"
             [style.left.px]="pos.x"
             [style.top.px]="pos.y">
              <div class="bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-1 overflow-hidden">
                  <textarea 
                    #quickInput
                    [(ngModel)]="inputContent"
                    (keydown.enter)="commitQuickAdd()"
                    (keydown.escape)="cancelQuickAdd()"
                    placeholder="Capture thought..."
                    class="w-full bg-transparent text-sm text-white placeholder:text-zinc-600 p-3 outline-none resize-none h-20"
                    autofocus
                  ></textarea>
                  <div class="flex justify-between items-center px-2 pb-2">
                      <span class="text-[9px] text-zinc-600 font-mono">ENTER to Create</span>
                      <button (click)="commitQuickAdd()" class="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform">
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                      </button>
                  </div>
              </div>
           </div>
       }

       <!-- IMMERSIVE MARKDOWN EDITOR -->
       @if (editingNode(); as node) {
          <div class="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center animate-fade-in p-0 sm:p-4 md:p-8" (click)="closeEditor()">
              <div 
                class="w-full h-full sm:h-auto sm:max-h-[90vh] max-w-5xl bg-[#09090b] sm:border border-white/10 shadow-2xl rounded-none sm:rounded-xl flex flex-col overflow-hidden relative" 
                (click)="$event.stopPropagation()">
                
                <!-- Editor Header -->
                <div class="h-14 border-b border-white/5 flex items-center justify-between px-4 sm:px-6 bg-zinc-900/30 shrink-0 gap-4">
                    <input 
                       [ngModel]="node.title" 
                       (ngModelChange)="updateTitle($event)"
                       class="bg-transparent text-lg sm:text-xl font-light tracking-wide text-white focus:outline-none flex-1 placeholder:text-zinc-700 min-w-0" 
                       placeholder="Untitled Node"
                    />
                    
                    <div class="flex gap-2 sm:gap-3 shrink-0">
                         <button (click)="togglePreview()" class="px-3 sm:px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold border border-white/10 rounded hover:bg-white/5 transition-colors" [class.bg-white_10]="showPreview()" [class.text-white]="showPreview()" [class.text-zinc-500]="!showPreview()">
                            {{ showPreview() ? 'Edit' : 'Preview' }}
                         </button>
                         <button (click)="closeEditor()" class="px-3 sm:px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold text-zinc-500 hover:text-white transition-colors">
                            Done
                         </button>
                    </div>
                </div>

                <!-- Editor Toolbar (Responsive) -->
                @if (!showPreview()) {
                    <div class="border-b border-white/5 bg-zinc-900/20 px-4 py-2 flex items-center gap-1 sm:gap-2 overflow-x-auto custom-scrollbar shrink-0">
                        <button (click)="insertMarkdown('**', '**')" class="w-7 h-7 flex shrink-0 items-center justify-center hover:bg-white/10 rounded text-zinc-400 hover:text-white font-bold transition-colors text-xs" title="Bold">B</button>
                        <button (click)="insertMarkdown('_', '_')" class="w-7 h-7 flex shrink-0 items-center justify-center hover:bg-white/10 rounded text-zinc-400 hover:text-white italic transition-colors text-xs" title="Italic">I</button>
                        <div class="w-px h-4 bg-white/10 mx-1"></div>
                        <button (click)="insertMarkdown('# ')" class="w-7 h-7 flex shrink-0 items-center justify-center hover:bg-white/10 rounded text-zinc-400 hover:text-white font-bold transition-colors text-xs" title="Heading 1">H1</button>
                        <button (click)="insertMarkdown('## ')" class="w-7 h-7 flex shrink-0 items-center justify-center hover:bg-white/10 rounded text-zinc-400 hover:text-white font-bold transition-colors text-[10px]" title="Heading 2">H2</button>
                        <div class="w-px h-4 bg-white/10 mx-1"></div>
                        <button (click)="insertMarkdown('- ')" class="w-7 h-7 flex shrink-0 items-center justify-center hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors" title="List">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </button>
                        <button (click)="insertCodeBlock()" class="w-7 h-7 flex shrink-0 items-center justify-center hover:bg-white/10 rounded text-zinc-400 hover:text-white font-mono text-xs transition-colors" title="Code Block">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                        </button>
                    </div>
                }

                <!-- Editor Body -->
                <div class="flex-1 relative group bg-[#050505] overflow-hidden flex flex-col">
                    @if (!showPreview()) {
                        <textarea 
                           #editorArea
                           [ngModel]="node.content"
                           (ngModelChange)="updateContent($event)"
                           class="flex-1 w-full bg-transparent text-zinc-300 font-mono text-sm sm:text-base p-4 sm:p-8 resize-none focus:outline-none leading-relaxed custom-scrollbar selection:bg-indigo-500/30"
                           placeholder="Type your thoughts here..."
                           spellcheck="false"
                        ></textarea>
                    } @else {
                        <div class="w-full h-full p-4 sm:p-8 overflow-y-auto custom-scrollbar">
                           <div class="prose prose-invert prose-zinc max-w-3xl mx-auto" [innerHTML]="parsedContent()"></div>
                        </div>
                    }
                </div>
                
                <!-- Editor Footer Metadata -->
                <div class="h-8 bg-zinc-950 border-t border-white/5 flex items-center px-4 gap-4 text-[9px] text-zinc-600 font-mono uppercase tracking-wider shrink-0 overflow-hidden whitespace-nowrap">
                    <span>{{ node.id.substring(0,8) }}</span>
                    <span>{{ node.content.length }} Chars</span>
                    <span class="truncate">Tags: {{ node.tags.join(', ') || 'NONE' }}</span>
                </div>
              </div>
          </div>
       }
    </div>
  `,
  styles: [`
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
    .animate-scale-in { animation: scaleIn 0.1s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .animate-fade-in { animation: fadeIn 0.2s ease-out; }
  `]
})
export class MindBoardComponent {
  mindService = inject(MindService);
  
  graphContainer = viewChild<ElementRef>('graphContainer');
  quickInput = viewChild<ElementRef>('quickInput'); 
  editorArea = viewChild<ElementRef>('editorArea');

  // State
  inputContent = signal('');
  isProcessing = signal(false);
  quickAddPos = signal<{x: number, y: number} | null>(null);
  contextMenu = signal<{x: number, y: number, node: MindNode} | null>(null);
  connectingSourceId = signal<string | null>(null);
  
  // Editor State
  editingNode = signal<MindNode | null>(null);
  showPreview = signal(false);

  parsedContent = computed(() => {
     const raw = this.editingNode()?.content || '';
     return this.parseMarkdown(raw);
  });

  private simulation: any;
  private width = 0;
  private height = 0;

  constructor() {
     effect(() => {
         const nodes = this.mindService.nodes();
         const container = this.graphContainer()?.nativeElement;
         if (nodes && container) {
             setTimeout(() => this.renderGraph(nodes, container), 0);
         }
     });

     effect(() => {
         if (this.quickAddPos() && this.quickInput()) {
             setTimeout(() => this.quickInput()?.nativeElement.focus(), 50);
         }
     });
  }

  // --- Interaction Handlers ---

  onCanvasDoubleClick(event: MouseEvent) {
      if (event.target !== this.graphContainer()?.nativeElement && (event.target as HTMLElement).tagName !== 'svg') return;
      this.closeContextMenu();
      this.cancelConnection();
      // Adjust click position for mobile
      this.quickAddPos.set({ x: event.clientX - 20, y: event.clientY - 20 });
  }

  async commitQuickAdd() {
      if (!this.inputContent().trim()) {
          this.cancelQuickAdd();
          return;
      }
      const pos = this.quickAddPos();
      const content = this.inputContent();
      this.cancelQuickAdd();
      this.isProcessing.set(true);
      await this.mindService.addNode(content, pos ? { x: pos.x, y: pos.y } : undefined);
      this.isProcessing.set(false);
  }

  cancelQuickAdd() {
      this.quickAddPos.set(null);
      this.inputContent.set('');
  }

  openContextMenu(event: MouseEvent, node: MindNode) {
      event.preventDefault();
      event.stopPropagation();
      this.contextMenu.set({ x: event.clientX, y: event.clientY, node });
  }

  closeContextMenu() {
      this.contextMenu.set(null);
  }

  deleteNode(id: string) {
      this.mindService.deleteNode(id);
      this.closeContextMenu();
  }

  // --- Connection Logic ---
  initiateConnection(node: MindNode) {
      this.connectingSourceId.set(node.id);
      this.closeContextMenu();
  }

  completeConnection(targetNode: MindNode) {
      const source = this.connectingSourceId();
      if (source && source !== targetNode.id) {
          this.mindService.connectNodesManual(source, targetNode.id);
      }
      this.connectingSourceId.set(null);
  }

  cancelConnection() {
      this.connectingSourceId.set(null);
  }

  // --- Editor Logic ---
  openEditor(node: MindNode) {
      this.editingNode.set(JSON.parse(JSON.stringify(node))); // Deep copy to prevent dragging issues while editing
      this.showPreview.set(false);
  }

  closeEditor() {
      // Save on close
      const node = this.editingNode();
      if (node) {
          this.mindService.updateNode(node.id, { title: node.title, content: node.content });
      }
      this.editingNode.set(null);
  }

  updateTitle(title: string) {
      this.editingNode.update(n => n ? ({ ...n, title }) : null);
  }

  updateContent(content: string) {
      this.editingNode.update(n => n ? ({ ...n, content }) : null);
  }

  togglePreview() {
      this.showPreview.set(!this.showPreview());
  }

  insertCodeBlock() {
      // Helper to avoid backtick escaping issues in template
      this.insertMarkdown('`', '`');
  }

  insertMarkdown(prefix: string, suffix: string = '') {
      const textarea = this.editorArea()?.nativeElement;
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const selection = text.substring(start, end);
      const after = text.substring(end);
      
      const newText = before + prefix + selection + suffix + after;
      this.updateContent(newText);
      
      // Restore focus and selection
      setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + prefix.length, end + prefix.length);
      });
  }

  parseMarkdown(text: string): string {
      // Very basic parser for the "Preview" mode
      let html = text
          .replace(/^# (.*$)/gim, '<h1 class="text-2xl sm:text-3xl font-light text-white mb-4 border-b border-white/10 pb-2">$1</h1>')
          .replace(/^## (.*$)/gim, '<h2 class="text-xl sm:text-2xl font-light text-white mb-3 mt-6">$1</h2>')
          .replace(/^### (.*$)/gim, '<h3 class="text-lg sm:text-xl font-medium text-white mb-2 mt-4">$1</h3>')
          .replace(/\*\*(.*)\*\*/gim, '<strong class="text-white font-bold">$1</strong>')
          .replace(/_(.*)_/gim, '<em class="text-zinc-400 italic">$1</em>')
          .replace(/`(.*)`/gim, '<code class="bg-zinc-800 text-zinc-300 px-1 rounded font-mono text-sm">$1</code>')
          .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-zinc-300 mb-1">$1</li>')
          .replace(/\n/gim, '<br />');
      return html;
  }

  // --- D3 Rendering ---

  renderGraph(mindNodes: MindNode[], container: HTMLElement) {
      d3.select(container).selectAll('*').remove();
      this.width = container.clientWidth;
      this.height = container.clientHeight;

      const nodes = mindNodes.map(n => ({ 
          ...n, 
          x: n.x ?? this.width / 2 + (Math.random() - 0.5) * 50, 
          y: n.y ?? this.height / 2 + (Math.random() - 0.5) * 50
      }));

      const links: any[] = [];
      mindNodes.forEach(n => {
          n.links.forEach(targetId => {
              if (nodes.find(node => node.id === targetId)) links.push({ source: n.id, target: targetId, type: 'semantic' });
          });
          n.manualLinks?.forEach(targetId => {
              if (nodes.find(node => node.id === targetId)) links.push({ source: n.id, target: targetId, type: 'manual' });
          });
      });

      this.simulation = d3.forceSimulation(nodes as any)
          .force('link', d3.forceLink(links).id((d: any) => d.id).distance((d: any) => d.type === 'manual' ? 80 : 180))
          .force('charge', d3.forceManyBody().strength(-200))
          .force('collide', d3.forceCollide().radius(45).strength(0.7))
          .force('center', d3.forceCenter(this.width / 2, this.height / 2).strength(0.02))
          .force('x', d3.forceX(this.width / 2).strength(0.01))
          .force('y', d3.forceY(this.height / 2).strength(0.01));

      const svg = d3.select(container).append('svg')
          .attr('width', '100%')
          .attr('height', '100%')
          .style('cursor', this.connectingSourceId() ? 'crosshair' : 'grab')
          .call(d3.zoom().scaleExtent([0.1, 4]).on('zoom', (event) => g.attr('transform', event.transform)) as any)
          .on('dblclick.zoom', null);

      const g = svg.append('g');

      const link = g.append('g')
          .selectAll('line')
          .data(links)
          .join('line')
          .attr('stroke-width', (d: any) => d.type === 'manual' ? 2 : 1)
          .attr('stroke', (d: any) => d.type === 'manual' ? '#FBBF24' : '#3f3f46')
          .attr('stroke-opacity', (d: any) => d.type === 'manual' ? 0.8 : 0.4);

      const node = g.append('g')
          .selectAll('.node')
          .data(nodes)
          .join('g')
          .attr('class', 'node group cursor-pointer')
          .call((d3.drag() as any)
              .on('start', dragstarted)
              .on('drag', dragged)
              .on('end', dragended))
          .on('contextmenu', (e, d: any) => this.openContextMenu(e, d))
          .on('click', (e, d: any) => {
              if (this.connectingSourceId()) {
                  e.stopPropagation();
                  this.completeConnection(d);
              } else if (!e.defaultPrevented) { // If not dragged
                  this.openEditor(d);
              }
          });

      node.append('circle')
          .attr('r', 0)
          .transition().duration(500)
          .attr('r', 35)
          .attr('fill', 'transparent')
          .attr('stroke', (d: any) => d.tags.includes('ROOT') ? '#ffffff' : 'transparent')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '4 2')
          .attr('class', 'opacity-20');

      node.append('circle')
          .attr('r', (d: any) => d.tags.includes('ROOT') ? 12 : 6)
          .attr('fill', '#18181b')
          .attr('stroke', (d: any) => {
              if (d.tags.includes('ROOT')) return '#fff';
              if (d.manualLinks && d.manualLinks.length > 0) return '#FBBF24';
              return '#52525b';
          })
          .attr('stroke-width', 2)
          .attr('class', 'transition-all duration-300 hover:fill-zinc-800 hover:scale-125 shadow-[0_0_15px_rgba(0,0,0,0.5)]');

      node.append('text')
          .attr('dy', 20)
          .attr('text-anchor', 'middle')
          .text((d: any) => d.title)
          .attr('fill', '#e4e4e7')
          .attr('font-size', '8px')
          .attr('font-weight', '500')
          .attr('class', 'pointer-events-none select-none tracking-wide bg-black/50 px-1 rounded');

      this.simulation.on('tick', () => {
          link
              .attr('x1', (d: any) => d.source.x)
              .attr('y1', (d: any) => d.source.y)
              .attr('x2', (d: any) => d.target.x)
              .attr('y2', (d: any) => d.target.y);
          node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
      });

      const simulation = this.simulation;
      
      function dragstarted(event: any) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
          d3.select(this).select('circle').attr('fill', '#27272a');
      }

      function dragged(event: any) {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
      }

      function dragended(event: any) {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
          d3.select(this).select('circle').attr('fill', '#18181b');
      }
  }
}
