
import { Component, inject, signal, effect, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { ProjectService } from '../services/project.service';
import { DriveService } from '../services/drive.service';
import { Content } from '@google/genai';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
  grounding?: any[];
  timestamp: Date;
}

@Component({
  selector: 'app-ai-agent',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Floating Trigger -->
    <button 
      (click)="isOpen.set(!isOpen())"
      class="fixed bottom-6 right-6 z-50 w-14 h-14 bg-white text-black rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group">
      @if (!isOpen()) {
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
      } @else {
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      }
      <div class="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900 animate-pulse"></div>
    </button>

    <!-- Chat Interface -->
    @if (isOpen()) {
      <div class="fixed bottom-24 right-6 w-[90vw] sm:w-[400px] h-[60vh] sm:h-[600px] bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-40 animate-scale-in origin-bottom-right">
        
        <!-- Header -->
        <div class="p-4 border-b border-white/5 bg-zinc-900/50 flex justify-between items-center">
           <div>
             <h3 class="text-sm font-bold text-white tracking-widest">ODUS AI</h3>
             <p class="text-[10px] text-zinc-500">Global Context Aware • Web Enabled</p>
           </div>
           <button (click)="clearHistory()" class="text-[10px] text-zinc-500 hover:text-white uppercase">Clear Memory</button>
        </div>

        <!-- Messages -->
        <div #scrollContainer class="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
           @if (messages().length === 0) {
              <div class="h-full flex flex-col items-center justify-center opacity-30 text-center p-8">
                 <svg class="w-12 h-12 mb-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                 <p class="text-xs">How can I assist you with your projects or data today?</p>
              </div>
           }

           @for (msg of messages(); track msg.timestamp) {
              <div [class]="msg.role === 'user' ? 'self-end ml-8' : 'self-start mr-8'" class="flex flex-col">
                 <div 
                   [class]="msg.role === 'user' ? 'bg-white text-black self-end' : 'bg-zinc-800 text-zinc-200 self-start'"
                   class="px-4 py-2 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-full break-words shadow-lg">
                   {{ msg.text }}
                 </div>
                 
                 @if (msg.grounding) {
                   <div class="mt-1 text-[9px] text-zinc-500 flex flex-wrap gap-2">
                      @for (chunk of msg.grounding; track $index) {
                         @if (chunk.web?.uri) {
                           <a [href]="chunk.web.uri" target="_blank" class="hover:text-blue-400 underline truncate max-w-[150px]">{{ chunk.web.title || 'Source' }}</a>
                         }
                      }
                   </div>
                 }
                 <span class="text-[9px] text-zinc-600 mt-1 opacity-50" [class.text-right]="msg.role === 'user'">{{ msg.timestamp | date:'shortTime' }}</span>
              </div>
           }

           @if (isThinking()) {
              <div class="self-start bg-zinc-800/50 px-4 py-2 rounded-2xl flex gap-1">
                 <div class="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></div>
                 <div class="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                 <div class="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              </div>
           }
        </div>

        <!-- Input -->
        <div class="p-3 bg-zinc-900 border-t border-white/5">
           <div class="relative flex items-center bg-black/50 border border-zinc-800 rounded-full px-4 py-2 focus-within:border-zinc-500 transition-colors">
              <input 
                [(ngModel)]="inputText"
                (keydown.enter)="sendMessage()"
                [disabled]="isThinking()"
                class="flex-1 bg-transparent border-none focus:outline-none text-xs sm:text-sm text-white placeholder:text-zinc-600"
                placeholder="Ask about projects, files, or search web..."
              />
              
              <!-- Mic Button -->
              <button 
                (click)="toggleVoice()"
                [class.text-red-500]="isListening()"
                [class.animate-pulse]="isListening()"
                class="mr-2 text-zinc-500 hover:text-white transition-colors"
                title="Voice Input">
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
  
  isOpen = signal(false);
  messages = signal<ChatMessage[]>([]);
  inputText = signal('');
  isThinking = signal(false);
  isListening = signal(false);
  scrollContainer = viewChild<ElementRef>('scrollContainer');
  
  private recognition: any;

  constructor() {
      // Load History
      const stored = localStorage.getItem('artifact_chat_history');
      if (stored) {
          try { this.messages.set(JSON.parse(stored)); } catch(e){}
      }
      
      effect(() => {
         localStorage.setItem('artifact_chat_history', JSON.stringify(this.messages()));
         if (this.messages().length) this.scrollToBottom();
      });

      // Init Voice
      if ('webkitSpeechRecognition' in window) {
          const v: any = window;
          this.recognition = new v.webkitSpeechRecognition();
          this.recognition.continuous = false;
          this.recognition.lang = 'en-US';
          this.recognition.onresult = (e: any) => {
              const transcript = e.results[0][0].transcript;
              this.inputText.set(transcript);
              this.isListening.set(false);
              this.sendMessage(); // Auto send on voice end
          };
          this.recognition.onerror = () => this.isListening.set(false);
          this.recognition.onend = () => this.isListening.set(false);
      }
  }

  toggleVoice() {
      if (!this.recognition) {
          alert('Voice input not supported in this browser.');
          return;
      }
      
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

      // Build Context
      const context = JSON.stringify({
          projects: this.projectService.projects(),
          files: this.driveService.files().map(f => ({ name: f.name, type: f.type, created: f.createdAt }))
      });

      // Transform History for API
      const history: Content[] = this.messages().map(m => ({
          role: m.role as 'user' | 'model',
          parts: [{ text: m.text }]
      }));

      try {
          const result = await this.geminiService.chatWithAgent(text, context, history);
          
          if (result.toolCall && result.toolCall.type === 'create_note') {
              // Execute Tool
              const noteData = result.toolCall.data;
              const blob = new Blob([noteData.content], { type: 'text/plain' });
              const file = new File([blob], `${noteData.title}.txt`, { type: 'text/plain' });
              this.driveService.addFile(file);
              
              this.messages.update(p => [...p, { 
                  role: 'model', 
                  text: `I've created the document "${noteData.title}" in your Vault.`, 
                  timestamp: new Date() 
              }]);
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
