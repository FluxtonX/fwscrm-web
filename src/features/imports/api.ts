import { apiClient } from '@/lib/api/client';
import { ImportRecord, PaginatedImportsResponse, ImportPreviewResponse } from './types';

export async function previewImportFile(file: File): Promise<ImportPreviewResponse> {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient<ImportPreviewResponse>('/imports/preview', {
    method: 'POST',
    body: formData,
  });
}

export async function uploadImportFile(
  file: File,
  mapping?: Record<string, string>,
  hasHeader = true,
  ownerId?: string,
): Promise<{
  importId: string;
  fileName: string;
  status: string;
  message: string;
}> {
  const formData = new FormData();
  formData.append('file', file);
  if (mapping && Object.keys(mapping).length > 0) {
    formData.append('mapping', JSON.stringify(mapping));
  }
  formData.append('hasHeader', String(hasHeader));
  if (ownerId && ownerId !== 'unassigned') {
    formData.append('ownerId', ownerId);
  }

  return apiClient('/imports', {
    method: 'POST',
    body: formData,
  });
}

// Backward-compatible alias
export const uploadCsvFile = uploadImportFile;


export async function fetchImports(
  page = 1,
  limit = 20,
): Promise<PaginatedImportsResponse> {
  return apiClient<PaginatedImportsResponse>(`/imports?page=${page}&limit=${limit}`);
}

export async function fetchImportDetails(id: string): Promise<ImportRecord> {
  return apiClient<ImportRecord>(`/imports/${id}`);
}
