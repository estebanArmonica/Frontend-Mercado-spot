import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth-service';


export const AuthGuard = () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  if (authService.isAuthenticated()) {
    return true;
  }
  
  router.navigate(['/login']);
  return false;
};
