
import { Component, output, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { GithubService } from '../services/github.service';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { ProjectService } from '../services/project.service';

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

                <!-- Danger Zone -->
                <div class="pt-6 mt-6 border-t border-red-900/30">
                    <h3 class="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Danger Zone</h3>
                    
                    @if (!showResetConfirmation()) {
                        <button 
                            (click)="showResetConfirmation.set(true)"
                            class="w-full py-3 bg-red-900/10 border border-red-900/30 text-red-500 text-xs font-bold uppercase tracking-widest rounded hover:bg-red-900/20 hover:border-red-500/50 transition-all flex items-center justify-center gap-2 group">
                            <svg class="w-4 h-4 opacity-70 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            Factory Reset Workspace
                        </button>
                    } @else {
                        <div class="bg-red-950/10 border border-red-900/30 rounded p-4 space-y-4 animate-scale-in">
                            <div class="flex items-start gap-3">
                                <div class="p-2 bg-red-900/20 rounded text-red-500 shrink-0">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                </div>
                                <div>
                                    <h4 class="text-xs font-bold text-red-400 uppercase tracking-wide mb-1">Irreversible Action</h4>
                                    <p class="text-[10px] text-red-400/80 leading-relaxed">
                                        This will permanently delete all projects, files, settings, and API keys. The application will reboot to a blank state.
                                    </p>
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-[9px] font-bold text-red-500/70 uppercase tracking-widest mb-2">Type "RESET" to confirm</label>
                                <input 
                                    type="text" 
                                    [(ngModel)]="resetConfirmation"
                                    class="w-full bg-zinc-950 border border-red-900/30 rounded p-2 text-xs text-red-400 focus:outline-none focus:border-red-500 placeholder:text-red-900/50"
                                    placeholder="RESET"
                                />
                            </div>

                            <div class="flex gap-2">
                                <button 
                                    (click)="showResetConfirmation.set(false); resetConfirmation.set('')"
                                    class="flex-1 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-widest rounded hover:bg-zinc-800 transition-colors">
                                    Cancel
                                </button>
                                <button 
                                    (click)="performFactoryReset()"
                                    [disabled]="resetConfirmation() !== 'RESET'"
                                    class="flex-1 py-2 bg-red-600 text-white text-xs font-bold uppercase tracking-widest rounded hover:bg-red-500 transition-colors disabled:opacity-50 disabled:bg-red-900/20 disabled:text-red-500 disabled:cursor-not-allowed">
                                    Confirm Reset
                                </button>
                            </div>
                        </div>
                    }
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
     
     @keyframes scaleIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
     .animate-scale-in { animation: scaleIn 0.2s ease-out; }
  `]
})
export class SettingsModalComponent {
  close = output();
  private geminiService = inject(GeminiService);
  private githubService = inject(GithubService);
  private authService = inject(AuthService);
  private projectService = inject(ProjectService);
  private notification = inject(NotificationService);

  activeTab = signal<SettingsTab>('profile');
  isTesting = signal(false);
  
  // Danger Zone State
  showResetConfirmation = signal(false);
  resetConfirmation = signal('');

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

  performFactoryReset() {
      if (this.resetConfirmation() === 'RESET') {
          this.projectService.hardReset();
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

          // 2. Propagate Identity Changes to Artifacts (Comments, etc)
          this.projectService.updateUserIdentity(this.userId(), this.userName(), this.userAvatar());

          // 3. Validate & Save System Config (If changed or keys exist)
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

          this.notification.notify('Success', 'Settings Updated Successfully', 'success');
          this.close.emit();

      } catch (e: any) {
          this.notification.notify('Error', e.message || 'Error Saving Settings', 'error');
      } finally {
          this.isTesting.set(false);
      }
  }
}
