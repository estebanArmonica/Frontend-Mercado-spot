import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth-service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dasboard-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dasboard-component.html',
  styleUrl: './dasboard-component.css',
})
export class DasboardComponent implements OnInit{
  user: any;
  estadisticas: any = {};
  loading = false;
  selectedFile: File | null = null;
  uploadProgress: any = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
