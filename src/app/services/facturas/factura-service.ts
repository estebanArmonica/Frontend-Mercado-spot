import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Factura, FacturaResponse, FacturaFilter, PageResponse } from '../../models/factura.model';

@Injectable({
  providedIn: 'root',
})
export class FacturaService {
  private apiUrl = 'http://localhost:8080/api/v1/facturas';

  constructor(private http: HttpClient) {}

  getAllFacturas(page: number = 0, size: number = 20): Observable<PageResponse<FacturaResponse>> {
    const params = new HttpParams()
      .set('page',page.toString())
      .set('size',page.toString())
      .set('sort',"id,desc")

    return this.http.get<PageResponse<FacturaResponse>>(this.apiUrl, { params });
  }

  getFacturaById(id: number): Observable<FacturaResponse> {
    return this.http.get<FacturaResponse>(`${this.apiUrl}/${id}`);
  }

  getFacturasByEntidad(rut: string): Observable<FacturaResponse[]> {
    return this.http.get<FacturaResponse[]>(`${this.apiUrl}/entidad/${rut}`);
  }

  getFacturasByPeriodo(year: number, month: number): Observable<FacturaResponse[]> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());
    
    return this.http.get<FacturaResponse[]>(`${this.apiUrl}/periodo`, { params });
  }

  searchFacturas(filters: FacturaFilter): Observable<PageResponse<FacturaResponse>> {
    let params = new HttpParams();
    
    if (filters.folio) params = params.set('folio', filters.folio.toString());
    if (filters.rutEntidad) params = params.set('rutEntidad', filters.rutEntidad);
    if (filters.year) params = params.set('year', filters.year.toString());
    if (filters.month) params = params.set('month', filters.month.toString());
    if (filters.fechaEmisionDesde) params = params.set('fechaEmisionDesde', filters.fechaEmisionDesde.toString());
    if (filters.fechaEmisionHasta) params = params.set('fechaEmisionHasta', filters.fechaEmisionHasta.toString());
    if (filters.montoMinimo) params = params.set('montoMinimo', filters.montoMinimo.toString());
    if (filters.montoMaximo) params = params.set('montoMaximo', filters.montoMaximo.toString());
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.size) params = params.set('size', filters.size.toString());
    
    return this.http.get<PageResponse<FacturaResponse>>(`${this.apiUrl}/search`, { params });
  }

  createFactura(factura: Factura): Observable<FacturaResponse> {
    return this.http.post<FacturaResponse>(this.apiUrl, factura);
  }

  updateFactura(id: number, factura: Factura): Observable<FacturaResponse> {
    return this.http.put<FacturaResponse>(`${this.apiUrl}/${id}`, factura);
  }

  updateEstadoFactura(id: number, estado: string): Observable<FacturaResponse> {
    const params = new HttpParams().set('estado', estado);
    return this.http.patch<FacturaResponse>(`${this.apiUrl}/${id}/estado`, null, { params });
  }

  deleteFactura(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getEstadisticas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/estadisticas`);
  }
}
