
import { Component, output, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { GithubService } from '../services/github.service';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

type SettingsTab = 'profile' | 'system';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" (click)="close.emit()">
      <div class="w-full max-w-md bg-zinc-950 border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="p-6 border-b border-white/5 bg-zinc-900/50 flex justify-between items-center shrink-0">
           <h2 class="text-sm font-bold text-white uppercase tracking-widest">Settings</h2>
           <button (click)="close.emit()" class="text-zinc-500 hover:text-white">✕</button>
        </div>
        
        <!-- Tabs -->
        <div class="flex border-b border-white/5">
            <button 
              (click)="activeTab.set('profile')" 
              class="flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2"
              [class.border-white]="activeTab() === 'profile'"
              [class.text-white]="activeTab() === 'profile'"
              [class.border-transparent]="activeTab() !== 'profile'"
              [class.text-zinc-500]="activeTab() !== 'profile'"
              [class.hover:text-zinc-300]="activeTab() !== 'profile'"
            >
              Profile
            </button>
            <button 
              (click)="activeTab.set('system')" 
              class="flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2"
              [class.border-white]="activeTab() === 'system'"
              [class.text-white]="activeTab() === 'system'"
              [class.border-transparent]="activeTab() !== 'system'"
              [class.text-zinc-500]="activeTab() !== 'system'"
              [class.hover:text-zinc-300]="activeTab() !== 'system'"
            >
              System
            </button>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
           
           <!-- PROFILE TAB -->
           @if (activeTab() === 'profile') {
              <div class="space-y-6 animate-fade-in">
                  <!-- Avatar & Info -->
                  <div class="flex items-center gap-4">
                      <img [src]="userAvatar()" class="w-16 h-16 rounded-full border border-white/10 object-cover bg-zinc-800" />
                      <div>
                          <p class="text-[10px] text-zinc-500 font-mono uppercase mb-1">User ID: {{ userId() }}</p>
                          <button class="text-xs text-indigo-400 hover:text-indigo-300 underline disabled:opacity-50 disabled:no-underline" disabled>Change Avatar</button>
                      </div>
                  </div>

                  <!-- Personal Info -->
                  <div class="space-y-4">
                      <div>
                          <label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Display Name</label>
                          <input 
                            [ngModel]="userName()"
                            (ngModelChange)="userName.set($event)"
                            type="text"
                            class="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-xs text-zinc-300 focus:outline-none focus:border-white/30 transition-colors"
                          />
                      </div>
                      <div>
                          <label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Email Address</label>
                          <input 
                            [ngModel]="userEmail()"
                            (ngModelChange)="userEmail.set($event)"
                            type="email"
                            class="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-xs text-zinc-300 focus:outline-none focus:border-white/30 transition-colors"
                          />
                      </div>
                  </div>

                  <!-- Notifications -->
                  <div class="pt-4 border-t border-white/5 space-y-4">
                      <h3 class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Alerts & Notifications</h3>
                      
                      <!-- Toggle: Email -->
                      <div class="flex justify-between items-center">
                          <div>
                              <div class="text-xs text-zinc-300">Email Digest</div>
                              <div class="text-[10px] text-zinc-600">Receive daily AI summaries</div>
                          </div>
                          <button 
                            (click)="emailAlerts.set(!emailAlerts())"
                            class="w-10 h-5 rounded-full relative transition-colors duration-200 ease-in-out"
                            [class.bg-green-600]="emailAlerts()"
                            [class.bg-zinc-700]="!emailAlerts()">
                              <div class="absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 shadow-sm" [class.translate-x-5]="emailAlerts()"></div>
                          </button>
                      </div>

                      <!-- Toggle: Device -->
                      <div class="flex justify-between items-center">
                          <div>
                              <div class="text-xs text-zinc-300">Device Push</div>
                              <div class="text-[10px] text-zinc-600">Browser notifications for tasks</div>
                          </div>
                          <button 
                            (click)="toggleDeviceNotifications()"
                            class="w-10 h-5 rounded-full relative transition-colors duration-200 ease-in-out"
                            [class.bg-green-600]="deviceNotifications()"
                            [class.bg-zinc-700]="!deviceNotifications()">
                              <div class="absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 shadow-sm" [class.translate-x-5]="deviceNotifications()"></div>
                          </button>
                      </div>
                  </div>
              </div>
           }

           <!-- SYSTEM TAB -->
           @if (activeTab() === 'system') {
              <div class="space-y-6 animate-fade-in">
                <!-- Gemini -->
                <div>
                    <label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Gemini API Key</label>
                    <div class="relative">
                        <input 
                            [ngModel]="geminiKey()"
                            (ngModelChange)="geminiKey.set($event)"
                            type="password"
                            class="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                            placeholder="AI Studio Key..."
                            [disabled]="isTesting()"
                        />
                    </div>
                    <p class="text-[9px] text-zinc-600 mt-2">Required for generative features. Stored locally.</p>
                </div>

                <!-- GitHub -->
                <div>
                    <label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">GitHub Personal Token</label>
                    <div class="relative">
                        <input 
                            [ngModel]="githubToken()"
                            (ngModelChange)="githubToken.set($event)"
                            type="password"
                            class="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                            placeholder="ghp_..."
                            [disabled]="isTesting()"
                        />
                    </div>
                    <p class="text-[9px] text-zinc-600 mt-2">Required for repository analysis. Needs 'repo' scope.</p>
                </div>
              </div>
           }
        </div>

        <div class="p-6 border-t border-white/5 bg-zinc-900/30 flex justify-end gap-3 shrink-0">
           <button (click)="close.emit()" [disabled]="isTesting()" class="px-4 py-2 text-xs text-zinc-400 hover:text-white transition-colors disabled:opacity-50">Cancel</button>
           <button 
             (click)="save()"
             [disabled]="isTesting()" 
             class="px-6 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest rounded hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center gap-2">
             @if(isTesting()) {
               <div class="w-3 h-3 border-2 border-zinc-400 border-t-black rounded-full animate-spin"></div>
               Saving...
             } @else {
               Save Changes
             }
           </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
     @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
     .animate-fade-in { animation: fadeIn 0.3s ease-out; }
  `]
})
export class SettingsModalComponent {
  close = output();
  private geminiService = inject(GeminiService);
  private githubService = inject(GithubService);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);

  activeTab = signal<SettingsTab>('profile');
  isTesting = signal(false);

  // System State
  geminiKey = signal(localStorage.getItem('gemini_api_key') || '');
  githubToken = signal(localStorage.getItem('gh_token') || '');

  // Profile State
  userId = signal('');
  userName = signal('');
  userEmail = signal('');
  userAvatar = signal('');
  emailAlerts = signal(false);
  deviceNotifications = signal(false);

  constructor() {
      // Init Profile Data
      const user = this.authService.currentUser();
      this.userId.set(user.id);
      this.userName.set(user.name);
      this.userEmail.set(user.email);
      this.userAvatar.set(user.avatar);
      this.emailAlerts.set(user.preferences.emailAlerts);
      this.deviceNotifications.set(user.preferences.deviceNotifications);
  }

  toggleDeviceNotifications() {
      const newState = !this.deviceNotifications();
      this.deviceNotifications.set(newState);
      if (newState) {
          this.authService.requestNotificationPermission();
      }
  }

  async save() {
      this.isTesting.set(true);
      
      try {
          // 1. Save Profile (Always)
          this.authService.updateProfile({
              name: this.userName(),
              email: this.userEmail(),
              preferences: {
                  emailAlerts: this.emailAlerts(),
                  deviceNotifications: this.deviceNotifications()
              }
          });

          // 2. Validate & Save System Config (If changed or keys exist)
          const gKey = this.geminiKey();
          const ghToken = this.githubToken();
          
          let geminiValid = true;
          let githubValid = true;

          // Only validate if on system tab or if keys exist to ensure integrity
          if (this.activeTab() === 'system' || gKey) {
             [geminiValid, githubValid] = await Promise.all([
                 this.geminiService.validateConnection(gKey),
                 ghToken ? this.githubService.validateConnection(ghToken) : Promise.resolve(true)
             ]);

             if (!geminiValid) throw new Error('Gemini API Key Invalid');
             if (!githubValid) throw new Error('GitHub Token Invalid');

             this.geminiService.updateApiKey(gKey);
             this.githubService.setToken(ghToken);
          }

          this.notification.show('Settings Updated Successfully', 'success');
          this.close.emit();

      } catch (e: any) {
          this.notification.show(e.message || 'Error Saving Settings', 'error');
      } finally {
          this.isTesting.set(false);
      }
  }
}
