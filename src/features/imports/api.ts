import { apiClient } from '@/lib/api/client';
import { ImportRecord, PaginatedImportsResponse } from './types';

export async function uploadCsvFile(file: File): Promise<{
  importId: string;
  fileName: string;
  status: string;
  message: string;
}> {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient('/imports', {
    method: 'POST',
    body: formData,
  });
}

export async function fetchImports(
  page = 1,
  limit = 20,
): Promise<PaginatedImportsResponse> {
  return apiClient<PaginatedImportsResponse>(`/imports?page=${page}&limit=${limit}`);
}

export async function fetchImportDetails(id: string): Promise<ImportRecord> {
  return apiClient<ImportRecord>(`/imports/${id}`);
}
