
import { Component, ElementRef, viewChild, output, inject, NgZone, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-zen-mode',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[200] bg-black animate-fade-in cursor-none">
        <canvas #canvas class="block w-full h-full"></canvas>
        
        <!-- UI Overlay -->
        <div class="absolute top-8 left-0 right-0 flex flex-col items-center pointer-events-none mix-blend-difference">
            <h1 class="text-4xl font-thin tracking-[0.5em] text-white uppercase opacity-80">Zen Mode</h1>
            <p class="text-xs font-mono text-zinc-400 mt-2 tracking-widest opacity-60">BREATHE • RELAX • RESET</p>
        </div>

        <button 
            (click)="close.emit()"
            class="absolute top-8 right-8 text-white/50 hover:text-white transition-colors cursor-pointer z-50 p-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <div class="absolute bottom-8 left-0 right-0 text-center pointer-events-none opacity-30">
            <p class="text-[10px] font-mono text-white">Move cursor to interact</p>
        </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .animate-fade-in { animation: fadeIn 1s ease-out; }
  `]
})
export class ZenModeComponent implements AfterViewInit, OnDestroy {
  close = output();
  canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private zone = inject(NgZone);
  
  private ctx: CanvasRenderingContext2D | null = null;
  private animationId: number = 0;
  private particles: any[] = [];
  private mouse = { x: -1000, y: -1000 };
  private width = 0;
  private height = 0;

  ngAfterViewInit() {
      this.initCanvas();
  }

  ngOnDestroy() {
      cancelAnimationFrame(this.animationId);
      window.removeEventListener('mousemove', this.onMouseMove);
      window.removeEventListener('resize', this.resize);
  }

  private initCanvas() {
      const canvas = this.canvasRef()?.nativeElement;
      if (!canvas) return;
      
      this.ctx = canvas.getContext('2d');
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      canvas.width = this.width;
      canvas.height = this.height;

      window.addEventListener('resize', this.resize.bind(this));
      window.addEventListener('mousemove', this.onMouseMove.bind(this));

      this.createParticles();
      
      // Run animation outside Angular zone for performance
      this.zone.runOutsideAngular(() => this.animate());
  }

  private resize() {
      if (!this.canvasRef()?.nativeElement) return;
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvasRef()!.nativeElement.width = this.width;
      this.canvasRef()!.nativeElement.height = this.height;
      this.createParticles();
  }

  private onMouseMove(e: MouseEvent) {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
  }

  private createParticles() {
      this.particles = [];
      const count = Math.min((this.width * this.height) / 10000, 150); // Responsive count
      
      for (let i = 0; i < count; i++) {
          this.particles.push({
              x: Math.random() * this.width,
              y: Math.random() * this.height,
              vx: (Math.random() - 0.5) * 0.5,
              vy: (Math.random() - 0.5) * 0.5,
              size: Math.random() * 3 + 1,
              color: `hsla(${Math.random() * 60 + 180}, 70%, 70%, ${Math.random() * 0.5 + 0.1})`, // Cyan/Blue hues
              baseX: Math.random() * this.width,
              baseY: Math.random() * this.height,
              density: (Math.random() * 30) + 1
          });
      }
  }

  private animate() {
      if (!this.ctx) return;
      this.ctx.fillStyle = 'rgba(5, 5, 10, 0.1)'; // Trail effect
      this.ctx.fillRect(0, 0, this.width, this.height);

      for (let i = 0; i < this.particles.length; i++) {
          let p = this.particles[i];
          
          // Interaction
          let dx = this.mouse.x - p.x;
          let dy = this.mouse.y - p.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          let forceDirectionX = dx / distance;
          let forceDirectionY = dy / distance;
          let maxDistance = 200;
          let force = (maxDistance - distance) / maxDistance;
          let directionX = forceDirectionX * force * p.density;
          let directionY = forceDirectionY * force * p.density;

          if (distance < maxDistance) {
              p.x -= directionX;
              p.y -= directionY;
          } else {
              // Return to original flow
              if (p.x !== p.baseX) {
                  let dx = p.x - p.baseX;
                  p.x -= dx / 50;
              }
              if (p.y !== p.baseY) {
                  let dy = p.y - p.baseY;
                  p.y -= dy / 50;
              }
          }

          // Movement
          p.x += p.vx;
          p.y += p.vy;

          // Wrap edges
          if (p.x < 0) p.x = this.width;
          if (p.x > this.width) p.x = 0;
          if (p.y < 0) p.y = this.height;
          if (p.y > this.height) p.y = 0;

          // Draw
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          this.ctx.fillStyle = p.color;
          this.ctx.fill();
          
          // Connect nearby particles
          for (let j = i; j < this.particles.length; j++) {
              let p2 = this.particles[j];
              let dx = p.x - p2.x;
              let dy = p.y - p2.y;
              let dist = Math.sqrt(dx*dx + dy*dy);
              
              if (dist < 100) {
                  this.ctx.beginPath();
                  this.ctx.strokeStyle = `rgba(100, 200, 255, ${0.1 - (dist/1000)})`;
                  this.ctx.lineWidth = 0.5;
                  this.ctx.moveTo(p.x, p.y);
                  this.ctx.lineTo(p2.x, p2.y);
                  this.ctx.stroke();
              }
          }
      }

      this.animationId = requestAnimationFrame(this.animate.bind(this));
  }
}
