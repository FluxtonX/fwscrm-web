'use client';

import * as React from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Info,
  ShieldCheck,
  FilterX,
  FileCheck,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { previewImportFile, uploadImportFile, fetchImportDetails } from '../api';
import { ImportRecord, ImportPreviewResponse, CrmFieldDefinition } from '../types';
import { fetchUsers, UserItem } from '@/features/leads/api';

interface ImportStepperProps {
  onImportCompleted: () => void;
}

type Step = 'upload' | 'mapping' | 'preview' | 'progress';

export function ImportStepper({ onImportCompleted }: ImportStepperProps) {
  const [currentStep, setCurrentStep] = React.useState<Step>('upload');
  const [file, setFile] = React.useState<File | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [previewData, setPreviewData] = React.useState<ImportPreviewResponse | null>(null);
  const [hasHeader, setHasHeader] = React.useState<boolean>(true);
  const [columnMapping, setColumnMapping] = React.useState<Record<string, string>>({});
  const [selectedOwnerId, setSelectedOwnerId] = React.useState<string>('unassigned');
  const [teamMembers, setTeamMembers] = React.useState<UserItem[]>([]);
  const [loadingMembers, setLoadingMembers] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [activeImport, setActiveImport] = React.useState<ImportRecord | null>(null);

  const toast = useToast();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Pre-load active team members for owner assignment
  React.useEffect(() => {
    setLoadingMembers(true);
    fetchUsers()
      .then((users) => setTeamMembers(users || []))
      .catch(() => {})
      .finally(() => setLoadingMembers(false));
  }, []);

  // Poll active import progress during step 4
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (
      currentStep === 'progress' &&
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
              toast.success(`Import complete: ${updated.importedRows} leads imported`);
            } else if (updated.status === 'COMPLETED_WITH_ERRORS') {
              toast.warning(
                `Import finished with warnings: ${updated.importedRows} imported, ${updated.invalidRows} invalid`,
              );
            } else {
              toast.error('Import processing encountered an error');
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
  }, [currentStep, activeImport, onImportCompleted, toast]);

  // Step 1: File selection & auto-preview
  const handleFile = async (selectedFile: File) => {
    if (!selectedFile.name.match(/\.(csv|tsv|txt|xlsx|xls)$/i)) {
      toast.error('Please upload a valid .csv or .xlsx spreadsheet');
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error('File size exceeds the 50MB limit');
      return;
    }

    setFile(selectedFile);
    setIsAnalyzing(true);

    try {
      const data = await previewImportFile(selectedFile);
      setPreviewData(data);
      setHasHeader(data.detectedHasHeader);
      setColumnMapping(data.suggestedMapping || {});
      setCurrentStep('mapping');
      toast.info(`Analyzed spreadsheet: ${data.headers.length} columns detected`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to inspect spreadsheet preview');
      setFile(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Step 2: Mapping Handlers
  const handleMappingChange = (header: string, crmField: string) => {
    setColumnMapping((prev) => {
      const next = { ...prev };
      if (crmField === 'DO_NOT_IMPORT' || !crmField) {
        delete next[header];
      } else {
        // Enforce 1-to-1 mapping for target fields
        for (const [key, val] of Object.entries(next)) {
          if (val === crmField && key !== header) {
            delete next[key];
          }
        }
        next[header] = crmField;
      }
      return next;
    });
  };

  // Validation before Step 3
  const isEmailMapped = Object.values(columnMapping).includes('email');
  const isFirstNameMapped = Object.values(columnMapping).includes('firstName');
  const isLastNameMapped = Object.values(columnMapping).includes('lastName');

  const handleProceedToPreview = () => {
    if (!isEmailMapped) {
      toast.error('Email is required. Please map a column to Email.');
      return;
    }
    if (!isFirstNameMapped) {
      toast.error('First Name (or Full Name) is required. Please map a column to First Name.');
      return;
    }
    setCurrentStep('preview');
  };

  // Step 3 -> 4: Submit Import
  const handleStartImport = async () => {
    if (!file) return;
    setIsSubmitting(true);
    try {
      const res = await uploadImportFile(
        file,
        columnMapping,
        hasHeader,
        selectedOwnerId !== 'unassigned' ? selectedOwnerId : undefined,
      );
      toast.info('File queued. Background ingestion started...');
      const initialDetails = await fetchImportDetails(res.importId);
      setActiveImport(initialDetails);
      setCurrentStep('progress');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to start import');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset Stepper
  const handleReset = () => {
    setFile(null);
    setPreviewData(null);
    setColumnMapping({});
    setSelectedOwnerId('unassigned');
    setActiveImport(null);
    setCurrentStep('upload');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const percentComplete =
    activeImport && activeImport.totalRows > 0
      ? Math.min(
          100,
          Math.round((activeImport.processedRows / activeImport.totalRows) * 100),
        )
      : activeImport?.status === 'PROCESSING'
      ? 15
      : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Wizard Header Breadcrumbs */}
      <div className="mb-8 border-b border-slate-100 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Lead Ingestion Wizard
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Unified CSV & XLSX parser with pre-flight column mapping & strict data filtering
            </p>
          </div>
          {currentStep !== 'upload' && currentStep !== 'progress' && (
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs text-slate-500">
              Start Over
            </Button>
          )}
        </div>

        {/* 4 Step Indicator Pills */}
        <div className="grid grid-cols-4 gap-2 mt-5">
          {[
            { id: 'upload', label: '1. Upload File' },
            { id: 'mapping', label: '2. Column Mapping' },
            { id: 'preview', label: '3. Pre-Flight Preview' },
            { id: 'progress', label: '4. Ingestion Pulse' },
          ].map((s, idx) => {
            const stepOrder: Step[] = ['upload', 'mapping', 'preview', 'progress'];
            const activeIdx = stepOrder.indexOf(currentStep);
            const thisIdx = idx;
            const isCompleted = thisIdx < activeIdx;
            const isCurrent = thisIdx === activeIdx;

            return (
              <div
                key={s.id}
                className={`flex items-center justify-center py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  isCurrent
                    ? 'bg-teal-50 text-crm-teal border border-teal-200 shadow-sm'
                    : isCompleted
                    ? 'bg-slate-50 text-slate-700 border border-slate-200'
                    : 'bg-slate-50 text-slate-400 border border-transparent'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                ) : null}
                <span>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: UPLOAD ZONE */}
      {currentStep === 'upload' && (
        <div className="space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
              dragActive
                ? 'border-crm-teal bg-teal-50/50 scale-[0.99]'
                : 'border-slate-200 hover:border-crm-teal/60 hover:bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.tsv,.txt"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-crm-teal mb-4">
              {isAnalyzing ? (
                <RefreshCw className="h-7 w-7 animate-spin" />
              ) : (
                <UploadCloud className="h-7 w-7" />
              )}
            </div>

            <h4 className="text-base font-semibold text-slate-900">
              {isAnalyzing ? 'Inspecting spreadsheet schema...' : 'Drag & drop your CSV or Excel file here'}
            </h4>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
              Supports <strong className="text-slate-700">.csv</strong> and <strong className="text-slate-700">.xlsx</strong> up to 50MB. Auto-detects column headers, delimiters, and suggests CRM field mappings.
            </p>

            <div className="mt-4 flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isAnalyzing}
                className="text-xs font-semibold text-crm-teal border-teal-200 hover:bg-teal-50"
              >
                <FileSpreadsheet className="h-4 w-4 mr-1.5" />
                Browse Files
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600 bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-crm-teal shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">Strict Data Boundary:</strong> Unmapped columns are never persisted to your database.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FileCheck className="h-4 w-4 text-crm-teal shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">Header & Headerless:</strong> Works with or without top column header labels.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FilterX className="h-4 w-4 text-crm-teal shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">Deduplication:</strong> Prevents duplicate lead records automatically by email.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: COLUMN MAPPING */}
      {currentStep === 'mapping' && previewData && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-teal-50/60 border border-teal-100">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-crm-teal" />
              <div>
                <div className="text-sm font-semibold text-slate-900">{file?.name}</div>
                <div className="text-xs text-slate-500">
                  {previewData.totalDetectedRows.toLocaleString()} detected rows • {previewData.headers.length} detected columns
                </div>
              </div>
            </div>

            {/* Header toggle */}
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasHeader}
                onChange={(e) => setHasHeader(e.target.checked)}
                className="rounded border-slate-300 text-crm-teal focus:ring-crm-teal"
              />
              <span>First row contains column headers</span>
            </label>
          </div>

          {/* Owner Assignment Dropdown */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100/70 text-crm-teal shrink-0 mt-0.5">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Assign Default Owner (Optional)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Leads without an assigned owner in the file will automatically be assigned to this team member.
                  </p>
                </div>
              </div>

              <div className="sm:w-64">
                <select
                  value={selectedOwnerId}
                  onChange={(e) => setSelectedOwnerId(e.target.value)}
                  disabled={loadingMembers}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-sm focus:border-crm-teal focus:outline-none focus:ring-1 focus:ring-crm-teal disabled:bg-slate-100"
                >
                  <option value="unassigned">-- Unassigned (No default owner) --</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.firstName} {member.lastName} ({member.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {selectedOwnerId !== 'unassigned' && (
              <div className="text-[11px] text-teal-800 bg-teal-50 px-3 py-1.5 rounded-md border border-teal-100 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-crm-teal shrink-0" />
                <span>
                  Default owner set to <strong>{teamMembers.find((m) => m.id === selectedOwnerId)?.firstName} {teamMembers.find((m) => m.id === selectedOwnerId)?.lastName}</strong>. If your file also maps an Owner column, the file value takes priority per row.
                </span>
              </div>
            )}
          </div>

          {/* Mapping Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Source File Column</th>
                  <th className="py-3 px-4 font-semibold">Sample Value (Row 1)</th>
                  <th className="py-3 px-4 font-semibold">Target CRM Field</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewData.headers.map((header) => {
                  const sampleVal = previewData.sampleRows[0]?.[header] || '—';
                  const mappedField = columnMapping[header] || 'DO_NOT_IMPORT';

                  return (
                    <tr key={header} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {header}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono truncate max-w-[200px]">
                        {sampleVal}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={mappedField}
                          onChange={(e) => handleMappingChange(header, e.target.value)}
                          className={`w-full max-w-xs rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                            mappedField === 'DO_NOT_IMPORT'
                              ? 'border-slate-200 text-slate-400 bg-slate-50'
                              : 'border-crm-teal/50 text-teal-950 bg-teal-50/50 font-semibold'
                          }`}
                        >
                          <option value="DO_NOT_IMPORT">-- Do not import (Discard) --</option>
                          <optgroup label="Required CRM Fields">
                            <option value="firstName">First Name *</option>
                            <option value="lastName">Last Name *</option>
                            <option value="email">Email Address *</option>
                          </optgroup>
                          <optgroup label="Optional CRM Fields">
                            <option value="phone">Phone Number</option>
                            <option value="country">Country</option>
                            <option value="leadSource">Lead Source</option>
                            <option value="referrer">Referrer</option>
                            <option value="tag1">Tag</option>
                            <option value="owner">Owner / Assigned Rep</option>
                          </optgroup>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Validation Notice & Help Banner */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <Info className="h-4 w-4 text-crm-teal shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <div>
                <strong>Strict Column Discarding:</strong> Any column left as <em>&ldquo;Do not import&rdquo;</em> (such as Balance, Salary, or internal metrics) is completely ignored in memory and will <strong>never</strong> be stored in the database.
              </div>
              <div>
                <strong>Tag Mapping:</strong> Select <em>&ldquo;Tag&rdquo;</em> only if the column represents a categorization tag. Generic columns like Balance should remain <em>&ldquo;Do not import&rdquo;</em>.
              </div>
              {!isLastNameMapped && isFirstNameMapped && (
                <div className="text-teal-800">
                  <strong>Auto-split active:</strong> If your source file contains full names in First Name, we will automatically split them into first and family name.
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep('upload')}
              className="text-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleProceedToPreview}
              className="bg-crm-teal hover:bg-crm-teal/90 text-white font-semibold text-xs px-5"
            >
              Preview & Validate <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: PRE-FLIGHT PREVIEW */}
      {currentStep === 'preview' && previewData && (
        <div className="space-y-6">
          {/* Mapping Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-xs text-slate-500 font-medium">Estimated Records</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {previewData.totalDetectedRows.toLocaleString()}
              </div>
            </div>
            <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4">
              <span className="text-xs text-teal-800 font-medium">Active Mapped Fields</span>
              <div className="text-2xl font-bold text-crm-teal mt-1">
                {Object.keys(columnMapping).length}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-xs text-slate-500 font-medium">Ignored Columns</span>
              <div className="text-2xl font-bold text-slate-600 mt-1">
                {previewData.headers.length - Object.keys(columnMapping).length}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-xs text-slate-500 font-medium">Default Owner</span>
              <div className="text-sm font-bold text-slate-900 mt-2 truncate">
                {selectedOwnerId !== 'unassigned'
                  ? (() => {
                      const m = teamMembers.find((u) => u.id === selectedOwnerId);
                      return m ? `${m.firstName} ${m.lastName}` : 'Assigned';
                    })()
                  : Object.values(columnMapping).includes('owner')
                  ? 'Mapped from file'
                  : 'Unassigned'}
              </div>
            </div>
          </div>

          {/* Clean Mapped Data Preview Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                Sample Output Preview (First 5 Rows)
              </span>
              <Badge variant="outline" className="text-[11px] text-crm-teal border-teal-200">
                Filtered Clean Data
              </Badge>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Row</th>
                    {Object.entries(columnMapping).map(([header, targetField]) => (
                      <th key={header} className="py-2.5 px-3 font-semibold text-slate-900">
                        {targetField} <span className="text-[10px] text-slate-400 font-normal">({header})</span>
                      </th>
                    ))}
                    {!Object.values(columnMapping).includes('owner') && selectedOwnerId !== 'unassigned' && (
                      <th className="py-2.5 px-3 font-semibold text-crm-teal">
                        owner <span className="text-[10px] text-teal-600 font-normal">(Default)</span>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewData.sampleRows.slice(0, 5).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-mono text-slate-400">#{idx + 1}</td>
                      {Object.entries(columnMapping).map(([header]) => (
                        <td key={header} className="py-2.5 px-3 font-medium text-slate-800">
                          {row[header] || <span className="text-slate-300">—</span>}
                        </td>
                      ))}
                      {!Object.values(columnMapping).includes('owner') && selectedOwnerId !== 'unassigned' && (
                        <td className="py-2.5 px-3 font-medium text-teal-700">
                          {(() => {
                            const m = teamMembers.find((u) => u.id === selectedOwnerId);
                            return m ? `${m.firstName} ${m.lastName}` : 'Selected Rep';
                          })()}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pre-Flight Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep('mapping')}
              className="text-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Mapping
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              onClick={handleStartImport}
              className="bg-crm-teal hover:bg-crm-teal/90 text-white font-semibold text-xs px-6"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Starting Import...
                </>
              ) : (
                <>Confirm & Ingest Leads</>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: PROGRESS & STATUS */}
      {currentStep === 'progress' && activeImport && (
        <div className="space-y-6 py-4">
          <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {activeImport.status === 'COMPLETED' ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                ) : activeImport.status === 'COMPLETED_WITH_ERRORS' ? (
                  <AlertCircle className="h-6 w-6 text-amber-500" />
                ) : (
                  <RefreshCw className="h-6 w-6 text-crm-teal animate-spin" />
                )}
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {activeImport.status === 'COMPLETED'
                      ? 'Ingestion Completed Successfully'
                      : activeImport.status === 'COMPLETED_WITH_ERRORS'
                      ? 'Ingestion Completed with Warnings'
                      : activeImport.status === 'PROCESSING'
                      ? 'Streaming and Batching Records...'
                      : 'Queued for Ingestion...'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Target: {activeImport.fileName} ({activeImport.fileSize ? `${Math.round(activeImport.fileSize / 1024)} KB` : ''})
                  </p>
                </div>
              </div>
              <span className="text-base font-bold text-crm-teal">
                {percentComplete}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  activeImport.status === 'COMPLETED'
                    ? 'bg-emerald-500'
                    : activeImport.status === 'COMPLETED_WITH_ERRORS'
                    ? 'bg-amber-500'
                    : 'bg-crm-teal'
                }`}
                style={{ width: `${percentComplete}%` }}
              />
            </div>

            {/* Metric counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center">
              <div className="rounded-lg bg-white p-3 border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium">Processed</span>
                <div className="text-lg font-bold text-slate-900 mt-0.5">
                  {activeImport.processedRows}
                </div>
              </div>
              <div className="rounded-lg bg-white p-3 border border-slate-100">
                <span className="text-[11px] text-emerald-600 font-medium">Imported</span>
                <div className="text-lg font-bold text-emerald-600 mt-0.5">
                  {activeImport.importedRows}
                </div>
              </div>
              <div className="rounded-lg bg-white p-3 border border-slate-100">
                <span className="text-[11px] text-amber-600 font-medium">Duplicates</span>
                <div className="text-lg font-bold text-amber-600 mt-0.5">
                  {activeImport.duplicateRows}
                </div>
              </div>
              <div className="rounded-lg bg-white p-3 border border-slate-100">
                <span className="text-[11px] text-rose-600 font-medium">Invalid</span>
                <div className="text-lg font-bold text-rose-600 mt-0.5">
                  {activeImport.invalidRows}
                </div>
              </div>
            </div>
          </div>

          {(activeImport.status === 'COMPLETED' ||
            activeImport.status === 'COMPLETED_WITH_ERRORS' ||
            activeImport.status === 'FAILED') && (
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-xs font-semibold"
              >
                Import Another File
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
