export interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant' | 'system';
  timestamp: Date;
  fileId?: string;
}

export interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pages?: number;
  uploadProgress: number;
  status: 'uploading' | 'processing' | 'ready' | 'error';
}