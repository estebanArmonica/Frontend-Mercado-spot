import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth-service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ETLProgress, ETLResult } from '../../models/etl.model';
import { FormsModule } from '@angular/forms';
import { EtlProcessComponent } from '../etl/etl-process.component';

@Component({
  selector: 'app-dasboard-component',
  standalone: true,
  imports: [CommonModule, FormsModule, EtlProcessComponent],
  templateUrl: './dasboard-component.html',
  styleUrl: './dasboard-component.css',
})
export class DasboardComponent implements OnInit, OnDestroy{
  user: any;
  estadisticas: any = {};
  loading = false;
  selectedFile: File | null = null;
  uploadProgress: any = null;

  dragOver = false;

  // UI State
  showUserMenu = false;
  currentSection = 'dashboard';
  searchTerm = '';
  refreshing = false;

  // ETL State
  etlRunning = false;
  etlProgress: ETLProgress | null = null;
  etlHistory: ETLResult[] = [];
  uploadMessage = '';
  uploadStatus = '';

  // Invoices Data (mientars lo dejare simulado)
  invoices: any[] = [];
  invoiceFilter = 'all';

  // Reports Data
  reportGenerating = false;

  // Config
  config = {
    notifications: true,
    autoRefresh: 30,
    theme: 'light'
  };

  // Stats para el dashboard
  stats = {
    energyProcessed: 0,
    energyGrowth: 0,
    invoicesGenerated: 0,
    invoicesGrowth: 0,
    processingTime: 0,
    timeGrowth: 0,
    successRate: 0,
    successGrowth: 0
  };

  // Actividad reciente
  recentActivities: any[] = [];
  private refreshInterval: any;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.loadDashboardData();
    this.loadETLHistory();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    if(this.refreshInterval){
      clearInterval(this.refreshInterval);
    }
  }

  // Cargar datos del dashboard
  loadDashboardData(): void {
    // son datos de prueba no reales falta llamar a la API
    this.stats = {
      energyProcessed: 12450,
      energyGrowth: 12.5,
      invoicesGenerated: 342,
      invoicesGrowth: 8.3,
      processingTime: 2.4,
      timeGrowth: 0.5,
      successRate: 98.7,
      successGrowth: 1.2
    };

    this.recentActivities = [
      { title: 'Proceso ETL completado', time: 'Hace 5 minutos', type: 'success', icon: 'fas fa-check-circle' },
      { title: 'Archivo cargado: facturas_ene.xlsx', time: 'Hace 2 horas', type: 'info', icon: 'fas fa-upload' },
      { title: 'Reporte mensual generado', time: 'Hace 4 horas', type: 'warning', icon: 'fas fa-chart-line' },
      { title: 'Sincronización de base de datos', time: 'Hace 1 día', type: 'success', icon: 'fas fa-database' }
    ];
  }

  // Cargar historial ETL
  loadETLHistory(): void {
    // Aquí llamarías a tu servicio ETL
    // this.etlService.getHistory().subscribe(history => this.etlHistory = history);
    
    // Datos de ejemplo
    this.etlHistory = [
      { 
        jobId: 'JOB-001', 
        status: 'COMPLETED', 
        fileName: 'datos_mercado_ene.xlsx',
        totalRecordsExtracted: 15234,
        totalRecordsTransformed: 15234,
        totalRecordsLoaded: 15230,
        totalRecordsUpdated: 4,
        totalRecordsSkipped: 0,
        totalErrors: 0,
        errors: [],
        errorMessage: '',
        startTime: '2024-01-15 10:30:00',
        endTime: '2024-01-15 10:32:30'
      },
      { 
        jobId: 'JOB-002', 
        status: 'FAILED', 
        fileName: 'precios_dic.xlsx',
        totalRecordsExtracted: 0,
        totalRecordsTransformed: 0,
        totalRecordsLoaded: 0,
        totalRecordsUpdated: 0,
        totalRecordsSkipped: 0,
        totalErrors: 5,
        errors: ['Formato de fecha inválido', 'Columna faltante: PRECIO'],
        errorMessage: 'Error en validación de datos',
        startTime: '2024-01-14 10:30:00',
        endTime: '2024-01-14 10:30:15'
      },
      { 
        jobId: 'JOB-003', 
        status: 'COMPLETED', 
        fileName: 'facturas_noviembre.xlsx',
        totalRecordsExtracted: 8920,
        totalRecordsTransformed: 8920,
        totalRecordsLoaded: 8915,
        totalRecordsUpdated: 5,
        totalRecordsSkipped: 0,
        totalErrors: 0,
        errors: [],
        errorMessage: '',
        startTime: '2024-01-13 10:30:00',
        endTime: '2024-01-13 10:31:45'
      }
    ];
  }

  // Seleccionar archivo para ETL
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      this.uploadMessage = `Archivo seleccionado: ${this.selectedFile.name}`;
      this.uploadStatus = 'info';
    }
  }

  // Iniciar proceso ETL
  startETLProcess(): void {
    if (!this.selectedFile) {
      this.uploadMessage = 'Por favor seleccione un archivo primero';
      this.uploadStatus = 'error';
      return;
    }

    this.etlRunning = true;
    this.uploadProgress = 0;
    
    // Simular progreso (reemplazar con llamada real al servicio)
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    
    // Aquí llamarías a tu servicio ETL
    // this.etlService.processFile(formData).subscribe({
    //   next: (progress: ETLProgress) => {
    //     this.etlProgress = progress;
    //     this.uploadProgress = progress.progress;
    //   },
    //   complete: () => {
    //     this.etlRunning = false;
    //     this.uploadMessage = 'Proceso ETL completado exitosamente';
    //     this.uploadStatus = 'success';
    //     this.loadETLHistory();
    //     this.addActivity('Proceso ETL completado: ' + this.selectedFile?.name, 'success');
    //   },
    //   error: (error) => {
    //     this.etlRunning = false;
    //     this.uploadMessage = 'Error en el proceso ETL: ' + error.message;
    //     this.uploadStatus = 'error';
    //   }
    // });

    // Simulación temporal
    const interval = setInterval(() => {
      if (this.uploadProgress < 100) {
        this.uploadProgress += 10;
        this.uploadMessage = `Procesando archivo... ${this.uploadProgress}%`;
      } else {
        clearInterval(interval);
        this.etlRunning = false;
        this.uploadMessage = 'Proceso ETL completado exitosamente';
        this.uploadStatus = 'success';
        this.addActivity('Proceso ETL completado: ' + this.selectedFile?.name, 'success');
        this.loadETLHistory();
        this.selectedFile = null;
        this.uploadProgress = null;
      }
    }, 500);
  }

  // Cancelar proceso ETL
  cancelETLProcess(): void {
    if (confirm('¿Está seguro de cancelar el proceso ETL?')) {
      this.etlRunning = false;
      this.uploadProgress = null;
      this.uploadMessage = 'Proceso cancelado';
      this.uploadStatus = 'warning';
    }
  }

  // Programar ETL
  scheduleETL(): void {
    // Implementar diálogo de programación
    console.log('Programar proceso ETL');
    this.addActivity('Proceso ETL programado', 'info');
  }

  // Generar reporte
  generateReport(type: string): void {
    this.reportGenerating = true;
    
    // Simular generación de reporte
    setTimeout(() => {
      this.reportGenerating = false;
      this.addActivity(`Reporte ${type} generado`, 'success');
      alert(`Reporte ${type} generado exitosamente`);
    }, 2000);
  }

  // Generar factura
  generateInvoice(): void {
    console.log('Generar nueva factura');
    this.addActivity('Nueva factura generada', 'info');
  }

  // Ver factura
  viewInvoice(invoice: any): void {
    console.log('Ver factura:', invoice);
  }

  // Descargar factura
  downloadInvoice(invoice: any): void {
    console.log('Descargar factura:', invoice);
    this.addActivity(`Factura ${invoice.id} descargada`, 'info');
  }

  // Refresh data
  refreshData(): void {
    this.refreshing = true;
    setTimeout(() => {
      this.loadDashboardData();
      this.loadETLHistory();
      this.refreshing = false;
      this.addActivity('Datos actualizados', 'success');
    }, 1000);
  }

  // Cambiar sección
  changeSection(section: string): void {
    this.currentSection = section;
  }

  // Obtener título de sección
  getSectionTitle(): string {
    const titles: {[key: string]: string} = {
      'dashboard': 'Panel de Control',
      'etl': 'Procesos ETL',
      'invoices': 'Facturación',
      'reports': 'Reportes',
      'config': 'Configuración'
    };
    return titles[this.currentSection] || 'Dashboard';
  }

  // Obtener inicial del usuario
  getUserInitial(): string {
    return this.user?.username?.charAt(0)?.toUpperCase() || 'U';
  }

  // Toggle user menu
  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Agregar actividad
  addActivity(title: string, type: string): void {
    this.recentActivities.unshift({
      title: title,
      time: 'Justo ahora',
      type: type,
      icon: type === 'success' ? 'fas fa-check-circle' : 
             type === 'info' ? 'fas fa-info-circle' : 
             'fas fa-exclamation-triangle'
    });
  }

  // Iniciar auto-refresh
  startAutoRefresh(): void {
    if (this.config.autoRefresh > 0) {
      this.refreshInterval = setInterval(() => {
        if (!this.refreshing && !this.etlRunning) {
          this.refreshData();
        }
      }, this.config.autoRefresh * 1000);
    }
  }

  // Acciones de ventana (para Electron)
  closeApp(): void {
    if (confirm('¿Deseas cerrar la aplicación?')) {
      window.close();
    }
  }

  minimizeApp(): void {
    console.log('Minimizar aplicación');
    // Electron: window.electron.ipcRenderer.send('minimize-window')
  }

  maximizeApp(): void {
    console.log('Maximizar aplicación');
    // Electron: window.electron.ipcRenderer.send('maximize-window')
  }

  goToProfile(event: Event): void {
    event.preventDefault();
    console.log('Ir a perfil');
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;

    const files = event.dataTransfer?.files;
    if(files && files.length > 0) {
      this.selectedFile = files[0];
      this.uploadMessage = `Archivo seleccionado: ${this.selectedFile.name}`;
      this.uploadStatus = 'info';
    }
  }

  changePassword(event: Event): void {
    event.preventDefault();
    console.log('Cambiar contraseña');
  }

  // Filtro de facturas
  get filteredInvoices(): any[] {
    if (this.invoiceFilter === 'all') return this.invoices;
    return this.invoices.filter(inv => inv.status === this.invoiceFilter);
  }

  getTotalRecords(): number {
    return this.etlHistory.reduce((total, process) => {
      return total + (process.totalRecordsLoaded || 0); 
    }, 0);
  }

  // métodos del ETL process
  onETLComplete(result: any): void {
    console.log('ETL completado: ', result);
    this.loadDashboardData();
    this.loadETLHistory();
  }
}
