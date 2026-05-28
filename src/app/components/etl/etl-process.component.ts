import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EtlService } from '../../services/elt/etl-service';
import { ETLProgress, ETLResult } from '../../models/etl.model';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'data';
  tableData?: any;
  level?: number;
}

@Component({
  selector: 'app-etl-process',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './etl-process.component.html',
  styleUrl: './etl-process.component.css',
})
export class EtlProcessComponent implements OnDestroy, OnInit {
  
  @Output() processComplete = new EventEmitter<ETLResult>();

  selectedFile: File | null = null;
  isProcessing = false;
  currentJobId: string | null = null;
  uploadProgress = 0;
  uploadMessage = '';
  uploadStatus: 'info' | 'success' | 'error' | 'warning' = 'info';

  // Log del sistema
  logs: LogEntry[] = [];
  autoScroll = true;
  dragOver = false;

  // progreso ETL
  etlProgress: ETLProgress | null = null;
  showDetails = false;

  private pollingSubscription: any = null;
  private logCounter = 0;

  constructor(private etlService: EtlService){}

  ngOnInit(): void {
    this.addInitialLogs();
  }

  ngOnDestroy(): void {
    if(this.pollingSubscription){
      this.pollingSubscription.unsubscribe();
    }
  }

  addInitialLogs(): void {
    this.addLog('Sistema ETL inicializado', 'info');
    this.addLog('Esperando selección de archivo...', 'info');
    this.addLog('Formatos soportados: .xlsx, .xls, .csv', 'info');
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      this.addLog(`Archivo seleccionado: ${this.selectedFile.name} (${(this.selectedFile.size / 1024).toFixed(2)} KB)`, 'success');
      this.uploadMessage = `Archivo seleccionado: ${this.selectedFile.name}`;
      this.uploadStatus = 'info';
    }
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
      this.addLog(`Archivo arrastrado: ${this.selectedFile.name}`, 'success');
      this.uploadMessage = `Archivo seleccionado: ${this.selectedFile.name}`;
      this.uploadStatus = 'info';
    }
  }

  startETLProcess(): void {
    if (!this.selectedFile) {
      this.addLog('ERROR: No se ha seleccionado ningún archivo', 'error');
      return;
    }

    this.isProcessing = true;
    this.logs = [];
    this.addLog('=========================================', 'info');
    this.addLog('INICIANDO PROCESO ETL', 'success');
    this.addLog('=========================================', 'info');
    this.addLog(`Archivo: ${this.selectedFile.name}`, 'info');
    this.addLog(`Tamaño: ${(this.selectedFile.size / 1024).toFixed(2)} KB`, 'info');
    this.addLog('Enviando archivo al servidor...', 'info');

    this.etlService.uploadAndProcess(this.selectedFile).subscribe({
      next: (response) => {
        this.addLog(`Respuesta del servidor: ${response.message}`, 'success');
        this.addLog(`Status: ${response.status}`, 'info');
        
        // Extraer jobId de la respuesta o del header
        // Por ahora asumimos que el jobId viene en el response o necesitas obtenerlo del progress polling
        this.currentJobId = 'temp-job-id'; // Ajusta según tu backend
        
        if (this.currentJobId) {
          this.startProgressMonitoring();
        }
      },
      error: (error) => {
        this.addLog(`ERROR al subir archivo: ${error.message}`, 'error');
        this.isProcessing = false;
        this.uploadStatus = 'error';
        this.uploadMessage = 'Error al subir el archivo';
      }
    });
  }

  startProgressMonitoring(): void {
    this.addLog('Monitoreando progreso del procesamiento...', 'info');
    
    this.pollingSubscription = this.etlService.startProgressPolling(this.currentJobId!, 2000)
      .subscribe({
        next: (progress) => {
          this.etlProgress = progress;
          this.uploadProgress = progress.progress;
          this.updateLogsFromProgress(progress);
          
          if (progress.status === 'COMPLETED') {
            this.handleProcessComplete(progress);
          } else if (progress.status === 'FAILED') {
            this.handleProcessFailed(progress);
          }
        },
        error: (error) => {
          this.addLog(`ERROR en el monitoreo: ${error.message}`, 'error');
          this.isProcessing = false;
        }
      });
  }

  updateLogsFromProgress(progress: ETLProgress): void {
    // Actualizar según el paso actual
    switch (progress.currentStep) {
      case 'VALIDATING':
        this.addLog('Validando estructura del archivo...', 'info');
        this.addLog(`Archivo: ${progress.fileName}`, 'info');
        break;
      case 'EXTRACTING':
        this.addLog(`EXTRAYENDO DATOS - Progreso: ${progress.progress}%`, 'info');
        this.addLog(`Registros extraídos: ${progress.recordsExtracted}`, 'data');
        break;
      case 'TRANSFORMING':
        this.addLog(`TRANSFORMANDO DATOS - Progreso: ${progress.progress}%`, 'info');
        this.addLog(`Registros transformados: ${progress.recordsTransformed}`, 'data');
        break;
      case 'LOADING':
        this.addLog(`CARGANDO DATOS - Progreso: ${progress.progress}%`, 'info');
        this.addLog(`Registros cargados: ${progress.recordsLoaded}`, 'data');
        break;
    }
  }

  handleProcessComplete(progress: ETLProgress): void {
    this.addLog('=========================================', 'success');
    this.addLog('✅ PROCESO ETL COMPLETADO EXITOSAMENTE', 'success');
    this.addLog('=========================================', 'success');
    this.addLog(`Total registros procesados: ${progress.recordsLoaded}`, 'success');
    this.addLog(`Tiempo de procesamiento: ${this.getElapsedTime(progress.startTime)}`, 'info');
    this.addLog('=========================================', 'info');
    
    this.isProcessing = false;
    this.uploadStatus = 'success';
    this.uploadMessage = 'Proceso ETL completado exitosamente';
    this.processComplete.emit(this.etlProgress as any);
  }

  handleProcessFailed(progress: ETLProgress): void {
    this.addLog('=========================================', 'error');
    this.addLog('❌ ERROR EN PROCESO ETL', 'error');
    this.addLog('=========================================', 'error');
    this.addLog(`Error: ${progress.errorMessage}`, 'error');
    
    this.isProcessing = false;
    this.uploadStatus = 'error';
    this.uploadMessage = 'Error en el proceso ETL';
  }

  cancelProcess(): void {
    if (this.currentJobId && this.isProcessing) {
      this.etlService.cancelJob(this.currentJobId).subscribe({
        next: () => {
          this.addLog('⚠️ Proceso cancelado por el usuario', 'warning');
          this.isProcessing = false;
          if (this.pollingSubscription) {
            this.pollingSubscription.unsubscribe();
          }
        },
        error: (error) => {
          this.addLog(`Error al cancelar: ${error.message}`, 'error');
        }
      });
    }
  }

  addLog(message: string, type: LogEntry['type'] = 'info', tableData?: any): void {
    const timestamp = new Date();
    const formattedTime = this.formatTimestamp(timestamp);
    
    this.logs.push({
      timestamp: formattedTime,
      message: message,
      type: type,
      tableData: tableData,
      level: this.logCounter++
    });
    
    if (this.autoScroll) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  formatTimestamp(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
  }

  getElapsedTime(startTime: string): string {
    if (!startTime) return 'N/A';
    const start = new Date(startTime);
    const end = new Date();
    const seconds = Math.floor((end.getTime() - start.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds} segundos`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} minutos ${remainingSeconds} segundos`;
  }

  scrollToBottom(): void {
    const logContainer = document.querySelector('.log-container');
    if (logContainer) {
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  }

  clearLogs(): void {
    this.logs = [];
    this.addInitialLogs();
  }

  downloadLogs(): void {
    const logText = this.logs.map(log => `[${log.timestamp}] ${log.message}`).join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `etl_logs_${this.formatTimestamp(new Date())}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    this.addLog('Logs exportados exitosamente', 'success');
  }

  getLogIcon(type: string): string {
    switch (type) {
      case 'success': return 'fas fa-check-circle';
      case 'error': return 'fas fa-times-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'data': return 'fas fa-database';
      default: return 'fas fa-info-circle';
    }
  }

  getLogClass(type: string): string {
    switch (type) {
      case 'success': return 'log-success';
      case 'error': return 'log-error';
      case 'warning': return 'log-warning';
      case 'data': return 'log-data';
      default: return 'log-info';
    }
  }

  formatMessageWithData(message: string): string {
    if (message.includes('nombre_campo=')) {
      return `<span class="log-field">${message}</span>`;
    }
    return message;
  }

}
