import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserContextService {

  constructor() { }

  getCurrentUserId(): string | null {
    return localStorage.getItem('userId');
  }

  getCurrentUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  isCurrentUserProfessional(): boolean {
    
    const role = this.getCurrentUserRole();
    return role?.toLocaleLowerCase() === 'professional';
  }

  getCurrentProfessionalId(): string | null {
    if (!this.isCurrentUserProfessional()) {
      return null;
    }
    return this.getCurrentUserId();
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  clearUserData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
  }
}
