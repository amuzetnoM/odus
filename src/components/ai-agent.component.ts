
import { Component, inject, signal, effect, computed, ElementRef, viewChild, NgZone, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { ProjectService, TaskStatus } from '../services/project.service';
import { DriveService } from '../services/drive.service';
import { AuthService } from '../services/auth.service';
import { AppControlService, AppView } from '../services/app-control.service';
import { NotificationService } from '../services/notification.service';
import { WorkspaceService } from '../services/workspace.service';
import { MindService } from '../services/mind.service';
import { Content } from '@google/genai';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  uiType?: 'text' | 'file-preview' | 'success-card' | 'search-result';
  uiData?: any;
  grounding?: any[];
  timestamp: Date;
}

@Component({
  selector: 'app-ai-agent',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Floating Draggable Trigger -->
    <!-- Added top-0 left-0 to ensure transform originates from viewport corner -->
    <div 
      class="fixed top-0 left-0 select-none touch-none"
      [style.zIndex]="9999"
      [style.transform]="transformStyle()"
      (mousedown)="startDrag($event)"
      (touchstart)="startDrag($event)"
    >
        <button 
          (click)="handleButtonClick()"
          class="w-14 h-14 bg-white text-black rounded-full shadow-[0_5px_25px_rgba(0,0,0,0.5)] flex items-center justify-center cursor-grab active:cursor-grabbing group border-2 border-transparent hover:border-zinc-300 relative transition-transform active:scale-90"
          [class.animate-bounce-gentle]="!isDragging && !isOpen()">
          @if (!isOpen()) {
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
          } @else {
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          }
          <!-- Pulse Indicator -->
          <div class="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900 animate-pulse pointer-events-none"></div>
        </button>
    </div>

    <!-- Chat Interface -->
    @if (isOpen()) {
      <div 
        class="fixed bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in origin-bottom-right"
        [style.zIndex]="9998"
        [style]="chatWindowStyle()"
      >
        
        <!-- Header -->
        <div class="p-4 border-b border-white/5 bg-zinc-900/50 flex justify-between items-center shrink-0">
           <div>
             <h3 class="text-sm font-bold text-white tracking-widest">ODUS AI</h3>
             <p class="text-[10px] text-zinc-500">Gemini 2.0 Flash • Connected</p>
           </div>
           <button (click)="clearHistory()" class="text-[10px] text-zinc-500 hover:text-white uppercase">Clear Memory</button>
        </div>

        <!-- Messages -->
        <div #scrollContainer class="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20">
           @if (messages().length === 0) {
              <div class="h-full flex flex-col items-center justify-center opacity-30 text-center p-8">
                 <svg class="w-12 h-12 mb-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                 <p class="text-xs">I can create projects, tasks, and generate data files (CSV/MD). Try asking me.</p>
              </div>
           }

           @for (msg of messages(); track msg.timestamp) {
              <div [class]="msg.role === 'user' ? 'self-end ml-8' : 'self-start mr-8'" class="flex flex-col animate-scale-in">
                 
                 <!-- Generative UI Switch -->
                 @switch (msg.uiType) {
                    
                    @case ('file-preview') {
                        <div class="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-lg w-full max-w-[300px]">
                            <div class="bg-zinc-800 px-3 py-2 flex justify-between items-center border-b border-white/5">
                                <div class="flex items-center gap-2">
                                    <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    <span class="text-xs font-bold text-white">{{ msg.uiData.filename }}</span>
                                </div>
                                <span class="text-[9px] text-zinc-500 uppercase">{{ msg.uiData.type }}</span>
                            </div>
                            <div class="p-3 bg-black/50 max-h-32 overflow-y-auto">
                                <pre class="text-[9px] text-zinc-400 font-mono whitespace-pre-wrap">{{ msg.uiData.preview }}</pre>
                            </div>
                            <div class="p-2 bg-zinc-900 flex justify-end">
                                <button (click)="navigateToDrive()" class="text-[10px] bg-white text-black px-3 py-1 rounded font-bold hover:bg-zinc-200">Open Vault</button>
                            </div>
                        </div>
                    }

                    @case ('success-card') {
                        <div class="bg-gradient-to-br from-emerald-900/30 to-zinc-900 border border-emerald-500/30 rounded-xl p-4 shadow-lg flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <div>
                                <h4 class="text-xs font-bold text-white">{{ msg.uiData.title }}</h4>
                                <p class="text-[10px] text-zinc-400">{{ msg.uiData.message }}</p>
                            </div>
                        </div>
                    }

                    @default {
                        <!-- Standard Text -->
                        <div 
                           [class]="msg.role === 'user' ? 'bg-white text-black self-end' : 'bg-zinc-800 text-zinc-200 self-start'"
                           class="px-4 py-2 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-full break-words shadow-lg">
                           {{ msg.text }}
                        </div>
                    }
                 }
                 
                 <!-- Web Grounding Chips -->
                 @if (msg.grounding) {
                   <div class="mt-1 text-[9px] text-zinc-500 flex flex-wrap gap-2">
                      @for (chunk of msg.grounding; track $index) {
                         @if (chunk.web?.uri) {
                           <a [href]="chunk.web.uri" target="_blank" class="hover:text-blue-400 underline truncate max-w-[150px] bg-zinc-900 px-2 py-0.5 rounded border border-white/5 flex items-center gap-1">
                              <span class="w-1 h-1 bg-blue-500 rounded-full"></span> {{ chunk.web.title || 'Source' }}
                           </a>
                         }
                      }
                   </div>
                 }
                 <span class="text-[9px] text-zinc-600 mt-1 opacity-50" [class.text-right]="msg.role === 'user'">{{ msg.timestamp | date:'shortTime' }}</span>
              </div>
           }

           @if (isThinking()) {
              <div class="self-start bg-zinc-800/50 px-4 py-2 rounded-2xl flex gap-1 items-center">
                 <div class="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></div>
                 <div class="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                 <div class="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                 <span class="text-[9px] text-zinc-500 ml-2 uppercase tracking-wide">Processing...</span>
              </div>
           }
        </div>

        <!-- Input -->
        <div class="p-3 bg-zinc-900 border-t border-white/5 shrink-0">
           <div class="relative flex items-center bg-black/50 border border-zinc-800 rounded-full px-4 py-2 focus-within:border-zinc-500 transition-colors">
              <input 
                [(ngModel)]="inputText"
                (keydown.enter)="sendMessage()"
                [disabled]="isThinking()"
                class="flex-1 bg-transparent border-none focus:outline-none text-xs sm:text-sm text-white placeholder:text-zinc-600"
                placeholder="Ask about projects, generate files..."
              />
              
              <button 
                (click)="toggleVoice()"
                [class.text-red-500]="isListening()"
                [class.animate-pulse]="isListening()"
                class="mr-2 text-zinc-500 hover:text-white transition-colors">
                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
              </button>

              <button 
                (click)="sendMessage()"
                [disabled]="!inputText() || isThinking()"
                class="ml-2 text-zinc-500 hover:text-white disabled:opacity-30">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7"></path></svg>
              </button>
           </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
    .animate-scale-in { animation: scaleIn 0.2s ease-out; }
    
    @keyframes bounceGentle {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
    }
    .animate-bounce-gentle { animation: bounceGentle 3s infinite ease-in-out; }
  `]
})
export class AiAgentComponent implements AfterViewInit, OnDestroy {
  geminiService = inject(GeminiService);
  projectService = inject(ProjectService);
  driveService = inject(DriveService);
  authService = inject(AuthService);
  appControlService = inject(AppControlService);
  notificationService = inject(NotificationService);
  workspaceService = inject(WorkspaceService);
  mindService = inject(MindService);
  zone = inject(NgZone);
  
  isOpen = signal(false);
  messages = signal<ChatMessage[]>([]);
  inputText = signal('');
  isThinking = signal(false);
  isListening = signal(false);
  scrollContainer = viewChild<ElementRef>('scrollContainer');
  
  // Physics State with robust defaults
  buttonPosition = signal({ 
      x: window.innerWidth > 0 ? window.innerWidth - 80 : 20, 
      y: window.innerHeight > 0 ? window.innerHeight - 80 : 20 
  });
  
  transformStyle = computed(() => `translate3d(${this.buttonPosition().x}px, ${this.buttonPosition().y}px, 0)`);
  
  isDragging = false;
  private dragOffset = { x: 0, y: 0 };
  private velocity = { x: 0, y: 0 };
  private lastDragPos = { x: 0, y: 0 };
  private lastDragTime = 0;
  private animationFrameId = 0;
  private isThrown = false;
  
  // Boundaries
  private windowWidth = window.innerWidth || 1000;
  private windowHeight = window.innerHeight || 800;
  
  private recognition: any;
  private safetyInterval: any;

  // Bound handlers for cleanup
  private readonly _onDrag = this.onDrag.bind(this);
  private readonly _stopDrag = this.stopDrag.bind(this);
  private readonly _onResize = () => {
      this.windowWidth = document.documentElement.clientWidth || window.innerWidth;
      this.windowHeight = document.documentElement.clientHeight || window.innerHeight;
      this.enforceBoundaries();
  };

  // Intelligent Chat Positioning
  chatWindowStyle = computed(() => {
      const btn = this.buttonPosition();
      const ww = this.windowWidth;
      const wh = this.windowHeight;
      
      const width = 400; // Base width
      const height = 600; // Base height
      
      // Calculate best position
      let left = 0;
      let transformOriginX = 'center';
      
      if (btn.x > ww / 2) {
          left = btn.x - width + 56;
          transformOriginX = 'right';
      } else {
          left = btn.x;
          transformOriginX = 'left';
      }
      
      left = Math.max(10, Math.min(ww - width - 10, left));

      let top = 0;
      let heightResult = Math.min(height, wh * 0.7);
      let transformOriginY = 'bottom';

      top = btn.y - heightResult - 10;

      if (top < 10) {
          top = btn.y + 60;
          transformOriginY = 'top';
      }
      
      if (top + heightResult > wh - 10) {
          top = wh - heightResult - 10;
      }
      
      return {
          left: `${left}px`,
          top: `${top}px`,
          width: `${width}px`,
          height: `${heightResult}px`,
          'transform-origin': `${transformOriginY} ${transformOriginX}`
      };
  });

  constructor() {
      // Init Chat
      const stored = localStorage.getItem('artifact_chat_history');
      if (stored) {
          try { this.messages.set(JSON.parse(stored)); } catch(e){}
      } else {
          const userName = this.authService.currentUser().name.split(' ')[0];
          this.messages.set([{
              role: 'model',
              text: `Hello ${userName}. I'm ODUS. I use the Gemini 2.0 Flash model to manage your projects.`,
              timestamp: new Date()
          }]);
      }
      
      effect(() => {
         localStorage.setItem('artifact_chat_history', JSON.stringify(this.messages()));
         if (this.messages().length) this.scrollToBottom();
      });

      // Global Listeners for Drag Physics
      window.addEventListener('mousemove', this._onDrag);
      window.addEventListener('mouseup', this._stopDrag);
      window.addEventListener('touchmove', this._onDrag, { passive: false });
      window.addEventListener('touchend', this._stopDrag);
      window.addEventListener('resize', this._onResize);

      // System messages logic
      effect(() => {
          const incoming = this.notificationService.incomingAiMessage();
          if (incoming) {
              this.addModelResponse(incoming.text);
              if (!this.isOpen() && this.messages().length < 5) this.isOpen.set(true);
              this.notificationService.incomingAiMessage.set(null);
          }
      }, { allowSignalWrites: true });

      // Voice
      if ('webkitSpeechRecognition' in window) {
          const v: any = window;
          this.recognition = new v.webkitSpeechRecognition();
          this.recognition.continuous = false;
          this.recognition.lang = 'en-US';
          this.recognition.onresult = (e: any) => {
              const transcript = e.results[0][0].transcript;
              this.inputText.set(transcript);
              this.isListening.set(false);
              this.sendMessage(); 
          };
          this.recognition.onerror = () => this.isListening.set(false);
          this.recognition.onend = () => this.isListening.set(false);
      }
  }

  ngAfterViewInit() {
      // Force initial boundaries check immediately to prevent drift
      this.windowWidth = document.documentElement.clientWidth || window.innerWidth;
      this.windowHeight = document.documentElement.clientHeight || window.innerHeight;
      this.enforceBoundaries();

      // Periodic safety check
      this.zone.runOutsideAngular(() => {
          this.safetyInterval = setInterval(() => {
              this.zone.run(() => this.enforceBoundaries());
          }, 2000);
      });
  }

  ngOnDestroy() {
      window.removeEventListener('mousemove', this._onDrag);
      window.removeEventListener('mouseup', this._stopDrag);
      window.removeEventListener('touchmove', this._onDrag);
      window.removeEventListener('touchend', this._stopDrag);
      window.removeEventListener('resize', this._onResize);
      cancelAnimationFrame(this.animationFrameId);
      clearInterval(this.safetyInterval);
  }

  // --- Physics & Drag Logic ---
  
  startDrag(event: MouseEvent | TouchEvent) {
      if (this.isOpen()) return; // Don't drag if chat is open

      this.isDragging = true;
      this.isThrown = false;
      this.velocity = { x: 0, y: 0 }; // Reset velocity
      cancelAnimationFrame(this.animationFrameId); // Stop any existing physics

      const clientX = 'touches' in event ? event.touches[0].clientX : (event as MouseEvent).clientX;
      const clientY = 'touches' in event ? event.touches[0].clientY : (event as MouseEvent).clientY;
      
      this.dragOffset = {
          x: clientX - this.buttonPosition().x,
          y: clientY - this.buttonPosition().y
      };

      this.lastDragPos = { x: clientX, y: clientY };
      this.lastDragTime = performance.now();
  }

  onDrag(event: MouseEvent | TouchEvent) {
      if (!this.isDragging) return;
      event.preventDefault(); 
      
      const clientX = 'touches' in event ? event.touches[0].clientX : (event as MouseEvent).clientX;
      const clientY = 'touches' in event ? event.touches[0].clientY : (event as MouseEvent).clientY;

      // Calculate instantaneous velocity
      const now = performance.now();
      const dt = now - this.lastDragTime;
      if (dt > 0) {
          this.velocity = {
              x: (clientX - this.lastDragPos.x) / dt * 15, // Scale up for "throw" feel
              y: (clientY - this.lastDragPos.y) / dt * 15
          };
      }
      
      this.lastDragPos = { x: clientX, y: clientY };
      this.lastDragTime = now;

      // Update Position
      this.buttonPosition.set({
          x: clientX - this.dragOffset.x,
          y: clientY - this.dragOffset.y
      });
  }

  stopDrag() {
      if (!this.isDragging) return;
      this.isDragging = false;
      
      // If velocity is significant, trigger throw physics
      const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
      if (speed > 0.5) {
          this.isThrown = true;
          this.zone.runOutsideAngular(() => this.runPhysicsLoop());
      } else {
          this.enforceBoundaries();
      }
  }
  
  handleButtonClick() {
      // If we were dragging/throwing, don't toggle chat immediately
      // Only toggle if velocity is essentially zero
      const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
      if (!this.isThrown && speed < 1) {
          this.toggleChat();
      }
  }

  // --- Physics Loop ---
  runPhysicsLoop() {
      const friction = 0.94;
      const bounce = 0.7;
      const stopThreshold = 0.1;

      const loop = () => {
          if (this.isDragging) return;

          let { x, y } = this.buttonPosition();
          let { x: vx, y: vy } = this.velocity;

          // Apply Velocity
          x += vx;
          y += vy;

          // Apply Friction
          vx *= friction;
          vy *= friction;

          // Bounce logic
          const size = 56; // Button size
          const margin = 10;
          
          let hitWall = false;

          if (x < margin) {
              x = margin;
              vx = -vx * bounce;
              hitWall = true;
          } else if (x > this.windowWidth - size - margin) {
              x = this.windowWidth - size - margin;
              vx = -vx * bounce;
              hitWall = true;
          }

          if (y < margin) {
              y = margin;
              vy = -vy * bounce;
              hitWall = true;
          } else if (y > this.windowHeight - size - margin) {
              y = this.windowHeight - size - margin;
              vy = -vy * bounce;
              hitWall = true;
          }
          
          this.velocity = { x: vx, y: vy };
          
          this.zone.run(() => {
             this.buttonPosition.set({ x, y });
          });

          // Stop condition
          if (Math.abs(vx) < stopThreshold && Math.abs(vy) < stopThreshold) {
              this.isThrown = false;
              this.velocity = { x: 0, y: 0 };
          } else {
              this.animationFrameId = requestAnimationFrame(loop);
          }
      };
      
      this.animationFrameId = requestAnimationFrame(loop);
  }

  enforceBoundaries() {
      // Keep button on screen if resize happens or drag ends gently
      const { x, y } = this.buttonPosition();
      const size = 56;
      const margin = 10;
      
      // Update dimensions first to be sure
      this.windowWidth = document.documentElement.clientWidth || window.innerWidth || 1000;
      this.windowHeight = document.documentElement.clientHeight || window.innerHeight || 800;

      // Ensure valid numbers
      let safeX = isNaN(x) ? this.windowWidth - 80 : x;
      let safeY = isNaN(y) ? this.windowHeight - 80 : y;

      const newX = Math.max(margin, Math.min(this.windowWidth - size - margin, safeX));
      const newY = Math.max(margin, Math.min(this.windowHeight - size - margin, safeY));
      
      if (Math.abs(newX - x) > 1 || Math.abs(newY - y) > 1) {
          this.buttonPosition.set({ x: newX, y: newY });
      }
  }

  toggleChat() {
      this.isOpen.set(!this.isOpen());
  }

  toggleVoice() {
      if (!this.recognition) return alert('Voice not supported.');
      if (this.isListening()) {
          this.recognition.stop();
          this.isListening.set(false);
      } else {
          this.recognition.start();
          this.isListening.set(true);
      }
  }

  async sendMessage() {
      const text = this.inputText().trim();
      if (!text || this.isThinking()) return;

      this.inputText.set('');
      this.messages.update(p => [...p, { role: 'user', text, timestamp: new Date() }]);
      this.isThinking.set(true);
      this.scrollToBottom();

      // Enhanced Context Construction with Workspace Service
      const userName = this.authService.currentUser().name;
      
      // Get comprehensive workspace context
      const context = this.workspaceService.getAIContext();

      const history: Content[] = this.messages().map(m => ({
          role: m.role as 'user' | 'model',
          parts: [{ text: m.text }]
      }));

      try {
          const result = await this.geminiService.chatWithAgent(text, context, history, userName);
          
          // Store AI interaction in memory for future learning
          await this.workspaceService.storeAIMemory(
              `User: ${text}`,
              `Context: ${context.substring(0, 500)}...`,
              `Response: ${result.text?.substring(0, 200) || 'Tool call'}`
          );
          
          if (result.toolCall) {
              await this.handleToolCall(result.toolCall, result.groundingMetadata);
          } else {
              this.messages.update(p => [...p, { 
                  role: 'model', 
                  text: result.text, 
                  grounding: result.groundingMetadata?.groundingChunks,
                  timestamp: new Date() 
              }]);
          }

      } catch (e) {
          this.messages.update(p => [...p, { role: 'model', text: 'Error connecting to AI core.', timestamp: new Date() }]);
      } finally {
          this.isThinking.set(false);
          this.scrollToBottom();
      }
  }
  
  private async handleToolCall(toolCall: { type: string, data: any }, grounding?: any) {
      const groundingChunks = grounding?.groundingChunks;

      switch(toolCall.type) {
          // --- Data Generation Tools ---
          case 'create_file':
              const { filename, content, mimeType } = toolCall.data;
              const blob = new Blob([content], { type: mimeType || 'text/plain' });
              const file = new File([blob], filename, { type: mimeType || 'text/plain' });
              this.driveService.addFile(file);
              
              // Add Flash UI Preview
              this.messages.update(p => [...p, {
                  role: 'model',
                  text: `I've generated "${filename}" in the Vault.`,
                  uiType: 'file-preview',
                  uiData: { filename, type: mimeType, preview: content.substring(0, 150) + '...' },
                  grounding: groundingChunks,
                  timestamp: new Date()
              }]);
              break;

          // --- Project CRUD ---
          case 'create_project':
              const pData = toolCall.data;
              this.projectService.addProject(pData.title, pData.description || 'AI Created', []);
              this.messages.update(p => [...p, {
                  role: 'model',
                  text: `Project "${pData.title}" initialized.`,
                  uiType: 'success-card',
                  uiData: { title: 'Project Initialized', message: `Workspace created for ${pData.title}` },
                  timestamp: new Date()
              }]);
              break;

          case 'delete_project':
              const delPId = toolCall.data.projectId;
              this.projectService.removeProject(delPId);
              this.addModelResponse(`Project removed successfully.`);
              break;

          // --- Task CRUD ---
          case 'create_task':
              const taskData = toolCall.data;
              this.projectService.addTask(taskData.projectId || 'personal', {
                  title: taskData.title,
                  description: 'Created by ODUS AI',
                  status: 'todo',
                  priority: 'medium',
                  inFocusList: !!taskData.addToFocus,
                  focusIndex: taskData.addToFocus ? 0 : 999
              });
              this.messages.update(p => [...p, {
                  role: 'model',
                  text: `Task "${taskData.title}" added to queue.`,
                  uiType: 'success-card',
                  uiData: { title: 'Task Created', message: `${taskData.title} added to active stream.` },
                  timestamp: new Date()
              }]);
              break;

          case 'delete_task':
              this.projectService.deleteTask(toolCall.data.projectId, toolCall.data.taskId);
              this.addModelResponse(`Task deleted from system.`);
              break;

          case 'update_task_status':
              const updateData = toolCall.data;
              const taskToUpdate = this.projectService.findTaskByTitle(updateData.taskTitle);
              if (taskToUpdate) {
                  this.projectService.updateTaskStatus(taskToUpdate.projectId, taskToUpdate.task.id, updateData.newStatus as TaskStatus);
                  this.addModelResponse(`Done. Marked "${updateData.taskTitle}" as ${updateData.newStatus}.`);
              } else {
                  this.addModelResponse(`Could not locate task "${updateData.taskTitle}".`);
              }
              break;

          case 'navigate':
              const navData = toolCall.data;
              this.appControlService.navigate(navData.view as AppView);
              this.addModelResponse(`Navigating interface to ${navData.view}.`);
              break;

          // --- Mind Map Integration ---
          case 'create_mind_node':
              const nodeData = toolCall.data;
              try {
                  await this.mindService.addNode(nodeData.content);
                  this.messages.update(p => [...p, {
                      role: 'model',
                      text: `Created mind map node.`,
                      uiType: 'success-card',
                      uiData: { title: 'Node Added', message: 'Knowledge graph updated.' },
                      timestamp: new Date()
                  }]);
              } catch (e) {
                  this.addModelResponse('Failed to create mind node.');
              }
              break;
      }
  }
  
  private addModelResponse(text: string) {
      this.messages.update(p => [...p, { role: 'model', text, timestamp: new Date() }]);
  }

  navigateToDrive() {
      this.appControlService.navigate('drive');
      this.isOpen.set(false);
  }

  scrollToBottom() {
      setTimeout(() => {
          if (this.scrollContainer()) {
              this.scrollContainer()!.nativeElement.scrollTop = this.scrollContainer()!.nativeElement.scrollHeight;
          }
      }, 50);
  }

  clearHistory() {
      this.messages.set([]);
  }
}
