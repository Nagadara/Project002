import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader, X } from 'lucide-react';
import { PDFFile } from '../types';

interface CompactPDFUploaderProps {
  onFileUpload: (file: PDFFile) => void;
  uploadedFile: PDFFile | null;
  onRemoveFile: () => void;
}

export const CompactPDFUploader: React.FC<CompactPDFUploaderProps> = ({ 
  onFileUpload, 
  uploadedFile, 
  onRemoveFile 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

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
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      const newFile: PDFFile = {
        file: pdfFile,
        name: pdfFile.name,
        size: pdfFile.size,
        uploadProgress: 0,
        status: 'uploading'
      };
      onFileUpload(newFile);
    }
  }, [onFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const newFile: PDFFile = {
        file,
        name: file.name,
        size: file.size,
        uploadProgress: 0,
        status: 'uploading'
      };
      onFileUpload(newFile);
    }
  }, [onFileUpload]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusIcon = (status: PDFFile['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Loader className="w-3 h-3 animate-spin text-blue-500" />;
      case 'ready':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
    }
  };

    return (
    <div
      className="rounded-xl p-3 text-center transition-all duration-200 cursor-pointer h-12 flex flex-col items-center justify-center bg-gray-50"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('compact-file-input')?.click()}
    >
      <Upload className="w-5 h-5 text-gray-400" />
      <input
        id="compact-file-input"
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};