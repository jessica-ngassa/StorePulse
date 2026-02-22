import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay, of, throwError } from 'rxjs';
import { User, LoginRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  login(request: LoginRequest): Observable<User> {
    const user: User = {
      id: 'user-123',
      name: 'John Associate',
      email: request.email || 'j.associate@homedepot.com',
      role: 'associate',
      preferredCategory: 'scanning',
      preferredSubTeam: 'Scanner Maintenance'
    };

    return of(user).pipe(delay(1500));
  }

  setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }

  updateCurrentUser(updates: Partial<User>): Observable<User> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      return throwError(() => new Error('No authenticated user found'));
    }

    const updatedUser: User = {
      ...currentUser,
      ...updates
    };
    this.currentUserSubject.next(updatedUser);
    return of(updatedUser).pipe(delay(350));
  }

  logout(): void {
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }
}
