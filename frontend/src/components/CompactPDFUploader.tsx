import React, { useCallback, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { PDFFile } from '../types';

interface CompactPDFUploaderProps {
  onFileUpload: (file: PDFFile) => void;
  uploadedFile: PDFFile | null;   // 시그니처 유지 (미사용)
  onRemoveFile: () => void;       // 시그니처 유지 (미사용)
}

export const CompactPDFUploader: React.FC<CompactPDFUploaderProps> = ({
  onFileUpload,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isValidPdf = (file: File) => {
    const nameOk = file.name.toLowerCase().endsWith('.pdf');
    const mimeOk = (file.type || '').toLowerCase() === 'application/pdf';
    return nameOk || mimeOk;
  };

  const openPicker = () => inputRef.current?.click();

  const handleFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    const MAX_FILES = 10;
    const MAX_BYTES = 100 * 1024 * 1024; // 100MB

    const seen = new Set<string>();
    for (const f of arr) {
      if (!isValidPdf(f)) continue;
      if (f.size <= 0 || f.size > MAX_BYTES) continue;

      const key = `${f.name}__${f.size}__${f.lastModified}`;
      if (seen.has(key)) continue;
      seen.add(key);

      onFileUpload({
        file: f,
        name: f.name,
        size: f.size,
        uploadProgress: 0,
        status: 'uploading',
      });

      if (seen.size >= MAX_FILES) break;
    }
  }, [onFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFiles(e.target.files);
    e.target.value = ''; // 같은 파일 재선택 허용
  }, [handleFiles]);

  return (
    <div className="flex flex-col">
      <div
        role="button"
        tabIndex={0}
        aria-label="PDF 업로드"
        className={[
          'rounded-xl p-3 text-center transition-all duration-200 cursor-pointer h-12',
          'flex flex-col items-center justify-center select-none',
          isDragOver ? 'bg-blue-50 ring-2 ring-blue-300' : 'bg-gray-50',
        ].join(' ')}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') openPicker();
        }}
      >
        <Upload className="w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};
