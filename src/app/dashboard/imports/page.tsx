'use client';

import * as React from 'react';
import { ImportUploader } from '@/features/imports/components/import-uploader';
import { ImportHistoryTable } from '@/features/imports/components/import-history-table';
import { fetchImports } from '@/features/imports/api';
import { ImportRecord } from '@/features/imports/types';
import { useToast } from '@/components/ui/toast';

export default function ImportsPage() {
  const [imports, setImports] = React.useState<ImportRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const toast = useToast();

  const loadImports = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchImports();
      setImports(res.data);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load import history');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadImports();
  }, [loadImports]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-crm-header">
          Spreadsheet Lead Import
        </h1>
        <p className="text-xs text-crm-muted mt-0.5">
          Upload CSV or XLSX spreadsheets with interactive column mapping, pre-persistence preview, and automatic deduplication.
        </p>
      </div>

      {/* Upload Zone */}
      <ImportUploader onImportCompleted={loadImports} />

      {/* Import History */}
      <ImportHistoryTable
        imports={imports}
        loading={loading}
        onRefresh={loadImports}
      />
    </div>
  );
}
