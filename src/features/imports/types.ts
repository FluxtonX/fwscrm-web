export type ImportStatus =
  | 'QUEUED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'COMPLETED_WITH_ERRORS'
  | 'FAILED'
  | 'CANCELLED';

export interface ImportErrorRecord {
  id: string;
  rowNumber: number;
  field?: string | null;
  reason: string;
  rawData?: any;
  createdAt: string;
}

export interface ImportRecord {
  id: string;
  organizationId: string;
  userId?: string | null;
  fileName: string;
  fileSize: number;
  status: ImportStatus;
  totalRows: number;
  processedRows: number;
  importedRows: number;
  updatedRows: number;
  duplicateRows: number;
  invalidRows: number;
  failedRows: number;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  errors?: ImportErrorRecord[];
}

export interface PaginatedImportsResponse {
  data: ImportRecord[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CrmFieldDefinition {
  key: string;
  label: string;
  required: boolean;
  description: string;
}

export interface ImportPreviewResponse {
  headers: string[];
  detectedHasHeader: boolean;
  totalDetectedRows: number;
  sampleRows: Record<string, string>[];
  suggestedMapping: Record<string, string>;
  availableFields: CrmFieldDefinition[];
}

