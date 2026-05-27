export interface Factura {
    id?: number;
    folio: number;
    montoNeto: number;
    montoBruto: number;
    montoTotal: number;
    fechaEmision: Date;
    fechaPago: Date;
    periodo: Date;
    glosa: string;
    rutEntidad: string;
    nomEntidad: string;
    estado: string;
    tipoEntidad: string;
}

export interface FacturaResponse {
    id: number;
    folio: number;
    montoNeto: number;
    montoBruto: number;
    montoTotal: number;
    fechaEmision: Date;
    fechaPago: Date;
    rutEntidad: string;
    nombreEntidad: string;
    glosa: string;
    periodo: Date;
}

export interface FacturaFilter {
    folio?: number;
    rutEntidad?: string;
    year?: number;
    month?: number;
    fechaEmisionDesde?: Date;
    fechaEmisionHasta?: Date;
    montoMinimo?: number;
    montoMaximo?: number;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}