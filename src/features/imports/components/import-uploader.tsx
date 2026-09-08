'use client';

import * as React from 'react';
import { ImportStepper } from './import-stepper';

interface ImportUploaderProps {
  onImportCompleted: () => void;
}

export function ImportUploader({ onImportCompleted }: ImportUploaderProps) {
  return <ImportStepper onImportCompleted={onImportCompleted} />;
}
