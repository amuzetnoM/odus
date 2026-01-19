
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
               <span class="w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_8px_cyan]"></span> Success Path
            </h2>
            <div class="flex gap-2 text-[9px] font-mono text-zinc-600 uppercase">
                <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-cyan-500"></span> Critical</span>
                <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-zinc-600"></span> Tangent</span>
            </div>
        </div>
        
        <div #graphContainer class="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden"></div>
        
        <div class="absolute bottom-4 right-4 text-[9px] text-zinc-600 font-mono pointer-events-none text-right">
            OPTIMAL DELIVERY VECTOR<br>
            <span class="text-cyan-500/50">COMPUTE_OPTIMIZED</span>
        </div>
    </div>
  `
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
        // Focus on active tasks
        const activeTasks = allTasks.filter(t => t.status !== 'done');
        if (activeTasks.length === 0) {
            d3.select(container).append('div')
              .attr('class', 'h-full flex items-center justify-center text-zinc-700 text-xs uppercase tracking-widest')
              .text('No Active Trajectory');
            return;
        }

        // 2. Identify Critical Path (Heuristic: High Priority chain or Date chain)
        // We define the "Straight Path" as the sequence of High Priority items sorted by date
        const highPriority = activeTasks.filter(t => t.priority === 'high').sort((a,b) => {
            const da = a.endDate ? new Date(a.endDate).getTime() : 0;
            const db = b.endDate ? new Date(b.endDate).getTime() : 0;
            return da - db;
        });

        // Add them to a Set for O(1) lookup
        const criticalIds = new Set(highPriority.map(t => t.id));
        
        // If no high priority, take the medium ones
        if (criticalIds.size === 0) {
             activeTasks.filter(t => t.priority === 'medium').forEach(t => criticalIds.add(t.id));
        }

        // 3. Build Nodes & Links
        const nodes = activeTasks.map(t => ({
            id: t.id,
            title: t.title,
            isCritical: criticalIds.has(t.id),
            priority: t.priority,
            color: t.projectColor,
            r: criticalIds.has(t.id) ? 8 : 5,
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

        // B. Implicit "Success Path" Links (Chain the critical items together)
        const criticalNodes = nodes.filter(n => n.isCritical).sort((a,b) => {
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
        // We want a left-to-right flow.
        const svg = d3.select(container).append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', [0, 0, width, height]);

        // Gradient Definition
        const defs = svg.append('defs');
        const gradient = defs.append('linearGradient')
            .attr('id', 'pathGradient')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '0%');
        gradient.append('stop').attr('offset', '0%').attr('stop-color', '#22d3ee').attr('stop-opacity', 0.2);
        gradient.append('stop').attr('offset', '100%').attr('stop-color', '#22d3ee').attr('stop-opacity', 1);

        // Define positioning based on sequence
        // Distribute Critical Nodes evenly across X axis
        const xStep = width / (criticalNodes.length + 2);
        
        criticalNodes.forEach((n, i) => {
            n.fx = xStep * (i + 1);
            n.fy = height / 2; // Lock to center line
        });

        this.simulation = d3.forceSimulation(nodes as any)
            .force('link', d3.forceLink(links).id((d: any) => d.id).distance(60).strength(0.5))
            .force('charge', d3.forceManyBody().strength(-100))
            .force('collide', d3.forceCollide().radius(15))
            // Tangent nodes gravitate towards their critical parents but float
            .force('y', d3.forceY(height / 2).strength(0.1))
            .force('x', d3.forceX((d: any) => {
                if (d.isCritical) return d.fx; // Should allow some wiggle but mostly fixed
                // If not critical, try to stay near linked neighbors
                return width / 2;
            }).strength(0.05));

        // Draw 'Success Line' (The straight path)
        svg.append('line')
            .attr('x1', 0)
            .attr('y1', height / 2)
            .attr('x2', width)
            .attr('y2', height / 2)
            .attr('stroke', 'url(#pathGradient)')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '4 4')
            .attr('class', 'opacity-30');

        const link = svg.append('g')
            .selectAll('line')
            .data(links)
            .join('line')
            .attr('stroke', (d: any) => d.type === 'flow' ? '#22d3ee' : '#52525b')
            .attr('stroke-width', (d: any) => d.type === 'flow' ? 2 : 1)
            .attr('stroke-opacity', (d: any) => d.type === 'flow' ? 0.6 : 0.3)
            .attr('stroke-dasharray', (d: any) => d.dashed ? '3 3' : 'none');

        const node = svg.append('g')
            .selectAll('g')
            .data(nodes)
            .join('g')
            .attr('class', 'cursor-pointer')
            .call((d3.drag() as any)
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));

        // Outer Glow for Critical
        node.filter((d: any) => d.isCritical)
            .append('circle')
            .attr('r', 12)
            .attr('fill', (d: any) => d.color || '#fff')
            .attr('fill-opacity', 0.2)
            .attr('class', 'animate-pulse');

        // Main Circle
        node.append('circle')
            .attr('r', (d: any) => d.r)
            .attr('fill', '#18181b')
            .attr('stroke', (d: any) => d.isCritical ? (d.color || '#fff') : '#52525b')
            .attr('stroke-width', (d: any) => d.isCritical ? 2 : 1);

        // Label
        node.append('text')
            .attr('dy', (d: any) => d.isCritical ? -15 : 12)
            .attr('text-anchor', 'middle')
            .text((d: any) => d.title.length > 10 ? d.title.substring(0,8)+'..' : d.title)
            .attr('font-size', '8px')
            .attr('fill', (d: any) => d.isCritical ? '#fff' : '#71717a')
            .attr('class', 'pointer-events-none select-none font-mono uppercase');

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
