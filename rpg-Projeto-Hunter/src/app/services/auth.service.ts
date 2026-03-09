import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser$ = new BehaviorSubject<User | null>(null);
  private isLoggedIn$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.checkStoredUser();
  }

  private checkStoredUser(): void {
    const user = localStorage.getItem('shadowCode_user');
    if (user) {
      this.currentUser$.next(JSON.parse(user));
      this.isLoggedIn$.next(true);
    }
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser$.asObservable();
  }

  getIsLoggedIn(): Observable<boolean> {
    return this.isLoggedIn$.asObservable();
  }

  register(username: string, email: string, password: string): boolean {
    const users = this.getStoredUsers();
    
    if (users.find((u: User) => u.email === email)) {
      return false;
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      username,
      email,
      createdAt: new Date()
    };

    users.push({ ...newUser, password: this.hashPassword(password) });
    localStorage.setItem('shadowCode_users', JSON.stringify(users));
    localStorage.setItem('shadowCode_user', JSON.stringify(newUser));
    
    this.currentUser$.next(newUser);
    this.isLoggedIn$.next(true);
    
    return true;
  }

  login(email: string, password: string): boolean {
    const users = this.getStoredUsers();
    const user = users.find((u: any) => u.email === email && u.password === this.hashPassword(password));

    if (!user) {
      return false;
    }

    const userData: User = {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    };

    localStorage.setItem('shadowCode_user', JSON.stringify(userData));
    this.currentUser$.next(userData);
    this.isLoggedIn$.next(true);
    return true;
  }

  logout(): void {
    localStorage.removeItem('shadowCode_user');
    localStorage.removeItem('shadowCode_hunter');
    this.currentUser$.next(null);
    this.isLoggedIn$.next(false);
  }

  private getStoredUsers(): any[] {
    const users = localStorage.getItem('shadowCode_users');
    return users ? JSON.parse(users) : [];
  }

  private hashPassword(password: string): string {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }
}
