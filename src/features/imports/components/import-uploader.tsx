'use client';

import * as React from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { uploadCsvFile, fetchImportDetails } from '../api';
import { ImportRecord } from '../types';

interface ImportUploaderProps {
  onImportCompleted: () => void;
}

export function ImportUploader({ onImportCompleted }: ImportUploaderProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [activeImport, setActiveImport] = React.useState<ImportRecord | null>(null);
  const toast = useToast();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Poll active import progress
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (
      activeImport &&
      (activeImport.status === 'QUEUED' || activeImport.status === 'PROCESSING')
    ) {
      interval = setInterval(async () => {
        try {
          const updated = await fetchImportDetails(activeImport.id);
          setActiveImport(updated);
          if (
            updated.status === 'COMPLETED' ||
            updated.status === 'COMPLETED_WITH_ERRORS' ||
            updated.status === 'FAILED'
          ) {
            onImportCompleted();
            if (updated.status === 'COMPLETED') {
              toast.success(
                `Import completed: ${updated.importedRows} leads imported`,
              );
            } else if (updated.status === 'COMPLETED_WITH_ERRORS') {
              toast.warning(
                `Import completed with errors: ${updated.importedRows} imported, ${updated.invalidRows} invalid`,
              );
            } else {
              toast.error('Import processing failed');
            }
          }
        } catch {
          // ignore transient poll error
        }
      }, 1500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeImport, onImportCompleted, toast]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (!selectedFile.name.match(/\.(csv|txt)$/i)) {
      toast.error('Only .csv files are supported');
      return;
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error('File size exceeds 50MB limit');
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadCsvFile(file);
      toast.info('File uploaded. Background streaming ingestion started...');
      const initialDetails = await fetchImportDetails(res.importId);
      setActiveImport(initialDetails);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload CSV file');
    } finally {
      setIsUploading(false);
    }
  };

  const percentComplete =
    activeImport && activeImport.totalRows > 0
      ? Math.min(
          100,
          Math.round((activeImport.processedRows / activeImport.totalRows) * 100),
        )
      : activeImport?.status === 'PROCESSING'
      ? 10
      : 0;

  return (
    <div className="space-y-4">
      {/* Active Import Progress Banner (if active) */}
      {activeImport &&
        (activeImport.status === 'QUEUED' ||
          activeImport.status === 'PROCESSING') && (
          <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-sm text-teal-950">
                <RefreshCw className="h-4 w-4 text-crm-teal animate-spin" />
                <span>
                  {activeImport.status === 'QUEUED'
                    ? 'Preparing CSV parser...'
                    : 'Streaming and validating leads...'}
                </span>
              </div>
              <span className="text-xs font-bold text-crm-teal">
                {percentComplete}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-crm-teal h-2 transition-all duration-300 rounded-full"
                style={{ width: `${percentComplete}%` }}
              />
            </div>

            {/* Statistics pill row */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
              <div>
                File: <span className="font-medium text-slate-900">{activeImport.fileName}</span>
              </div>
              <div>
                Processed:{' '}
                <span className="font-semibold text-slate-900">
                  {activeImport.processedRows.toLocaleString()}
                </span>
                {activeImport.totalRows > 0 &&
                  ` / ${activeImport.totalRows.toLocaleString()}`}
              </div>
              <div>
                Imported:{' '}
                <span className="font-semibold text-emerald-600">
                  {activeImport.importedRows.toLocaleString()}
                </span>
              </div>
              <div>
                Duplicates:{' '}
                <span className="font-semibold text-amber-600">
                  {activeImport.duplicateRows.toLocaleString()}
                </span>
              </div>
              {activeImport.invalidRows > 0 && (
                <div>
                  Invalid:{' '}
                  <span className="font-semibold text-rose-600">
                    {activeImport.invalidRows.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Upload Dropzone Container */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors bg-white ${
          dragActive
            ? 'border-crm-teal bg-teal-50/20'
            : 'border-crm-border hover:border-slate-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id="csv-file-input"
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-crm-teal mb-3">
          <UploadCloud className="h-6 w-6" />
        </div>

        <h3 className="text-sm font-semibold text-crm-header">
          {file ? file.name : 'Upload your leads CSV file'}
        </h3>
        <p className="mt-1 text-xs text-crm-muted max-w-sm">
          {file
            ? `${(file.size / 1024).toFixed(1)} KB — Ready to ingest`
            : 'Drag and drop your file here, or click browse. Supports up to 50MB.'}
        </p>

        {/* Expected columns guidance matching Sample CSV */}
        <div className="mt-3 rounded bg-slate-50 border border-slate-100 px-3 py-1.5 text-[11px] text-slate-500 max-w-md">
          Supported columns: <span className="font-mono text-slate-700">First Name, Last Name, Email, Phone, Country, Lead Source, referrer, tag1</span>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <label htmlFor="csv-file-input">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              {file ? 'Change File' : 'Browse File'}
            </Button>
          </label>

          {file && (
            <Button
              size="sm"
              onClick={handleUpload}
              isLoading={isUploading}
            >
              Start Streaming Import
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
