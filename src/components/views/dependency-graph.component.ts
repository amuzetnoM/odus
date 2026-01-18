
import { Component, input, output, effect, ElementRef, viewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project, Task } from '../../services/project.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-dependency-graph',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full h-full relative bg-zinc-950/20 overflow-hidden">
      <div #graphContainer class="w-full h-full cursor-grab active:cursor-grabbing"></div>
      
      <div class="absolute bottom-4 left-4 p-2 bg-zinc-950/80 backdrop-blur rounded border border-white/5 text-[10px] text-zinc-400 font-mono pointer-events-none select-none">
        <div class="flex items-center gap-2 mb-1"><span class="w-2 h-2 rounded-full bg-zinc-800 border border-zinc-600"></span> Pending</div>
        <div class="flex items-center gap-2 mb-1"><span class="w-2 h-2 rounded-full bg-white shadow-[0_0_5px_white]"></span> Active</div>
        <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-zinc-900 border border-zinc-800"></span> Archived</div>
      </div>
    </div>
  `
})
export class DependencyGraphComponent implements OnDestroy {
  project = input.required<Project>();
  nodeClick = output<Task>();
  graphContainer = viewChild<ElementRef>('graphContainer');
  
  private simulation: any;

  constructor() {
    effect(() => {
      const project = this.project();
      const container = this.graphContainer()?.nativeElement;
      if (project && container) {
        this.renderGraph(project, container);
      }
    });
  }

  ngOnDestroy() {
    if (this.simulation) this.simulation.stop();
  }

  renderGraph(project: Project, container: HTMLElement) {
    d3.select(container).selectAll('*').remove();

    const width = container.clientWidth;
    const height = container.clientHeight;

    const nodes = project.tasks.map(t => ({ id: t.id, ...t }));
    const links: any[] = [];
    
    project.tasks.forEach(task => {
      if (task.dependencyIds) {
        task.dependencyIds.forEach(depId => {
           if (nodes.find(n => n.id === depId)) {
               links.push({ source: depId, target: task.id });
           }
        });
      }
    });

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;');

    // Adjusted Forces for better clustering and less scatter
    this.simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(80).strength(0.5)) // Stronger, shorter links
      .force('charge', d3.forceManyBody().strength(-300)) // Moderate repulsion
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(40))
      .force('y', d3.forceY(height/2).strength(0.05)) // Gentle pull to vertical center
      .force('x', d3.forceX(width/2).strength(0.05));

    svg.append('defs').selectAll('marker')
      .data(['end'])
      .join('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 26) // pushed back to avoid overlapping circle
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('fill', '#52525b') // Zinc-600
      .attr('d', 'M0,-5L10,0L0,5');

    const link = svg.append('g')
      .attr('stroke', '#3f3f46') // Zinc-700
      .attr('stroke-opacity', 0.5)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#arrow)');

    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node-group')
      .style('cursor', 'pointer')
      .call((d3.drag() as any)
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended))
      .on('click', (event, d: any) => {
         // Prevent drag end from firing click immediately if it was a drag
         if (event.defaultPrevented) return;
         
         // Find original task object
         const originalTask = project.tasks.find(t => t.id === d.id);
         if (originalTask) this.nodeClick.emit(originalTask);
      });

    node.append('circle')
      .attr('r', 10)
      .attr('fill', (d: any) => {
         switch(d.status) {
             case 'todo': return '#27272a'; // Zinc-800
             case 'in-progress': return '#ffffff'; // White
             case 'done': return '#09090b'; // Zinc-950
             default: return '#27272a';
         }
      })
      .attr('stroke', (d: any) => {
          if (d.status === 'in-progress') return 'rgba(255,255,255,0.5)';
          // Highlight nodes with dependencies (Root nodes or hubs)
          if (links.some((l: any) => l.target.id === d.id)) return '#71717a'; // Has incoming
          return '#3f3f46';
      })
      .attr('stroke-width', (d: any) => d.status === 'in-progress' ? 3 : 2);

    // Label
    node.append('text')
      .attr('x', 14)
      .attr('y', 4)
      .text((d: any) => d.title.length > 18 ? d.title.substring(0, 18) + '...' : d.title)
      .clone(true).lower()
      .attr('fill', 'none')
      .attr('stroke', '#000')
      .attr('stroke-width', 4);

    node.append('text')
      .attr('x', 14)
      .attr('y', 4)
      .text((d: any) => d.title.length > 18 ? d.title.substring(0, 18) + '...' : d.title)
      .attr('fill', '#d4d4d8') // Zinc-300
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('font-weight', '400');

    this.simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
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
