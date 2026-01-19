
import { Injectable, signal } from '@angular/core';

export interface UserPreferences {
  emailAlerts: boolean;
  deviceNotifications: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  preferences: UserPreferences;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Default fallback user
  private readonly defaultUser: User = {
    id: 'u1',
    name: 'Alex Innovator',
    email: 'alex@nexus.ai',
    // Using a reliable seed for abstract/fractal art style
    avatar: 'https://api.dicebear.com/9.x/shapes/svg?seed=fractal&backgroundColor=0a0a0a&shape1Color=22d3ee&shape2Color=818cf8',
    preferences: {
      emailAlerts: false,
      deviceNotifications: false
    }
  };

  // Signal holding current user state
  readonly currentUser = signal<User>(this.loadUser());

  readonly allUsers = signal<User[]>([
    { ...this.defaultUser },
    { id: 'u2', name: 'Sarah Design', email: 'sarah@nexus.ai', avatar: 'https://i.pravatar.cc/150?u=sarah', preferences: { emailAlerts: false, deviceNotifications: false } },
    { id: 'u3', name: 'Mike Dev', email: 'mike@nexus.ai', avatar: 'https://i.pravatar.cc/150?u=mike', preferences: { emailAlerts: false, deviceNotifications: false } }
  ]);

  constructor() {
    // No specific initialization needed beyond property initializers
  }

  private loadUser(): User {
    const stored = localStorage.getItem('artifact_user_profile');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Merge with default to ensure new fields (like preferences) exist if loading old data
        return {
          ...this.defaultUser,
          ...parsed,
          preferences: { ...this.defaultUser.preferences, ...(parsed.preferences || {}) }
        };
      } catch (e) {
        console.error('Failed to parse user profile', e);
      }
    }
    return this.defaultUser;
  }

  updateProfile(updates: Partial<User>) {
    this.currentUser.update(current => {
      const updated = { ...current, ...updates };
      // Deep merge preferences if provided
      if (updates.preferences) {
        updated.preferences = { ...current.preferences, ...updates.preferences };
      }
      localStorage.setItem('artifact_user_profile', JSON.stringify(updated));
      return updated;
    });
  }

  requestNotificationPermission() {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        }
      });
    }
  }
}
