
import { Injectable, signal, computed, inject } from '@angular/core';
import { GeminiService } from './gemini.service';

export interface MindNode {
  id: string;
  title: string;
  content: string;
  properties: Record<string, string>;
  tags: string[];
  links: string[]; // AI Semantic Links
  manualLinks: string[]; // User Override Links (Gold/Indigo)
  createdAt: string;
  x?: number; 
  y?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MindService {
  private geminiService = inject(GeminiService);
  
  private nodesState = signal<MindNode[]>([]);
  readonly nodes = this.nodesState.asReadonly();

  constructor() {
    this.load();
  }

  private load() {
    const stored = localStorage.getItem('artifact_mind_nodes');
    if (stored) {
        this.nodesState.set(JSON.parse(stored));
    } else {
        // Initial Tutorial Node
        this.nodesState.set([{
            id: 'root',
            title: 'Nexus Core',
            content: 'Central node of the idea graph.',
            properties: { type: 'system', status: 'active' },
            tags: ['ROOT', 'SYSTEM'],
            links: [],
            manualLinks: [],
            createdAt: new Date().toISOString()
        }]);
    }
  }

  private save() {
    localStorage.setItem('artifact_mind_nodes', JSON.stringify(this.nodesState()));
  }

  async addNode(content: string, position?: {x: number, y: number}) {
     // Snapshot for AI context
     const existingSummary = this.nodesState().map(n => ({ id: n.id, title: n.title, tags: n.tags }));

     // AI Analysis
     const analysis = await this.geminiService.analyzeIdea(content, existingSummary);

     const newNode: MindNode = {
         id: crypto.randomUUID(),
         title: analysis.title,
         content: content,
         properties: analysis.properties,
         tags: analysis.tags,
         links: analysis.relatedNodeIds.filter(id => this.nodesState().some(n => n.id === id)),
         manualLinks: [],
         createdAt: new Date().toISOString(),
         x: position?.x,
         y: position?.y
     };

     this.nodesState.update(prev => {
         const updated = [newNode, ...prev];
         // Bidirectional AI links
         newNode.links.forEach(linkId => {
             const target = updated.find(n => n.id === linkId);
             if (target && !target.links.includes(newNode.id)) {
                 target.links.push(newNode.id);
             }
         });
         return updated;
     });

     this.save();
  }

  updateNode(id: string, updates: Partial<MindNode>) {
      this.nodesState.update(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
      this.save();
  }

  deleteNode(id: string) {
      this.nodesState.update(prev => prev.filter(n => n.id !== id));
      this.save();
  }

  connectNodesManual(sourceId: string, targetId: string) {
      if (sourceId === targetId) return;

      this.nodesState.update(prev => prev.map(n => {
          if (n.id === sourceId && !n.manualLinks.includes(targetId)) {
              return { ...n, manualLinks: [...n.manualLinks, targetId] };
          }
          if (n.id === targetId && !n.manualLinks.includes(sourceId)) {
               return { ...n, manualLinks: [...n.manualLinks, sourceId] };
          }
          return n;
      }));
      this.save();
  }
}
