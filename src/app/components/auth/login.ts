import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth-service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  showPassword = false;
  loginError = '';

  constructor(private formBuilder: FormBuilder, private router: Router, private authService: AuthService, private toastr: ToastrService) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    // Cargamos credenciales guardadas
    this.loadSavedCredentials();
  }

  onSubmit(): void {
    this.submitted = true;
    this.loginError = '';
    
    if (this.loginForm.invalid) {
      return;
    }
    
    this.loading = true;
    
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.toastr.success('Login exitoso', 'Bienvenido ' + response.username);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.toastr.error('Credenciales inválidas', 'Error de autenticación');
        this.loading = false;
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  /**
      forgotPassword(event: Event){
        event.preventDefault();
        console.log('Recuperar contraseña');
      }  
  */

  private loadSavedCredentials() {
    const savedCredentials = localStorage.getItem('savedCredentials');
    if(savedCredentials) {
      const { username, password } = JSON.parse(savedCredentials);
      this.loginForm.patchValue({ username, password, rememberMe: true });
    }
  }

  private saveCredentials() {
    if(this.loginForm.get('rememberMe')?.value){
      const { username, password } = this.loginForm.value;
      localStorage.setItem('savedCredentials', JSON.stringify({ username, password }));
    } else {
      localStorage.removeItem('savedCredentials');
    }
  }
}
