import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { ETLProgress, ETLResult, UploadResponse } from '../../models/etl.model';
import { environmentDev } from '../../../environments/environment.dev';

@Injectable({
  providedIn: 'root',
})
export class EtlService {
  private apiUrl = `${environmentDev.apiUrl}/etl`;
  private progressSubject = new Subject<ETLProgress | null>();
  progress$ = this.progressSubject.asObservable();

  constructor(private http: HttpClient) {}

  uploadAndProcess(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    // agregamos el headers por Bearer
    let headers = new HttpHeaders();

    // llamamos a nuestro token
    const token = localStorage.getItem('token');

    headers = headers.set('Authorization', `Bearer ${token}`);
    
    return this.http.post<UploadResponse>(`${this.apiUrl}/upload`, formData, { headers });
  }

  getJobProgress(jobId: string): Observable<ETLProgress> {
    return this.http.get<ETLProgress>(`${this.apiUrl}/progress/${jobId}`);
  }

  cancelJob(jobId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cancel/${jobId}`);
  }

  // este método actualiza en tiempo real la ejecución del ETL
  startProgressPolling(jobId: string, intervalMs: number = 2000): Observable<ETLProgress> {
    return new Observable(observer => {
      const interval = setInterval(() => {
        this.getJobProgress(jobId).subscribe({
          next: (progress) => {
            observer.next(progress);
            if (progress.status === 'COMPLETED' || progress.status === 'FAILED') {
              clearInterval(interval);
              observer.complete();
            }
          },
          error: (err) => {
            observer.error(err);
            clearInterval(interval);
          }
        });
      }, intervalMs);

      return () => clearInterval(interval);
    });
  }

  clearProgress(): void {
    this.progressSubject.next(null);
  }
}
