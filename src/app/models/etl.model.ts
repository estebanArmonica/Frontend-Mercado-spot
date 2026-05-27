export interface ETLProgress {
    jobId: string;
    usuarioId: string;
    fileName: string;
    status: string;
    currentStep: string;
    progress: number;
    recordsExtracted: number;
    recordsTransformed: number;
    recordsLoaded: number;
    errorMessage: string;
    startTime: string;
}

export interface ETLResult {
    jobId: string;
    status: string;
    fileName: string;
    totalRecordsExtracted: number;
    totalRecordsTransformed: number;
    totalRecordsLoaded: number;
    totalRecordsUpdated: number;
    totalRecordsSkipped: number;
    totalErrors: number;
    errors: string[];
    errorMessage: string;
    startTime: string;
    endTime: string;
}

export interface UploadResponse {
    message: string;
    status: string;
}