import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { ETLProgress, ETLResult, UploadResponse } from '../../models/etl.model';

@Injectable({
  providedIn: 'root',
})
export class EtlService {
  private apiUrl = 'http://localhost:8080/api/v1/etl';
  private progressSubject = new BehaviorSubject<ETLProgress | null>(null);
  progress$ = this.progressSubject.asObservable();

  constructor(private http: HttpClient) {}

  uploadExcel(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<UploadResponse>(`${this.apiUrl}/upload`, formData);
  }

  getJobProgress(jobId: string): Observable<ETLProgress> {
    return this.http.get<ETLProgress>(`${this.apiUrl}/progress/${jobId}`);
  }

  cancelJob(jobId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cancel/${jobId}`);
  }

  startPolling(jobId: string, interval: number = 2000): void {
    const poll = setInterval(() => {
      this.getJobProgress(jobId).subscribe({
        next: (progress) => {
          this.progressSubject.next(progress);
          
          if (progress.status === 'COMPLETED' || progress.status === 'FAILED' || progress.status === 'CANCELLED') {
            clearInterval(poll);
          }
        },
        error: () => {
          clearInterval(poll);
        }
      });
    }, interval);
  }

  clearProgress(): void {
    this.progressSubject.next(null);
  }
}
