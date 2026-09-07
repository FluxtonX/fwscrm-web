'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { ImportRecord } from '../types';
import { fetchImportDetails } from '../api';
import { ImportErrorsModal } from './import-errors-modal';
import { AlertCircle, CheckCircle2, Clock, FileText } from 'lucide-react';

interface ImportHistoryTableProps {
  imports: ImportRecord[];
  loading: boolean;
  onRefresh: () => void;
}

export function ImportHistoryTable({
  imports,
  loading,
  onRefresh,
}: ImportHistoryTableProps) {
  const [selectedImport, setSelectedImport] = React.useState<ImportRecord | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [loadingDetails, setLoadingDetails] = React.useState(false);

  const handleViewErrors = async (importItem: ImportRecord) => {
    setLoadingDetails(true);
    try {
      const details = await fetchImportDetails(importItem.id);
      setSelectedImport(details);
      setModalOpen(true);
    } catch {
      setSelectedImport(importItem);
      setModalOpen(true);
    } finally {
      setLoadingDetails(false);
    }
  };

  const getStatusBadge = (status: ImportRecord['status']) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3 w-3" /> Completed
          </Badge>
        );
      case 'COMPLETED_WITH_ERRORS':
        return (
          <Badge variant="warning" className="gap-1">
            <AlertCircle className="h-3 w-3" /> Partial Errors
          </Badge>
        );
      case 'PROCESSING':
        return (
          <Badge variant="info" className="gap-1">
            <Spinner size="sm" className="h-3 w-3 text-sky-600" /> Processing
          </Badge>
        );
      case 'QUEUED':
        return (
          <Badge variant="default" className="gap-1">
            <Clock className="h-3 w-3" /> Queued
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge variant="danger" className="gap-1">
            <AlertCircle className="h-3 w-3" /> Failed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-3 select-none">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-crm-header">
          Recent Import History
        </h3>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
          Refresh
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-crm-border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-crm-text border-collapse">
            <thead className="bg-crm-table-header text-slate-600 font-semibold border-b border-crm-border">
              <tr>
                <th className="px-4 py-3">File Name</th>
                <th className="px-4 py-3">Uploaded Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Total Rows</th>
                <th className="px-4 py-3 text-right">Imported</th>
                <th className="px-4 py-3 text-right">Duplicates</th>
                <th className="px-4 py-3 text-right">Invalid</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-crm-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-crm-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Spinner size="md" />
                      <span>Loading import history...</span>
                    </div>
                  </td>
                </tr>
              ) : imports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8">
                    <EmptyState
                      icon={<FileText className="h-6 w-6" />}
                      title="No imports found"
                      description="You haven't uploaded any CSV lead files yet. Use the dropzone above to begin."
                    />
                  </td>
                </tr>
              ) : (
                imports.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-crm-header">
                      {item.fileName}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {item.totalRows.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                      {item.importedRows.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-amber-600 font-medium">
                      {item.duplicateRows.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-rose-600 font-medium">
                      {item.invalidRows.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {item.invalidRows > 0 ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewErrors(item)}
                          isLoading={loadingDetails && selectedImport?.id === item.id}
                        >
                          View Errors
                        </Button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ImportErrorsModal
        importRecord={selectedImport}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
