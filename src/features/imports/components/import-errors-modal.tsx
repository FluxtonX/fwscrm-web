'use client';

import * as React from 'react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ImportRecord } from '../types';
import { AlertCircle } from 'lucide-react';

interface ImportErrorsModalProps {
  importRecord: ImportRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportErrorsModal({
  importRecord,
  open,
  onOpenChange,
}: ImportErrorsModalProps) {
  if (!importRecord) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <DialogTitle className="flex items-center gap-2 text-rose-600">
          <AlertCircle className="h-5 w-5" />
          Import Errors — {importRecord.fileName}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-3 max-h-[350px] overflow-y-auto text-xs">
        {importRecord.errors && importRecord.errors.length > 0 ? (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            {importRecord.errors.map((err) => (
              <div key={err.id} className="p-3 bg-white hover:bg-slate-50">
                <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
                  <span>Row {err.rowNumber}</span>
                  {err.field && (
                    <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-mono">
                      Field: {err.field}
                    </span>
                  )}
                </div>
                <p className="text-slate-600 text-[11px]">{err.reason}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 py-6 text-center">
            No specific row errors recorded for this import.
          </p>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
