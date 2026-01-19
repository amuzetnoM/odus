
import { Component, inject, signal, effect, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { ProjectService, TaskStatus } from '../services/project.service';
import { DriveService } from '../services/drive.service';
import { AuthService } from '../services/auth.service';
import { AppControlService, AppView } from '../services/app-control.service';
import { NotificationService } from '../services/notification.service';
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
    <div 
      class="fixed z-50 transition-transform active:scale-95"
      [style.left.px]="buttonPosition().x"
      [style.top.px]="buttonPosition().y"
      (mousedown)="startDrag($event)"
      (touchstart)="startDrag($event)"
    >
        <button 
          (click)="toggleChat()"
          class="w-14 h-14 bg-white text-black rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center cursor-grab active:cursor-grabbing group border-2 border-transparent hover:border-zinc-300 relative">
          @if (!isOpen()) {
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
          } @else {
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          }
          <!-- Pulse Indicator -->
          <div class="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900 animate-pulse pointer-events-none"></div>
        </button>
    </div>

    <!-- Chat Interface (Fixed Position relative to screen for stability, but near button logic could be added) -->
    @if (isOpen()) {
      <div 
        class="fixed bottom-24 right-6 left-6 sm:left-auto sm:w-[400px] h-[60vh] sm:h-[600px] bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-40 animate-scale-in origin-bottom-right"
        [style.right.px]="windowWidth() - buttonPosition().x - 60"
        [style.bottom.px]="windowHeight() - buttonPosition().y + 20"
      >
        
        <!-- Header -->
        <div class="p-4 border-b border-white/5 bg-zinc-900/50 flex justify-between items-center shrink-0 cursor-move" (mousedown)="startDrag($event)">
           <div>
             <h3 class="text-sm font-bold text-white tracking-widest">ODUS AI</h3>
             <p class="text-[10px] text-zinc-500">Global Context Aware • Web Enabled</p>
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
  `]
})
export class AiAgentComponent {
  geminiService = inject(GeminiService);
  projectService = inject(ProjectService);
  driveService = inject(DriveService);
  authService = inject(AuthService);
  appControlService = inject(AppControlService);
  notificationService = inject(NotificationService);
  
  isOpen = signal(false);
  messages = signal<ChatMessage[]>([]);
  inputText = signal('');
  isThinking = signal(false);
  isListening = signal(false);
  scrollContainer = viewChild<ElementRef>('scrollContainer');
  
  // Drag State
  buttonPosition = signal({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
  isDragging = false;
  dragOffset = { x: 0, y: 0 };
  windowWidth = signal(window.innerWidth);
  windowHeight = signal(window.innerHeight);
  
  private recognition: any;

  constructor() {
      // Init Chat
      const stored = localStorage.getItem('artifact_chat_history');
      if (stored) {
          try { this.messages.set(JSON.parse(stored)); } catch(e){}
      } else {
          const userName = this.authService.currentUser().name.split(' ')[0];
          this.messages.set([{
              role: 'model',
              text: `Hello ${userName}. I'm ODUS. I can manage projects, search the web, and generate data files (CSV/MD) for you.`,
              timestamp: new Date()
          }]);
      }
      
      effect(() => {
         localStorage.setItem('artifact_chat_history', JSON.stringify(this.messages()));
         if (this.messages().length) this.scrollToBottom();
      });

      // Global Listeners for Drag
      window.addEventListener('mousemove', this.onDrag.bind(this));
      window.addEventListener('mouseup', this.stopDrag.bind(this));
      window.addEventListener('touchmove', this.onDrag.bind(this), { passive: false });
      window.addEventListener('touchend', this.stopDrag.bind(this));
      window.addEventListener('resize', () => {
          this.windowWidth.set(window.innerWidth);
          this.windowHeight.set(window.innerHeight);
          // Keep button on screen
          this.buttonPosition.set({ 
              x: Math.min(this.buttonPosition().x, window.innerWidth - 70),
              y: Math.min(this.buttonPosition().y, window.innerHeight - 70)
          });
      });

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

  // --- Drag Logic ---
  startDrag(event: MouseEvent | TouchEvent) {
      // If it's a touch event, prevent default scrolling
      if (event.type === 'touchstart') {
          // event.preventDefault(); // Optional, depending on desired behavior
      }
      
      this.isDragging = true;
      const clientX = 'touches' in event ? event.touches[0].clientX : (event as MouseEvent).clientX;
      const clientY = 'touches' in event ? event.touches[0].clientY : (event as MouseEvent).clientY;
      
      this.dragOffset = {
          x: clientX - this.buttonPosition().x,
          y: clientY - this.buttonPosition().y
      };
  }

  onDrag(event: MouseEvent | TouchEvent) {
      if (!this.isDragging) return;
      event.preventDefault(); // Stop selection/scrolling
      
      const clientX = 'touches' in event ? event.touches[0].clientX : (event as MouseEvent).clientX;
      const clientY = 'touches' in event ? event.touches[0].clientY : (event as MouseEvent).clientY;

      this.buttonPosition.set({
          x: Math.max(10, Math.min(window.innerWidth - 70, clientX - this.dragOffset.x)),
          y: Math.max(10, Math.min(window.innerHeight - 70, clientY - this.dragOffset.y))
      });
  }

  stopDrag() {
      this.isDragging = false;
  }

  toggleChat() {
      if (!this.isDragging) {
          this.isOpen.set(!this.isOpen());
      }
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

      // Context construction
      const userName = this.authService.currentUser().name;
      const context = JSON.stringify({
          userName,
          openTasks: this.projectService.allTasks()
              .filter(t => t.status !== 'done')
              .map(t => ({ id: t.id, title: t.title, project: t.projectTitle })),
          projects: this.projectService.projects().map(p => ({ id: p.id, title: p.title })),
          files: this.driveService.files().map(f => ({ name: f.name, type: f.type }))
      });

      const history: Content[] = this.messages().map(m => ({
          role: m.role as 'user' | 'model',
          parts: [{ text: m.text }]
      }));

      try {
          const result = await this.geminiService.chatWithAgent(text, context, history, userName);
          
          if (result.toolCall) {
              this.handleToolCall(result.toolCall, result.groundingMetadata);
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
  
  private handleToolCall(toolCall: { type: string, data: any }, grounding?: any) {
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
