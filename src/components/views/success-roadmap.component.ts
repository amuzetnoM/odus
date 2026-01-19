
import { Component, inject, viewChild, ElementRef, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService, Task } from '../../services/project.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-success-roadmap',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col h-full bg-zinc-900/10 border border-white/5 rounded-xl backdrop-blur-sm overflow-hidden relative group">
        <div class="p-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/40">
            <h2 class="text-xs font-semibold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
               <span class="w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_8px_cyan] animate-pulse"></span> Success Path
            </h2>
        </div>
        
        <div #graphContainer class="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden"></div>
        
        <div class="absolute bottom-4 right-4 text-[9px] text-zinc-600 font-mono pointer-events-none text-right">
            OPTIMAL DELIVERY VECTOR<br>
            <span class="text-cyan-500/50 animate-pulse">COMPUTE_OPTIMIZED</span>
        </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .flow-line {
        stroke-dasharray: 4 4;
        animation: flowDash 1s linear infinite;
        filter: url(#neon-glow);
    }
    
    :host ::ng-deep .critical-node-glow {
        animation: neonPulse 2s ease-in-out infinite;
    }

    @keyframes flowDash {
        to { stroke-dashoffset: -8; }
    }

    @keyframes neonPulse {
        0% { r: 12; opacity: 0.1; stroke-width: 0; }
        50% { r: 16; opacity: 0.3; stroke-width: 1px; }
        100% { r: 12; opacity: 0.1; stroke-width: 0; }
    }
  `]
})
export class SuccessRoadmapComponent implements OnDestroy {
    projectService = inject(ProjectService);
    graphContainer = viewChild<ElementRef>('graphContainer');
    
    private simulation: any;
    private resizeObserver: ResizeObserver;

    constructor() {
        effect(() => {
            const tasks = this.projectService.allTasks();
            const container = this.graphContainer()?.nativeElement;
            if (tasks && container) {
                // Debounce render
                requestAnimationFrame(() => this.render(tasks, container));
            }
        });
    }

    ngAfterViewInit() {
        const el = this.graphContainer()?.nativeElement;
        if (el) {
            this.resizeObserver = new ResizeObserver(() => {
                // Wrap in RAF to prevent "ResizeObserver loop limit exceeded"
                requestAnimationFrame(() => {
                    this.render(this.projectService.allTasks(), el);
                });
            });
            this.resizeObserver.observe(el);
        }
    }

    ngOnDestroy() {
        if (this.simulation) this.simulation.stop();
        if (this.resizeObserver) this.resizeObserver.disconnect();
    }

    render(allTasks: any[], container: HTMLElement) {
        if (!container.clientWidth) return;
        
        d3.select(container).selectAll('*').remove();
        
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        // 1. Filter & Prepare Data
        const activeTasks = allTasks.filter(t => t.status !== 'done');
        
        if (activeTasks.length === 0) {
            d3.select(container).append('div')
              .attr('class', 'h-full flex items-center justify-center text-zinc-700 text-xs uppercase tracking-widest')
              .text('No Active Trajectory');
            return;
        }

        // 2. Identify Critical Path (Robust Heuristics)
        const criticalSet = new Set<string>();

        // Sort by date to understand flow
        const sortedByDate = [...activeTasks].sort((a,b) => {
            const da = a.endDate ? new Date(a.endDate).getTime() : 0;
            const db = b.endDate ? new Date(b.endDate).getTime() : 0;
            return da - db;
        });

        // Pass 1: High Priority (Explicit Business Value)
        activeTasks.filter(t => t.priority === 'high').forEach(t => criticalSet.add(t.id));

        // Pass 2: Structural Hubs (If roadmap is too thin)
        if (criticalSet.size < 3) {
            const blockedCounts = new Map<string, number>();
            activeTasks.forEach(t => {
                (t.dependencyIds || []).forEach((depId: string) => {
                    blockedCounts.set(depId, (blockedCounts.get(depId) || 0) + 1);
                });
            });
            // Add top blockers
            [...blockedCounts.entries()]
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .forEach(([id]) => criticalSet.add(id));
        }

        // Pass 3: Temporal Spine (Ensure we have a beginning, middle, and end)
        if (criticalSet.size < 3 && sortedByDate.length > 0) {
            criticalSet.add(sortedByDate[0].id); // Start
            if (sortedByDate.length > 2) criticalSet.add(sortedByDate[Math.floor(sortedByDate.length / 2)].id); // Middle
            criticalSet.add(sortedByDate[sortedByDate.length - 1].id); // End
        }

        // 3. Build Nodes & Links
        const nodes = activeTasks.map(t => ({
            id: t.id,
            title: t.title,
            isCritical: criticalSet.has(t.id),
            priority: t.priority,
            color: t.projectColor,
            r: criticalSet.has(t.id) ? 6 : 4,
            startDate: t.startDate,
            endDate: t.endDate,
            ...t
        }));

        const links: any[] = [];
        
        // A. Explicit Dependencies
        nodes.forEach(n => {
            if (n.dependencyIds) {
                n.dependencyIds.forEach(depId => {
                    if (nodes.find(node => node.id === depId)) {
                        links.push({ source: depId, target: n.id, type: 'dependency' });
                    }
                });
            }
        });

        // B. Implicit "Flow" Links (Chain critical nodes by date)
        const criticalNodes = nodes
            .filter(n => n.isCritical)
            .sort((a,b) => {
                // Stable sort for critical path
                const da = a.endDate ? new Date(a.endDate).getTime() : 0;
                const db = b.endDate ? new Date(b.endDate).getTime() : 0;
                return da - db;
            });

        for (let i = 0; i < criticalNodes.length - 1; i++) {
            links.push({ 
                source: criticalNodes[i].id, 
                target: criticalNodes[i+1].id, 
                type: 'flow',
                dashed: true
            });
        }

        // 4. Force Simulation
        const svg = d3.select(container).append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', [0, 0, width, height]);

        // Gradient & Filter Definitions
        const defs = svg.append('defs');
        
        const gradient = defs.append('linearGradient')
            .attr('id', 'pathGradient')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '0%');
        gradient.append('stop').attr('offset', '0%').attr('stop-color', '#22d3ee').attr('stop-opacity', 0.1);
        gradient.append('stop').attr('offset', '50%').attr('stop-color', '#22d3ee').attr('stop-opacity', 0.4);
        gradient.append('stop').attr('offset', '100%').attr('stop-color', '#22d3ee').attr('stop-opacity', 0.1);

        const filter = defs.append('filter')
            .attr('id', 'neon-glow')
            .attr('x', '-50%')
            .attr('y', '-50%')
            .attr('width', '200%')
            .attr('height', '200%');
        
        filter.append('feGaussianBlur')
            .attr('stdDeviation', '2.5')
            .attr('result', 'coloredBlur');
            
        const feMerge = filter.append('feMerge');
        feMerge.append('feMergeNode').attr('in', 'coloredBlur');
        feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        // Pin Critical Nodes to the Spine
        const xStep = width / (criticalNodes.length + 1);
        criticalNodes.forEach((n, i) => {
            n.fx = xStep * (i + 1);
            n.fy = height / 2; // Lock vertical
        });

        this.simulation = d3.forceSimulation(nodes as any)
            .force('link', d3.forceLink(links).id((d: any) => d.id).distance(60).strength(0.5))
            .force('charge', d3.forceManyBody().strength(-150))
            .force('collide', d3.forceCollide().radius(20))
            // Non-critical nodes float around the middle, pulled slightly to their date position relative to width
            .force('y', d3.forceY(height / 2).strength(0.1))
            .force('x', d3.forceX((d: any) => {
                if (d.isCritical) return d.fx;
                return width / 2; // Default center pull for others
            }).strength(0.05));

        // Draw 'Success Line'
        svg.append('line')
            .attr('x1', xStep)
            .attr('y1', height / 2)
            .attr('x2', width - xStep)
            .attr('y2', height / 2)
            .attr('stroke', 'url(#pathGradient)')
            .attr('stroke-width', 2)
            .attr('class', 'opacity-50');

        const link = svg.append('g')
            .selectAll('line')
            .data(links)
            .join('line')
            .attr('stroke', (d: any) => d.type === 'flow' ? '#22d3ee' : '#52525b')
            .attr('stroke-width', (d: any) => d.type === 'flow' ? 2 : 1)
            .attr('stroke-opacity', (d: any) => d.type === 'flow' ? 0.8 : 0.3)
            .attr('class', (d: any) => d.type === 'flow' ? 'flow-line' : '');

        const node = svg.append('g')
            .selectAll('g')
            .data(nodes)
            .join('g')
            .attr('class', 'cursor-pointer')
            .call((d3.drag() as any)
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));

        node.filter((d: any) => d.isCritical)
            .append('circle')
            .attr('r', 12)
            .attr('fill', (d: any) => d.color || '#fff')
            .attr('stroke', (d: any) => d.color || '#fff')
            .attr('class', 'critical-node-glow');

        node.append('circle')
            .attr('r', (d: any) => d.r)
            .attr('fill', '#18181b')
            .attr('stroke', (d: any) => d.isCritical ? (d.color || '#fff') : '#52525b')
            .attr('stroke-width', (d: any) => d.isCritical ? 2 : 1)
            .style('filter', (d: any) => d.isCritical ? 'url(#neon-glow)' : 'none');

        node.append('text')
            .attr('dy', (d: any) => d.isCritical ? -18 : 15)
            .attr('text-anchor', 'middle')
            .text((d: any) => d.title.length > 12 ? d.title.substring(0,10)+'..' : d.title)
            .attr('font-size', (d: any) => d.isCritical ? '9px' : '7px')
            .attr('fill', (d: any) => d.isCritical ? '#fff' : '#71717a')
            .attr('font-weight', (d: any) => d.isCritical ? 'bold' : 'normal')
            .style('text-shadow', (d: any) => d.isCritical ? '0 0 10px rgba(0,0,0,0.8)' : 'none')
            .attr('class', 'pointer-events-none select-none font-mono uppercase tracking-tight');

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
        }
        function dragged(event: any) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }
        function dragended(event: any) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }
    }
}
