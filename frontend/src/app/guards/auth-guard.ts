import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  
  // Tarayıcı tarafındaysak (SSR hatası almamak için) kontrol et
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    
    if (token) {
      return true; // Token varsa admin paneline girebilir
    }
  }

  // Token yoksa kullanıcıyı login sayfasına fırlat
  router.navigate(['/login']);
  return false;
};