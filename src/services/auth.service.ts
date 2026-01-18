
import { Injectable, signal } from '@angular/core';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Simulated logged-in user
  readonly currentUser = signal<User>({
    id: 'u1',
    name: 'Alex Innovator',
    email: 'alex@nexus.ai',
    avatar: 'https://i.pravatar.cc/150?u=alex'
  });

  readonly allUsers = signal<User[]>([
    { id: 'u1', name: 'Alex Innovator', email: 'alex@nexus.ai', avatar: 'https://i.pravatar.cc/150?u=alex' },
    { id: 'u2', name: 'Sarah Design', email: 'sarah@nexus.ai', avatar: 'https://i.pravatar.cc/150?u=sarah' },
    { id: 'u3', name: 'Mike Dev', email: 'mike@nexus.ai', avatar: 'https://i.pravatar.cc/150?u=mike' }
  ]);
}
