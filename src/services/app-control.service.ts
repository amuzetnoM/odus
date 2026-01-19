
import { Injectable, signal } from '@angular/core';

export type AppView = 'dashboard' | 'calendar' | 'drive' | 'github' | 'projects' | 'mind' | 'analytics';

@Injectable({
  providedIn: 'root'
})
export class AppControlService {
  readonly navigationRequest = signal<AppView | null>(null);

  navigate(view: AppView) {
    this.navigationRequest.set(view);
  }
}
