import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) { 
    const token = localStorage.getItem('token');
    if(token) this.isLoggedInSubject.next(true);
  }

  login(data: any) {
    // API adresi: http://localhost:3000/api/auth/login
    return this.http.post<any>(`${this.apiUrl}/login`, data).pipe(
      tap(response => {
        // Token'ı kaydet
        localStorage.setItem('token', response.token);
        // Kullanıcı bilgisini kaydet
        localStorage.setItem('user', JSON.stringify(response.user));
        // Giriş yapıldı bilgisini yay
        this.isLoggedInSubject.next(true);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isLoggedInSubject.next(false);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getCurrentUser() {
    const user = localStorage.getItem('user');
    // JSON formatındaki veriyi nesneye çevirip geri döndürüyoruz
    return user ? JSON.parse(user) : null;
  }
}