import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay, of } from 'rxjs';
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
      role: 'associate'
    };

    return of(user).pipe(delay(1500));
  }

  setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }

  logout(): void {
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }
}
